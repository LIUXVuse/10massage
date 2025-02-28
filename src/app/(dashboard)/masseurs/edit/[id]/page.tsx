"use client"

import { useState, useEffect } from "react"
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

export default function EditMasseurPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [masseur, setMasseur] = useState<MasseurData | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const isNewMasseur = params.id === "new"
  const pageTitle = isNewMasseur ? "新增按摩師" : "編輯按摩師資料"
  
  // 加入診斷日誌
  useEffect(() => {
    console.log("Session data:", session);
    console.log("User role:", session?.user?.role);
    console.log("IsAdmin result:", isAdmin(session));
  }, [session]);
  
  // 如果未登入或不是管理員，則重定向到登入頁面
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && !isAdmin(session)) {
      router.push("/dashboard")
      toast({
        title: "權限不足",
        description: "只有管理員能夠編輯按摩師資料",
        variant: "destructive"
      })
    }
  }, [session, status, router])
  
  // 獲取服務列表和按摩師數據（如果不是新增）
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 獲取服務列表
        const servicesResponse = await fetch('/api/services')
        if (!servicesResponse.ok) {
          throw new Error("無法獲取服務列表")
        }
        const servicesData = await servicesResponse.json()
        setServices(servicesData)
        
        // 如果不是新增模式，獲取指定按摩師的數據
        if (!isNewMasseur) {
          const masseurResponse = await fetch(`/api/masseurs/${params.id}`)
          if (!masseurResponse.ok) {
            throw new Error("無法獲取按摩師數據")
          }
          const masseurData = await masseurResponse.json()
          
          // 記錄完整的按摩師數據，確保裁剪參數存在
          console.log('編輯頁面獲取到的按摩師數據:', masseurData);
          
          // 確保裁剪參數被正確設置
          const enhancedData = {
            ...masseurData,
            // 如果數據中沒有這些欄位，使用預設值
            cropX: masseurData.cropX !== undefined ? masseurData.cropX : 0,
            cropY: masseurData.cropY !== undefined ? masseurData.cropY : 0,
            cropWidth: masseurData.cropWidth !== undefined ? masseurData.cropWidth : 300,
            cropHeight: masseurData.cropHeight !== undefined ? masseurData.cropHeight : 225,
            imageScale: masseurData.imageScale !== undefined ? masseurData.imageScale : 1
          };
          
          setMasseur(enhancedData)
        } else {
          // 新增模式不需要獲取按摩師數據
          setLoading(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "獲取數據時發生錯誤")
        toast({
          title: "載入失敗",
          description: err instanceof Error ? err.message : "獲取數據時發生錯誤",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (status === "authenticated" && isAdmin(session)) {
      fetchData()
    }
  }, [params.id, session, status, isNewMasseur])
  
  // 處理表單提交
  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      // 檢查是否為新按摩師還是更新現有按摩師
      const isNewMasseur = false; // 編輯頁面一定是更新現有按摩師
      
      // 根據是新建還是更新來確定HTTP方法和URL
      const method = 'PUT'; // 在編輯頁面固定使用PUT方法
      const apiUrl = '/api/masseurs';
      
      console.log('提交表單數據', {
        isNewMasseur: false,
        method,
        data: {
          ...data,
          id: params.id,
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
        id: params.id,
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
        throw new Error(responseData.error || `更新按摩師失敗 (${response.status})`);
      }

      toast({
        title: '成功',
        description: '按摩師已成功更新',
      });

      // 成功後，強制頁面重載以確保顯示最新數據
      window.location.href = '/masseurs';
    } catch (error: any) {
      console.error('提交表單時發生錯誤:', error);
      toast({
        title: '錯誤',
        description: error.message || '更新按摩師失敗',
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