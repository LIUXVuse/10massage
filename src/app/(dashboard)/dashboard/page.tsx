"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">歡迎回來，{/* 用戶名稱 */}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className="p-6 bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push("/appointments")}
        >
          <h2 className="text-xl font-semibold mb-2">我的預約</h2>
          <p className="text-gray-600">查看和管理您的預約記錄</p>
        </div>

        <div 
          className="p-6 bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push("/profile")}
        >
          <h2 className="text-xl font-semibold mb-2">個人資料</h2>
          <p className="text-gray-600">更新您的個人資訊</p>
        </div>

        <div 
          className="p-6 bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push("/services")}
        >
          <h2 className="text-xl font-semibold mb-2">服務項目</h2>
          <p className="text-gray-600">瀏覽可預約的服務項目</p>
        </div>

        <div 
          className="p-6 bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push("/masseurs")}
        >
          <h2 className="text-xl font-semibold mb-2">按摩師</h2>
          <p className="text-gray-600">查看按摩師資訊</p>
        </div>
      </div>
    </div>
  )
} 