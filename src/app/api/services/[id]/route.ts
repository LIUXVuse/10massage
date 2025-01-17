import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface MasseurRelation {
  id: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        durations: true,
        masseurs: {
          include: {
            masseur: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, type, category, isRecommended, recommendOrder, durations, masseurs } = body;

    // 刪除現有的時長和按摩師關聯
    await prisma.$transaction([
      prisma.serviceDuration.deleteMany({
        where: { serviceId: params.id },
      }),
      prisma.masseurService.deleteMany({
        where: { serviceId: params.id },
      }),
    ]);

    // 更新服務資訊並創建新的關聯
    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        name,
        description,
        type,
        category,
        isRecommended,
        recommendOrder,
        durations: {
          create: durations.map((d: { duration: number; price: number }) => ({
            duration: d.duration,
            price: d.price,
          })),
        },
        masseurs: {
          create: masseurs.map((m: MasseurRelation) => ({
            masseur: {
              connect: { id: m.id },
            },
          })),
        },
      },
      include: {
        durations: true,
        masseurs: {
          include: {
            masseur: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 刪除相關的時長和按摩師關聯
    await prisma.$transaction([
      prisma.serviceDuration.deleteMany({
        where: { serviceId: params.id },
      }),
      prisma.masseurService.deleteMany({
        where: { serviceId: params.id },
      }),
    ]);

    // 刪除服務
    await prisma.service.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
} 