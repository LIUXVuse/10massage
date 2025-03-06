"use client";

import { useEffect, useState } from "react";
import { ServiceForm } from "@/app/(dashboard)/services/components/service-form";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/auth-utils";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface Service {
  id: string;
  name: string;
  description: string;
  type: "SINGLE" | "COMBO";
  category: "MASSAGE" | "CARE" | "TREATMENT";
  isRecommended: boolean;
  isRecommend: boolean; // 後端欄位名稱
  recommendOrder: number;
  // 期間限定相關字段
  isLimitedTime: boolean;
  limitedStartDate: string | null;
  limitedEndDate: string | null;
  limitedSpecialPrice: number | null;
  limitedDiscountPercent: number | null;
  limitedNote: string | null;
  // 快閃方案相關字段
  isFlashSale: boolean;
  flashSaleNote: string | null;
  // 關聯字段
  durations: Array<{
    id: string;
    duration: number;
    price: number;
  }>;
  masseurs: Array<{
    id?: string;
    name?: string;
    masseur?: {
      id: string;
      name: string;
    };
  }>;
  customOptions: Array<{
    id: string;
    bodyPart: string;
    customDuration: number;
    customPrice: number;
  }>;
}

interface Masseur {
  id: string;
  name: string;
}

interface ServiceData {
  id?: string;
  name: string;
  description?: string;
  type: "SINGLE" | "COMBO";
  category: "MASSAGE" | "CARE" | "TREATMENT";
  isRecommend?: boolean;
  recommendOrder?: number;
  // 期間限定相關字段
  isLimitedTime?: boolean;
  limitedStartDate?: string | null;
  limitedEndDate?: string | null;
  limitedSpecialPrice?: number | null;
  limitedDiscountPercent?: number | null;
  limitedNote?: string | null;
  // 快閃方案相關字段
  isFlashSale?: boolean;
  flashSaleNote?: string | null;
  // 關聯字段
  durations?: Array<{
    id?: string;
    duration: number;
    price: number;
  }>;
  masseurs?: Array<{
    id?: string;
    name?: string;
    masseur?: {
      id: string;
      name: string;
    };
  }>;
  customOptions?: Array<{
    id?: string;
    bodyPart?: string;
    customDuration?: number;
    customPrice?: number;
  }>;
}

const categoryLabels = {
  MASSAGE: "按摩",
  CARE: "護理",
  TREATMENT: "療程",
};

const categoryColors = {
  MASSAGE: "bg-blue-100 text-blue-800",
  CARE: "bg-green-100 text-green-800",
  TREATMENT: "bg-purple-100 text-purple-800",
};

