"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Plus, Calendar as CalendarIcon } from "lucide-react";

// 導入我們創建的組件
import { DynamicIcon } from "@/components/icons";
import { CategorySelect } from "@/components/services/category-select";

import { ServiceAreaPricing } from "@/components/services/service-area-pricing";
import { ServiceGenderPricing } from "@/components/services/service-gender-pricing";
import { ServiceAddonOptions } from "@/components/services/service-addon-options";
import { ServicePackageComponent } from "@/components/services/service-package";

// 定義服務表單數據類型
export type ServiceFormData = {
  id?: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  duration: number;
  price: number;
  isLimitedTime?: boolean;
  limitedTimeStart?: Date;
  limitedTimeEnd?: Date;
  limitedSpecialPrice?: number;
  limitedDiscountPercent?: number;
  limitedNote?: string;
  isFlashSale?: boolean;
  flashSaleStart?: Date;
  flashSaleEnd?: Date;
  flashSaleNote?: string;
  active?: boolean;
  masseursIds?: string[];
  durations?: {
    id?: string;
    duration: number;
    price: number;
  }[];
  genderPrices?: {
    id?: string;
    gender: string;
    price: number;
    serviceName?: string;
  }[];
  areaPrices?: {
    id?: string;
    area: string;
    price: number;
    gender?: string;
    description?: string;
  }[];
  addons?: {
    id?: string;
    name: string;
    description?: string;
    price: number;
    isRequired: boolean;
  }[];
  packageItems?: {
    id?: string;
    serviceId: string;
    serviceName: string;
    duration: number;
    price: number;
    isRequired: boolean;
    bodyPart: string;
    customDuration: number;
    customPrice: number;
  }[];
  packageOptions?: {
    id?: string;
    name: string;
    description?: string;
    maxSelections: number;
    items: {
      id?: string;
      name: string;
    }[];
  }[];
};

// 定義表單驗證模式
const formSchema = z.object({
  name: z.string().min(1, { message: "服務名稱不能為空" }),
  description: z.string().optional(),
  category: z.string().optional(),
  duration: z.number().min(1, { message: "時長必須大於0" }),
  price: z.number().min(0, { message: "價格不能為負數" }),
  isLimitedTime: z.boolean().optional(),
  limitedTimeStart: z.date().optional(),
  limitedTimeEnd: z.date().optional(),
  limitedSpecialPrice: z.number().optional(),
  limitedDiscountPercent: z.number().optional(),
  limitedNote: z.string().optional(),
  isFlashSale: z.boolean().optional(),
  flashSaleStart: z.date().optional(),
  flashSaleEnd: z.date().optional(),
  flashSaleNote: z.string().optional(),
  active: z.boolean().optional(),
  masseursIds: z.array(z.string()).optional(),
  durations: z.array(
    z.object({
      id: z.string().optional(),
      duration: z.number().min(1, { message: "時長必須大於0" }),
      price: z.number().min(0, { message: "價格不能為負數" }),
    })
  ).optional(),
  genderPrices: z.array(
    z.object({
      id: z.string().optional(),
      gender: z.string(),
      price: z.number().min(0, { message: "價格不能為負數" }),
      serviceName: z.string().optional(),
    })
  ).optional(),
  areaPrices: z.array(
    z.object({
      id: z.string().optional(),
      area: z.string(),
      price: z.number().min(0, { message: "價格不能為負數" }),
      gender: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  addons: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      description: z.string().optional(),
      price: z.number().min(0, { message: "價格不能為負數" }),
      isRequired: z.boolean(),
    })
  ).optional(),
  packageItems: z.array(
    z.object({
      id: z.string().optional(),
      serviceId: z.string(),
      serviceName: z.string(),
      duration: z.number().min(1, { message: "時長必須大於0" }),
      price: z.number().min(0, { message: "價格不能為負數" }),
      isRequired: z.boolean(),
      bodyPart: z.string().optional(),
      customDuration: z.number().optional(),
      customPrice: z.number().optional()
    })
  ).optional(),
  packageOptions: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      description: z.string().optional(),
      maxSelections: z.number().min(1, { message: "選擇數量必須大於0" }),
      items: z.array(
        z.object({
          id: z.string().optional(),
          name: z.string(),
        })
      ),
    })
  ).optional(),
});

