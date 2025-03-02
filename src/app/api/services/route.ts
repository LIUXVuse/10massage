import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth/auth.server';

// 支持Node.js運行時
export const runtime = 'nodejs';
export const revalidate = 3600; // 每小時重新驗證一次

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

// 獲取服務列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const public = searchParams.get("public");
    const active = searchParams.get("active");
    const category = searchParams.get("category");
    const details = searchParams.get("details");
    const withInactive = searchParams.get("withInactive");

    // 根據查詢參數構建查詢條件
    let where: any = {};
    
    // 如果指定了ID，則查詢特定服務
    if (id) {
      where.id = id;
    }
    
    // 如果指定了分類，則按分類過濾
    if (category) {
      where.category = category;
    }
    
    // 如果要求活躍服務或公開服務，則只返回活躍的
    if (active === "true" || public === "true") {
      where.active = true;
    }
    
    // 如果不是特別要求包含非活躍服務，則只返回活躍的
    if (withInactive !== "true" && active !== "false") {
      where.active = true;
    }

    // 對於公開API請求，篩選僅當前有效的限時優惠和閃購服務
    if (public === "true") {
      const now = new Date();
      
      // 使用OR條件：常規服務 或 當前有效的限時優惠 或 當前有效的閃購
      where.OR = [
        // 常規服務 (非限時優惠且非閃購)
        {
          isLimitedTime: false,
          isFlashSale: false,
        },
        // 當前有效的限時優惠
        {
          isLimitedTime: true,
          limitedTimeStart: { lte: now },
          limitedTimeEnd: { gte: now },
        },
        // 當前有效的閃購
        {
          isFlashSale: true,
          flashSaleStart: { lte: now },
          flashSaleEnd: { gte: now },
        },
      ];
    }

    // 構建包含標準關聯的查詢
    const include: any = {
      durations: true,
      masseurs: {
        include: {
          masseur: true,
        },
      },
    };
    
    // 如果需要詳細信息，則包含其他關聯數據
    if (details === "true") {
      include.genderPrices = true;
      include.areaPrices = true;
      include.addons = true;
      include.packageItems = true;
      include.packageOptions = {
        include: {
          items: true,
        },
      };
    }

    // 執行查詢
    const services = await prisma.service.findMany({
      where,
      include,
      orderBy: {
        createdAt: "desc",
      },
    });

    // 如果查詢特定ID但找不到結果，則返回404
    if (id && services.length === 0) {
      return NextResponse.json(
        { error: "找不到指定服務" },
        { status: 404 }
      );
    }

    // 轉換結果為前端友好格式
    const formattedServices = services.map((service) => {
      // 提取按摩師信息
      const masseurs = service.masseurs.map((ms) => ({
        id: ms.masseur.id,
        name: ms.masseur.name,
        avatar: ms.masseur.avatar,
      }));

      // 返回格式化服務對象
      return {
        ...service,
        masseurs,
        // 移除原始按摩師關聯數據
        masseursRelations: undefined,
      };
    });

    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error("獲取服務失敗:", error);
    return NextResponse.json(
      { error: "獲取服務時發生錯誤" },
      { status: 500 }
    );
  }
}

