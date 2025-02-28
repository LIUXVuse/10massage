"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { isAdmin } from "@/lib/auth/auth-utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const userIsAdmin = isAdmin(session);

  if (status === "loading") {
    return <div>載入中...</div>
  }

  if (status === "unauthenticated") {
    router.replace("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="font-bold">伊林SPA</span>
            </Link>
            <nav className="flex gap-6">
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                儀表板
              </Link>
              <Link
                href="/masseurs"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                查看按摩師
              </Link>
              <Link
                href="/services"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                服務項目
              </Link>
              {userIsAdmin && (
                <Link
                  href="/users"
                  className="transition-colors hover:text-foreground/80 text-foreground"
                >
                  用戶管理
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {session?.user?.name} ({session?.user?.role?.toUpperCase() === "ADMIN" ? "管理員" : 
                                     session?.user?.role?.toUpperCase() === "MASSEUR" ? "按摩師" : "會員"})
            </span>
            <Button
              variant="ghost"
              onClick={() => {
                signOut({ 
                  callbackUrl: "/login",
                  redirect: true
                }).catch(err => {
                  console.error("登出時發生錯誤:", err);
                  window.location.href = "/login";
                });
              }}
            >
              登出
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  )
} 