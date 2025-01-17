import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json(
        { error: "未找到上傳的文件" },
        { status: 400 }
      )
    }

    // 檢查文件類型
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "只允許上傳圖片文件" },
        { status: 400 }
      )
    }

    // 生成唯一的文件名
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`

    // 確保上傳目錄存在
    const uploadDir = join(process.cwd(), "public", "uploads")
    try {
      await writeFile(join(uploadDir, filename), buffer)
    } catch (error) {
      console.error("保存文件時發生錯誤:", error)
      return NextResponse.json(
        { error: "保存文件失敗" },
        { status: 500 }
      )
    }

    // 返回文件URL
    return NextResponse.json({
      url: `/uploads/${filename}`
    })
  } catch (error) {
    console.error("上傳文件時發生錯誤:", error)
    return NextResponse.json(
      { error: "上傳文件失敗" },
      { status: 500 }
    )
  }
} 