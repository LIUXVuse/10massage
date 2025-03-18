import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getToken } from 'next-auth/jwt';
import { NextApiRequest } from 'next';
import { db } from "@/lib/db";

// 支持Cloudflare Pages和Prisma
export const runtime = 'nodejs'; // 從'edge'改為'nodejs'，以支持Prisma
export const revalidate = 3600; // 每小時重新驗證一次

// 獲取按摩師列表 - 公開API，所有用戶可以訪問
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";
    
    // 构建查询条件
    const where: any = {};
    
    // 如果只查询激活的按摩师
    if (activeOnly) {
      where.isActive = true;
    }
    
    // 获取按摩师列表
    const masseurs = await db.masseur.findMany({
      where,
      orderBy: {
        sortOrder: "asc"
      }
    });
    
    // 處理圖片URL映射
    const masseursWithImageUrl = masseurs.map(masseur => ({
      ...masseur,
      imageUrl: masseur.image // 將數據庫中的image屬性映射到前端使用的imageUrl
    }));
    
    return NextResponse.json(masseursWithImageUrl);
  } catch (error) {
    console.error("获取按摩师列表失败:", error);
    return NextResponse.json(
      { error: "获取按摩师列表失败" },
      { status: 500 }
    );
  }
}

// 判斷請求是否來自管理員
async function isAdmin(request: Request) {
  const token = await getToken({ req: request as any });
  return token?.role?.toUpperCase() === 'ADMIN';
}

