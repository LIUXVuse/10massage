import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

// 定義需要保護的路由
const adminRoutes = [
  '/api/masseurs/create',
  '/api/masseurs/update',
  '/api/masseurs/delete',
  '/api/services/create',
  '/api/services/update',
  '/api/services/delete',
  '/admin'
]

const masseurRoutes = [
  '/masseur/profile'
  // 將來可以添加按摩師專屬路由
]

// 可以自由訪問的API路由
const publicApiRoutes = [
  '/api/masseurs',
  '/api/services'
]

// 檢查用戶是否為管理員 - 與auth-utils統一邏輯
function isAdmin(token?: any) {
  return token?.role?.toUpperCase() === "ADMIN";
}

// 檢查用戶是否為按摩師或管理員 - 與auth-utils統一邏輯
function isMasseurOrAdmin(token?: any) {
  const role = token?.role?.toUpperCase();
  return role === "ADMIN" || role === "MASSEUR";
}

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request })
  const pathname = request.nextUrl.pathname
  
  // 檢查是否是需要保護的API路由
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isMasseurRoute = masseurRoutes.some(route => pathname.startsWith(route))
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))
  
  // 如果是公開API路由，直接允許訪問
  if (isPublicApiRoute) {
    return NextResponse.next()
  }
  
  // 如果是管理員路由但沒有令牌或不是管理員角色
  if (isAdminRoute && (!token || !isAdmin(token))) {
    // 對API請求返回未授權錯誤
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }
    // 對頁面請求重定向到首頁
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // 如果是按摩師路由但不是按摩師或管理員
  if (isMasseurRoute && (!token || !isMasseurOrAdmin(token))) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有需要保護的路由:
     * - API路由 (/api/*)
     * - 管理員路由 (/admin/*)
     * - 按摩師路由 (/masseur/*)
     */
    '/api/:path*',
    '/admin/:path*',
    '/masseur/:path*'
  ],
} 