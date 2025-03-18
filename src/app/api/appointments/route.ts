import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 檢查用戶是否已登入
    if (!session?.user) {
      return NextResponse.json(
        { error: "未授權，請登入後再試" }, 
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { serviceId, masseurId, serviceDurationId, date, time } = body;
    
    // 驗證必要欄位
    if (!serviceId || !masseurId || !serviceDurationId || !date || !time) {
      return NextResponse.json(
        { error: "缺少必要的預約資訊" }, 
        { status: 400 }
      );
    }
    
    // 驗證服務是否存在
    const service = await db.service.findUnique({
      where: { id: serviceId }
    });
    
    if (!service) {
      return NextResponse.json(
        { error: "所選服務不存在" }, 
        { status: 404 }
      );
    }
    
    // 驗證服務時長選項是否存在
    const serviceDuration = await db.serviceDuration.findUnique({
      where: { id: serviceDurationId }
    });
    
    if (!serviceDuration) {
      return NextResponse.json(
        { error: "所選服務時長不存在" }, 
        { status: 404 }
      );
    }
    
    // 驗證按摩師是否存在
    const masseur = await db.masseur.findUnique({
      where: { id: masseurId }
    });
    
    if (!masseur) {
      return NextResponse.json(
        { error: "所選按摩師不存在" }, 
        { status: 404 }
      );
    }
    
    // 驗證預約時間是否可用（這裡只是簡單示例，實際應用中可能需要更複雜的邏輯）
    const existingAppointment = await db.appointment.findFirst({
      where: {
        masseurId,
        date,
        time,
        status: { in: ["CONFIRMED", "PENDING"] }
      }
    });
    
    if (existingAppointment) {
      return NextResponse.json(
        { error: "所選時間已被預約，請選擇其他時間" }, 
        { status: 409 }
      );
    }
    
    // 創建預約
    const appointment = await db.appointment.create({
      data: {
        serviceId,
        masseurId,
        serviceDurationId,
        userId: session.user.id,
        date,
        time,
        status: "PENDING" // 初始狀態為待確認
      }
    });
    
    // 發送預約確認郵件/簡訊（此處為示例，實際實現可能需要集成第三方服務）
    // await sendAppointmentConfirmation(appointment, session.user.email);
    
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("創建預約失敗:", error);
    return NextResponse.json(
      { error: "創建預約失敗，請稍後再試" }, 
      { status: 500 }
    );
  }
}

// 獲取用戶的預約列表
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 檢查用戶是否已登入
    if (!session?.user) {
      return NextResponse.json(
        { error: "未授權，請登入後再試" }, 
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    
    // 構建查詢條件
    const where: any = {
      userId: session.user.id
    };
    
    // 如果指定了狀態，添加狀態過濾
    if (status) {
      where.status = status;
    }
    
    // 獲取預約列表
    const appointments = await db.appointment.findMany({
      where,
      include: {
        service: true,
        serviceDuration: true,
        masseur: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("獲取預約列表失敗:", error);
    return NextResponse.json(
      { error: "獲取預約列表失敗，請稍後再試" }, 
      { status: 500 }
    );
  }
} 