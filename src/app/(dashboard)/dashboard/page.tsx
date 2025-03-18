"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const userName = session?.user?.name || "用户"

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8 text-amber-800">欢迎回来，{userName}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="p-6 bg-white rounded-lg shadow-sm border border-amber-100 cursor-pointer hover:shadow-md transition-shadow hover:border-amber-300"
          onClick={() => router.push("/appointments")}
        >
          <div className="flex items-center mb-3">
            <span className="text-amber-600 text-2xl mr-3">📅</span>
            <h2 className="text-xl font-semibold">我的预约</h2>
          </div>
          <p className="text-gray-600">查看和管理您的预约记录</p>
        </div>

        <div 
          className="p-6 bg-white rounded-lg shadow-sm border border-amber-100 cursor-pointer hover:shadow-md transition-shadow hover:border-amber-300"
          onClick={() => router.push("/profile")}
        >
          <div className="flex items-center mb-3">
            <span className="text-amber-600 text-2xl mr-3">👤</span>
            <h2 className="text-xl font-semibold">个人资料</h2>
          </div>
          <p className="text-gray-600">更新您的个人信息</p>
        </div>

        <div 
          className="p-6 bg-white rounded-lg shadow-sm border border-amber-100 cursor-pointer hover:shadow-md transition-shadow hover:border-amber-300"
          onClick={() => router.push("/manage-services")}
        >
          <div className="flex items-center mb-3">
            <span className="text-amber-600 text-2xl mr-3">🧖</span>
            <h2 className="text-xl font-semibold">服务项目</h2>
          </div>
          <p className="text-gray-600">浏览可预约的服务项目</p>
        </div>

        <div 
          className="p-6 bg-white rounded-lg shadow-sm border border-amber-100 cursor-pointer hover:shadow-md transition-shadow hover:border-amber-300"
          onClick={() => router.push("/masseurs")}
        >
          <div className="flex items-center mb-3">
            <span className="text-amber-600 text-2xl mr-3">👐</span>
            <h2 className="text-xl font-semibold">按摩师</h2>
          </div>
          <p className="text-gray-600">查看按摩师信息</p>
        </div>
      </div>
    </div>
  )
} 