import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/auth.server";

// 支持Cloudflare Pages和Prisma
export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("開始初始化測試帳號");
    
    // 定義測試帳號
    const testAccounts = [
      {
        name: "管理員",
        email: "admin@example.com",
        password: "password123",
        role: "admin"
      },
      {
        name: "按摩師",
        email: "masseur@example.com",
        password: "password123",
        role: "masseur"
      },
      {
        name: "一般用戶",
        email: "user@example.com",
        password: "password123",
        role: "user"
      }
    ];
    
    const results = [];
    
    // 為每個測試帳號
    for (const account of testAccounts) {
      // 檢查帳號是否已存在
      const existingUser = await prisma.user.findUnique({
        where: {
          email: account.email
        }
      });
      
      if (existingUser) {
        console.log(`測試帳號 ${account.email} 已存在，角色為 ${existingUser.role}`);
        results.push({
          email: account.email,
          status: "已存在",
          role: existingUser.role
        });
        continue;
      }
      
      // 創建新帳號
      const hashedPassword = hashPassword(account.password);
      
      const newUser = await prisma.user.create({
        data: {
          name: account.name,
          email: account.email,
          password: hashedPassword,
          role: account.role
        }
      });
      
      console.log(`已創建測試帳號 ${account.email}，角色為 ${account.role}`);
      results.push({
        email: account.email,
        status: "已創建",
        role: account.role
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "測試帳號初始化完成",
      accounts: results
    });
  } catch (error) {
    console.error("初始化測試帳號時發生錯誤:", error);
    return NextResponse.json({ 
      success: false,
      error: "初始化測試帳號失敗" 
    }, { status: 500 });
  }
} 