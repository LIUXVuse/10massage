import NextAuth from "next-auth"
import { getAuthOptions } from "@/lib/auth/auth.server"

// 改為使用Node.js運行時間
export const runtime = 'nodejs';  // 從'edge'改為'nodejs'
export const revalidate = 3600; // 每小時重新驗證一次

export async function GET(req: Request, context: any) {
  const authOptions = await getAuthOptions();
  return await NextAuth(authOptions)(req, context);
}

export async function POST(req: Request, context: any) {
  const authOptions = await getAuthOptions();
  return await NextAuth(authOptions)(req, context);
} 