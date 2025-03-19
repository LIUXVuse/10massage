import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth/auth.server';

// 支持Node.js運行時
export const runtime = 'nodejs';

// 檢查用戶是否為管理員
async function isAdmin() {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    return session?.user?.role === 'admin';
  } catch (error) {
    console.error('驗證管理員權限時出錯:', error);
    return false;
  }
}

// 處理服務排序
export async function POST(request: Request) {
  try {
    // 檢查用戶是否為管理員
    if (!await isAdmin()) {
      return NextResponse.json({ error: "未授權訪問，僅管理員可以更新服務順序" }, { status: 401 });
    }

    const data = await request.json();
    
    // 檢查請求數據是否有效
    if (!data.services || !Array.isArray(data.services)) {
      return NextResponse.json({ error: "無效的請求數據格式" }, { status: 400 });
    }
    
    // 獲取需要更新的服務ID和順序
    const services = data.services;
    
    console.log('開始更新服務順序:', services);
    
    // 使用事務處理更新操作，確保操作的原子性
    const result = await prisma.$transaction(
      services.map((service: { id: string, sortOrder: number }) => 
        prisma.service.update({
          where: { id: service.id },
          data: { sortOrder: service.sortOrder }
        })
      )
    );
    
    console.log('服務順序更新完成，更新了', result.length, '個服務');
    
    return NextResponse.json({ 
      success: true, 
      message: `成功更新${result.length}個服務的順序`
    });
  } catch (error) {
    console.error("更新服務順序失敗:", error);
    return NextResponse.json(
      { error: "更新服務順序時發生錯誤" },
      { status: 500 }
    );
  }
} 