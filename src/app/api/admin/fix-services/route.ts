import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getToken } from 'next-auth/jwt';

// 支持Node.js運行時
export const runtime = 'nodejs';

// 檢查用戶是否為管理員或有有效的密鑰
async function isAuthorized(request: Request) {
  try {
    // 檢查密鑰
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get('secret_key');
    const adminSecret = process.env.ADMIN_API_SECRET;
    
    if (secretKey === adminSecret) {
      return true;
    }
    
    // 檢查管理員權限
    const token = await getToken({ req: request as any });
    return token?.role === 'ADMIN' || token?.role === 'admin';
  } catch (error) {
    console.error('授權檢查錯誤:', error);
    return false;
  }
}

// 處理GET請求 - 檢查並修復服務與按摩師關聯
export async function GET(request: Request) {
  try {
    if (!await isAuthorized(request)) {
      return NextResponse.json(
        { error: '未授權訪問，請使用管理員帳號或正確的密鑰' },
        { status: 403 }
      );
    }
    
    console.log('開始檢查服務與按摩師關聯');
    
    // 1. 檢查_MasseurToService表是否存在
    let masseurServiceExists = false;
    try {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '_MasseurToService'
        ) as "exists"
      `;
      masseurServiceExists = (result as any)[0].exists;
    } catch (error) {
      console.error('檢查關聯表時出錯:', error);
    }
    
    // 2. 如果表不存在，創建它
    if (!masseurServiceExists) {
      try {
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
        
        console.log('成功創建_MasseurToService表');
      } catch (error) {
        console.error('創建關聯表時出錯:', error);
      }
    }
    
    // 3. 檢查服務列表
    const services = await prisma.service.findMany();
    console.log(`找到 ${services.length} 個服務`);
    
    // 4. 檢查按摩師列表
    const masseurs = await prisma.masseur.findMany();
    console.log(`找到 ${masseurs.length} 個按摩師`);
    
    // 5. 如果沒有按摩師，創建默認按摩師
    if (masseurs.length === 0) {
      try {
        await prisma.masseur.create({
          data: {
            name: "服務中心",
            description: "默認服務提供者",
            experience: 1,
            isActive: true
          }
        });
        console.log('創建了默認按摩師');
      } catch (error) {
        console.error('創建默認按摩師時出錯:', error);
      }
    }
    
    // 6. 檢查服務與按摩師關聯
    const repairResults = [];
    
    for (const service of services) {
      try {
        // 檢查這個服務有沒有關聯按摩師
        const serviceWithMasseurs = await prisma.service.findUnique({
          where: { id: service.id },
          include: { masseurs: true }
        });
        
        // 如果沒有關聯任何按摩師，將其關聯到所有按摩師
        if (serviceWithMasseurs?.masseurs.length === 0) {
          const updatedService = await prisma.service.update({
            where: { id: service.id },
            data: {
              masseurs: {
                connect: masseurs.map(m => ({ id: m.id }))
              }
            }
          });
          
          repairResults.push({
            service: service.name,
            action: '關聯到所有按摩師',
            masseursCount: masseurs.length
          });
        } else {
          repairResults.push({
            service: service.name,
            action: '已有關聯按摩師',
            masseursCount: serviceWithMasseurs?.masseurs.length || 0
          });
        }
      } catch (error) {
        console.error(`修復服務 ${service.name} 關聯時出錯:`, error);
        repairResults.push({
          service: service.name,
          action: '修復失敗',
          error: String(error)
        });
      }
    }
    
    return NextResponse.json({
      message: '服務與按摩師關聯檢查修復完成',
      servicesCount: services.length,
      masseursCount: masseurs.length,
      repairResults
    });
  } catch (error) {
    console.error('修復服務與按摩師關聯時出錯:', error);
    return NextResponse.json(
      { error: `修復服務與按摩師關聯時出錯: ${error}` },
      { status: 500 }
    );
  }
} 