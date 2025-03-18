"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const userName = session?.user?.name || "使用者"

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8 text-amber-800">歡迎回來，{userName}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="p-6 bg-white rounded-lg shadow-sm border border-amber-100 cursor-pointer hover:shadow-md transition-shadow hover:border-amber-300"
          onClick={() => router.push("/appointments")}
        >
          <div className="flex items-center mb-3">
            <span className="text-amber-600 text-2xl mr-3">📅</span>
            <h2 className="text-xl font-semibold">我的預約</h2>
          </div>
          <p className="text-gray-600">查看和管理您的預約記錄</p>
        </div>

        <div 
          className="p-6 bg-white rounded-lg shadow-sm border border-amber-100 cursor-pointer hover:shadow-md transition-shadow hover:border-amber-300"
          onClick={() => router.push("/profile")}
        >
          <div className="flex items-center mb-3">
            <span className="text-amber-600 text-2xl mr-3">👤</span>
            <h2 className="text-xl font-semibold">個人資料</h2>
          </div>
          <p className="text-gray-600">更新您的個人資訊</p>
        </div>

        <div 
          className="p-6 bg-white rounded-lg shadow-sm border border-amber-100 cursor-pointer hover:shadow-md transition-shadow hover:border-amber-300"
          onClick={() => router.push("/manage-services")}
        >
          <div className="flex items-center mb-3">
            <span className="text-amber-600 text-2xl mr-3">🧖</span>
            <h2 className="text-xl font-semibold">服務項目</h2>
          </div>
          <p className="text-gray-600">瀏覽可預約的服務項目</p>
        </div>

        <div 
          className="p-6 bg-white rounded-lg shadow-sm border border-amber-100 cursor-pointer hover:shadow-md transition-shadow hover:border-amber-300"
          onClick={() => router.push("/masseurs")}
        >
          <div className="flex items-center mb-3">
            <span className="text-amber-600 text-2xl mr-3">👐</span>
            <h2 className="text-xl font-semibold">按摩師</h2>
          </div>
          <p className="text-gray-600">查看按摩師資訊</p>
        </div>
      </div>
    </div>
  )
} 