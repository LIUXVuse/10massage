"use server";

import { getAuthOptions } from "./auth.server";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

// 服務器端身份驗證函數 - 使用於頁面路由
export async function getCurrentUser() {
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  
  if (user.role?.toUpperCase() !== "ADMIN") {
    redirect("/");
  }
  
  return user;
}

export async function requireMasseurOrAdmin() {
  const user = await requireAuth();
  
  const role = user.role?.toUpperCase();
  if (role !== "ADMIN" && role !== "MASSEUR") {
    redirect("/");
  }
  
  return user;
} 