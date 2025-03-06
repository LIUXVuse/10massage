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
    const isPublic = searchParams.get("public");
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
    if (active === "true" || isPublic === "true") {
      where.isActive = true;
    }
    
    // 如果不是特別要求包含非活躍服務，則只返回活躍的
    if (withInactive !== "true" && active !== "false") {
      where.isActive = true;
    }

    // 對於公開API請求，篩選僅當前有效的限時優惠和閃購服務
    if (isPublic === "true") {
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
          limitedStartDate: { lte: now },
          limitedEndDate: { gte: now },
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
      masseurs: true,
      customOptions: true,
    };
    
    // 如果需要詳細資訊，則添加額外的關聯
    if (details === "true") {
      include.genderPrices = true;
      include.areaPrices = true;
      include.addons = true;
      include.packageItems = true;
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
      // 格式化服務對象
      const formattedService = {
        ...service,
        masseurs: service.masseurs?.map((masseur: any) => ({
          id: masseur.id,
          name: masseur.name,
          avatar: masseur.image || null,
        })) || [],
        customFields: service.customOptions?.map((option: any) => ({
          id: option.id,
          bodyPart: option.bodyPart,
          customDuration: option.customDuration,
          customPrice: option.customPrice,
        })) || [],
        customOptions: undefined,
      };

      return formattedService;
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
    if (!data.name || !data.durations || !data.durations.length) {
      return NextResponse.json(
        { error: "必須提供服務名稱和至少一個時長價格選項" },
        { status: 400 }
      );
    }

    // 使用第一個時長選項作為默認值
    const defaultDuration = data.durations[0];

    // 處理服務創建
    const result = await prisma.$transaction(async (tx) => {
      // 創建基本服務
      const service = await tx.service.create({
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          category: data.category,
          // 使用第一個時長選項作為默認值
          duration: parseInt(defaultDuration.duration.toString()),
          price: parseFloat(defaultDuration.price.toString()),
          isLimitedTime: data.isLimitedTime || false,
          limitedStartDate: data.limitedStartDate ? new Date(data.limitedStartDate) : null,
          limitedEndDate: data.limitedEndDate ? new Date(data.limitedEndDate) : null,
          limitedSpecialPrice: data.limitedSpecialPrice,
          limitedDiscountPercent: data.limitedDiscountPercent,
          limitedNote: data.limitedNote,
          isFlashSale: data.isFlashSale || false,
          flashSaleNote: data.flashSaleNote,
          isActive: data.isActive !== undefined ? data.isActive : true,
          // 創建關聯數據
          durations: {
            create: data.durations.map((duration: any) => ({
              duration: parseInt(duration.duration.toString()),
              price: parseFloat(duration.price.toString()),
            }))
          },
          masseurs: data.masseursIds?.length ? {
            connect: data.masseursIds.map((id: string) => ({ id }))
          } : undefined,
          genderPrices: data.genderPrices?.length ? {
            create: data.genderPrices.map((genderPrice: any) => ({
              gender: genderPrice.gender,
              price: parseFloat(genderPrice.price.toString()),
            }))
          } : undefined,
          areaPrices: data.areaPrices?.length ? {
            create: data.areaPrices.map((areaPrice: any) => ({
              areaName: areaPrice.area,
              price: parseFloat(areaPrice.price.toString()),
              gender: areaPrice.gender || null,
            }))
          } : undefined,
          addons: data.addons?.length ? {
            create: data.addons.map((addon: any) => ({
              name: addon.name,
              description: addon.description || null,
              price: parseFloat(addon.price.toString()),
              isRequired: addon.isRequired || false,
            }))
          } : undefined,
        },
        include: {
          durations: true,
          masseurs: true,
          genderPrices: true,
          areaPrices: true,
          addons: true,
        },
      });

      // 創建自定義選項
      if (data.customOptions?.length) {
        await Promise.all(
          data.customOptions.map((option: any) =>
            tx.service.update({
              where: { id: service.id },
              data: {
                customOptions: {
                  create: {
                    bodyPart: option.bodyPart || null,
                    customDuration: option.customDuration ? parseInt(option.customDuration.toString()) : null,
                    customPrice: option.customPrice ? parseFloat(option.customPrice.toString()) : null,
                  }
                }
              }
            })
          )
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
      return NextResponse.json({ error: "未授權訪問，僅管理員可以更新服務" }, { status: 401 });
    }

    const data = await request.json();
    
    // 驗證必填字段
    if (!data.id || !data.name || !data.duration || data.price === undefined) {
      return NextResponse.json(
        { error: "必須提供服務ID、名稱、時長和價格" },
        { status: 400 }
      );
    }

    console.log('開始更新服務:', data.id, data.name);

    try {
      // 使用事務處理所有更新操作
      const result = await prisma.$transaction(async (tx) => {
        // 更新服務基本信息
        const updatedService = await tx.service.update({
          where: { id: data.id },
          data: {
            name: data.name,
            description: data.description,
            category: data.category,
            duration: parseInt(data.duration),
            price: parseFloat(data.price),
            isLimitedTime: data.isLimitedTime || false,
            limitedStartDate: data.limitedStartDate ? new Date(data.limitedStartDate) : null,
            limitedEndDate: data.limitedEndDate ? new Date(data.limitedEndDate) : null,
            limitedSpecialPrice: data.limitedSpecialPrice,
            limitedDiscountPercent: data.limitedDiscountPercent,
            limitedNote: data.limitedNote,
            isFlashSale: data.isFlashSale || false,
            flashSaleNote: data.flashSaleNote,
            isActive: data.isActive !== undefined ? data.isActive : true,
          },
        });

        // 更新服務時的自定義選項處理
        if (data.customFields !== undefined) {
          await tx.service.update({
            where: { id: data.id },
            data: {
              customOptions: {
                deleteMany: {},
                create: data.customFields.map((field: any) => ({
                  bodyPart: field.bodyPart || null,
                  customDuration: field.customDuration ? parseInt(field.customDuration) : null,
                  customPrice: field.customPrice ? parseFloat(field.customPrice) : null,
                }))
              }
            }
          });
        }

        // 處理多時長選項（先刪除舊的，再添加新的）
        if (data.durations && data.durations.length > 0) {
          // 刪除原有的時長選項
          await prisma.serviceDuration.deleteMany({
            where: { serviceId: data.id },
          });
          
          console.log('舊時長選項已刪除');
          
          // 添加新的時長選項
          for (const duration of data.durations) {
            await prisma.serviceDuration.create({
              data: {
                serviceId: data.id,
                duration: parseInt(duration.duration),
                price: parseFloat(duration.price),
              },
            });
          }
          
          console.log('新時長選項已添加');
        }

        // 第三步：更新按摩師關聯
        if (data.masseursIds && data.masseursIds.length > 0) {
          // 使用直接更新關聯的方式
          await prisma.service.update({
            where: { id: data.id },
            data: {
              masseurs: {
                set: data.masseursIds.map((id: string) => ({
                  id
                }))
              }
            }
          });
          
          console.log('按摩師關聯已更新');
        }

        // 第四步：處理套餐項目（如果有）
        if (data.packageItems && data.packageItems.length > 0) {
          // 先刪除原有的套餐項目
          await prisma.packageItem.deleteMany({
            where: { 
              packageId: data.id
            }
          });
          
          console.log('舊套餐項目已刪除');
          
          // 添加新的套餐項目
          for (const item of data.packageItems) {
            await prisma.packageItem.create({
              data: {
                serviceId: item.serviceId,
                duration: parseInt(item.duration),
                isRequired: item.isRequired || true,
                bodyPart: item.bodyPart || null,
                customDuration: item.customDuration ? parseInt(item.customDuration) : null,
                customPrice: item.customPrice ? parseFloat(item.customPrice) : null,
                packageId: data.id
              }
            });
          }
          
          console.log('新套餐項目已添加');
        }

        return updatedService;
      });

      return NextResponse.json({
        id: result.id,
        message: "服務更新成功",
      });
    } catch (error) {
      console.error('更新服務時出錯:', error);
      return NextResponse.json(
        { error: `更新服務時出錯: ${error instanceof Error ? error.message : String(error)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('更新服務失敗:', error);
    return NextResponse.json(
      { error: `更新服務失敗: ${error}` },
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