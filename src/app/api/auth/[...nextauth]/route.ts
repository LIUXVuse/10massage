import NextAuth from "next-auth"
import { getAuthOptions } from "@/lib/auth/auth.server"

export async function GET(req: Request, context: any) {
  const authOptions = await getAuthOptions();
  return await NextAuth(authOptions)(req, context);
}

export async function POST(req: Request, context: any) {
  const authOptions = await getAuthOptions();
  return await NextAuth(authOptions)(req, context);
} 