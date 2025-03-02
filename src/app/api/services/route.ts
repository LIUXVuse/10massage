import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth/auth.server';

// 支持Node.js運行時
export const runtime = 'nodejs';
export const revalidate = 3600; // 每小時重新驗證一次

// 檢查用戶是否為管理員
async function isAdmin(request: Request) {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    return session?.user?.role === 'admin';
  } catch (error) {
    console.error('驗證管理員權限時出錯:', error);
    return false;
  }
}

// 獲取服務列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get('public') === 'true';
    const activeOnly = searchParams.get('active') === 'true';
    const withDetails = searchParams.get('details') === 'true';
    const withInactive = searchParams.get('withInactive') === 'true';

    // 只獲取有效服務
    let whereClause: any = {};
    
    // 如果有這個參數，包括非活動狀態
    if (!withInactive) {
      whereClause.isActive = true;
    }
    
    // 檢查是否為管理員
    const userIsAdmin = await isAdmin(request);
    
    // 如果不是管理員或者明確要求只顯示公開服務
    if (publicOnly || !userIsAdmin) {
      // 檢查今天日期是否在限定期間內
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 設置為當天的00:00:00
      
      // 創建查詢條件: 非期間限定 或 在有效期內的期間限定
      whereClause = {
        ...whereClause,
        OR: [
          { isLimitedTime: false },
          {
            isLimitedTime: true,
            limitedStartDate: { lte: today },
            limitedEndDate: { gte: today }
          }
        ]
      };
    }
    
    // 獲取服務列表
    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        masseurs: {
          select: {
            id: true,
            name: true,
            image: true,
            isActive: true
          }
        },
        durations: {
          orderBy: {
            duration: 'asc'
          }
        }
      },
      orderBy: [
        { isRecommend: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    return NextResponse.json(services);
  } catch (error) {
    console.error('獲取服務列表失敗:', error);
    return NextResponse.json({ error: '獲取服務列表失敗' }, { status: 500 });
  }
}

