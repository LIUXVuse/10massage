import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { z } from "zod"

import { prisma } from "@/lib/db/prisma"

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

    const hashedPassword = await hash(body.password, 10)

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