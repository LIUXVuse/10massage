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
          // 確保使用統一的密碼雜湊方法 - SHA-256
          const shaHash = createHash('sha256').update(password).digest('hex');
          
          // 更新用戶密碼和角色
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
                  description: `${name}是我們團隊的專業按摩師，擁有豐富的經驗，專注於提供高品質的按摩服務。`,
                  isActive: true
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
        // 如果帳戶不存在，則建立新帳戶
        try {
          const shaHash = createHash('sha256').update(password).digest('hex');
          
          // 創建新用戶
          const newUser = await prisma.user.create({
            data: {
              name,
              email,
              password: shaHash,
              role
            }
          });
          
          results.push(`已創建帳戶: ${email} (${role})`);
          diagnostics.found++;
          diagnostics.updated++;
          
          // 如果是按摩師角色，同時創建按摩師記錄
          if (role === "MASSEUR") {
            await prisma.masseur.create({
              data: {
                name,
                description: `${name}是我們團隊的專業按摩師，擁有豐富的經驗，專注於提供高品質的按摩服務。`,
                isActive: true
              }
            });
            
            diagnostics.masseurCreated++;
            results.push(`已為新用戶 ${email} 創建按摩師記錄`);
          }
        } catch (error: any) {
          console.error(`創建帳戶 ${email} 時出錯:`, error);
          diagnostics.errors.push(`${email}: ${error.message || '未知錯誤'}`);
        }
      }
    }
    
    // 3. 檢查是否存在所有按摩師記錄 - 解決本地環境和生產環境同步問題
    try {
      // 獲取所有MASSEUR角色的用戶
      const masseurUsers = await prisma.user.findMany({
        where: { role: "MASSEUR" }
      });
      
      // 獲取所有按摩師記錄
      const existingMasseurs = await prisma.masseur.findMany();
      const existingMasseurNames = existingMasseurs.map(m => m.name.toLowerCase());
      
      // 對於每個按摩師角色用戶，確保他們有對應的按摩師記錄
      for (const user of masseurUsers) {
        if (!user.name) continue;
        
        const userName = user.name.toLowerCase();
        if (!existingMasseurNames.includes(userName)) {
          // 創建缺失的按摩師記錄
          await prisma.masseur.create({
            data: {
              name: user.name,
              description: `${user.name}是我們團隊的專業按摩師，擁有豐富的經驗，專注於提供高品質的按摩服務。`,
              isActive: true
            }
          });
          
          diagnostics.masseurCreated++;
          results.push(`為現有用戶 ${user.email} 創建缺失的按摩師記錄`);
        }
      }
      
      // 檢查是否有名稱相同但資料不同的按摩師記錄（本地環境和生產環境不一致）
      const localMasseurNames = masseurUsers.map(u => u.name?.toLowerCase() || '').filter(Boolean);
      
      for (const masseur of existingMasseurs) {
        const masseurName = masseur.name.toLowerCase();
        if (!localMasseurNames.includes(masseurName)) {
          // 這可能是本地環境中的按摩師，但在生產環境中沒有對應用戶
          // 創建一個新的用戶以匹配這個按摩師
          const emailPrefix = masseur.name.toLowerCase().replace(/\s+/g, '.');
          const email = `${emailPrefix}@eilinspa.com`;
          
          // 檢查是否已經存在相同email的用戶
          const existingUser = await prisma.user.findUnique({
            where: { email }
          });
          
          if (!existingUser) {
            // 創建新用戶
            const shaHash = createHash('sha256').update("masseur123").digest('hex');
            await prisma.user.create({
              data: {
                name: masseur.name,
                email,
                password: shaHash,
                role: "MASSEUR"
              }
            });
            
            results.push(`為現有按摩師 ${masseur.name} 創建對應用戶 (${email})`);
            diagnostics.updated++;
          }
        }
      }
    } catch (error: any) {
      console.error("同步按摩師記錄時出錯:", error);
      diagnostics.errors.push(`同步按摩師記錄: ${error.message || '未知錯誤'}`);
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