// 更新按摩師排序 - 僅管理員可訪問
export async function PATCH(request: Request) {
  try {
    // 檢查是否為管理員
    if (!await isAdmin(request)) {
      return NextResponse.json({ error: '未授權訪問，僅管理員可以更新按摩師排序' }, { status: 403 });
    }
    
    const requestData = await request.json();
    console.log('收到排序更新請求數據:', requestData);
    
    const { masseurOrders } = requestData;
    
    // 驗證輸入
    if (!Array.isArray(masseurOrders)) {
      console.error('無效的排序數據:', masseurOrders);
      return NextResponse.json({ error: '無效的請求數據，masseurOrders必須是陣列' }, { status: 400 });
    }
    
    // 檢查陣列內容是否符合預期
    if (masseurOrders.length === 0) {
      console.error('空的排序陣列');
      return NextResponse.json({ error: '排序陣列不能為空' }, { status: 400 });
    }
    
    console.log('準備更新以下按摩師排序:', masseurOrders);
    
    // 使用 Prisma 事務批量更新按摩師的排序欄位
    try {
      const updates = masseurOrders.map(({ id, order }: { id: string, order: number }) => {
        if (!id) {
          throw new Error(`排序更新缺少ID: ${JSON.stringify({ id, order })}`);
        }
        console.log(`更新按摩師 ID: ${id} 的排序為: ${order}`);
        return db.masseur.update({
          where: { id },
          data: { 
            sortOrder: order // 直接更新 sortOrder 欄位
          }
        });
      });
      
      const results = await db.$transaction(updates);
      console.log('按摩師排序更新結果:', results.map(r => ({ id: r.id, sortOrder: r.sortOrder })));
      
      return NextResponse.json({ 
        success: true, 
        message: '按摩師排序已更新',
        updatedCount: results.length 
      });
    } catch (dbError) {
      console.error('資料庫更新操作失敗:', dbError);
      return NextResponse.json({ 
        error: '資料庫更新失敗', 
        details: dbError instanceof Error ? dbError.message : '未知錯誤' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('更新按摩師排序時發生錯誤:', error);
    return NextResponse.json({ 
      error: '更新按摩師排序失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}

// 創建按摩師 - 僅管理員可訪問
export async function POST(request: Request) {
  try {
    // 檢查是否為管理員
    if (!await isAdmin(request)) {
      return NextResponse.json({ error: '未授權訪問，僅管理員可以創建按摩師' }, { status: 403 });
    }
    
    const { 
      name, 
      description, 
      imageUrl, 
      imageScale, 
      imageX, 
      imageY,
      cropX,
      cropY,
      cropWidth,
      cropHeight
    } = await request.json();

    // 使用Prisma創建按摩師
    const masseur = await prisma.masseur.create({
      data: {
        name,
        description,
        image: imageUrl,
        ...(imageScale !== undefined && { imageScale: parseFloat(imageScale.toString()) }),
        ...(imageX !== undefined && { imageX: parseFloat(imageX.toString()) }),
        ...(imageY !== undefined && { imageY: parseFloat(imageY.toString()) }),
        ...(cropX !== undefined && { cropX: parseFloat(cropX.toString()) }),
        ...(cropY !== undefined && { cropY: parseFloat(cropY.toString()) }),
        ...(cropWidth !== undefined && { cropWidth: parseFloat(cropWidth.toString()) }),
        ...(cropHeight !== undefined && { cropHeight: parseFloat(cropHeight.toString()) }),
      }
    });

    return NextResponse.json({ id: masseur.id });
  } catch (error) {
    console.error('創建按摩師時發生錯誤:', error);
    return NextResponse.json({ error: '創建按摩師失敗' }, { status: 500 });
  }
}

// 更新按摩師 - 僅管理員可訪問
export async function PUT(request: Request) {
  try {
    // 檢查是否為管理員
    if (!await isAdmin(request)) {
      return NextResponse.json({ error: '未授權訪問，僅管理員可以更新按摩師' }, { status: 403 });
    }
    
    const requestData = await request.json();
    console.log('接收到的原始更新數據:', requestData);
    
    const { 
      id, 
      name, 
      description, 
      imageUrl, // 前端使用 imageUrl 欄位
      imageScale, 
      cropX,
      cropY,
      cropWidth,
      cropHeight
    } = requestData;

    if (!id) {
      return NextResponse.json({ error: '缺少按摩師ID' }, { status: 400 });
    }
    
    if (!name) {
      return NextResponse.json({ error: '按摩師名稱不能為空' }, { status: 400 });
    }

    console.log('處理後的更新數據:', { 
      id, name, description, imageUrl, imageScale, 
      cropX, cropY, cropWidth, cropHeight 
    });

    // 檢查按摩師是否存在
    const currentMasseur = await prisma.masseur.findUnique({
      where: { id }
    });

    if (!currentMasseur) {
      return NextResponse.json({ error: '找不到按摩師' }, { status: 404 });
    }

    // 準備更新數據
    const updateData: any = {
      name,
      description: description || null,
    };
    
    // 只在有值時才更新相應字段
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (imageScale !== undefined) updateData.imageScale = parseFloat(String(imageScale));
    if (cropX !== undefined) updateData.cropX = parseFloat(String(cropX));
    if (cropY !== undefined) updateData.cropY = parseFloat(String(cropY));
    if (cropWidth !== undefined) updateData.cropWidth = parseFloat(String(cropWidth));
    if (cropHeight !== undefined) updateData.cropHeight = parseFloat(String(cropHeight));
    
    console.log('最終更新數據:', updateData);

    // 更新按摩師
    const masseur = await prisma.masseur.update({
      where: { id },
      data: updateData
    });

    console.log('按摩師更新成功:', masseur);
    return NextResponse.json({ success: true, masseur: { 
      ...masseur, 
      imageUrl: masseur.image // 確保響應中也映射 image 到 imageUrl
    }});
  } catch (error) {
    console.error('更新按摩師時發生錯誤:', error);
    return NextResponse.json({ error: '更新按摩師失敗' }, { status: 500 });
  }
}

// 刪除按摩師 - 僅管理員可訪問
export async function DELETE(request: Request) {
  try {
    // 檢查是否為管理員
    if (!await isAdmin(request)) {
      return NextResponse.json({ error: '未授權訪問，僅管理員可以刪除按摩師' }, { status: 403 });
    }
    
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: '缺少按摩師 ID' }, { status: 400 });
    }

    // 使用Prisma刪除按摩師
    await prisma.masseur.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除按摩師時發生錯誤:', error);
    return NextResponse.json({ error: '刪除按摩師失敗' }, { status: 500 });
  }
} 