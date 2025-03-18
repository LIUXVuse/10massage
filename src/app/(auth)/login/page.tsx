import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentServerUser } from "@/lib/auth/auth.server"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "登录 | 伊林SPA",
  description: "登录伊林SPA会员账号",
}

export default async function LoginPage() {
  const user = await getCurrentServerUser()
  
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-amber-800" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/">伊林SPA</Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;享受专业的按摩服务，让身心灵得到完全的放松。&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              登录会员账号
            </h1>
            <p className="text-sm text-muted-foreground">
              输入您的电子邮箱和密码登录
            </p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/register"
              className="hover:text-amber-600 underline underline-offset-4"
            >
              还没有账号？立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 