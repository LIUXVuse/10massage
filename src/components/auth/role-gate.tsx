"use client"

import { useSession } from "next-auth/react"
import { ReactNode } from "react"

interface RoleGateProps {
  children: ReactNode
  allowedRoles: string[]
}

export function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { data: session } = useSession()
  const userRole = session?.user?.role

  // 如果沒有會話或角色不在允許列表中，則不渲染子元素
  if (!session || !userRole || !allowedRoles.includes(userRole)) {
    return null
  }

  // 如果用戶角色在允許列表中，渲染子元素
  return <>{children}</>
} 