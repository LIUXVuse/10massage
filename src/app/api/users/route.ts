import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getToken } from 'next-auth/jwt';

// 獲取所有用戶 - 只有管理員可以訪問
export async function GET(request: Request) {
  try {
    // 檢查用戶角色
    const token = await getToken({ req: request as any });
    
    // 如果不是管理員，返回未授權錯誤
    if (!token || token.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: '未授權訪問，僅管理員可以查看用戶列表' }, { status: 403 });
    }
    
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 格式化數據
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      role: user.role,
      image: user.image || '',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('獲取用戶列表時發生錯誤:', error);
    return NextResponse.json({ error: '獲取用戶列表失敗' }, { status: 500 });
  }
}

// 更新用戶角色 - 只有管理員可以訪問
export async function PUT(request: Request) {
  try {
    // 檢查用戶角色
    const token = await getToken({ req: request as any });
    
    // 如果不是管理員，返回未授權錯誤
    if (!token || token.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: '未授權訪問，僅管理員可以更新用戶角色' }, { status: 403 });
    }
    
    const { id, role } = await request.json();

    if (!id || !role) {
      return NextResponse.json({ error: '缺少必要參數 id 或 role' }, { status: 400 });
    }

    // 驗證角色是否有效
    const validRoles = ['user', 'masseur', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: '無效的角色' }, { status: 400 });
    }

    // 更新用戶角色
    await prisma.user.update({
      where: { id },
      data: { role }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新用戶角色時發生錯誤:', error);
    return NextResponse.json({ error: '更新用戶角色失敗' }, { status: 500 });
  }
} 