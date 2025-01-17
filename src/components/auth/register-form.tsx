"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const registerSchema = z.object({
  name: z.string().min(2, "姓名至少需要2個字元"),
  email: z.string().email("請輸入有效的電子郵件"),
  password: z.string().min(6, "密碼至少需要6個字元"),
  phone: z.string().optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormValues) {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      router.push("/login?registered=true")
    } catch (error) {
      setError(error instanceof Error ? error.message : "註冊時發生錯誤")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="name"
          placeholder="您的姓名"
          type="text"
          autoCapitalize="none"
          autoComplete="name"
          autoCorrect="off"
          disabled={isLoading}
          {...register("name")}
        />
        {errors?.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
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
        />
        {errors?.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Input
          id="password"
          placeholder="請輸入密碼"
          type="password"
          autoComplete="new-password"
          disabled={isLoading}
          {...register("password")}
        />
        {errors?.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Input
          id="phone"
          placeholder="電話號碼（選填）"
          type="tel"
          autoComplete="tel"
          disabled={isLoading}
          {...register("phone")}
        />
        {errors?.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "註冊中..." : "註冊"}
      </Button>
    </form>
  )
} 