import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

// 初始化Prisma客戶端
const prisma = new PrismaClient();

// 支持Node.js運行時
export const runtime = 'nodejs';
export const revalidate = 3600; // 每小時重新驗證一次

// 檢查用戶是否為管理員
async function isAdmin(request: Request) {
  const token = await getToken({ req: request as any });
  return token?.role === 'ADMIN' || token?.role?.toUpperCase() === 'ADMIN';
}

// 獲取服務列表 - 公開API，所有用戶可以訪問
export async function GET(request: Request) {
  try {
    // 解析URL查詢參數
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';
    const showAll = searchParams.get('all') === 'true';
    
    // 构建查询条件
    let where: any = {};
    
    // 如果是公開API，只返回活躍的服務
    if (isPublic && !showAll) {
      where.isActive = true;
      
      // 過濾掉過期的期間限定服務
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 設置到當天的開始
      
      where.OR = [
        { isLimitedTime: false }, // 不是期間限定的服務
        {
          AND: [
            { isLimitedTime: true },
            { limitedStartDate: { lte: today } }, // 開始日期早於或等於今天
            { limitedEndDate: { gte: today } } // 結束日期晚於或等於今天
          ]
        }
      ];
    }
    
    // 獲取所有服務，包括關聯的按摩師和時長
    const services = await prisma.service.findMany({
      where,
      include: {
        masseurs: true,
        durations: true
      },
      orderBy: [
        { isRecommend: 'desc' }, // 首先按推薦狀態排序
        { isFlashSale: 'desc' }, // 然後按快閃方案排序
        { isLimitedTime: 'desc' }, // 然後按期間限定排序
        { createdAt: 'desc' } // 最後按創建時間排序
      ]
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
      // 期間限定相關字段
      isLimitedTime,
      limitedStartDate,
      limitedEndDate,
      // 快閃方案相關字段
      isFlashSale,
      flashSalePercent,
      flashSalePrice,
      flashSaleNote,
      // 關聯資料
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
      const invalidDurations = durations.filter((d: any) => 
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
    
    // 檢查期間限定相關參數
    if (isLimitedTime) {
      if (!limitedStartDate || !limitedEndDate) {
        console.log('期間限定服務缺少開始或結束日期');
        return NextResponse.json({ error: '期間限定服務必須提供開始和結束日期' }, { status: 400 });
      }
      
      const startDate = new Date(limitedStartDate);
      const endDate = new Date(limitedEndDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log('期間限定日期格式無效');
        return NextResponse.json({ error: '期間限定日期格式無效' }, { status: 400 });
      }
      
      if (endDate <= startDate) {
        console.log('期間限定結束日期不能早於開始日期');
        return NextResponse.json({ error: '期間限定結束日期必須晚於開始日期' }, { status: 400 });
      }
    }
    
    // 檢查快閃方案相關參數
    if (isFlashSale) {
      if (flashSalePercent === undefined && flashSalePrice === undefined) {
        console.log('快閃方案缺少折扣百分比或特價');
        return NextResponse.json({ error: '快閃方案必須提供折扣百分比或特價' }, { status: 400 });
      }
      
      if (flashSalePercent !== undefined && flashSalePercent !== null) {
        const percent = Number(flashSalePercent);
        if (isNaN(percent) || percent < 0 || percent > 100) {
          console.log('快閃折扣百分比無效:', flashSalePercent);
          return NextResponse.json({ error: '快閃折扣百分比必須在0到100之間' }, { status: 400 });
        }
      }
      
      if (flashSalePrice !== undefined && flashSalePrice !== null) {
        const specialPrice = Number(flashSalePrice);
        if (isNaN(specialPrice) || specialPrice < 0) {
          console.log('快閃特價無效:', flashSalePrice);
          return NextResponse.json({ error: '快閃特價必須是大於0的數字' }, { status: 400 });
        }
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
      isLimitedTime,
      isFlashSale,
      masseurs: masseurs?.length || 0
    });

    try {
      // 創建基本服務資訊
      const service = await prisma.service.create({
        data: {
          name,
          description: description || '',
          price: parseFloat(servicePrice.toString()),
          duration: parseInt(serviceDuration.toString()),
          type: type || 'SINGLE',
          category: category || 'MASSAGE',
          isRecommend: isRecommended || false,
          // 期間限定相關字段
          isLimitedTime: isLimitedTime || false,
          limitedStartDate: isLimitedTime ? new Date(limitedStartDate) : null,
          limitedEndDate: isLimitedTime ? new Date(limitedEndDate) : null,
          // 快閃方案相關字段
          isFlashSale: isFlashSale || false,
          flashSalePercent: isFlashSale && flashSalePercent !== undefined ? 
            parseInt(flashSalePercent.toString()) : null,
          flashSalePrice: isFlashSale && flashSalePrice !== undefined ? 
            parseFloat(flashSalePrice.toString()) : null,
          flashSaleNote: isFlashSale ? flashSaleNote || null : null,
          // 關聯資料
          masseurs: {
            connect: masseurs?.map((m: { id: string }) => ({ id: m.id })) || []
          }
        }
      });

      console.log('服務創建成功, ID:', service.id);

      // 分別創建每個服務時長
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

      // 查詢完整服務資訊（包含關聯資料）
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
      recommendOrder,
      // 期間限定相關字段
      isLimitedTime,
      limitedStartDate,
      limitedEndDate,
      // 快閃方案相關字段
      isFlashSale,
      flashSalePercent,
      flashSalePrice,
      flashSaleNote,
      // 關聯資料
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
      const invalidDurations = durations.filter((d: any) => 
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
    
    // 檢查期間限定相關參數
    if (isLimitedTime) {
      if (!limitedStartDate || !limitedEndDate) {
        console.log('期間限定服務缺少開始或結束日期');
        return NextResponse.json({ error: '期間限定服務必須提供開始和結束日期' }, { status: 400 });
      }
      
      const startDate = new Date(limitedStartDate);
      const endDate = new Date(limitedEndDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log('期間限定日期格式無效');
        return NextResponse.json({ error: '期間限定日期格式無效' }, { status: 400 });
      }
      
      if (endDate <= startDate) {
        console.log('期間限定結束日期不能早於開始日期');
        return NextResponse.json({ error: '期間限定結束日期必須晚於開始日期' }, { status: 400 });
      }
    }
    
    // 檢查快閃方案相關參數
    if (isFlashSale) {
      if (flashSalePercent === undefined && flashSalePrice === undefined) {
        console.log('快閃方案缺少折扣百分比或特價');
        return NextResponse.json({ error: '快閃方案必須提供折扣百分比或特價' }, { status: 400 });
      }
      
      if (flashSalePercent !== undefined && flashSalePercent !== null) {
        const percent = Number(flashSalePercent);
        if (isNaN(percent) || percent < 0 || percent > 100) {
          console.log('快閃折扣百分比無效:', flashSalePercent);
          return NextResponse.json({ error: '快閃折扣百分比必須在0到100之間' }, { status: 400 });
        }
      }
      
      if (flashSalePrice !== undefined && flashSalePrice !== null) {
        const specialPrice = Number(flashSalePrice);
        if (isNaN(specialPrice) || specialPrice < 0) {
          console.log('快閃特價無效:', flashSalePrice);
          return NextResponse.json({ error: '快閃特價必須是大於0的數字' }, { status: 400 });
        }
      }
    }

    // 確認服務存在
    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      console.log('服務不存在:', id);
      return NextResponse.json({ error: '指定的服務不存在' }, { status: 404 });
    }

    console.log('更新服務:', {
      id,
      name,
      price: servicePrice,
      duration: serviceDuration,
      isRecommended,
      isLimitedTime,
      isFlashSale
    });

    try {
      // 使用事務處理確保數據一致性
      const result = await prisma.$transaction(async (tx) => {
        // 如果提供了durations數組，先刪除所有現有時長，然後重新創建
        if (durations && durations.length > 0) {
          await tx.serviceDuration.deleteMany({
            where: { serviceId: id }
          });

          // 獲取要保留的durations id列表
          const durationsToKeep = durations
            .filter((d: any) => d.id)
            .map((d: any) => d.id);

          console.log(`刪除服務 ${id} 的時長，將重新創建 ${durations.length} 個時長`);

          // 創建新的durations
          for (const d of durations) {
            await tx.serviceDuration.create({
              data: {
                duration: parseInt(d.duration.toString()),
                price: parseFloat(d.price.toString()),
                serviceId: id
              }
            });
          }
        }

        // 更新服務基本資訊
        const updatedService = await tx.service.update({
          where: { id },
          data: {
            name,
            description: description || '',
            price: parseFloat(servicePrice.toString()),
            duration: parseInt(serviceDuration.toString()),
            type: type || 'SINGLE',
            category: category || 'MASSAGE',
            isRecommend: isRecommended || false,
            // 期間限定相關字段
            isLimitedTime: isLimitedTime || false,
            limitedStartDate: isLimitedTime ? new Date(limitedStartDate) : null,
            limitedEndDate: isLimitedTime ? new Date(limitedEndDate) : null,
            // 快閃方案相關字段
            isFlashSale: isFlashSale || false,
            flashSalePercent: isFlashSale && flashSalePercent !== undefined ? 
              parseInt(flashSalePercent.toString()) : null,
            flashSalePrice: isFlashSale && flashSalePrice !== undefined ? 
              parseFloat(flashSalePrice.toString()) : null,
            flashSaleNote: isFlashSale ? flashSaleNote || null : null,
            // 如果提供了masseurs數組，則更新關聯
            ...(masseurs ? {
              masseurs: {
                set: [], // 清除所有現有關聯
                connect: masseurs.map((m: { id: string }) => ({ id: m.id }))
              }
            } : {}),
          },
          include: {
            masseurs: true,
            durations: true
          }
        });

        return updatedService;
      });

      console.log('服務更新成功:', result.id);
      
      return NextResponse.json(result);
    } catch (dbError) {
      console.error('更新服務失敗:', dbError);
      return NextResponse.json({ 
        error: `更新服務失敗: ${dbError instanceof Error ? dbError.message : '未知錯誤'}`,
        details: process.env.NODE_ENV === 'development' ? (dbError instanceof Error ? dbError.stack : undefined) : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error('更新服務失敗:', error);
    return NextResponse.json({ 
      error: `更新服務失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
}

// 刪除服務 - 僅管理員可訪問
export async function DELETE(request: Request) {
  try {
    // 檢查是否為管理員
    if (!await isAdmin(request)) {
      console.log('非管理員嘗試刪除服務')
      return NextResponse.json({ error: '未授權訪問，僅管理員可以刪除服務' }, { status: 403 });
    }

    // 獲取要刪除的服務ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.log('缺少服務ID參數');
      return NextResponse.json({ error: '缺少服務ID參數' }, { status: 400 });
    }

    // 確認服務存在
    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      console.log('服務不存在:', id);
      return NextResponse.json({ error: '指定的服務不存在' }, { status: 404 });
    }

    // 刪除服務
    // 注意: 由於我們在schema中設置了onDelete: Cascade，
    // 服務時長將自動被刪除
    await prisma.service.delete({
      where: { id }
    });

    console.log('服務刪除成功:', id);
    return NextResponse.json({ message: '服務刪除成功' });
  } catch (error) {
    console.error('刪除服務失敗:', error);
    return NextResponse.json({ error: '刪除服務失敗' }, { status: 500 });
  }
} 