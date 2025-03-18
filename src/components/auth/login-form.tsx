"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const loginSchema = z.object({
  email: z.string().email("请输入有效的电子邮箱"),
  password: z.string().min(6, "密码至少需要6个字符"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsLoading(true)
      setError("")

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError("电子邮箱或密码错误")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("登录错误:", error)
      setError("登录时发生错误")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="email"
          placeholder="name@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          disabled={isLoading}
          {...register("email")}
          className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
        />
        {errors?.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Input
          id="password"
          placeholder="请输入密码"
          type="password"
          autoComplete="current-password"
          disabled={isLoading}
          {...register("password")}
          className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
        />
        {errors?.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button 
        type="submit" 
        className="w-full bg-amber-600 hover:bg-amber-700" 
        disabled={isLoading}
      >
        {isLoading ? "登录中..." : "登录"}
      </Button>
      
      <div className="pt-4 border-t mt-6">
        <p className="text-sm text-gray-500 mb-3 text-center">系统预设账号</p>
        <div className="text-xs text-gray-500 space-y-1">
          <p>管理员：admin@eilinspa.com / admin123</p>
          <p>按摩师：masseur@eilinspa.com / masseur123</p>
          <p>用户：user@eilinspa.com / user123</p>
        </div>
      </div>
    </form>
  )
} 