import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getToken } from 'next-auth/jwt';

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
        masseurs: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
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
      return NextResponse.json({ error: '未授權訪問，僅管理員可以創建服務' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      duration,
      type,
      category,
      isRecommended,
      masseurs
    } = body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        type: type || 'general',
        category: category || 'massage',
        isRecommend: isRecommended || false,
        masseurs: {
          connect: masseurs?.map((m: any) => ({ id: m.id })) || []
        }
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('創建服務失敗:', error);
    return NextResponse.json({ error: '創建服務失敗' }, { status: 500 });
  }
}

// 更新服務 - 僅管理員可訪問
export async function PUT(request: Request) {
  try {
    // 檢查是否為管理員
    if (!await isAdmin(request)) {
      return NextResponse.json({ error: '未授權訪問，僅管理員可以更新服務' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      name,
      description,
      price,
      duration,
      type,
      category,
      isRecommended,
      masseurs
    } = body;

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
        price: parseFloat(price),
        duration: parseInt(duration),
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
    return NextResponse.json({ error: '更新服務失敗' }, { status: 500 });
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
    return NextResponse.json({ error: '刪除服務失敗' }, { status: 500 });
  }
} 