import NextAuth from "next-auth"
import { getAuthOptions } from "@/lib/auth/auth.server"

// 改為使用Node.js運行時間
export const runtime = 'nodejs';  // 從'edge'改為'nodejs'
export const revalidate = 3600; // 每小時重新驗證一次

// 添加調試日誌
async function getDebugAuthOptions() {
  console.log("獲取認證選項");
  const options = await getAuthOptions();
  console.log("認證提供者:", options.providers.length);
  return options;
}

export async function GET(req: Request, context: any) {
  console.log("處理GET認證請求");
  const authOptions = await getDebugAuthOptions();
  return await NextAuth(authOptions)(req, context);
}

export async function POST(req: Request, context: any) {
  console.log("處理POST認證請求");
  
  // 獲取請求正文以進行調試
  try {
    const body = await req.clone().json();
    console.log("認證請求正文:", {
      email: body.email ? body.email.substring(0, 3) + "..." : undefined,
      hasPassword: !!body.password,
      providerId: body.providerId
    });
  } catch (e) {
    console.log("無法解析請求正文");
  }
  
  const authOptions = await getDebugAuthOptions();
  return await NextAuth(authOptions)(req, context);
} 