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
  email: z.string().email("請輸入有效的電子郵件"),
  password: z.string().min(6, "密碼至少需要6個字元"),
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
        setError("電子郵件或密碼錯誤")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      setError("登入時發生錯誤")
    } finally {
      setIsLoading(false)
    }
  }

  // 測試帳號登錄函數
  async function loginWithTestAccount(role: string) {
    try {
      setIsLoading(true)
      setError("")

      let email = "";
      let password = "password123";

      switch(role) {
        case "admin":
          email = "admin@example.com";
          break;
        case "masseur":
          email = "masseur@example.com";
          break;
        case "user":
          email = "user@example.com";
          break;
        default:
          setError("無效的測試帳號類型");
          setIsLoading(false);
          return;
      }

      const result = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      })

      if (result?.error) {
        setError(`測試帳號登入失敗: ${result.error}`);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError("測試帳號登入時發生錯誤");
      console.error("測試帳號登入錯誤:", error);
    } finally {
      setIsLoading(false);
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
          autoComplete="current-password"
          disabled={isLoading}
          {...register("password")}
        />
        {errors?.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "登入中..." : "登入"}
      </Button>

      {/* 測試帳號區域 */}
      <div className="pt-4 border-t mt-6">
        <p className="text-sm text-gray-500 mb-3 text-center">使用測試帳號快速登入</p>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => loginWithTestAccount("admin")}
            disabled={isLoading}
            className="text-xs"
          >
            管理員測試
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => loginWithTestAccount("masseur")}
            disabled={isLoading}
            className="text-xs"
          >
            按摩師測試
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => loginWithTestAccount("user")}
            disabled={isLoading}
            className="text-xs"
          >
            一般用戶測試
          </Button>
        </div>
      </div>
    </form>
  )
} 