export default function ServicesPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })

  // 使用統一的權限檢查函數
  console.log("SESSION DATA:", session);
  const userIsAdmin = isAdmin(session);
  console.log("IS ADMIN:", userIsAdmin, "ROLE:", session?.user?.role);

  const [services, setServices] = useState<Service[]>([]);
  const [masseurs, setMasseurs] = useState<Masseur[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    fetchServices();
    fetchMasseurs();
  }, []);

  const fetchServices = async () => {
    try {
      console.log("開始獲取服務列表...");
      const response = await fetch("/api/services");
      
      if (!response.ok) {
        console.error("服務列表獲取失敗:", response.status, response.statusText);
        throw new Error("Failed to fetch services");
      }
      
      const data = await response.json();
      console.log("獲取到的服務數據:", data.length, "條記錄");
      
      // 檢查和轉換數據格式
      const formattedServices = data.map((service: ServiceData) => {
        // 確保所有必要屬性存在
        return {
          id: service.id || "",
          name: service.name || "",
          description: service.description || "",
          type: service.type || "SINGLE",
          category: service.category || "MASSAGE",
          isRecommended: !!service.isRecommend,
          isRecommend: !!service.isRecommend,
          recommendOrder: service.recommendOrder || 0,
          // 期間限定相關字段
          isLimitedTime: !!service.isLimitedTime,
          limitedStartDate: service.limitedStartDate,
          limitedEndDate: service.limitedEndDate,
          limitedSpecialPrice: service.limitedSpecialPrice,
          limitedDiscountPercent: service.limitedDiscountPercent,
          limitedNote: service.limitedNote,
          // 快閃方案相關字段
          isFlashSale: !!service.isFlashSale,
          flashSaleNote: service.flashSaleNote,
          // 確保durations是數組
          durations: Array.isArray(service.durations) 
            ? service.durations.map((d: { id?: string; duration: number; price: number }) => ({
                id: d.id || "",
                duration: d.duration || 0,
                price: d.price || 0
              }))
            : [],
          // 確保masseurs是數組並轉換格式
          masseurs: Array.isArray(service.masseurs) 
            ? service.masseurs.map((m: { id?: string; name?: string; masseur?: { id: string; name: string } }) => ({
                masseur: {
                  id: m.masseur?.id || m.id || "",
                  name: m.masseur?.name || m.name || ""
                }
              }))
            : [],
          // 處理自定義選項
          customOptions: Array.isArray(service.customOptions)
            ? service.customOptions.map((option: { id?: string; bodyPart?: string; customDuration?: number; customPrice?: number }) => ({
                id: option.id || "",
                bodyPart: option.bodyPart || "",
                customDuration: option.customDuration || 0,
                customPrice: option.customPrice || 0
              }))
            : []
        };
      });
      
      setServices(formattedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchMasseurs = async () => {
    try {
      const response = await fetch("/api/masseurs");
      
      if (!response.ok) {
        throw new Error("Failed to fetch masseurs");
      }
      
      const data = await response.json();
      setMasseurs(data);
    } catch (error) {
      console.error("Error fetching masseurs:", error);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      // 處理自定義選項數據
      const formattedData = {
        ...data,
        customOptions: data.customOptions?.map((option: any) => ({
          id: option.id || undefined,
          bodyPart: option.bodyPart || null,
          customDuration: option.customDuration || null,
          customPrice: option.customPrice || null
        })) || []
      };

      const method = formattedData.id ? "PUT" : "POST";
      const apiUrl = "/api/services" + (formattedData.id ? `?id=${formattedData.id}` : "");
      
      // 提交表單數據到API
      const response = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save service");
      }
      
      setIsEditing(false);
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("確定要刪除此服務嗎？此操作不可恢復。")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/services?id=${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete service");
      }
      
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsEditing(true);
  };

  const getFilteredServices = () => {
    if (selectedCategory === "ALL") {
      return services;
    } else if (selectedCategory === "RECOMMENDED") {
      return services.filter(service => service.isRecommend);
    } else if (selectedCategory === "LIMITED_TIME") {
      return services.filter(service => service.isLimitedTime);
    } else if (selectedCategory === "FLASH_SALE") {
      return services.filter(service => service.isFlashSale);
    } else {
      return services.filter(service => service.category === selectedCategory);
    }
  }

  // 獲取已過濾的服務
  const filteredServices = getFilteredServices();

  // 處理排序: 推薦 > 快閃 > 期間限定 > 正常
  const sortedServices = [...filteredServices].sort((a, b) => {
    // 先按推薦排序
    if (a.isRecommend && !b.isRecommend) return -1;
    if (!a.isRecommend && b.isRecommend) return 1;
    if (a.isRecommend && b.isRecommend) {
      return a.recommendOrder - b.recommendOrder;
    }
    
    // 其次按快閃方案排序
    if (a.isFlashSale && !b.isFlashSale) return -1;
    if (!a.isFlashSale && b.isFlashSale) return 1;
    
    // 再按期間限定排序
    if (a.isLimitedTime && !b.isLimitedTime) return -1;
    if (!a.isLimitedTime && b.isLimitedTime) return 1;
    
    // 最後按創建時間或名稱排序
    return a.name.localeCompare(b.name);
  });

  if (isEditing) {
    // 轉換服務數據格式以適應表單組件的需求
    const serviceData = selectedService
      ? {
          ...selectedService,
          isRecommended: selectedService.isRecommend, // 使用正確的屬性名
          masseurs: selectedService.masseurs.map((m) => ({
            id: m.masseur?.id || m.id || "",
          })),
        }
      : undefined;

    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {selectedService ? "編輯服務" : "新增服務"}
          </h1>
          <Button variant="outline" onClick={() => {
            setIsEditing(false);
            setSelectedService(null);
          }}>
            返回
          </Button>
        </div>
        <ServiceForm
          service={serviceData}
          masseurs={masseurs}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">服務管理</h1>
        {userIsAdmin && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="mr-2 h-4 w-4" /> 新增服務
          </Button>
        )}
      </div>

      <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
        <Button
          variant={selectedCategory === "ALL" ? "default" : "outline"}
          className="whitespace-nowrap"
          onClick={() => setSelectedCategory("ALL")}
        >
          全部
        </Button>
        <Button
          variant={selectedCategory === "RECOMMENDED" ? "default" : "outline"}
          className="whitespace-nowrap"
          onClick={() => setSelectedCategory("RECOMMENDED")}
        >
          推薦服務
        </Button>
        <Button
          variant={selectedCategory === "LIMITED_TIME" ? "default" : "outline"}
          className="whitespace-nowrap"
          onClick={() => setSelectedCategory("LIMITED_TIME")}
        >
          期間限定
        </Button>
        <Button
          variant={selectedCategory === "FLASH_SALE" ? "default" : "outline"}
          className="whitespace-nowrap"
          onClick={() => setSelectedCategory("FLASH_SALE")}
        >
          快閃方案
        </Button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? "default" : "outline"}
            className="whitespace-nowrap"
            onClick={() => setSelectedCategory(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedServices.map((service) => (
          <div
            key={service.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{service.name}</h2>
                <div className="flex space-x-2">
                  {userIsAdmin && (
                    <>
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={categoryColors[service.category]}>
                  {categoryLabels[service.category]}
                </Badge>
                
                {service.isRecommend && (
                  <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50">
                    推薦服務
                  </Badge>
                )}
                
                {service.isLimitedTime && (
                  <Badge variant="outline" className="border-purple-400 text-purple-700 bg-purple-50 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    期間限定
                  </Badge>
                )}
                
                {service.isFlashSale && (
                  <Badge variant="outline" className="border-red-400 text-red-700 bg-red-50 flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    快閃方案
                  </Badge>
                )}
              </div>

              {/* 期間限定日期與價格顯示 */}
              {service.isLimitedTime && service.limitedStartDate && service.limitedEndDate && (
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-gray-600">
                    限定期間: {format(new Date(service.limitedStartDate), 'yyyy/MM/dd', { locale: zhTW })} 至 {format(new Date(service.limitedEndDate), 'yyyy/MM/dd', { locale: zhTW })}
                  </div>
                  
                  {service.limitedSpecialPrice ? (
                    <div className="flex items-center">
                      <span className="text-red-600 font-bold">特價: NT${service.limitedSpecialPrice}</span>
                      {service.durations[0] && (
                        <span className="text-gray-400 line-through ml-2">原價: NT${service.durations[0].price}</span>
                      )}
                    </div>
                  ) : service.limitedDiscountPercent ? (
                    <div className="text-red-600 font-bold">折扣: {service.limitedDiscountPercent}% OFF</div>
                  ) : null}
                  
                  {service.limitedNote && (
                    <div className="text-sm text-gray-600">{service.limitedNote}</div>
                  )}
                </div>
              )}
              
              {/* 快閃方案日期顯示 */}
              {service.isFlashSale && service.limitedStartDate && service.limitedEndDate && (
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-gray-600">
                    快閃期間: {format(new Date(service.limitedStartDate), 'yyyy/MM/dd', { locale: zhTW })} 至 {format(new Date(service.limitedEndDate), 'yyyy/MM/dd', { locale: zhTW })}
                  </div>
                  
                  {service.flashSaleNote && (
                    <div className="text-sm text-gray-600">{service.flashSaleNote}</div>
                  )}
                </div>
              )}

              <p className="text-gray-600 mt-2">{service.description}</p>

              <div className="mt-3">
                <h3 className="font-medium">時長與價格:</h3>
                <div className="mt-1 space-y-1">
                  {service.durations.map((d) => (
                    <div key={d.id} className="text-sm">
                      {d.duration} 分鐘 - NT${d.price}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-medium">按摩師:</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {service.masseurs.map((m) => (
                    <Badge key={m.masseur?.id || m.id} variant="secondary">
                      {m.masseur?.name || m.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedServices.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          尚無服務資料
        </div>
      )}
    </div>
  );
} 