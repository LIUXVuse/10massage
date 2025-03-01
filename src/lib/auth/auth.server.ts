"use server";

import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import { User } from "next-auth"
import { createHash } from "crypto"

// 簡單的密碼哈希函數，適用於Edge環境
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// 簡單的密碼比較函數，替代bcrypt.compare
function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  const hashedPlainPassword = hashPassword(plainPassword);
  return hashedPlainPassword === hashedPassword;
}

// 這個文件只會在服務器端使用，不會被打包到客戶端
export async function getAuthOptions(): Promise<NextAuthOptions> {
  return {
    // @ts-ignore: 忽略 PrismaAdapter 類型不匹配問題，實際運行沒有問題
    adapter: PrismaAdapter(prisma),
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/login",
    },
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "密碼", type: "password" }
        },
        // @ts-ignore: 忽略 authorize 函數返回類型不匹配問題
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            console.log("缺少憑證");
            return null
          }

          try {
            const user = await prisma.user.findUnique({
              where: {
                email: credentials.email
              }
            })

            if (!user) {
              console.log("找不到用戶");
              return null
            }

            // 使用新的密碼驗證方法
            // const isPasswordValid = await compare(credentials.password, user.password)
            const isPasswordValid = verifyPassword(credentials.password, user.password);

            if (!isPasswordValid) {
              console.log("密碼無效");
              return null
            }

            console.log("認證成功", user.email);
            return {
              id: user.id,
              email: user.email || "",
              name: user.name || "",
              role: user.role,
            }
          } catch (error) {
            console.error("認證過程中發生錯誤:", error);
            return null;
          }
        }
      })
    ],
    callbacks: {
      async session({ token, session }) {
        if (token) {
          session.user.id = token.id as string;
          session.user.name = token.name as string || "";
          session.user.email = token.email as string || "";
          session.user.role = token.role as string;
        }

        return session
      },
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id
          token.role = user.role
        }

        return token
      }
    }
  }
}

// 簡化查詢當前使用者的函數
export async function getCurrentServerUser() {
  try {
    // 因為無法直接訪問session，我們需要使用getServerSession
    // 但我們可以處理此處的靜態生成問題
    const { headers } = await import("next/headers");
    
    // 檢查是否是靜態生成環境
    // 如果是靜態生成，則返回null而不是拋出錯誤
    try {
      // 訪問headers以觸發動態渲染
      headers();
    } catch (e: any) {
      // 如果出現靜態渲染錯誤，則只需要返回null
      console.log("靜態生成環境中：", e?.message || "未知錯誤");
      return null;
    }
    
    // 只有在成功觸發動態渲染後才執行此部分
    const { getServerSession } = await import("next-auth/next");
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    return session?.user;
  } catch (error) {
    console.error("獲取用戶時發生錯誤:", error);
    return null;
  }
}

// 伺服器端身份驗證函數 - 使用伺服器端API
export async function requireAuthServer() {
  const user = await getCurrentServerUser();
  
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  
  return user;
}

export async function requireAdminServer() {
  const user = await requireAuthServer();
  
  if (!user || user.role?.toUpperCase() !== "ADMIN") {
    const { redirect } = await import("next/navigation");
    redirect("/");
  }
  
  return user;
}

export async function requireMasseurOrAdminServer() {
  const user = await requireAuthServer();
  
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
    return {} as any; // 這行不會執行，但是為了類型檢查
  }
  
  const role = user.role?.toUpperCase();
  if (role !== "ADMIN" && role !== "MASSEUR") {
    const { redirect } = await import("next/navigation");
    redirect("/");
  }
  
  return user;
}

// 公開此哈希函數，以便用戶註冊時使用
export { hashPassword }; 