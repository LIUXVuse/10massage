import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { hashPassword } from "@/lib/auth/auth.server"

// 支持Cloudflare Pages和Prisma
export const runtime = "nodejs"; // 從'edge'改為'nodejs'，以支持密碼哈希功能

// 不再需要這個簡單哈希函數，我們使用從auth.server.ts導入的hashPassword
// function simpleHash(str: string): string {
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     const char = str.charCodeAt(i);
//     hash = ((hash << 5) - hash) + char;
//     hash = hash & hash; // 轉換為32bit整數
//   }
//   return hash.toString(16);
// }

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = registerSchema.parse(json)

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
      },
    })

    const { password: _, ...result } = user

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "無效的輸入" }, { status: 422 })
    }

    return NextResponse.json(
      { message: "註冊時發生錯誤" },
      { status: 500 }
    )
  }
} 