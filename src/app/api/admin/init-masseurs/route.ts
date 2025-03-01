import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// 支持Cloudflare Pages和Prisma
export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("開始初始化按摩師數據");
    
    // 定義示範按摩師數據
    const demoMasseurs = [
      {
        name: "王小明",
        description: "專業按摩師，擁有10年經驗。擅長舒緩疲勞和緩解肌肉痠痛。",
        experience: 10,
        image: "https://randomuser.me/api/portraits/men/1.jpg",
        isActive: true,
        sortOrder: 1
      },
      {
        name: "李美玲",
        description: "資深芳療師，精通多種按摩技法，特別擅長穴位按摩和精油舒壓。",
        experience: 8,
        image: "https://randomuser.me/api/portraits/women/1.jpg",
        isActive: true,
        sortOrder: 2
      },
      {
        name: "張大維",
        description: "運動按摩專家，曾為多位運動員提供康復服務，專注於運動傷害恢復。",
        experience: 12,
        image: "https://randomuser.me/api/portraits/men/2.jpg",
        isActive: true,
        sortOrder: 3
      }
    ];
    
    const results = [];
    
    // 為每個示範按摩師
    for (const masseur of demoMasseurs) {
      // 檢查按摩師是否已存在
      const existingMasseur = await prisma.masseur.findFirst({
        where: {
          name: masseur.name
        }
      });
      
      if (existingMasseur) {
        console.log(`按摩師 ${masseur.name} 已存在`);
        results.push({
          name: masseur.name,
          status: "已存在",
          id: existingMasseur.id
        });
        continue;
      }
      
      // 創建新按摩師
      const newMasseur = await prisma.masseur.create({
        data: masseur
      });
      
      console.log(`已創建按摩師 ${masseur.name}`);
      results.push({
        name: masseur.name,
        status: "已創建",
        id: newMasseur.id
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "按摩師數據初始化完成",
      masseurs: results
    });
  } catch (error) {
    console.error("初始化按摩師數據時發生錯誤:", error);
    return NextResponse.json({ 
      success: false,
      error: "初始化按摩師數據失敗",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 