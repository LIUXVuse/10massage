import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { hashPassword } from "@/lib/auth/auth.server"

// 支持Cloudflare Pages和Prisma
export const runtime = "nodejs"; // 從'edge'改為'nodejs'，以支持密碼哈希功能

const registerMasseurSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = registerMasseurSchema.parse(json)

    const exists = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    })

    if (exists) {
      return NextResponse.json(
        { message: "此電子郵件已被註冊" },
        { status: 400 }
      )
    }

    // 使用從auth.server.ts導入的hashPassword函數
    const hashedPassword = hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        phone: body.phone,
        role: "masseur", // 直接設置為按摩師角色
      },
    })

    const { password: _, ...result } = user

    return NextResponse.json(result)
  } catch (error) {
    console.error("按摩師註冊錯誤:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "無效的輸入" }, { status: 422 })
    }

    return NextResponse.json(
      { message: "按摩師註冊時發生錯誤" },
      { status: 500 }
    )
  }
} 