import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { hashPassword } from "@/lib/auth/auth.server"
import { createHash } from "crypto"

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

// 修復帳戶密碼 - 確保所有帳戶的密碼使用相同的雜湊方法
export async function GET(req: Request) {
  try {
    const results: string[] = [];
    const diagnostics = {
      found: 0,
      updated: 0,
      masseurCreated: 0,
      errors: [] as string[]
    };
    
    // 1. 檢查所有用戶並修復密碼雜湊
    for (const account of DEFAULT_ACCOUNTS) {
      const { name, email, password, role } = account;
      
      // 檢查帳戶是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        diagnostics.found++;
        try {
          // 使用SHA-256雜湊來重新設置密碼
          const shaHash = createHash('sha256').update(password).digest('hex');
          
          // 更新用戶密碼
          await prisma.user.update({
            where: { email },
            data: {
              password: shaHash,
              role
            }
          });
          
          diagnostics.updated++;
          results.push(`已修復帳戶: ${email} (${role})`);
          
          // 2. 如果是MASSEUR角色，檢查是否需要創建按摩師記錄
          if (role === "MASSEUR") {
            // 檢查是否已存在按摩師記錄
            const masseur = await prisma.masseur.findFirst({
              where: {
                name: existingUser.name || name
              }
            });
            
            if (!masseur) {
              // 創建新的按摩師記錄
              await prisma.masseur.create({
                data: {
                  name: existingUser.name || name,
                  description: `${name}是我們團隊的專業按摩師，擁有豐富的經驗，專注於提供高品質的按摩服務。`
                  // 在某些系統中，sortOrder字段可能不可用，此處移除
                }
              });
              
              diagnostics.masseurCreated++;
              results.push(`已為用戶 ${email} 創建按摩師記錄`);
            }
          }
        } catch (error: any) {
          console.error(`修復帳戶 ${email} 時出錯:`, error);
          diagnostics.errors.push(`${email}: ${error.message || '未知錯誤'}`);
        }
      } else {
        results.push(`找不到帳戶: ${email}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "帳戶修復操作完成",
      details: results,
      diagnostics,
      accounts: DEFAULT_ACCOUNTS.map(({ email, password, role }) => ({ email, password, role }))
    });
  } catch (error: any) {
    console.error("修復帳戶時發生錯誤:", error);
    return NextResponse.json(
      { error: "修復帳戶失敗", details: error.message || String(error) },
      { status: 500 }
    );
  }
} 