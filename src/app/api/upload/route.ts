import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getAuthOptions } from "@/lib/auth/auth.server"
import { isAdmin } from "@/lib/auth/auth-utils"
import { v4 as uuidv4 } from "uuid"
import { promises as fs } from "fs"
import { join } from "path"

// 支持Cloudflare Pages和Prisma
export const runtime = 'nodejs';

/**
 * 處理圖片上傳的API端點
 * 根據環境變量判斷使用Cloudflare R2或本地文件系統存儲
 */
export async function POST(req: Request) {
  try {
    console.log("開始處理檔案上傳請求");
    
    // 權限檢查
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    
    console.log("上傳API權限檢查:", {
      sessionExists: !!session,
      user: session?.user?.name || "無使用者",
      email: session?.user?.email || "無郵箱",
      role: session?.user?.role || "無角色",
    });
    
    // 只允許管理員上傳
    if (!isAdmin(session)) {
      console.log("上傳API - 權限拒絕: 使用者不是管理員");
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

    // 生成唯一的檔案名稱
    const buffer = await file.arrayBuffer();
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    console.log("上傳API - 檔案信息:", {
      name: file.name,
      type: file.type,
      size: file.size,
      generatedName: fileName
    });
    
    // 檢測是否在Cloudflare環境
    let url = "";
    const isCloudflare = process.env.CLOUDFLARE_R2_ENABLED === 'true';
    
    console.log("上傳API - 環境檢測:", {
      isCloudflare,
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID ? "已設置" : "未設置",
      bucketName: process.env.R2_BUCKET_NAME || "未設置",
      r2Url: process.env.NEXT_PUBLIC_R2_URL || "未設置",
    });
    
    if (isCloudflare) {
      try {
        // 使用R2儲存檔案
        console.log("上傳API - 使用Cloudflare R2儲存檔案:", fileName);
        
        if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.R2_BUCKET_NAME || !process.env.CLOUDFLARE_API_TOKEN) {
          throw new Error("缺少必要的R2環境變數設置");
        }
        
        const r2Endpoint = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${process.env.R2_BUCKET_NAME}/objects/${fileName}`;
        console.log("上傳API - R2端點:", r2Endpoint);
        
        const response = await fetch(r2Endpoint, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            "Content-Type": file.type,
          },
          body: buffer,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("上傳API - R2上傳失敗:", {
            status: response.status,
            statusText: response.statusText,
            errorText
          });
          return NextResponse.json(
            { error: "檔案上傳到R2失敗", details: errorText },
            { status: 500 }
          );
        }
        
        url = `${process.env.NEXT_PUBLIC_R2_URL}/${fileName}`;
        console.log("上傳API - 成功上傳到R2:", url);
      } catch (error) {
        console.error("上傳API - R2上傳出錯:", error);
        return NextResponse.json(
          { error: "檔案上傳到R2時發生錯誤", details: error instanceof Error ? error.message : "未知錯誤" },
          { status: 500 }
        );
      }
    } else {
      try {
        // 存儲在本地文件系統
        console.log("上傳API - 使用本地文件系統儲存檔案:", fileName);
        const uploadsDir = join(process.cwd(), "public/uploads");
        
        try {
          await fs.access(uploadsDir);
        } catch (e) {
          console.log("上傳API - 創建上傳目錄:", uploadsDir);
          await fs.mkdir(uploadsDir, { recursive: true });
        }
        
        const filePath = join(uploadsDir, fileName);
        await fs.writeFile(filePath, Buffer.from(buffer));
        
        url = `/uploads/${fileName}`;
        console.log("上傳API - 成功上傳到本地:", url);
      } catch (error) {
        console.error("上傳API - 本地上傳出錯:", error);
        return NextResponse.json(
          { error: "檔案上傳到本地時發生錯誤", details: error instanceof Error ? error.message : "未知錯誤" },
          { status: 500 }
        );
      }
    }

    console.log("上傳API - 處理完成:", { url });
    return NextResponse.json({ url });
  } catch (error) {
    console.error("上傳API - 處理錯誤:", error);
    return NextResponse.json(
      { error: "處理上傳時發生錯誤", details: error instanceof Error ? error.message : "未知錯誤" },
      { status: 500 }
    );
  }
} 