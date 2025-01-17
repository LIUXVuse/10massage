import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hash } from "bcrypt"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Service {
  id: string
  name: string
}

interface ServiceRelation {
  service: Service
}

interface Masseur {
  id: string
  description: string | null
  imageUrl: string | null
  imageScale: number | null
  imageX: number | null
  imageY: number | null
  user: User | null
  services: ServiceRelation[]
}

export async function POST(req: Request) {
  try {
    const { name, description, services, imageUrl, imageScale, imageX, imageY } = await req.json()

    // 生成臨時密碼
    const tempPassword = await hash("temporary", 10)

    const masseur = await prisma.masseur.create({
      data: {
        user: {
          create: {
            name,
            email: `${name}@example.com`,
            password: tempPassword,
            role: "MASSEUR"
          }
        },
        description,
        imageUrl,
        imageScale,
        imageX,
        imageY,
        services: {
          create: services?.map((serviceId: string) => ({
            service: {
              connect: { id: serviceId }
            }
          })) || []
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(masseur)
  } catch (error) {
    console.error("新增按摩師時發生錯誤:", error)
    return NextResponse.json({ error: "新增按摩師時發生錯誤" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const masseurs = await prisma.masseur.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    const formattedMasseurs = masseurs.map((masseur: Masseur) => ({
      id: masseur.id,
      name: masseur.user?.name,
      description: masseur.description,
      imageUrl: masseur.imageUrl,
      imageScale: masseur.imageScale,
      imageX: masseur.imageX,
      imageY: masseur.imageY,
      services: masseur.services.map((s: ServiceRelation) => s.service),
      user: masseur.user
    }))

    return NextResponse.json(formattedMasseurs)
  } catch (error) {
    console.error("獲取按摩師列表時發生錯誤:", error)
    return NextResponse.json({ error: "獲取按摩師列表時發生錯誤" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, description, services, imageUrl, imageScale, imageX, imageY } = await req.json()

    const masseur = await prisma.masseur.update({
      where: { id },
      data: {
        description,
        imageUrl,
        imageScale,
        imageX,
        imageY,
        user: name ? {
          update: {
            name
          }
        } : undefined,
        services: {
          deleteMany: {},
          create: services?.map((serviceId: string) => ({
            service: {
              connect: { id: serviceId }
            }
          })) || []
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    const formattedMasseur = {
      id: masseur.id,
      name: masseur.user?.name,
      description: masseur.description,
      imageUrl: masseur.imageUrl,
      imageScale: masseur.imageScale,
      imageX: masseur.imageX,
      imageY: masseur.imageY,
      services: masseur.services.map((s: ServiceRelation) => s.service),
      user: masseur.user
    }

    return NextResponse.json(formattedMasseur)
  } catch (error) {
    console.error("更新按摩師時發生錯誤:", error)
    return NextResponse.json({ error: "更新按摩師時發生錯誤" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()

    await prisma.masseur.delete({
      where: { id }
    })

    return NextResponse.json({ message: "按摩師已成功刪除" })
  } catch (error) {
    console.error("刪除按摩師時發生錯誤:", error)
    return NextResponse.json({ error: "刪除按摩師時發生錯誤" }, { status: 500 })
  }
} 