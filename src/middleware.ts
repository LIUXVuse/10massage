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
  '/register',
  // 添加更多公共路徑
  '/favicon.ico',
  '/_next',
  '/api/auth'
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
    
    // 在生產環境中，使用帶前綴的cookie名稱
    // 修正：Cloudflare Pages可能使用不同的cookie名稱
    const cookieName = isProduction 
      ? 'next-auth.session-token' // 嘗試使用標準名稱
      : 'next-auth.session-token';
    
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET
      // 不指定cookieName，讓nextAuth自動檢測
    });
    
    const pathname = request.nextUrl.pathname;
    
    // 添加詳細日誌以便調試
    console.log(`中間件檢查 - [${new Date().toISOString()}]`);
    console.log(`- 環境: ${environment}, 是否生產環境: ${isProduction}`);
    console.log(`- 路徑: ${pathname}`);
    console.log(`- 令牌存在: ${!!token}`);
    if (token) {
      console.log(`- 用戶信息: email=${token.email}, role=${token.role}, name=${token.name}`);
    }
    
    // 對於公共API和静态资源，直接允许访问
    for (const publicRoute of publicApiRoutes) {
      if (pathname === publicRoute || pathname.startsWith(publicRoute)) {
        console.log(`- 允許訪問公開路徑: ${pathname} (匹配 ${publicRoute})`);
        return NextResponse.next();
      }
    }
    
    // 檢查是否匹配嚴格管理頁面路由
    // 處理各種可能的路徑格式：/masseurs, /dashboard/masseurs, /(dashboard)/masseurs
    let isStrictAdminPage = false;
    for (const route of strictAdminPageRoutes) {
      if (
        pathname === route || 
        pathname.startsWith(`${route}/`) ||
        pathname.includes(`/dashboard${route}`) ||
        pathname.includes(`/(dashboard)${route}`)
      ) {
        isStrictAdminPage = true;
        console.log(`- 匹配嚴格管理頁面: ${pathname} (匹配 ${route})`);
        break;
      }
    }
    
    // 檢查是否是需要保護的API路由
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isMasseurRoute = masseurRoutes.some(route => pathname.startsWith(route));
    
    console.log(`- 路由檢查結果: 管理員路由=${isAdminRoute}, 嚴格管理頁面=${isStrictAdminPage}, 按摩師路由=${isMasseurRoute}`);
    
    // 如果是管理員路由或嚴格管理頁面，但沒有令牌或不是管理員角色
    if ((isAdminRoute || isStrictAdminPage) && (!token || !isAdmin(token))) {
      console.log(`- 拒絕訪問管理員路由: ${pathname}`);
      
      // 對API請求返回未授權錯誤
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ 
          error: '未授權訪問',
          message: '您需要管理員權限才能訪問此資源',
          path: pathname 
        }, { status: 401 });
      }
      
      // 對頁面請求重定向到登入頁面
      const redirectUrl = new URL('/login', request.url);
      console.log(`- 重定向到: ${redirectUrl.toString()}`);
      return NextResponse.redirect(redirectUrl);
    }
    
    // 如果是按摩師路由但不是按摩師或管理員
    if (isMasseurRoute && (!token || !isMasseurOrAdmin(token))) {
      console.log(`- 拒絕訪問按摩師路由: ${pathname}`);
      
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ 
          error: '未授權訪問',
          message: '您需要按摩師或管理員權限才能訪問此資源',
          path: pathname 
        }, { status: 401 });
      }
      
      const redirectUrl = new URL('/login', request.url);
      console.log(`- 重定向到: ${redirectUrl.toString()}`);
      return NextResponse.redirect(redirectUrl);
    }
    
    console.log(`- 允許訪問: ${pathname}`);
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
    
    // 出錯時，對頁面請求重定向到登入頁面
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
    '/services/:path*',
    '/users/:path*'
  ],
}; 