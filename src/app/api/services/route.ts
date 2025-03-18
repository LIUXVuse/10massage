import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth/auth.server';
import { db } from "@/lib/db";

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
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";
    
    // 构建查询条件
    const where: any = {};
    
    // 如果只查询激活的服务
    if (activeOnly) {
      where.isActive = true;
    }
    
    // 获取服务列表，包括时长选项
    const services = await db.service.findMany({
      where,
      include: {
        durations: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json(services);
  } catch (error) {
    console.error("获取服务列表失败:", error);
    return NextResponse.json(
      { error: "获取服务列表失败" },
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