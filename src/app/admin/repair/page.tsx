"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RepairPage() {
  const router = useRouter();
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function repairAccounts() {
    try {
      setIsRepairing(true);
      setError(null);
      setRepairResult(null);
      
      console.log("開始修復帳戶...");
      const response = await fetch("/api/admin/repair-accounts");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "修復帳戶時發生錯誤");
      }
      
      const data = await response.json();
      console.log("修復結果:", data);
      
      setRepairResult(data);
      toast({ 
        title: "帳戶修復完成", 
        description: `找到 ${data.diagnostics.found} 個帳戶，更新了 ${data.diagnostics.updated} 個帳戶`,
        variant: "default" 
      });
    } catch (error: any) {
      console.error("帳戶修復錯誤:", error);
      setError(error.message || "修復過程中發生未知錯誤");
      toast({ 
        title: "修復失敗", 
        description: error.message || "修復過程中發生未知錯誤",
        variant: "destructive" 
      });
    } finally {
      setIsRepairing(false);
    }
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-4 mb-6">
        <h1 className="text-3xl font-bold">系統修復工具</h1>
        <p className="text-gray-500">
          此頁面提供管理員工具來修復系統中的已知問題，包括帳戶密碼雜湊不一致和按摩師關聯問題。
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>帳戶修復工具</CardTitle>
            <CardDescription>
              修復預設帳戶的密碼雜湊問題，並創建缺少的按摩師資料
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">此工具將完成以下操作：</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>修復所有預設帳戶的密碼雜湊，確保使用一致的雜湊方法</li>
                    <li>為具有按摩師角色的用戶創建缺少的按摩師資料記錄</li>
                    <li>修復按摩師角色卡顯示問題</li>
                  </ul>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>錯誤</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {repairResult && (
                  <div className="border rounded-md p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">修復完成</h3>
                    </div>
                    
                    <div className="text-sm space-y-2">
                      <p><span className="font-medium">找到:</span> {repairResult.diagnostics.found} 個帳戶</p>
                      <p><span className="font-medium">更新:</span> {repairResult.diagnostics.updated} 個帳戶</p>
                      <p><span className="font-medium">創建按摩師資料:</span> {repairResult.diagnostics.masseurCreated} 個</p>
                    </div>
                    
                    {repairResult.details.length > 0 && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <h4 className="font-medium mb-2 text-sm">詳情:</h4>
                          <ul className="text-xs text-gray-500 space-y-1">
                            {repairResult.details.map((detail: string, index: number) => (
                              <li key={index}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    {repairResult.diagnostics.errors.length > 0 && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <h4 className="font-medium mb-2 text-sm text-red-600">錯誤:</h4>
                          <ul className="text-xs text-red-500 space-y-1">
                            {repairResult.diagnostics.errors.map((err: string, index: number) => (
                              <li key={index}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
            >
              返回管理
            </Button>
            <Button
              onClick={repairAccounts}
              disabled={isRepairing}
            >
              {isRepairing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  修復中...
                </>
              ) : (
                "開始修復"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          返回儀表板
        </Link>
      </div>
    </div>
  );
} 