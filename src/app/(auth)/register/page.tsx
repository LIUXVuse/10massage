import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentServerUser } from "@/lib/auth/auth.server"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "註冊 | 伊林SPA",
  description: "註冊伊林SPA會員帳號",
}

export default async function RegisterPage() {
  const user = await getCurrentServerUser()
  
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/">伊林SPA</Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;享受專業的按摩服務，讓身心靈得到完全的放鬆。&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              註冊會員帳號
            </h1>
            <p className="text-sm text-muted-foreground">
              填寫以下資料以註冊會員
            </p>
          </div>
          <RegisterForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-brand underline underline-offset-4"
            >
              已有帳號？立即登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 