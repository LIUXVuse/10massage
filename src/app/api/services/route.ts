import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getToken } from 'next-auth/jwt';

// 支持Cloudflare Pages和Prisma
export const runtime = 'nodejs'; // 從'edge'改為'nodejs'，以支持Prisma
export const revalidate = 3600; // 每小時重新驗證一次

// 檢查用戶是否為管理員
async function isAdmin(request: Request) {
  const token = await getToken({ req: request as any });
  return token?.role === 'ADMIN' || token?.role?.toUpperCase() === 'ADMIN';
}

// 獲取服務列表 - 公開API，所有用戶可以訪問
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        masseurs: true,
        durations: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('獲取服務列表失敗:', error);
    return NextResponse.json({ error: '獲取服務列表失敗' }, { status: 500 });
  }
}

// 創建服務 - 僅管理員可訪問
export async function POST(request: Request) {
  try {
    // 檢查是否為管理員
    if (!await isAdmin(request)) {
      console.log('非管理員嘗試創建服務')
      return NextResponse.json({ error: '未授權訪問，僅管理員可以創建服務' }, { status: 403 });
    }

    const body = await request.json();
    console.log('POST服務API接收的數據:', JSON.stringify(body, null, 2));
    
    const {
      name,
      description,
      price,
      duration,
      type,
      category,
      isRecommended,
      recommendOrder,
      masseurs,
      durations,
    } = body;

    if (!name) {
      console.log('缺少服務名稱參數');
      return NextResponse.json({ error: '缺少服務名稱(name)參數' }, { status: 400 });
    }

    // 檢查是否提供了masseurs
    if (!masseurs || !Array.isArray(masseurs) || masseurs.length === 0) {
      console.log('缺少按摩師參數或格式不正確');
      return NextResponse.json({ error: '請選擇至少一位按摩師' }, { status: 400 });
    }

    // 檢查是否提供了durations
    if (!durations || !Array.isArray(durations) || durations.length === 0) {
      console.log('缺少時長價格參數或格式不正確');
      return NextResponse.json({ error: '請提供至少一個有效的時長價格組合' }, { status: 400 });
    }

    // 使用durations中的第一個時長價格作為服務基本價格和時長
    const servicePrice = price || (durations.length > 0 ? durations[0].price : 0);
    const serviceDuration = duration || (durations.length > 0 ? durations[0].duration : 0);

    // 檢查價格和時長是否為有效數字
    if (isNaN(Number(servicePrice)) || Number(servicePrice) <= 0) {
      console.log('無效的價格:', servicePrice);
      return NextResponse.json({ error: '價格必須是大於0的數字' }, { status: 400 });
    }

    if (isNaN(Number(serviceDuration)) || Number(serviceDuration) <= 0) {
      console.log('無效的時長:', serviceDuration);
      return NextResponse.json({ error: '時長必須是大於0的整數' }, { status: 400 });
    }

    // 驗證durations數組
    if (durations) {
      const invalidDurations = durations.filter(d => 
        isNaN(Number(d.duration)) || Number(d.duration) <= 0 || 
        isNaN(Number(d.price)) || Number(d.price) <= 0
      );
      
      if (invalidDurations.length > 0) {
        console.log('發現無效的時長價格選項:', invalidDurations);
        return NextResponse.json({ 
          error: '所有時長必須是大於0的整數，價格必須是大於0的數字',
          invalidItems: invalidDurations 
        }, { status: 400 });
      }
    }

    console.log('創建服務:', {
      name,
      description,
      price: servicePrice,
      duration: serviceDuration,
      type,
      category,
      isRecommended,
      masseurs: masseurs?.length || 0
    });

    try {
      // 先創建基本服務
      const service = await prisma.service.create({
        data: {
          name,
          description: description || '',
          price: parseFloat(servicePrice.toString()),
          duration: parseInt(serviceDuration.toString()),
          type: type || 'SINGLE',
          category: category || 'MASSAGE',
          isRecommend: isRecommended || false,
          masseurs: {
            connect: masseurs?.map((m: { id: string }) => ({ id: m.id })) || []
          }
        }
      });

      console.log('服務創建成功, ID:', service.id);

      // 單獨添加服務時長
      if (durations && durations.length > 0) {
        for (const d of durations) {
          await prisma.serviceDuration.create({
            data: {
              duration: parseInt(d.duration.toString()),
              price: parseFloat(d.price.toString()),
              serviceId: service.id
            }
          });
        }
        console.log(`已添加 ${durations.length} 個服務時長選項`);
      }

      // 獲取完整的服務資訊（包括新增的時長）
      const completeService = await prisma.service.findUnique({
        where: { id: service.id },
        include: {
          masseurs: true,
          durations: true
        }
      });

      return NextResponse.json(completeService);
    } catch (dbError) {
      console.error('數據庫操作失敗:', dbError);
      return NextResponse.json({ 
        error: `數據庫操作失敗: ${dbError instanceof Error ? dbError.message : '未知錯誤'}`,
        details: process.env.NODE_ENV === 'development' ? (dbError instanceof Error ? dbError.stack : undefined) : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error('創建服務失敗:', error);
    // 返回更詳細的錯誤訊息
    return NextResponse.json({ 
      error: `創建服務失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
}

// 更新服務 - 僅管理員可訪問
export async function PUT(request: Request) {
  try {
    // 檢查是否為管理員
    if (!await isAdmin(request)) {
      console.log('非管理員嘗試更新服務')
      return NextResponse.json({ error: '未授權訪問，僅管理員可以更新服務' }, { status: 403 });
    }

    const body = await request.json();
    console.log('PUT服務API接收的數據:', JSON.stringify(body, null, 2));
    
    const {
      id,
      name,
      description,
      price,
      duration,
      type,
      category,
      isRecommended,
      masseurs,
      durations,
    } = body;

    if (!id) {
      console.log('缺少服務ID');
      return NextResponse.json({ error: '缺少服務ID' }, { status: 400 });
    }

    // 如果提供了durations數組，使用第一個duration的值作為默認值
    const servicePrice = price || (durations && durations.length > 0 ? durations[0].price : 0);
    const serviceDuration = duration || (durations && durations.length > 0 ? durations[0].duration : 0);

    if (!servicePrice) {
      console.log('缺少價格參數');
      return NextResponse.json({ error: '缺少價格(price)參數' }, { status: 400 });
    }

    if (!serviceDuration) {
      console.log('缺少時長參數');
      return NextResponse.json({ error: '缺少時長(duration)參數' }, { status: 400 });
    }

    // 檢查價格和時長是否為有效數字
    if (isNaN(Number(servicePrice)) || Number(servicePrice) <= 0) {
      console.log('無效的價格:', servicePrice);
      return NextResponse.json({ error: '價格必須是大於0的數字' }, { status: 400 });
    }

    if (isNaN(Number(serviceDuration)) || Number(serviceDuration) <= 0) {
      console.log('無效的時長:', serviceDuration);
      return NextResponse.json({ error: '時長必須是大於0的整數' }, { status: 400 });
    }

    // 驗證durations數組
    if (durations) {
      const invalidDurations = durations.filter(d => 
        isNaN(Number(d.duration)) || Number(d.duration) <= 0 || 
        isNaN(Number(d.price)) || Number(d.price) <= 0
      );
      
      if (invalidDurations.length > 0) {
        console.log('發現無效的時長價格選項:', invalidDurations);
        return NextResponse.json({ 
          error: '所有時長必須是大於0的整數，價格必須是大於0的數字',
          invalidItems: invalidDurations 
        }, { status: 400 });
      }
    }

    // 先獲取服務的當前按摩師
    const currentService = await prisma.service.findUnique({
      where: { id },
      include: { 
        masseurs: true
      }
    });

    if (!currentService) {
      console.log('找不到服務, ID:', id);
      return NextResponse.json({ error: '找不到服務' }, { status: 404 });
    }

    console.log('更新服務:', {
      id,
      name,
      price: servicePrice,
      duration: serviceDuration,
      masseurs: masseurs?.length || 0
    });

    try {
      // 1. 更新服務基本資訊
      const service = await prisma.service.update({
        where: { id },
        data: {
          name,
          description,
          price: parseFloat(servicePrice.toString()),
          duration: parseInt(serviceDuration.toString()),
          type: type || 'SINGLE',
          category: category || 'MASSAGE',
          isRecommend: isRecommended || false
        }
      });

      // 2. 更新按摩師關聯
      if (masseurs && Array.isArray(masseurs)) {
        // 先斷開所有按摩師關聯
        await prisma.service.update({
          where: { id },
          data: {
            masseurs: {
              set: []
            }
          }
        });

        // 再重新關聯新的按摩師
        await prisma.service.update({
          where: { id },
          data: {
            masseurs: {
              connect: masseurs.map((m: { id: string }) => ({ id: m.id }))
            }
          }
        });

        console.log('按摩師關聯更新成功');
      }

      // 3. 更新服務時長
      if (durations && durations.length > 0) {
        // 先刪除所有舊的時長
        await prisma.serviceDuration.deleteMany({
          where: { serviceId: id }
        });

        // 添加新的時長
        for (const d of durations) {
          await prisma.serviceDuration.create({
            data: {
              duration: parseInt(d.duration.toString()),
              price: parseFloat(d.price.toString()),
              serviceId: id
            }
          });
        }

        console.log(`已更新 ${durations.length} 個服務時長選項`);
      }

      // 獲取更新後的完整服務資訊
      const updatedService = await prisma.service.findUnique({
        where: { id },
        include: {
          masseurs: true,
          durations: true
        }
      });

      return NextResponse.json(updatedService);
    } catch (error) {
      console.error('更新服務失敗:', error);
      return NextResponse.json({ 
        error: `更新服務失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error('更新服務處理失敗:', error);
    return NextResponse.json({ 
      error: `更新服務處理失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
}

// 刪除服務 - 僅管理員可訪問
export async function DELETE(request: Request) {
  try {
    // 檢查是否為管理員
    if (!await isAdmin(request)) {
      return NextResponse.json({ error: '未授權訪問，僅管理員可以刪除服務' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少服務 ID' }, { status: 400 });
    }

    // 刪除服務時，關聯的ServiceDuration會因為onDelete: Cascade自動刪除
    // 先斷開與按摩師的關聯，再刪除服務
    await prisma.service.update({
      where: { id },
      data: {
        masseurs: {
          set: []
        }
      }
    });

    await prisma.service.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除服務失敗:', error);
    return NextResponse.json({ error: '刪除服務失敗' }, { status: 500 });
  }
} 