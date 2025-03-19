"use client";

import { useEffect, useState } from "react";
import { ServiceForm } from "@/app/(dashboard)/manage-services/components/service-form";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/auth-utils";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { GenderPrice, AreaPrice, AddonOption } from "@/types/service";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  type: "SINGLE" | "COMBO";
  category: "MASSAGE" | "CARE" | "TREATMENT";
  isRecommended: boolean;
  isRecommend: boolean; // 後端欄位名稱
  recommendOrder: number;
  sortOrder: number; // 添加排序順序字段
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
    bodyPart: string | null;
    customDuration: number | null;
    customPrice: number | null;
  }>;
  packageItems: Array<{
    id: string;
    duration: number;
    customDuration: number | null;
    customPrice: number | null;
    service: {
      id: string;
      name: string;
      description: string | null;
    };
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
  sortOrder?: number; // 添加排序字段
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
  masseursIds?: string[];
  customOptions?: Array<{
    id?: string;
    bodyPart?: string;
    customDuration?: number;
    customPrice?: number;
  }>;
  packageItems?: Array<{
    id?: string;
    duration: number;
    customDuration?: number;
    customPrice?: number;
    service: {
      id: string;
      name: string;
      description?: string;
    };
  }>;
  active?: boolean;
  genderPrices?: GenderPrice[];
  areaPrices?: AreaPrice[];
  addons?: AddonOption[];
}

interface ServiceFormData {
  id?: string;
  name: string;
  description?: string;
  type: "SINGLE" | "COMBO";
  category: "MASSAGE" | "CARE" | "TREATMENT";
  isRecommend?: boolean;
  recommendOrder?: number;
  isLimitedTime?: boolean;
  limitedStartDate?: string | null;
  limitedEndDate?: string | null;
  limitedSpecialPrice?: number | null;
  limitedDiscountPercent?: number | null;
  limitedNote?: string | null;
  isFlashSale?: boolean;
  flashSaleNote?: string | null;
  durations: Array<{
    id?: string;
    duration: number;
    price: number;
  }>;
  masseurs: Array<{
    id: string;
    name?: string;
  }>;
  customOptions: Array<{
    id?: string;
    bodyPart?: string;
    customDuration?: number;
    customPrice?: number;
  }>;
  packageItems?: Array<{
    id?: string;
    duration: number;
    customDuration?: number;
    customPrice?: number;
    service: {
      id: string;
      name: string;
      description?: string;
    };
  }>;
  active?: boolean;
  genderPrices?: GenderPrice[];
  areaPrices?: AreaPrice[];
  addons?: AddonOption[];
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

// 可排序的服務卡片組件
function SortableServiceCard({ 
  service, 
  userIsAdmin, 
  onDelete,
  onEdit 
}: { 
  service: Service, 
  userIsAdmin: boolean,
  onDelete: (id: string) => void,
  onEdit: (service: Service) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-lg shadow relative group ${isDragging ? 'ring-2 ring-primary shadow-lg' : ''}`}
    >
      {userIsAdmin && (
        <div 
          className="absolute top-2 left-2 cursor-grab opacity-30 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-6 w-6 text-gray-500" />
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2 pl-8">
        <h3 className="font-semibold text-lg">{service.name}</h3>
        <Badge className={categoryColors[service.category]}>
          {categoryLabels[service.category]}
        </Badge>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 pl-8">
        {service.description || "無描述"}
      </p>

      {/* 時長和價格 */}
      <div className="space-y-2 mb-3 pl-8">
        {service.durations.map((duration) => (
          <div key={duration.id} className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>{duration.duration} 分鐘 - NT${duration.price}</span>
          </div>
        ))}
      </div>

      {/* 套餐項目 */}
      {service.type === "COMBO" && service.packageItems && service.packageItems.length > 0 && (
        <div className="mt-3 pl-8">
          <h4 className="text-sm font-medium text-gray-700 mb-2">套餐包含：</h4>
          <div className="space-y-2">
            {service.packageItems.map((item) => (
              <div key={item.id} className="flex items-center text-sm">
                <span className="text-gray-600">
                  {item.service.name} ({item.duration}分鐘)
                  {item.customDuration && ` - 自訂時長: ${item.customDuration}分鐘`}
                  {item.customPrice && ` - 自訂價格: NT$${item.customPrice}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 推薦、限時和快閃標籤 */}
      <div className="flex flex-wrap gap-1 mt-3 pl-8">
        {service.isRecommend && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            推薦
          </span>
        )}
        {service.isLimitedTime && (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
            期間限定
          </span>
        )}
        {service.isFlashSale && (
          <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800">
            <Zap className="w-3 h-3 mr-1" />
            快閃方案
          </span>
        )}
      </div>

