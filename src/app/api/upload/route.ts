import { NextResponse } from "next/server"
import { requireAdminServer } from "@/lib/auth/auth.server"
import { put } from "@vercel/blob"

// 支持Cloudflare Pages和Prisma
export const runtime = 'nodejs';

/**
 * 處理圖片上傳的API端點
 * 使用Vercel Blob Storage儲存圖片
 */
export async function POST(req: Request) {
  try {
    console.log("開始處理檔案上傳請求");
    
    try {
      // 權限檢查 - 確保只有管理員可以上傳
      await requireAdminServer();
      console.log("上傳API - 權限檢查通過：使用者是管理員");
    } catch (error) {
      console.log("上傳API - 權限拒絕：使用者不是管理員");
      return NextResponse.json(
        { error: "未授權：只有管理員可以上傳檔案" },
        { status: 403 }
      );
    }

    // 解析表單數據
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("上傳API - 錯誤: 未找到檔案");
      return NextResponse.json(
        { error: "未找到檔案" },
        { status: 400 }
      );
    }

    // 檢查文件類型是否為圖像
    if (!file.type.startsWith("image/")) {
      console.log("上傳API - 錯誤: 檔案類型錯誤", file.type);
      return NextResponse.json(
        { error: "僅接受圖像檔案" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const fileExtension = file.name.split(".").pop() || "jpg";
    
    console.log("上傳API - 檔案信息:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    
    try {
      // 使用Vercel Blob Storage上傳圖片
      const { url } = await put(`masseurs/${Date.now()}.${fileExtension}`, file, {
        access: 'public',
      });
      
      console.log("上傳API - 成功上傳到Vercel Blob:", url);
      return NextResponse.json({ url });
    } catch (error) {
      console.error("上傳API - Blob上傳出錯:", error);
      return NextResponse.json(
        { error: "檔案上傳到Blob時發生錯誤", details: error instanceof Error ? error.message : "未知錯誤" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("上傳API - 處理錯誤:", error);
    return NextResponse.json(
      { error: "處理上傳時發生錯誤", details: error instanceof Error ? error.message : "未知錯誤" },
      { status: 500 }
    );
  }
} 