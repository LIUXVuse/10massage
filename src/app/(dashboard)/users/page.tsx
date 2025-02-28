"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/auth/auth-utils"
import { UserRoleManagement } from "@/components/admin/user-role-management"

export default function UsersPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })

  // 使用統一的權限檢查函數
  const userIsAdmin = isAdmin(session);

  // 如果不是管理員，重定向到儀表板
  useEffect(() => {
    if (!userIsAdmin) {
      redirect('/dashboard')
    }
  }, [userIsAdmin])

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">用戶管理</h1>
        <p className="text-gray-600">管理系統中的所有用戶和角色分配</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">角色說明</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-lg font-medium mb-1 text-blue-600">一般用戶</div>
            <p className="text-sm text-gray-600">只能查看和預約服務，管理個人資料。</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-lg font-medium mb-1 text-green-600">按摩師</div>
            <p className="text-sm text-gray-600">可以查看預約情況並管理自己的排程。</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-lg font-medium mb-1 text-purple-600">管理員</div>
            <p className="text-sm text-gray-600">可以進行系統全部設定，管理用戶、服務和按摩師。</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">用戶列表</h2>
        <UserRoleManagement />
      </div>
    </div>
  )
} 