      {userIsAdmin && (
        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
          <Button variant="ghost" size="sm" onClick={() => onEdit(service)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(service.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

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
  const [loading, setLoading] = useState(true);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchServices();
    fetchMasseurs();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
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
          sortOrder: service.sortOrder || 999, // 使用API返回的sortOrder或默認值
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
            ? service.masseurs.map((m: any) => ({
                id: m.id || "",
                name: m.name || "",
                imageUrl: m.imageUrl || m.image || "",
                description: m.description || ""
              }))
            : [],
          // 處理自定義選項
          customOptions: Array.isArray(service.customOptions)
            ? service.customOptions.map((option: any) => ({
                id: option.id || "",
                bodyPart: option.bodyPart || "",
                customDuration: option.customDuration || undefined,
                customPrice: option.customPrice || undefined
              }))
            : [],
          // 處理套餐項目
          packageItems: Array.isArray(service.packageItems)
            ? service.packageItems.map((item: any) => ({
                id: item.id || "",
                duration: item.duration || 0,
                customDuration: item.customDuration || undefined,
                customPrice: item.customPrice || undefined,
                service: {
                  id: item.service?.id || "",
                  name: item.service?.name || "",
                  description: item.service?.description || ""
                }
              }))
            : []
        };
      });
      
      setServices(formattedServices);
    } catch (error) {
      console.error("服務列表獲取失敗:", error);
      toast({
        title: "錯誤",
        description: "獲取服務列表失敗",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  // 處理排序: 先按sortOrder排序，再按推薦 > 快閃 > 期間限定 > 正常
  const sortedServices = [...filteredServices].sort((a, b) => {
    // 首先按sortOrder排序
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    
    // 再按推薦排序
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

  // 添加 onCancel 處理函數
  const handleCancel = () => {
    setIsEditing(false);
    setSelectedService(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // 先獲取移動前後的索引
      const oldIndex = services.findIndex((item) => item.id === active.id);
      const newIndex = services.findIndex((item) => item.id === over.id);
      
      // 創建新的排序後的服務列表
      const newSortedItems = arrayMove(services, oldIndex, newIndex);
      
      // 更新狀態
      setServices(newSortedItems);
      
      toast({
        title: "正在更新排序",
        description: "正在保存新的服務排序...",
        duration: 2000
      });
      
      // 立即保存新順序
      await saveNewOrder(newSortedItems);
    }
  };
  
  const saveNewOrder = async (items = services) => {
    try {
      setIsSavingOrder(true);
      
      // 將服務ID與順序索引映射為一個數組
      const orderData = items.map((service, index) => ({
        id: service.id,
        sortOrder: index
      }));
      
      const response = await fetch('/api/services/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ services: orderData })
      });
      
      if (!response.ok) {
        throw new Error('保存服務順序失敗');
      }
      
      toast({
        title: "成功",
        description: "服務順序已更新",
        duration: 3000
      });
    } catch (error) {
      console.error('保存服務順序時發生錯誤:', error);
      toast({
        title: "錯誤",
        description: "保存服務順序失敗",
        variant: "destructive"
      });
    } finally {
      setIsSavingOrder(false);
    }
  };

  if (isEditing) {
    // 轉換服務數據格式以適應表單組件的需求
    const serviceData = selectedService
      ? {
          ...selectedService,
          isRecommended: selectedService.isRecommend, // 使用正確的屬性名
          masseurs: selectedService.masseurs.map((m) => ({
            id: m.id || "",
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
          service={serviceData as ServiceFormData}
          masseurs={masseurs}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">服務管理</h1>
        {userIsAdmin && (
          <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> 新增服務
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

      {isEditing ? (
        <ServiceForm
          service={selectedService as ServiceFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          masseurs={masseurs}
        />
      ) : (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="ml-2 text-lg">載入中...</span>
            </div>
          ) : getFilteredServices().length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-4">目前沒有符合條件的服務</p>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sortedServices.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 gap-4">
                  {sortedServices.map((service) => (
                    <SortableServiceCard
                      key={service.id}
                      service={service}
                      userIsAdmin={userIsAdmin}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </SortableContext>
              {isSavingOrder && (
                <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    <span className="text-gray-700 font-medium">正在保存排序...</span>
                  </div>
                </div>
              )}
            </DndContext>
          )}
        </>
      )}
    </div>
  );
} 