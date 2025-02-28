"use client";

import { Session } from "next-auth";

// 客戶端判斷功能 - 不依賴服務器端模組
export function isAdmin(session?: Session | null) {
  return session?.user?.role?.toUpperCase() === "ADMIN";
}

export function isMasseurOrAdmin(session?: Session | null) {
  const role = session?.user?.role?.toUpperCase();
  return role === "ADMIN" || role === "MASSEUR";
} 