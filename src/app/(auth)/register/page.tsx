import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentServerUser } from "@/lib/auth/auth.server"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "注册 | 伊林SPA",
  description: "注册伊林SPA会员账号",
}

export default async function RegisterPage() {
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
              &ldquo;加入伊林SPA会员，享受更多专属优惠与服务。&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              注册会员账号
            </h1>
            <p className="text-sm text-muted-foreground">
              填写以下资料完成注册
            </p>
          </div>
          <RegisterForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-amber-600 underline underline-offset-4"
            >
              已有账号？立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 