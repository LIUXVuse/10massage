import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
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
      orderBy: [
        {
          isRecommended: 'desc',
        },
        {
          recommendOrder: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, type, category, isRecommended, recommendOrder, durations, masseurs } = body;

    const service = await prisma.service.create({
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
          create: masseurs.map((m: { id: string }) => ({
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
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
} 