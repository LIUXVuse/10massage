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

// 具體的管理頁面路由，需要額外檢查
const strictAdminPageRoutes = [
  '/masseurs',
  '/services',
  '/users'
]

const masseurRoutes = [
  '/masseur/profile'
  // 將來可以添加按摩師專屬路由
]

// 可以自由訪問的API路由
const publicApiRoutes = [
  '/api/masseurs',
  '/api/services',
  '/api/admin/init-accounts',
  '/api/admin/init-test-accounts',
  '/api/admin/init-masseurs',
  '/init', // 添加初始化頁面到公開路由
  // 添加其他必要的公開路由
  '/',
  '/login',
  '/register'
]

// 檢查用戶是否為管理員 - 與auth-utils統一邏輯
function isAdmin(token?: any) {
  if (!token) return false;
  try {
    const role = token?.role?.toUpperCase();
    const isAdminRole = role === "ADMIN";
    console.log(`權限檢查 - 使用者: ${token.email}, 角色: ${role}, 是否管理員: ${isAdminRole}`);
    return isAdminRole;
  } catch (error) {
    console.error("權限檢查出錯:", error);
    return false;
  }
}

// 檢查用戶是否為按摩師或管理員 - 與auth-utils統一邏輯
function isMasseurOrAdmin(token?: any) {
  if (!token) return false;
  try {
    const role = token?.role?.toUpperCase();
    const hasAccess = role === "ADMIN" || role === "MASSEUR";
    console.log(`權限檢查 - 使用者: ${token.email}, 角色: ${role}, 有權限: ${hasAccess}`);
    return hasAccess;
  } catch (error) {
    console.error("權限檢查出錯:", error);
    return false;
  }
}

export default async function middleware(request: NextRequestWithAuth) {
  try {
    // 針對Cloudflare環境優化：正確指定cookie名稱
    const environment = process.env.NODE_ENV || 'development';
    const isProduction = environment === 'production';
    const cookieName = isProduction
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';
    
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: cookieName
    });
    
    const pathname = request.nextUrl.pathname;
    
    // 添加詳細日誌以便調試
    console.log(`中間件檢查 - 環境: ${environment}, 路徑: ${pathname}, 令牌存在: ${!!token}${token ? `, 用戶: ${token.email}, 角色: ${token.role}` : ''}, Cookie名稱: ${cookieName}`);
    
    // 修正路徑匹配邏輯，考慮Next.js 14的分組功能
    // Next.js 14的(dashboard)是一個分組，不影響實際URL路徑
    const dashboardPath = pathname.replace(/^\/(dashboard)/, '');
    console.log(`轉換後路徑: ${dashboardPath}`);
    
    // 檢查是否是需要保護的API路由
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isStrictAdminPage = strictAdminPageRoutes.some(route => 
      dashboardPath.startsWith(route) || pathname.startsWith(route) || pathname.includes(`/dashboard${route}`)
    );
    const isMasseurRoute = masseurRoutes.some(route => pathname.startsWith(route));
    const isPublicApiRoute = publicApiRoutes.some(route => pathname === route || pathname.startsWith(route));
    
    console.log(`路由檢查結果 - 管理員路由: ${isAdminRoute}, 嚴格管理頁面: ${isStrictAdminPage}, 按摩師路由: ${isMasseurRoute}, 公開API: ${isPublicApiRoute}`);
    
    // 如果是公開API路由，直接允許訪問
    if (isPublicApiRoute) {
      console.log(`允許訪問公開API: ${pathname}`);
      return NextResponse.next();
    }
    
    // 如果是管理員路由但沒有令牌或不是管理員角色
    if ((isAdminRoute || isStrictAdminPage) && (!token || !isAdmin(token))) {
      console.log(`拒絕訪問管理員路由: ${pathname}, 令牌: ${!!token}, 角色: ${token?.role}`);
      
      // 對API請求返回未授權錯誤
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ 
          error: '未授權訪問',
          message: '您需要管理員權限才能訪問此資源',
          path: pathname 
        }, { status: 401 });
      }
      
      // 對頁面請求重定向到首頁
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // 如果是按摩師路由但不是按摩師或管理員
    if (isMasseurRoute && (!token || !isMasseurOrAdmin(token))) {
      console.log(`拒絕訪問按摩師路由: ${pathname}, 令牌: ${!!token}, 角色: ${token?.role}`);
      
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ 
          error: '未授權訪問',
          message: '您需要按摩師或管理員權限才能訪問此資源',
          path: pathname 
        }, { status: 401 });
      }
      
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    console.log(`允許訪問: ${pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error("中間件處理錯誤:", error);
    
    // 出錯時，對API請求返回錯誤
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ 
        error: '伺服器錯誤',
        message: '權限驗證過程中發生錯誤',
        path: request.nextUrl.pathname
      }, { status: 500 });
    }
    
    // 出錯時，對頁面請求重定向到首頁
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * 匹配所有需要保護的路由:
     * - API路由 (/api/*)，除了公開API
     * - 管理員路由 (/admin/*, /dashboard/*)
     * - 按摩師路由 (/masseur/*)
     * - 頁面路由 (/masseurs, /services, /users)
     */
    '/api/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/masseur/:path*',
    '/masseurs/:path*',
    '/masseurs',
    '/services/:path*',
    '/services',
    '/users/:path*',
    '/users'
  ],
}; 