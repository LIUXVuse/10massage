import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    const user = await prisma.user.update({
      where: {
        email,
      },
      data: {
        role: "ADMIN",
      },
    })

    return NextResponse.json({ message: "已成功設定為管理員", user })
  } catch (error) {
    console.error("設定管理員時發生錯誤:", error)
    return NextResponse.json(
      { error: "設定管理員時發生錯誤" },
      { status: 500 }
    )
  }
} 