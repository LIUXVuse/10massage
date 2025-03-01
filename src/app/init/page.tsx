"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InitPage() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initResult, setInitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [initMasseursResult, setInitMasseursResult] = useState<{ success: boolean; message: string } | null>(null);

  async function initializeTestAccounts() {
    try {
      setIsInitializing(true);
      setInitResult(null);
      
      console.log("正在初始化測試帳號...");
      const response = await fetch("/api/admin/init-test-accounts");
      const data = await response.json();
      
      console.log("初始化測試帳號結果:", data);
      if (response.ok) {
        setInitResult({ 
          success: true, 
          message: `成功初始化測試帳號: ${data.results?.length || 0}個帳號` 
        });
      } else {
        setInitResult({ 
          success: false, 
          message: data.error || "初始化測試帳號失敗" 
        });
      }
    } catch (error) {
      console.error("初始化測試帳號錯誤:", error);
      setInitResult({ 
        success: false, 
        message: "初始化過程中發生錯誤" 
      });
    } finally {
      setIsInitializing(false);
    }
  }

  async function initializeMasseurs() {
    try {
      setIsInitializing(true);
      setInitMasseursResult(null);
      
      console.log("正在初始化按摩師資料...");
      const response = await fetch("/api/admin/init-masseurs");
      const data = await response.json();
      
      console.log("初始化按摩師資料結果:", data);
      if (response.ok) {
        setInitMasseursResult({ 
          success: true, 
          message: `成功初始化按摩師資料: ${data.results?.length || 0}個按摩師` 
        });
      } else {
        setInitMasseursResult({ 
          success: false, 
          message: data.error || "初始化按摩師資料失敗" 
        });
      }
    } catch (error) {
      console.error("初始化按摩師資料錯誤:", error);
      setInitMasseursResult({ 
        success: false, 
        message: "初始化過程中發生錯誤" 
      });
    } finally {
      setIsInitializing(false);
    }
  }

  return (
    <div className="container max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">系統初始化</h1>
      
      <div className="space-y-8">
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-3">初始化測試帳號</h2>
          <p className="text-gray-600 text-sm mb-4">
            創建系統預設的測試帳號，包括管理員、按摩師和一般用戶。
          </p>
          <Button 
            onClick={initializeTestAccounts} 
            disabled={isInitializing}
            className="w-full"
          >
            {isInitializing ? "初始化中..." : "初始化測試帳號"}
          </Button>
          
          {initResult && (
            <div className={`mt-3 p-3 rounded text-sm ${
              initResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {initResult.message}
            </div>
          )}
        </div>
        
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-3">初始化按摩師資料</h2>
          <p className="text-gray-600 text-sm mb-4">
            創建系統預設的示範按摩師資料。
          </p>
          <Button 
            onClick={initializeMasseurs} 
            disabled={isInitializing}
            className="w-full"
          >
            {isInitializing ? "初始化中..." : "初始化按摩師資料"}
          </Button>
          
          {initMasseursResult && (
            <div className={`mt-3 p-3 rounded text-sm ${
              initMasseursResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {initMasseursResult.message}
            </div>
          )}
        </div>
        
        <div className="text-center">
          <Link href="/login" className="text-blue-500 hover:underline">
            返回登入頁面
          </Link>
        </div>
      </div>
    </div>
  );
} 