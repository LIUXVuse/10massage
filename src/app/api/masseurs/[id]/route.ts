import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getToken } from 'next-auth/jwt';

// 支持Cloudflare Pages和Prisma
export const runtime = 'nodejs'; // 從'edge'改為'nodejs'，以支持Prisma
export const revalidate = 3600; // 每小時重新驗證一次

interface Props {
  params: { id: string }
}

// 判斷請求是否來自管理員
async function isAdmin(request: Request) {
  const token = await getToken({ req: request as any });
  return token?.role?.toUpperCase() === 'ADMIN';
}

// 獲取單一按摩師詳細資料
export async function GET(request: Request, { params }: Props) {
  try {
    // 檢查是否為管理員 - 注意：由於這是編輯頁面使用的API，應該只有管理員可以訪問
    if (!await isAdmin(request)) {
      return NextResponse.json({ error: '未授權訪問，僅管理員可以查看按摩師詳細資料' }, { status: 403 });
    }
    
    const { id } = params;
    
    // 查詢單一按摩師，包括其服務項目
    const masseur = await prisma.masseur.findUnique({
      where: { id },
      include: {
        services: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // 如果找不到按摩師，返回404錯誤
    if (!masseur) {
      return NextResponse.json({ error: '找不到按摩師' }, { status: 404 });
    }

    // 記錄完整的按摩師資料用於調試
    console.log('獲取單一按摩師原始數據:', masseur);

    // 將數據庫中的image字段映射到前端使用的imageUrl，並包含所有裁剪參數
    const mappedMasseur = {
      ...masseur,
      imageUrl: masseur.image,
      // 確保這些欄位具有預設值，以防資料庫中沒有這些值
      imageScale: (masseur as any).imageScale || 1,
      cropX: (masseur as any).cropX || 0,
      cropY: (masseur as any).cropY || 0,
      cropWidth: (masseur as any).cropWidth || 300,
      cropHeight: (masseur as any).cropHeight || 225
    };
    
    console.log('返回給前端的按摩師數據:', mappedMasseur);
    
    return NextResponse.json(mappedMasseur);
  } catch (error) {
    console.error('獲取按摩師詳細資料時發生錯誤:', error);
    return NextResponse.json({ error: '獲取按摩師詳細資料失敗' }, { status: 500 });
  }
} 