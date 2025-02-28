"use server";

import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import { compare } from "bcrypt"
import { User } from "next-auth"

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
            return null
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email || "",
            name: user.name || "",
            role: user.role,
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
  const { getServerSession } = await import("next-auth/next");
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  return session?.user;
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
  
  if (user.role?.toUpperCase() !== "ADMIN") {
    const { redirect } = await import("next/navigation");
    redirect("/");
  }
  
  return user;
}

export async function requireMasseurOrAdminServer() {
  const user = await requireAuthServer();
  
  const role = user.role?.toUpperCase();
  if (role !== "ADMIN" && role !== "MASSEUR") {
    const { redirect } = await import("next/navigation");
    redirect("/");
  }
  
  return user;
} 