// 創建新服務 - 僅管理員可訪問
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
      limitedSpecialPrice,
      limitedDiscountPercent,
      limitedNote,
      // 快閃方案相關字段
      isFlashSale,
      flashSaleNote,
      // 關聯資料
      masseurs,
      durations,
    } = body;

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
      
      // 檢查特價或折扣至少要有一個
      if (limitedDiscountPercent === undefined && limitedSpecialPrice === undefined) {
        console.log('期間限定缺少折扣百分比或特價');
        return NextResponse.json({ error: '期間限定必須提供折扣百分比或特價' }, { status: 400 });
      }
      
      // 檢查折扣百分比有效性
      if (limitedDiscountPercent !== undefined && limitedDiscountPercent !== null) {
        const percent = Number(limitedDiscountPercent);
        if (isNaN(percent) || percent < 0 || percent > 100) {
          console.log('折扣百分比無效:', limitedDiscountPercent);
          return NextResponse.json({ error: '折扣百分比必須在0到100之間' }, { status: 400 });
        }
      }
      
      // 檢查特價有效性
      if (limitedSpecialPrice !== undefined && limitedSpecialPrice !== null) {
        const specialPrice = Number(limitedSpecialPrice);
        if (isNaN(specialPrice) || specialPrice < 0) {
          console.log('特價無效:', limitedSpecialPrice);
          return NextResponse.json({ error: '特價必須是大於0的數字' }, { status: 400 });
        }
      }
    }
    
    // 檢查快閃方案相關參數
    if (isFlashSale) {
      if (!limitedStartDate || !limitedEndDate) {
        console.log('快閃方案缺少開始或結束日期');
        return NextResponse.json({ error: '快閃方案必須提供開始和結束日期' }, { status: 400 });
      }
      
      const startDate = new Date(limitedStartDate);
      const endDate = new Date(limitedEndDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log('快閃方案日期格式無效');
        return NextResponse.json({ error: '快閃方案日期格式無效' }, { status: 400 });
      }
      
      if (endDate <= startDate) {
        console.log('快閃方案結束日期不能早於開始日期');
        return NextResponse.json({ error: '快閃方案結束日期必須晚於開始日期' }, { status: 400 });
      }
    }

    try {
      // 使用事務處理確保數據一致性
      const result = await prisma.$transaction(async (tx) => {
        // 創建服務
        const service = await tx.service.create({
          data: {
            name,
            description: description || '',
            price: parseFloat(servicePrice.toString()),
            duration: parseInt(serviceDuration.toString()),
            type: type || 'SINGLE',
            category: category || 'MASSAGE',
            isActive: true,
            isRecommend: isRecommended || false,
            // 期間限定相關字段
            isLimitedTime: isLimitedTime || false,
            limitedStartDate: isLimitedTime ? new Date(limitedStartDate) : null,
            limitedEndDate: isLimitedTime ? new Date(limitedEndDate) : null,
            limitedSpecialPrice: isLimitedTime && limitedSpecialPrice !== undefined ? 
              parseFloat(limitedSpecialPrice.toString()) : null,
            limitedDiscountPercent: isLimitedTime && limitedDiscountPercent !== undefined ? 
              parseInt(limitedDiscountPercent.toString()) : null,
            limitedNote: isLimitedTime ? limitedNote || null : null,
            // 快閃方案相關字段
            isFlashSale: isFlashSale || false,
            flashSaleNote: isFlashSale ? flashSaleNote || null : null,
            // 設置按摩師關聯
            ...(masseurs ? {
              masseurs: {
                connect: masseurs.map((m: { id: string }) => ({ id: m.id }))
              }
            } : {})
          }
        });

        // 創建服務時長
        if (durations && durations.length > 0) {
          for (const d of durations) {
            await tx.serviceDuration.create({
              data: {
                duration: parseInt(d.duration.toString()),
                price: parseFloat(d.price.toString()),
                serviceId: service.id
              }
            });
          }
        }

        return service;
      });

      console.log('服務創建成功:', result.id);
      return NextResponse.json(result);
    } catch (dbError) {
      console.error('創建服務失敗:', dbError);
      return NextResponse.json({ 
        error: `創建服務失敗: ${dbError instanceof Error ? dbError.message : '未知錯誤'}`,
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
      limitedSpecialPrice,
      limitedDiscountPercent,
      limitedNote,
      // 快閃方案相關字段
      isFlashSale,
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
      
      // 檢查特價或折扣至少要有一個
      if (limitedDiscountPercent === undefined && limitedSpecialPrice === undefined) {
        console.log('期間限定缺少折扣百分比或特價');
        return NextResponse.json({ error: '期間限定必須提供折扣百分比或特價' }, { status: 400 });
      }
      
      // 檢查折扣百分比有效性
      if (limitedDiscountPercent !== undefined && limitedDiscountPercent !== null) {
        const percent = Number(limitedDiscountPercent);
        if (isNaN(percent) || percent < 0 || percent > 100) {
          console.log('折扣百分比無效:', limitedDiscountPercent);
          return NextResponse.json({ error: '折扣百分比必須在0到100之間' }, { status: 400 });
        }
      }
      
      // 檢查特價有效性
      if (limitedSpecialPrice !== undefined && limitedSpecialPrice !== null) {
        const specialPrice = Number(limitedSpecialPrice);
        if (isNaN(specialPrice) || specialPrice < 0) {
          console.log('特價無效:', limitedSpecialPrice);
          return NextResponse.json({ error: '特價必須是大於0的數字' }, { status: 400 });
        }
      }
    }
    
    // 檢查快閃方案相關參數
    if (isFlashSale) {
      if (!limitedStartDate || !limitedEndDate) {
        console.log('快閃方案缺少開始或結束日期');
        return NextResponse.json({ error: '快閃方案必須提供開始和結束日期' }, { status: 400 });
      }
      
      const startDate = new Date(limitedStartDate);
      const endDate = new Date(limitedEndDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log('快閃方案日期格式無效');
        return NextResponse.json({ error: '快閃方案日期格式無效' }, { status: 400 });
      }
      
      if (endDate <= startDate) {
        console.log('快閃方案結束日期不能早於開始日期');
        return NextResponse.json({ error: '快閃方案結束日期必須晚於開始日期' }, { status: 400 });
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
            limitedSpecialPrice: isLimitedTime && limitedSpecialPrice !== undefined ? 
              parseFloat(limitedSpecialPrice.toString()) : null,
            limitedDiscountPercent: isLimitedTime && limitedDiscountPercent !== undefined ? 
              parseInt(limitedDiscountPercent.toString()) : null,
            limitedNote: isLimitedTime ? limitedNote || null : null,
            // 快閃方案相關字段
            isFlashSale: isFlashSale || false,
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