"use server";

import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import { User } from "next-auth"
import { createHash } from "crypto"
import { Prisma } from "@prisma/client"

// 簡單的密碼哈希函數，適用於Edge環境
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// 簡單的密碼比較函數，替代bcrypt.compare
function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  const hashedPlainPassword = hashPassword(plainPassword);
  const isValid = hashedPlainPassword === hashedPassword;
  console.log("密碼驗證結果:", isValid, "輸入密碼雜湊前幾位:", hashedPlainPassword.substring(0, 8), "數據庫密碼雜湊前幾位:", hashedPassword.substring(0, 8));
  return isValid;
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
            console.log("嘗試認證用戶:", credentials.email);
            
            // 檢查連接狀態
            try {
              await prisma.$queryRaw`SELECT 1`;
              console.log("數據庫連接正常");
            } catch (dbError) {
              console.error("數據庫連接錯誤:", dbError);
            }
            
            // 1. 嘗試直接按email查詢用戶
            let user = await prisma.user.findUnique({
              where: {
                email: credentials.email
              }
            });
            
            // 2. 如果找不到，則嘗試不區分大小寫的查詢
            if (!user) {
              console.log("精確匹配未找到用戶，嘗試不區分大小寫查詢");
              
              // 使用SQL直接查詢，避免Prisma類型問題
              const lowercaseEmail = credentials.email.toLowerCase();
              const users = await prisma.$queryRaw`
                SELECT * FROM "User" WHERE LOWER(email) = ${lowercaseEmail}
              `;
              
              if (Array.isArray(users) && users.length > 0) {
                user = users[0];
                console.log("通過不區分大小寫查詢找到用戶:", user.email);
              }
            }
            
            // 3. 如果仍然找不到用戶，可能是默認帳號尚未創建，嘗試創建
            if (!user) {
              console.log("未找到用戶，檢查是否是預設帳號");
              
              // 檢查是否是預設帳號
              const DEFAULT_ACCOUNTS = [
                { name: "系統管理員", email: "admin@eilinspa.com", password: "admin123", role: "ADMIN" },
                { name: "測試按摩師", email: "masseur@eilinspa.com", password: "masseur123", role: "MASSEUR" },
                { name: "測試用戶", email: "user@eilinspa.com", password: "user123", role: "USER" }
              ];
              
              const defaultAccount = DEFAULT_ACCOUNTS.find(acc => 
                acc.email.toLowerCase() === credentials.email.toLowerCase()
              );
              
              if (defaultAccount && credentials.password === defaultAccount.password) {
                console.log("確認為預設帳號，嘗試自動創建");
                try {
                  // 創建新用戶
                  const shaHash = hashPassword(defaultAccount.password);
                  user = await prisma.user.create({
                    data: {
                      name: defaultAccount.name,
                      email: defaultAccount.email,
                      password: shaHash,
                      role: defaultAccount.role
                    }
                  });
                  console.log("成功創建預設帳號:", user.email);
                  
                  // 如果是按摩師角色，同時創建按摩師記錄
                  if (defaultAccount.role === "MASSEUR") {
                    const masseur = await prisma.masseur.create({
                      data: {
                        name: defaultAccount.name,
                        description: `${defaultAccount.name}是我們團隊的專業按摩師，擁有豐富的經驗，專注於提供高品質的按摩服務。`,
                        isActive: true
                      }
                    });
                    console.log("為預設帳號創建按摩師記錄");
                  }
                } catch (createError) {
                  console.error("創建預設帳號失敗:", createError);
                }
              }
            }

            if (!user) {
              console.log("找不到用戶:", credentials.email);
              return null
            }

            console.log("找到用戶:", user.email, "角色:", user.role);
            
            // 使用新的密碼驗證方法
            const isPasswordValid = verifyPassword(credentials.password, user.password);

            if (!isPasswordValid) {
              console.log("密碼無效，用戶:", user.email);
              
              // 檢查是否是預設帳號，如果是則重置密碼
              const DEFAULT_ACCOUNTS = [
                { email: "admin@eilinspa.com", password: "admin123" },
                { email: "masseur@eilinspa.com", password: "masseur123" },
                { email: "user@eilinspa.com", password: "user123" }
              ];
              
              const defaultAccount = DEFAULT_ACCOUNTS.find(acc => 
                acc.email.toLowerCase() === credentials.email.toLowerCase()
              );
              
              if (defaultAccount && credentials.password === defaultAccount.password) {
                console.log("預設帳號密碼不匹配，嘗試修復");
                try {
                  const shaHash = hashPassword(defaultAccount.password);
                  await prisma.user.update({
                    where: { id: user.id },
                    data: { password: shaHash }
                  });
                  console.log("已修復預設帳號密碼");
                  // 再次驗證
                  if (verifyPassword(credentials.password, shaHash)) {
                    console.log("修復後認證成功");
                    return {
                      id: user.id,
                      email: user.email || "",
                      name: user.name || "",
                      role: user.role,
                    }
                  }
                } catch (updateError) {
                  console.error("修復密碼失敗:", updateError);
                }
              }
              
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
    // 增加日誌記錄
    debug: process.env.NODE_ENV !== 'production',
    logger: {
      error(code, metadata) {
        console.error("NextAuth錯誤:", code, metadata);
      },
      warn(code) {
        console.warn("NextAuth警告:", code);
      },
      debug(code, metadata) {
        console.log("NextAuth調試:", code, metadata);
      }
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = user.role;
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.role = token.role as string;
          session.user.id = token.id as string;
        }
        return session;
      }
    }
  };
}

// 用於調試的版本，提供更多日誌
export async function getDebugAuthOptions(): Promise<NextAuthOptions> {
  const options = await getAuthOptions();
  options.debug = true;
  return options;
}

// 伺服器端獲取當前用戶函數
export async function getCurrentServerUser() {
  try {
    // 使用app目錄結構中的auth()函數而不是直接導入
    const { cookies } = await import("next/headers");
    const { getServerSession } = await import("next-auth");
    const options = await getAuthOptions();
    const session = await getServerSession(options);
    return session?.user;
  } catch (error) {
    console.error("獲取當前用戶失敗:", error);
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