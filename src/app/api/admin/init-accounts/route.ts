import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { hashPassword } from "@/lib/auth/auth.server"

// 支持Cloudflare Pages和Prisma
export const runtime = "nodejs";

// 預設帳戶設置
const DEFAULT_ACCOUNTS = [
  {
    name: "系統管理員",
    email: "admin@eilinspa.com",
    password: "admin123", // 實際部署時應使用更強密碼
    role: "ADMIN"
  },
  {
    name: "測試按摩師",
    email: "masseur@eilinspa.com", 
    password: "masseur123",
    role: "MASSEUR"
  },
  {
    name: "測試用戶",
    email: "user@eilinspa.com",
    password: "user123",
    role: "USER"
  }
];

export async function GET(req: Request) {
  try {
    const results = [];
    
    // 逐一創建或更新預設帳戶
    for (const account of DEFAULT_ACCOUNTS) {
      const { name, email, password, role } = account;
      
      // 檢查帳戶是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        // 更新現有帳戶的密碼和角色
        await prisma.user.update({
          where: { email },
          data: {
            password: hashPassword(password),
            role
          }
        });
        results.push(`已更新帳戶: ${email} (${role})`);
      } else {
        // 創建新帳戶
        await prisma.user.create({
          data: {
            name,
            email,
            password: hashPassword(password),
            role
          }
        });
        results.push(`已創建帳戶: ${email} (${role})`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "預設帳戶設置完成",
      details: results,
      accounts: DEFAULT_ACCOUNTS.map(({ email, password, role }) => ({ email, password, role }))
    });
  } catch (error) {
    console.error("設置預設帳戶時發生錯誤:", error);
    return NextResponse.json(
      { error: "設置預設帳戶失敗", details: error },
      { status: 500 }
    );
  }
} 