import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getToken } from 'next-auth/jwt';
import { exec } from 'child_process';
import { promisify } from 'util';

// 只在Node.js環境中運行
export const runtime = 'nodejs';

// 檢查用戶是否為管理員
async function isAdmin(request: Request) {
  try {
    const token = await getToken({ req: request as any });
    console.log('檢查管理員權限，當前Token:', token ? `存在(role=${token.role})` : '不存在');
    return token?.role === 'ADMIN' || token?.role === 'admin'; // 添加小寫檢查
  } catch (error) {
    console.error('獲取令牌錯誤:', error);
    return false;
  }
}

// 轉換exec為Promise形式
const execPromise = promisify(exec);

// 處理GET請求 - 用於檢查表是否存在
export async function GET(request: Request) {
  try {
    // 只允許管理員或特定秘密金鑰存取
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get('secret_key');
    const adminSecret = process.env.ADMIN_API_SECRET;
    
    console.log('訪問重置API - secretKey:', secretKey ? '已提供' : '未提供');
    console.log('環境變數 ADMIN_API_SECRET:', adminSecret ? '已設置' : '未設置');
    
    const isAdminUser = await isAdmin(request);
    console.log('是否管理員用戶:', isAdminUser);
    
    if (!isAdminUser && secretKey !== adminSecret) {
      console.log('授權失敗 - 無管理員權限且密鑰不匹配');
      return NextResponse.json(
        { 
          error: '未授權訪問, 請使用管理員帳號或正確的密鑰',
          isAdmin: isAdminUser,
          secretKeyProvided: !!secretKey,
          secretKeyValid: secretKey === adminSecret
        },
        { status: 403 }
      );
    }

    // 檢查資料庫中的表格情況
    const masseurServiceTable = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_MasseurToService'
      ) as "exists"
    `;
    
    const serviceTable = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'Service'
    `;

    return NextResponse.json({
      message: '資料庫診斷完成',
      masseurServiceTable,
      serviceTable
    });
  } catch (error) {
    console.error('檢查資料庫錯誤:', error);
    return NextResponse.json(
      { error: `檢查資料庫錯誤: ${error}` },
      { status: 500 }
    );
  }
}

// 處理POST請求 - 用於執行資料庫修復
export async function POST(request: Request) {
  try {
    // 只允許管理員或特定秘密金鑰存取
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get('secret_key');
    const adminSecret = process.env.ADMIN_API_SECRET;
    const forceReset = searchParams.get('force') === 'true';
    
    if (!(await isAdmin(request)) && secretKey !== adminSecret) {
      return NextResponse.json(
        { error: '未授權訪問, 請使用管理員帳號或正確的密鑰' },
        { status: 403 }
      );
    }

    // 執行Prisma遷移重置
    if (forceReset) {
      try {
        await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "_MasseurToService" CASCADE');
        await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "Masseur" CASCADE');
        await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "Service" CASCADE');
      } catch (dropError) {
        console.warn('刪除表格時出錯:', dropError);
      }
    }

    try {
      // 在Node.js環境下使用命令行執行遷移
      const { stdout, stderr } = await execPromise('npx prisma migrate deploy');
      console.log('遷移輸出:', stdout);
      if (stderr) console.error('遷移錯誤:', stderr);
      
      // 生成新的Prisma Client
      await execPromise('npx prisma generate');
      
      return NextResponse.json({
        message: '資料庫重置成功',
        migrations: stdout,
        errors: stderr || null
      });
    } catch (migrationError: any) {
      console.error('遷移執行錯誤:', migrationError);
      
      // 使用Prisma API直接修復
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "_MasseurToService" (
          "A" TEXT NOT NULL,
          "B" TEXT NOT NULL,
          CONSTRAINT "_MasseurToService_AB_unique" UNIQUE ("A","B"),
          CONSTRAINT "_MasseurToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Masseur"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "_MasseurToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
      
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "_MasseurToService_B_index" ON "_MasseurToService"("B")
      `);
      
      // 檢查Service表中的active字段並將其重命名為isActive
      const columnExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'Service' 
          AND column_name = 'active'
        ) as "exists"
      `;
      
      if ((columnExists as any)[0].exists) {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "Service" 
          RENAME COLUMN "active" TO "isActive"
        `);
      }
      
      return NextResponse.json({
        message: '使用直接SQL修復資料庫完成',
        error: migrationError.message,
        recovery: '已嘗試直接使用SQL修復關聯表'
      });
    }
  } catch (error) {
    console.error('資料庫重置錯誤:', error);
    return NextResponse.json(
      { error: `資料庫重置錯誤: ${error}` },
      { status: 500 }
    );
  }
} 