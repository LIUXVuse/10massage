import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getToken } from 'next-auth/jwt';

// 支持Cloudflare Pages和Prisma
export const runtime = 'nodejs';
export const revalidate = 3600; // 每小時重新驗證一次

interface MasseurRelation {
  id: string;
}

// 檢查用戶是否為管理員
async function isAdmin(request: Request) {
  const token = await getToken({ req: request as any });
  return token?.role === 'ADMIN' || token?.role?.toUpperCase() === 'ADMIN';
}

// 獲取指定ID的服務
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        masseurs: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json({ error: '找不到服務' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('獲取服務失敗:', error);
    return NextResponse.json({ error: `獲取服務失敗: ${error}` }, { status: 500 });
  }
}

// 更新指定ID的服務
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 檢查是否為管理員
    if (!await isAdmin(request)) {
      return NextResponse.json({ error: '未授權訪問，僅管理員可以更新服務' }, { status: 403 });
    }

    const id = params.id;
    const body = await request.json();
    const {
      name,
      description,
      price,
      duration,
      type,
      category,
      isRecommended,
      masseurs,
      // 新增支持durations數組
      durations,
    } = body;

    // 如果提供了durations數組，使用第一個duration的值
    const servicePrice = price || (durations && durations.length > 0 ? durations[0].price : 0);
    const serviceDuration = duration || (durations && durations.length > 0 ? durations[0].duration : 0);

    if (!servicePrice) {
      return NextResponse.json({ error: '缺少價格(price)參數' }, { status: 400 });
    }

    if (!serviceDuration) {
      return NextResponse.json({ error: '缺少時長(duration)參數' }, { status: 400 });
    }

    // 先獲取服務的當前按摩師
    const currentService = await prisma.service.findUnique({
      where: { id },
      include: { masseurs: true }
    });

    if (!currentService) {
      return NextResponse.json({ error: '找不到服務' }, { status: 404 });
    }

    // 更新服務
    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(servicePrice),
        duration: parseInt(serviceDuration),
        type,
        category,
        isRecommend: isRecommended,
        masseurs: {
          // 斷開所有現有關聯
          disconnect: currentService.masseurs.map(m => ({ id: m.id })),
          // 建立新關聯
          connect: masseurs?.map((m: any) => ({ id: m.id })) || []
        }
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('更新服務失敗:', error);
    return NextResponse.json({ error: `更新服務失敗: ${error}` }, { status: 500 });
  }
}

// 刪除指定ID的服務
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 檢查是否為管理員
    if (!await isAdmin(request)) {
      return NextResponse.json({ error: '未授權訪問，僅管理員可以刪除服務' }, { status: 403 });
    }

    const id = params.id;

    // 先斷開與按摩師的關聯，再刪除服務
    await prisma.service.update({
      where: { id },
      data: {
        masseurs: {
          disconnect: []
        }
      }
    });

    await prisma.service.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除服務失敗:', error);
    return NextResponse.json({ error: `刪除服務失敗: ${error}` }, { status: 500 });
  }
} 