// 表單組件接口定義
interface ServiceFormProps {
  service?: ServiceFormData;
  onSubmit: (data: ServiceFormData) => void;
  masseurs?: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  categories?: string[];
  availableServices?: {
    id: string;
    name: string;
  }[];
}

// 服務表單組件
export function ServiceForm({ 
  service, 
  onSubmit, 
  masseurs = [], 
  categories = [],
  availableServices = []
}: ServiceFormProps) {
  // 表單管理
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    control,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: service || {
      name: "",
      description: "",
      category: "",
      duration: 60,
      price: 0,
      isLimitedTime: false,
      isFlashSale: false,
      active: true,
      masseursIds: [],
      durations: [],
      genderPrices: [],
      areaPrices: [],
      addons: [],
      packageItems: [],
      packageOptions: [],
    },
  });

  // 服務類型狀態
  const [serviceType, setServiceType] = useState<string>(
    service?.areaPrices?.length ? "areaPricing" :
    service?.genderPrices?.length ? "genderPricing" : 
    service?.packageItems?.length ? "package" : "standard"
  );

  // 多時長價格管理
  const durations = watch("durations") || [];
  
  // 添加時長
  const addDuration = () => {
    const newDurations = [...durations, { duration: 60, price: 0 }];
    setValue("durations", newDurations);
  };

  // 移除時長
  const removeDuration = (index: number) => {
    const newDurations = [...durations];
    newDurations.splice(index, 1);
    setValue("durations", newDurations);
  };

  // 更新時長
  const updateDuration = (index: number, field: "duration" | "price", value: number) => {
    const newDurations = [...durations];
    newDurations[index][field] = value;
    setValue("durations", newDurations);
  };

  // 限時優惠狀態
  const isLimitedTime = watch("isLimitedTime");
  const limitedTimeStart = watch("limitedTimeStart");
  const limitedTimeEnd = watch("limitedTimeEnd");
  
  // 限時閃購狀態
  const isFlashSale = watch("isFlashSale");
  const flashSaleStart = watch("flashSaleStart");
  const flashSaleEnd = watch("flashSaleEnd");

  // 處理服務類型變更，重置相關欄位
  useEffect(() => {
    console.log("服務類型變更為:", serviceType);
    
    if (serviceType === "standard") {
      setValue("genderPrices", []);
      setValue("areaPrices", []);
      setValue("packageItems", []);
      setValue("packageOptions", []);
    } else if (serviceType === "genderPricing") {
      setValue("areaPrices", []);
      setValue("packageItems", []);
      setValue("packageOptions", []);
      
      // 檢查性別價格是否為空，若為空則初始化
      const currentGenderPrices = watch("genderPrices") || [];
      if (currentGenderPrices.length === 0) {
        setValue("genderPrices", [
          { gender: "MALE", price: 0, serviceName: "" },
          { gender: "FEMALE", price: 0, serviceName: "" }
        ]);
      }
    } else if (serviceType === "areaPricing") {
      setValue("genderPrices", []);
      setValue("packageItems", []);
      setValue("packageOptions", []);
      
      // 檢查區域價格是否為空，若為空則初始化
      const currentAreaPrices = watch("areaPrices") || [];
      if (currentAreaPrices.length === 0) {
        setValue("areaPrices", [{ area: "", price: 0 }]);
      }
    } else if (serviceType === "package") {
      setValue("genderPrices", []);
      setValue("areaPrices", []);
      if (!(watch("packageItems")?.length)) {
        setValue("packageItems", []);
      }
      if (!(watch("packageOptions")?.length)) {
        setValue("packageOptions", []);
      }
    }
  }, [serviceType, setValue, watch]);

  // 表單提交處理
  const onSaveService = (data: ServiceFormData) => {
    console.log("提交服務數據:", data, "服務類型:", serviceType);
    
    // 根據服務類型調整數據
    if (serviceType === "standard") {
      data.genderPrices = [];
      data.areaPrices = [];
      data.packageItems = [];
      data.packageOptions = [];
    } else if (serviceType === "genderPricing") {
      data.areaPrices = [];
      data.packageItems = [];
      data.packageOptions = [];
      
      // 驗證性別定價數據
      if (!data.genderPrices?.length || !data.genderPrices.every(gp => gp.gender && gp.price !== undefined)) {
        alert("性別定價服務至少需要設定一個性別價格，且必須包含性別和價格");
        return;
      }
    } else if (serviceType === "areaPricing") {
      data.genderPrices = [];
      data.packageItems = [];
      data.packageOptions = [];
      
      // 驗證區域定價數據
      if (!data.areaPrices?.length || !data.areaPrices.every(ap => ap.area && ap.price !== undefined)) {
        alert("區域定價服務至少需要設定一個區域價格，且必須包含區域名稱和價格");
        return;
      }
    } else if (serviceType === "package") {
      data.genderPrices = [];
      data.areaPrices = [];
      
      // 驗證套餐數據
      if (!data.packageItems?.length) {
        alert("套餐服務至少需要包含一個服務項目");
        return;
      }
    }

    // 檢查必填字段
    if (!data.name) {
      alert("請填寫服務名稱");
      return;
    }
    
    if (serviceType === "standard" && (!data.duration || data.price === undefined)) {
      alert("標準服務必須提供時長和價格");
      return;
    }

    // 檢查限時優惠邏輯
    if (data.isLimitedTime) {
      if (!data.limitedTimeStart || !data.limitedTimeEnd) {
        // 處理錯誤：限時優惠需要開始和結束時間
        alert("限時優惠需要設定開始和結束時間");
        return;
      }
      if (data.limitedTimeEnd < data.limitedTimeStart) {
        // 處理錯誤：結束時間不能早於開始時間
        alert("限時優惠結束時間不能早於開始時間");
        return;
      }
    } else {
      // 如果不是限時優惠，清除相關字段
      data.limitedTimeStart = undefined;
      data.limitedTimeEnd = undefined;
      data.limitedSpecialPrice = undefined;
      data.limitedDiscountPercent = undefined;
      data.limitedNote = undefined;
    }

    // 檢查閃購邏輯
    if (data.isFlashSale) {
      if (!data.flashSaleStart || !data.flashSaleEnd) {
        // 處理錯誤：閃購需要開始和結束時間
        alert("限時閃購需要設定開始和結束時間");
        return;
      }
      if (data.flashSaleEnd < data.flashSaleStart) {
        // 處理錯誤：結束時間不能早於開始時間
        alert("限時閃購結束時間不能早於開始時間");
        return;
      }
    } else {
      // 如果不是閃購，清除相關字段
      data.flashSaleStart = undefined;
      data.flashSaleEnd = undefined;
      data.flashSaleNote = undefined;
    }

    // 提交數據
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSaveService)} className="space-y-6">
      {/* 基本信息部分 */}
      <Card className="border rounded-lg p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">服務名稱</Label>
              <Input
                id="name"
                {...register("name")}
                className="mb-2"
                placeholder="請輸入服務名稱"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">服務描述</Label>
              <Textarea
                id="description"
                {...register("description")}
                className="mb-2"
                placeholder="請輸入服務描述"
              />
            </div>

            <div>
              <Label htmlFor="category">服務分類</Label>
              <CategorySelect
                categories={categories}
                value={watch("category") || ""}
                onChange={(value) => setValue("category", value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={watch("active") || false}
                onCheckedChange={(checked) => setValue("active", checked)}
              />
              <Label htmlFor="active">啟用此服務</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 服務類型選擇 */}
      <Card className="border rounded-lg p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold">服務類型</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={serviceType === "standard" ? "default" : "outline"}
                onClick={() => setServiceType("standard")}
                className="w-full justify-start"
              >
                <span className="mr-2">標準服務</span>
                <span className="text-xs opacity-70">(固定價格)</span>
              </Button>
              
              <Button
                type="button"
                variant={serviceType === "genderPricing" ? "default" : "outline"}
                onClick={() => setServiceType("genderPricing")}
                className="w-full justify-start"
              >
                <span className="mr-2">性別定價</span>
                <span className="text-xs opacity-70">(男女不同價)</span>
              </Button>
              
              <Button
                type="button"
                variant={serviceType === "areaPricing" ? "default" : "outline"}
                onClick={() => setServiceType("areaPricing")}
                className="w-full justify-start"
              >
                <span className="mr-2">區域定價</span>
                <span className="text-xs opacity-70">(除毛/各部位不同價)</span>
              </Button>
              
              <Button
                type="button"
                variant={serviceType === "package" ? "default" : "outline"}
                onClick={() => setServiceType("package")}
                className="w-full justify-start"
              >
                <span className="mr-2">服務套餐</span>
                <span className="text-xs opacity-70">(多項服務組合)</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 價格部分 - 根據服務類型顯示不同的價格編輯器 */}
      {serviceType === "standard" && (
        <Card className="border rounded-lg p-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">服務時長與價格</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-6">
              {/* 基本時長與價格 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">時長 (分鐘)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    {...register("duration", { valueAsNumber: true })}
                    className="mb-2"
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-500">{errors.duration.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="price">價格 (NT$)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    {...register("price", { valueAsNumber: true })}
                    className="mb-2"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>
              </div>

              {/* 多時長選項 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>多時長選項 (選填)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDuration}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加時長
                  </Button>
                </div>

                {durations.length === 0 && (
                  <p className="text-sm text-gray-500">
                    尚未添加額外時長選項。點擊「添加時長」按鈕添加不同的時長與價格選擇。
                  </p>
                )}

                {durations.map((item, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div>
                        <Input
                          type="number"
                          min="1"
                          value={item.duration}
                          onChange={(e) =>
                            updateDuration(index, "duration", Number(e.target.value))
                          }
                          placeholder="時長(分鐘)"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) =>
                            updateDuration(index, "price", Number(e.target.value))
                          }
                          placeholder="價格(NT$)"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDuration(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {serviceType === "genderPricing" && (
        <Card className="border rounded-lg p-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">性別定價</CardTitle>
            <p className="text-sm text-gray-500">設定不同性別的價格</p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ServiceGenderPricing 
              genderPrices={watch("genderPrices") || [
                { gender: "MALE", price: 0, serviceName: "" },
                { gender: "FEMALE", price: 0, serviceName: "" }
              ]}
              onChange={(genderPrices) => setValue("genderPrices", genderPrices)}
            />
          </CardContent>
        </Card>
      )}
      
      {serviceType === "areaPricing" && (
        <Card className="border rounded-lg p-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">區域定價</CardTitle>
            <p className="text-sm text-gray-500">針對不同部位設定不同價格（適用於除毛等服務）</p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ServiceAreaPricing 
              areaPrices={watch("areaPrices") || []}
              onChange={(prices) => {
                console.log("更新區域價格:", prices);
                setValue("areaPrices", prices);
              }}
            />
          </CardContent>
        </Card>
      )}
      
      {serviceType === "package" && (
        <Card className="border rounded-lg p-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">套餐設定</CardTitle>
            <p className="text-sm text-gray-500">創建包含多個服務項目的套餐</p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ServicePackageComponent 
              servicePackage={{
                name: watch("name") || "",
                description: watch("description") || "",
                price: Number(watch("price")) || 0,
                duration: Number(watch("duration")) || 0,
                items: watch("packageItems") || [],
                options: watch("packageOptions") || []
              }}
              availableServices={availableServices}
              onChange={(packageData) => {
                setValue("name", packageData.name);
                setValue("description", packageData.description || "");
                setValue("price", packageData.price);
                setValue("duration", packageData.duration);
                setValue("packageItems", packageData.items);
                setValue("packageOptions", packageData.options);
              }}
            />
          </CardContent>
        </Card>
      )}
      
      {/* 附加項目 - 針對標準服務和性別定價服務 */}
      {(serviceType === "standard" || serviceType === "genderPricing") && (
        <Card className="border rounded-lg p-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">附加選項</CardTitle>
            <p className="text-sm text-gray-500">添加可選的服務附加項目</p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ServiceAddonOptions 
              addonOptions={(watch("addons") || []).map(addon => ({
                ...addon,
                description: addon.description || null
              }))}
              onChange={(options) => {
                setValue("addons", options);
              }}
            />
          </CardContent>
        </Card>
      )}
      
      {/* 限時優惠設定 */}
      <Card className="border rounded-lg p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold">限時優惠設定</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isLimitedTime"
                checked={isLimitedTime || false}
                onCheckedChange={(checked) => setValue("isLimitedTime", checked)}
              />
              <Label htmlFor="isLimitedTime">啟用限時優惠</Label>
            </div>

            {isLimitedTime && (
              <div className="space-y-4 border-l-2 border-blue-300 pl-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>開始時間</Label>
                    <div className="mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !limitedTimeStart && "text-muted-foreground"
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {limitedTimeStart ? (
                              format(limitedTimeStart, "yyyy-MM-dd")
                            ) : (
                              <span>選擇日期</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={limitedTimeStart}
                            onSelect={(date) => setValue("limitedTimeStart", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label>結束時間</Label>
                    <div className="mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !limitedTimeEnd && "text-muted-foreground"
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {limitedTimeEnd ? (
                              format(limitedTimeEnd, "yyyy-MM-dd")
                            ) : (
                              <span>選擇日期</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={limitedTimeEnd}
                            onSelect={(date) => setValue("limitedTimeEnd", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="limitedSpecialPrice">特價(NT$)</Label>
                    <Input
                      id="limitedSpecialPrice"
                      type="number"
                      min="0"
                      {...register("limitedSpecialPrice", { valueAsNumber: true })}
                      className="mb-2"
                      placeholder="輸入優惠特價"
                    />
                  </div>

                  <div>
                    <Label htmlFor="limitedDiscountPercent">折扣百分比(%)</Label>
                    <Input
                      id="limitedDiscountPercent"
                      type="number"
                      min="0"
                      max="100"
                      {...register("limitedDiscountPercent", { valueAsNumber: true })}
                      className="mb-2"
                      placeholder="例如：80代表八折"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="limitedNote">優惠說明</Label>
                  <Textarea
                    id="limitedNote"
                    {...register("limitedNote")}
                    className="mb-2"
                    placeholder="例如：季節限定優惠"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 限時閃購設定 */}
      <Card className="border rounded-lg p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold">限時閃購設定</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isFlashSale"
                checked={isFlashSale || false}
                onCheckedChange={(checked) => setValue("isFlashSale", checked)}
              />
              <Label htmlFor="isFlashSale">啟用限時閃購</Label>
            </div>

            {isFlashSale && (
              <div className="space-y-4 border-l-2 border-red-300 pl-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>開始時間</Label>
                    <div className="mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !flashSaleStart && "text-muted-foreground"
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {flashSaleStart ? (
                              format(flashSaleStart, "yyyy-MM-dd")
                            ) : (
                              <span>選擇日期</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={flashSaleStart}
                            onSelect={(date) => setValue("flashSaleStart", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label>結束時間</Label>
                    <div className="mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !flashSaleEnd && "text-muted-foreground"
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {flashSaleEnd ? (
                              format(flashSaleEnd, "yyyy-MM-dd")
                            ) : (
                              <span>選擇日期</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={flashSaleEnd}
                            onSelect={(date) => setValue("flashSaleEnd", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="flashSaleNote">閃購說明</Label>
                  <Textarea
                    id="flashSaleNote"
                    {...register("flashSaleNote")}
                    className="mb-2"
                    placeholder="例如：限量5名，先搶先得"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 按摩師選擇 */}
      <Card className="border rounded-lg p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold">可提供服務的按摩師</CardTitle>
          <p className="text-sm text-gray-500">選擇哪些按摩師可以提供此服務</p>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            {masseurs.length === 0 ? (
              <p className="text-sm text-gray-500">尚未添加按摩師資料</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {masseurs.map((masseur) => {
                  // 獲取當前選中的按摩師列表
                  const currentMasseurs = watch("masseursIds") || [];
                  const isChecked = currentMasseurs.includes(masseur.id);
                  
                  return (
                    <div
                      key={masseur.id}
                      className={`flex items-center space-x-2 border rounded-lg p-2 hover:bg-gray-50 transition-colors ${isChecked ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <input
                        type="checkbox"
                        id={`masseur-${masseur.id}`}
                        value={masseur.id}
                        className="h-4 w-4"
                        checked={isChecked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          
                          if (checked) {
                            const newMasseursIds = [...currentMasseurs, masseur.id];
                            setValue("masseursIds", newMasseursIds);
                          } else {
                            const newMasseursIds = currentMasseurs.filter((id) => id !== masseur.id);
                            setValue("masseursIds", newMasseursIds);
                          }
                        }}
                      />
                      <Label htmlFor={`masseur-${masseur.id}`} className="flex items-center cursor-pointer">
                        {masseur.avatar && (
                          <img
                            src={masseur.avatar}
                            alt={masseur.name}
                            className="w-8 h-8 rounded-full mr-2 object-cover"
                          />
                        )}
                        <span>{masseur.name}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="submit">保存服務</Button>
      </div>
    </form>
  );
} 