"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { isAdmin } from "@/lib/auth/auth-utils"
import { useLanguage } from "@/context/language-context"
import { t } from "@/lib/translations"
import LanguageSwitcher from "@/components/language-switcher"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { language } = useLanguage()
  const userIsAdmin = isAdmin(session);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("app.loading", language)}...
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.replace("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="font-bold text-amber-800 text-xl">
                {t("app.name", language)}
              </span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                href="/dashboard"
                className="transition-colors hover:text-amber-600 text-gray-700 font-medium"
              >
                {t("nav.dashboard", language)}
              </Link>
              <Link
                href="/masseurs"
                className="transition-colors hover:text-amber-600 text-gray-700 font-medium"
              >
                {t("nav.masseurs", language)}
              </Link>
              <Link
                href="/manage-services"
                className="transition-colors hover:text-amber-600 text-gray-700 font-medium"
              >
                {t("nav.services", language)}
              </Link>
              {userIsAdmin && (
                <>
                  <Link
                    href="/users"
                    className="transition-colors hover:text-amber-600 text-gray-700 font-medium"
                  >
                    {t("nav.userManagement", language)}
                  </Link>
                  <Link
                    href="/admin"
                    className="transition-colors hover:text-amber-600 text-gray-700 font-medium"
                  >
                    {t("nav.systemManagement", language)}
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="text-sm text-gray-600 hidden md:inline-block">
              {session?.user?.name} (
              {session?.user?.role?.toUpperCase() === "ADMIN" 
                ? t("role.admin", language) 
                : session?.user?.role?.toUpperCase() === "MASSEUR" 
                ? t("role.masseur", language) 
                : t("role.member", language)
              })
            </span>
            <Button
              variant="outline"
              className="border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
              onClick={() => {
                signOut({ 
                  callbackUrl: "/login",
                  redirect: true
                }).catch(err => {
                  console.error(`${t("error.logoutFailed", language)}:`, err);
                  window.location.href = "/login";
                });
              }}
            >
              {t("auth.logout", language)}
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
      <footer className="bg-amber-800 text-white py-6 mt-auto">
        <div className="container text-center">
          <p>© 2023 {t("app.name", language)}. {t("footer.copyright", language)}</p>
        </div>
      </footer>
    </div>
  )
} 