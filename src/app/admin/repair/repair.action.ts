"use server";

import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/auth.server";
import { revalidatePath } from "next/cache";
import { log } from "console";

/**
 * 系統修復操作
 * 
 * 1. 重置默認賬戶的密碼，確保可以使用預設密碼登入
 * 2. 確保按摩師賬戶與按摩師資料同步
 */
export async function repairSystem() {
  console.log("開始系統修復...");
  
  // 1. 修復默認帳號
  const DEFAULT_ACCOUNTS = [
    { name: "系統管理員", email: "admin@eilinspa.com", password: "admin123", role: "ADMIN" },
    { name: "測試按摩師", email: "masseur@eilinspa.com", password: "masseur123", role: "MASSEUR" },
    { name: "測試用戶", email: "user@eilinspa.com", password: "user123", role: "USER" }
  ];
  
  // 修復成功計數
  let updatedAccounts = 0;
  let createdMasseurs = 0;
  
  // 修復默認帳號密碼
  for (const account of DEFAULT_ACCOUNTS) {
    try {
      // 檢查帳號是否存在
      let user = await prisma.user.findUnique({
        where: { email: account.email }
      });
      
      // 如果帳號已存在，更新密碼
      if (user) {
        const shaHash = hashPassword(account.password);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: shaHash }
        });
        console.log(`更新帳號 ${account.email} 的密碼哈希`);
        updatedAccounts++;
      } 
      // 如果帳號不存在，創建帳號
      else {
        const shaHash = hashPassword(account.password);
        user = await prisma.user.create({
          data: {
            name: account.name,
            email: account.email,
            password: shaHash,
            role: account.role
          }
        });
        console.log(`創建帳號 ${account.email}`);
        updatedAccounts++;
      }
    } catch (error) {
      console.error(`修復帳號 ${account.email} 失敗:`, error);
    }
  }
  
  // 2. 同步按摩師資料
  // 先獲取所有角色為MASSEUR的用戶
  try {
    // 查找所有角色為MASSEUR的用戶
    console.log("開始同步按摩師資料...");
    const masseurUsers = await prisma.user.findMany({
      where: { role: "MASSEUR" }
    });
    
    console.log(`找到 ${masseurUsers.length} 個按摩師角色用戶`);
    
    // 為每個按摩師用戶檢查或建立按摩師資料
    for (const user of masseurUsers) {
      try {
        // 檢查是否已有對應的按摩師資料
        const existingMasseur = await prisma.masseur.findFirst({
          where: { name: user.name || "" }
        });
        
        if (!existingMasseur) {
          // 創建按摩師資料
          await prisma.masseur.create({
            data: {
              name: user.name || `按摩師 ${user.id.substring(0, 4)}`,
              description: `${user.name || "此按摩師"}是我們團隊的專業按摩師，擁有豐富的經驗，專注於提供高品質的按摩服務。`,
              isActive: true
            }
          });
          console.log(`為用戶 ${user.email} 創建按摩師資料`);
          createdMasseurs++;
        } else {
          console.log(`用戶 ${user.email} 已有按摩師資料`);
        }
      } catch (error) {
        console.error(`為用戶 ${user.email} 同步按摩師資料失敗:`, error);
      }
    }
    
    // 3. 檢查是否存在孤立的按摩師記錄(未對應用戶記錄)
    const allMasseurs = await prisma.masseur.findMany();
    console.log(`系統中共有 ${allMasseurs.length} 個按摩師記錄`);
  } catch (error) {
    console.error("同步按摩師資料時發生錯誤:", error);
  }
  
  // 檢查並顯示當前所有按摩師記錄
  try {
    const currentMasseurs = await prisma.masseur.findMany();
    console.log("目前系統中的按摩師:", currentMasseurs.map(m => m.name).join(", "));
  } catch (error) {
    console.error("獲取按摩師列表失敗:", error);
  }
  
  // 更新緩存，確保頁面刷新後能看到更新
  revalidatePath("/admin/repair");
  revalidatePath("/admin/masseurs");
  revalidatePath("/");
  
  return {
    success: true,
    message: `系統修復完成。更新帳號: ${updatedAccounts} 個，創建按摩師資料: ${createdMasseurs} 個。`,
  };
} 