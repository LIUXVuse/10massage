"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { repairSystem } from "./repair.action";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function RepairPage() {
  const [isRepairing, setIsRepairing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleRepair = async () => {
    if (isRepairing) return;
    
    try {
      setIsRepairing(true);
      setResult(null);
      
      // 調用修復操作
      const repairResult = await repairSystem();
      setResult(repairResult);
    } catch (error) {
      console.error("修復過程中發生錯誤:", error);
      setResult({
        success: false,
        message: `修復失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
      });
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">系統修復工具</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>自動修復系統</CardTitle>
          <CardDescription>
            此工具會執行以下操作:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">1. 重置默認帳號密碼哈希，確保可以使用預設密碼登入</p>
            <p className="text-sm">2. 為所有MASSEUR角色用戶同步創建按摩師資料</p>
            <p className="text-sm">3. 檢查並修復系統資料一致性問題</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleRepair} 
            disabled={isRepairing}
            className="w-full"
          >
            {isRepairing ? "修復中..." : "開始修復"}
          </Button>
        </CardFooter>
      </Card>
      
      {result && (
        <Alert variant={result.success ? "default" : "destructive"} className="my-4">
          {result.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{result.success ? "修復成功" : "修復失敗"}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>使用說明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">默認帳號信息:</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>管理員: admin@eilinspa.com / admin123</li>
                <li>按摩師: masseur@eilinspa.com / masseur123</li>
                <li>用戶: user@eilinspa.com / user123</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">常見問題:</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>如果默認帳號無法登入，可能是密碼哈希不一致，點擊「開始修復」重置密碼</li>
                <li>如果按摩師數據不顯示，可能是按摩師資料未同步，點擊「開始修復」創建對應資料</li>
                <li>如果修復後仍有問題，請刷新頁面並重新登入</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 