// 創建新服務 - 僅管理員可訪問
export async function POST(request: Request) {
  try {
    // 檢查用戶是否為管理員
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // 驗證必填字段
    if (!data.name || !data.duration || data.price === undefined) {
      return NextResponse.json(
        { error: "必須提供服務名稱、時長和價格" },
        { status: 400 }
      );
    }

    // 檢查服務類型並進行相應的驗證
    let serviceType = "standard";
    
    // 檢查是否為性別定價服務
    if (data.genderPrices?.length > 0) {
      serviceType = "genderPricing";
      // 驗證性別定價數據
      if (!data.genderPrices.every((gp: any) => gp.gender && gp.price !== undefined)) {
        return NextResponse.json(
          { error: "性別定價服務必須提供性別和價格" },
          { status: 400 }
        );
      }
    }
    
    // 檢查是否為區域定價服務
    if (data.areaPrices?.length > 0) {
      serviceType = "areaPricing";
      // 驗證區域定價數據
      if (!data.areaPrices.every((ap: any) => ap.area && ap.price !== undefined)) {
        return NextResponse.json(
          { error: "區域定價服務必須提供區域名稱和價格" },
          { status: 400 }
        );
      }
    }
    
    // 檢查是否為套餐服務
    if (data.packageItems?.length > 0) {
      serviceType = "package";
      // 驗證套餐數據
      if (!data.packageItems.every((item: any) => 
        item.serviceId && item.serviceName && item.duration)
      ) {
        return NextResponse.json(
          { error: "套餐服務必須提供服務ID、名稱和時長" },
          { status: 400 }
        );
      }
    }

    // 檢查限時優惠邏輯
    if (data.isLimitedTime) {
      if (!data.limitedTimeStart || !data.limitedTimeEnd) {
        return NextResponse.json(
          { error: "限時優惠必須提供開始和結束時間" },
          { status: 400 }
        );
      }
      
      const startDate = new Date(data.limitedTimeStart);
      const endDate = new Date(data.limitedTimeEnd);
      
      if (endDate < startDate) {
        return NextResponse.json(
          { error: "限時優惠結束時間必須晚於開始時間" },
          { status: 400 }
        );
      }
    }

    // 檢查閃購邏輯
    if (data.isFlashSale) {
      if (!data.flashSaleStart || !data.flashSaleEnd) {
        return NextResponse.json(
          { error: "閃購必須提供開始和結束時間" },
          { status: 400 }
        );
      }
      
      const startDate = new Date(data.flashSaleStart);
      const endDate = new Date(data.flashSaleEnd);
      
      if (endDate < startDate) {
        return NextResponse.json(
          { error: "閃購結束時間必須晚於開始時間" },
          { status: 400 }
        );
      }
    }

    // 處理服務創建
    const result = await prisma.$transaction(async (tx) => {
      // 創建基本服務
      const service = await tx.service.create({
        data: {
          name: data.name,
          description: data.description,
          image: data.image,
          category: data.category,
          duration: parseInt(data.duration),
          price: parseFloat(data.price),
          isLimitedTime: data.isLimitedTime || false,
          limitedTimeStart: data.limitedTimeStart ? new Date(data.limitedTimeStart) : null,
          limitedTimeEnd: data.limitedTimeEnd ? new Date(data.limitedTimeEnd) : null,
          limitedSpecialPrice: data.limitedSpecialPrice,
          limitedDiscountPercent: data.limitedDiscountPercent,
          limitedNote: data.limitedNote,
          isFlashSale: data.isFlashSale || false,
          flashSaleStart: data.flashSaleStart ? new Date(data.flashSaleStart) : null,
          flashSaleEnd: data.flashSaleEnd ? new Date(data.flashSaleEnd) : null,
          flashSaleNote: data.flashSaleNote,
          active: data.active !== undefined ? data.active : true,
        },
      });

      // 處理多時長選項
      if (data.durations && data.durations.length > 0) {
        await Promise.all(
          data.durations.map((duration: any) =>
            tx.serviceDuration.create({
              data: {
                serviceId: service.id,
                duration: parseInt(duration.duration),
                price: parseFloat(duration.price),
              },
            })
          )
        );
      }

      // 處理按摩師關聯
      if (data.masseursIds && data.masseursIds.length > 0) {
        await Promise.all(
          data.masseursIds.map((masseursId: string) =>
            tx.masseurService.create({
              data: {
                serviceId: service.id,
                masseurId: masseursId,
              },
            })
          )
        );
      }
      
      // 處理性別定價
      if (serviceType === "genderPricing" && data.genderPrices?.length > 0) {
        await Promise.all(
          data.genderPrices.map((genderPrice: any) =>
            tx.serviceGenderPrice.create({
              data: {
                serviceId: service.id,
                gender: genderPrice.gender,
                price: parseFloat(genderPrice.price),
                serviceName: genderPrice.serviceName || null,
              },
            })
          )
        );
      }
      
      // 處理區域定價
      if (serviceType === "areaPricing" && data.areaPrices?.length > 0) {
        await Promise.all(
          data.areaPrices.map((areaPrice: any) =>
            tx.serviceAreaPrice.create({
              data: {
                serviceId: service.id,
                area: areaPrice.area,
                price: parseFloat(areaPrice.price),
                gender: areaPrice.gender || null,
                description: areaPrice.description || null,
              },
            })
          )
        );
      }
      
      // 處理附加選項
      if (data.addons?.length > 0) {
        await Promise.all(
          data.addons.map((addon: any) =>
            tx.serviceAddon.create({
              data: {
                serviceId: service.id,
                name: addon.name,
                description: addon.description || null,
                price: parseFloat(addon.price),
                isRequired: addon.isRequired || false,
              },
            })
          )
        );
      }
      
      // 處理套餐項目
      if (serviceType === "package" && data.packageItems?.length > 0) {
        await Promise.all(
          data.packageItems.map((item: any) =>
            tx.packageItem.create({
              data: {
                serviceId: service.id,
                includedServiceId: item.serviceId,
                serviceName: item.serviceName,
                duration: parseInt(item.duration),
                isRequired: item.isRequired || true,
              },
            })
          )
        );
      }
      
      // 處理套餐選項
      if (serviceType === "package" && data.packageOptions?.length > 0) {
        await Promise.all(
          data.packageOptions.map(async (option: any) => {
            const packageOption = await tx.packageOption.create({
              data: {
                serviceId: service.id,
                name: option.name,
                description: option.description || null,
                maxSelections: option.maxSelections || 1,
              },
            });
            
            // 處理選項項目
            if (option.items?.length > 0) {
              await Promise.all(
                option.items.map((item: any) =>
                  tx.packageOptionItem.create({
                    data: {
                      optionId: packageOption.id,
                      name: item.name,
                    },
                  })
                )
              );
            }
          })
        );
      }

      return service;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("創建服務失敗:", error);
    return NextResponse.json(
      { error: "創建服務時發生錯誤" },
      { status: 500 }
    );
  }
}

// 更新服務 - 僅管理員可訪問
export async function PUT(request: Request) {
  try {
    // 檢查用戶是否為管理員
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // 驗證必填字段
    if (!data.id || !data.name || !data.duration || data.price === undefined) {
      return NextResponse.json(
        { error: "必須提供服務ID、名稱、時長和價格" },
        { status: 400 }
      );
    }

    // 檢查服務是否存在
    const existingService = await prisma.service.findUnique({
      where: { id: data.id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "找不到指定服務" },
        { status: 404 }
      );
    }

    // 檢查服務類型並進行相應的驗證
    let serviceType = "standard";
    
    // 檢查是否為性別定價服務
    if (data.genderPrices?.length > 0) {
      serviceType = "genderPricing";
      // 驗證性別定價數據
      if (!data.genderPrices.every((gp: any) => gp.gender && gp.price !== undefined)) {
        return NextResponse.json(
          { error: "性別定價服務必須提供性別和價格" },
          { status: 400 }
        );
      }
    }
    
    // 檢查是否為區域定價服務
    if (data.areaPrices?.length > 0) {
      serviceType = "areaPricing";
      // 驗證區域定價數據
      if (!data.areaPrices.every((ap: any) => ap.area && ap.price !== undefined)) {
        return NextResponse.json(
          { error: "區域定價服務必須提供區域名稱和價格" },
          { status: 400 }
        );
      }
    }
    
    // 檢查是否為套餐服務
    if (data.packageItems?.length > 0) {
      serviceType = "package";
      // 驗證套餐數據
      if (!data.packageItems.every((item: any) => 
        item.serviceId && item.serviceName && item.duration)
      ) {
        return NextResponse.json(
          { error: "套餐服務必須提供服務ID、名稱和時長" },
          { status: 400 }
        );
      }
    }

    // 檢查限時優惠邏輯
    if (data.isLimitedTime) {
      if (!data.limitedTimeStart || !data.limitedTimeEnd) {
        return NextResponse.json(
          { error: "限時優惠必須提供開始和結束時間" },
          { status: 400 }
        );
      }
      
      const startDate = new Date(data.limitedTimeStart);
      const endDate = new Date(data.limitedTimeEnd);
      
      if (endDate < startDate) {
        return NextResponse.json(
          { error: "限時優惠結束時間必須晚於開始時間" },
          { status: 400 }
        );
      }
    }

    // 檢查閃購邏輯
    if (data.isFlashSale) {
      if (!data.flashSaleStart || !data.flashSaleEnd) {
        return NextResponse.json(
          { error: "閃購必須提供開始和結束時間" },
          { status: 400 }
        );
      }
      
      const startDate = new Date(data.flashSaleStart);
      const endDate = new Date(data.flashSaleEnd);
      
      if (endDate < startDate) {
        return NextResponse.json(
          { error: "閃購結束時間必須晚於開始時間" },
          { status: 400 }
        );
      }
    }

    // 處理服務更新
    const result = await prisma.$transaction(async (tx) => {
      // 更新基本服務信息
      const service = await tx.service.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description,
          image: data.image,
          category: data.category,
          duration: parseInt(data.duration),
          price: parseFloat(data.price),
          isLimitedTime: data.isLimitedTime || false,
          limitedTimeStart: data.limitedTimeStart ? new Date(data.limitedTimeStart) : null,
          limitedTimeEnd: data.limitedTimeEnd ? new Date(data.limitedTimeEnd) : null,
          limitedSpecialPrice: data.limitedSpecialPrice,
          limitedDiscountPercent: data.limitedDiscountPercent,
          limitedNote: data.limitedNote,
          isFlashSale: data.isFlashSale || false,
          flashSaleStart: data.flashSaleStart ? new Date(data.flashSaleStart) : null,
          flashSaleEnd: data.flashSaleEnd ? new Date(data.flashSaleEnd) : null,
          flashSaleNote: data.flashSaleNote,
          active: data.active !== undefined ? data.active : true,
        },
      });

      // 處理多時長選項：刪除舊的，添加新的
      await tx.serviceDuration.deleteMany({
        where: { serviceId: service.id },
      });

      if (data.durations && data.durations.length > 0) {
        await Promise.all(
          data.durations.map((duration: any) =>
            tx.serviceDuration.create({
              data: {
                serviceId: service.id,
                duration: parseInt(duration.duration),
                price: parseFloat(duration.price),
              },
            })
          )
        );
      }

      // 處理按摩師關聯：刪除舊的，添加新的
      await tx.masseurService.deleteMany({
        where: { serviceId: service.id },
      });

      if (data.masseursIds && data.masseursIds.length > 0) {
        await Promise.all(
          data.masseursIds.map((masseursId: string) =>
            tx.masseurService.create({
              data: {
                serviceId: service.id,
                masseurId: masseursId,
              },
            })
          )
        );
      }
      
      // 處理性別定價：刪除舊的，添加新的
      await tx.serviceGenderPrice.deleteMany({
        where: { serviceId: service.id },
      });
      
      if (serviceType === "genderPricing" && data.genderPrices?.length > 0) {
        await Promise.all(
          data.genderPrices.map((genderPrice: any) =>
            tx.serviceGenderPrice.create({
              data: {
                serviceId: service.id,
                gender: genderPrice.gender,
                price: parseFloat(genderPrice.price),
                serviceName: genderPrice.serviceName || null,
              },
            })
          )
        );
      }
      
      // 處理區域定價：刪除舊的，添加新的
      await tx.serviceAreaPrice.deleteMany({
        where: { serviceId: service.id },
      });
      
      if (serviceType === "areaPricing" && data.areaPrices?.length > 0) {
        await Promise.all(
          data.areaPrices.map((areaPrice: any) =>
            tx.serviceAreaPrice.create({
              data: {
                serviceId: service.id,
                area: areaPrice.area,
                price: parseFloat(areaPrice.price),
                gender: areaPrice.gender || null,
                description: areaPrice.description || null,
              },
            })
          )
        );
      }
      
      // 處理附加選項：刪除舊的，添加新的
      await tx.serviceAddon.deleteMany({
        where: { serviceId: service.id },
      });
      
      if (data.addons?.length > 0) {
        await Promise.all(
          data.addons.map((addon: any) =>
            tx.serviceAddon.create({
              data: {
                serviceId: service.id,
                name: addon.name,
                description: addon.description || null,
                price: parseFloat(addon.price),
                isRequired: addon.isRequired || false,
              },
            })
          )
        );
      }
      
      // 處理套餐項目：刪除舊的，添加新的
      await tx.packageItem.deleteMany({
        where: { serviceId: service.id },
      });
      
      if (serviceType === "package" && data.packageItems?.length > 0) {
        await Promise.all(
          data.packageItems.map((item: any) =>
            tx.packageItem.create({
              data: {
                serviceId: service.id,
                includedServiceId: item.serviceId,
                serviceName: item.serviceName,
                duration: parseInt(item.duration),
                isRequired: item.isRequired || true,
              },
            })
          )
        );
      }
      
      // 處理套餐選項：刪除舊的，添加新的
      // 首先獲取所有現有的選項ID
      const existingOptions = await tx.packageOption.findMany({
        where: { serviceId: service.id },
        select: { id: true },
      });
      
      // 刪除每個選項的項目
      await Promise.all(
        existingOptions.map((option) =>
          tx.packageOptionItem.deleteMany({
            where: { optionId: option.id },
          })
        )
      );
      
      // 刪除所有選項
      await tx.packageOption.deleteMany({
        where: { serviceId: service.id },
      });
      
      // 添加新的選項和項目
      if (serviceType === "package" && data.packageOptions?.length > 0) {
        await Promise.all(
          data.packageOptions.map(async (option: any) => {
            const packageOption = await tx.packageOption.create({
              data: {
                serviceId: service.id,
                name: option.name,
                description: option.description || null,
                maxSelections: option.maxSelections || 1,
              },
            });
            
            // 添加選項項目
            if (option.items?.length > 0) {
              await Promise.all(
                option.items.map((item: any) =>
                  tx.packageOptionItem.create({
                    data: {
                      optionId: packageOption.id,
                      name: item.name,
                    },
                  })
                )
              );
            }
          })
        );
      }

      return service;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("更新服務失敗:", error);
    return NextResponse.json(
      { error: "更新服務時發生錯誤" },
      { status: 500 }
    );
  }
}

// 刪除服務 - 僅管理員可訪問
export async function DELETE(request: Request) {
  try {
    // 檢查用戶是否為管理員
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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