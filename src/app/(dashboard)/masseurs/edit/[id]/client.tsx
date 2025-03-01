"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MasseurForm } from "@/components/masseurs/masseur-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { isAdmin } from "@/lib/auth/auth-utils"

interface Service {
  id: string
  name: string
}

interface MasseurData {
  id: string
  name: string
  description: string
  imageUrl?: string
  imageScale?: number
  cropX?: number
  cropY?: number
  cropWidth?: number
  cropHeight?: number
  services?: Service[]
}

export function MasseurEditClient({ id }: { id: string }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [masseur, setMasseur] = useState<MasseurData | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const isNewMasseur = id === "new"
  const pageTitle = isNewMasseur ? "新增按摩師" : "編輯按摩師資料"
  
  // 定義fetchData函數 - 使用useCallback避免依賴循環
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 獲取服務列表
      const servicesResponse = await fetch('/api/services');
      if (!servicesResponse.ok) {
        throw new Error('無法獲取服務列表');
      }
      const servicesData = await servicesResponse.json();
      setServices(servicesData);
      
      // 如果不是新增按摩師，則獲取按摩師資料
      if (!isNewMasseur) {
        console.log(`獲取按摩師資料: ${id}`);
        const masseurResponse = await fetch(`/api/masseurs/${id}`);
        if (!masseurResponse.ok) {
          throw new Error('無法獲取按摩師資料');
        }
        const masseurData = await masseurResponse.json();
        console.log('獲取到的按摩師資料:', masseurData);
        setMasseur(masseurData);
      }
    } catch (err) {
      console.error('獲取資料時出錯:', err);
      setError(err instanceof Error ? err.message : '獲取資料時出錯');
      toast({
        title: "載入失敗",
        description: err instanceof Error ? err.message : '獲取資料時出錯',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [id, isNewMasseur]);
  
  // 加入診斷日誌
  useEffect(() => {
    console.log("Session data:", session);
    console.log("User role:", session?.user?.role);
    console.log("IsAdmin result:", isAdmin(session));
  }, [session]);
  
  // 權限驗證 - 修復權限檢查邏輯
  useEffect(() => {
    // 只在客戶端和session載入完成後執行
    if (status === "loading") return;
    
    const userIsAdmin = isAdmin(session);
    console.log("權限檢查結果:", { status, userIsAdmin });
    
    if (status !== "authenticated" || !userIsAdmin) {
      toast({
        title: "權限不足",
        description: "只有管理員才能管理按摩師資料",
        variant: "destructive"
      });
      router.push("/dashboard");
    } else {
      // 管理員已驗證，可以開始載入資料
      fetchData();
    }
  }, [status, session, router, fetchData]);
  
  // 處理表單提交
  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      // 檢查是否為新按摩師還是更新現有按摩師
      const isNewMasseur = id === "new"; 
      
      // 根據是新建還是更新來確定HTTP方法和URL
      const method = isNewMasseur ? 'POST' : 'PUT';
      const apiUrl = '/api/masseurs';
      
      console.log('提交表單數據', {
        isNewMasseur,
        method,
        data: {
          ...data,
          id: isNewMasseur ? undefined : id,
          imageScale: data.imageScale,
          cropX: data.cropX,
          cropY: data.cropY,
          cropWidth: data.cropWidth,
          cropHeight: data.cropHeight
        }
      });

      // 構建提交數據
      const submitData = {
        ...data,
        id: isNewMasseur ? undefined : id,
      };

      // 確保裁剪參數傳遞正確
      if (data.imageScale !== undefined) submitData.imageScale = Number(data.imageScale);
      if (data.cropX !== undefined) submitData.cropX = Number(data.cropX);
      if (data.cropY !== undefined) submitData.cropY = Number(data.cropY);
      if (data.cropWidth !== undefined) submitData.cropWidth = Number(data.cropWidth);
      if (data.cropHeight !== undefined) submitData.cropHeight = Number(data.cropHeight);

      console.log('發送API請求', {
        method,
        url: apiUrl,
        data: submitData
      });

      // 發送API請求
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
      
      const responseData = await response.json();
      console.log('API回應', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || `${isNewMasseur ? '新增' : '更新'}按摩師失敗 (${response.status})`);
      }

      toast({
        title: '成功',
        description: `按摩師已成功${isNewMasseur ? '新增' : '更新'}`,
      });

      // 成功後，強制頁面重載以確保顯示最新數據
      window.location.href = '/masseurs';
    } catch (error: any) {
      console.error('提交表單時發生錯誤:', error);
      toast({
        title: '錯誤',
        description: error.message || `${isNewMasseur ? '新增' : '更新'}按摩師失敗`,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (status === "loading" || (loading && !isNewMasseur)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-600">載入中...</p>
      </div>
    )
  }
  
  if (error && !isNewMasseur) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Link href="/masseurs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回按摩師列表
            </Button>
          </Link>
        </div>
        
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <h2 className="text-lg font-medium text-red-800 mb-2">載入失敗</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/masseurs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回按摩師列表
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-4">{pageTitle}</h1>
        </div>
      </div>
      
      {/* 如果是編輯模式，顯示按摩師表單；如果是新增模式，直接顯示空表單 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <MasseurForm 
          initialData={isNewMasseur ? undefined : masseur || undefined}
          services={services}
          onSubmit={onSubmit}
          onCancel={() => router.push("/masseurs")}
        />
        
        {submitting && (
          <div className="flex items-center justify-center mt-4">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>正在{isNewMasseur ? '新增' : '儲存'}...</span>
          </div>
        )}
      </div>
    </div>
  )
} 