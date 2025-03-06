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

import { ServiceAreaPricing } from "@/components/services/service-area-pricing";
import { ServiceGenderPricing } from "@/components/services/service-gender-pricing";
import { ServiceAddonOptions } from "@/components/services/service-addon-options";

import { Gender, GenderPrice, AreaPrice, AddonOption, CustomOption } from "@/types/service";

// 表單數據型別
interface ServiceFormData {
  name: string;
  description?: string;
  type: "SINGLE" | "COMBO";
  category?: string;
  durations: { id?: string; duration: number; price: number }[];
  customOptions: CustomOption[];
  masseursIds?: string[];
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
  genderPrices?: GenderPrice[];
  areaPrices?: AreaPrice[];
  addons?: AddonOption[];
}

// 表單驗證 Schema
const formSchema = z.object({
  name: z.string().min(1, { message: "請輸入服務名稱" }),
  description: z.string().optional(),
  type: z.enum(["SINGLE", "COMBO"]),
  category: z.string().optional(),
  durations: z.array(
    z.object({
      id: z.string().optional(),
      duration: z.number().min(1, { message: "時長必須大於0" }),
      price: z.number().min(0, { message: "價格不能為負數" }),
    })
  ),
  customOptions: z.array(
    z.object({
      id: z.string().optional(),
      bodyPart: z.string().min(1, "請輸入部位名稱").optional(),
      customDuration: z.number().min(1, "時長必須大於0").optional(),
      customPrice: z.number().min(0, "價格不能為負數").optional(),
    }).refine((data) => {
      const hasAnyValue = data.bodyPart || data.customDuration || data.customPrice;
      if (!hasAnyValue) return true;
      
      const hasAllValues = data.bodyPart && data.customDuration && data.customPrice;
      return hasAllValues || "如果填寫任一欄位，則所有欄位都必須填寫";
    })
  ),
  masseursIds: z.array(z.string()).optional(),
  isLimitedTime: z.boolean().optional(),
  limitedTimeStart: z.date().optional(),
  limitedTimeEnd: z.date().optional(),
  limitedSpecialPrice: z.number().min(0).optional(),
  limitedDiscountPercent: z.number().min(0).max(100).optional(),
  limitedNote: z.string().optional(),
  isFlashSale: z.boolean().optional(),
  flashSaleStart: z.date().optional(),
  flashSaleEnd: z.date().optional(),
  flashSaleNote: z.string().optional(),
  active: z.boolean().optional(),
  genderPrices: z.array(z.object({
    id: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE"]),
    price: z.number().min(0),
    serviceName: z.string().optional(),
  })).optional(),
  areaPrices: z.array(z.object({
    id: z.string().optional(),
    area: z.string(),
    price: z.number().min(0),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    description: z.string().optional(),
  })).optional(),
  addons: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, "請輸入附加項目名稱"),
    description: z.string().optional(),
    price: z.number().min(0),
    isRequired: z.boolean(),
  })).optional(),
});

// 自定義選項卡片組件
const CustomOptionCard = ({ 
  option, 
  onUpdate, 
  onDelete,
  errors
}: { 
  option: CustomOption;
  onUpdate: (field: keyof CustomOption, value: string | number | undefined) => void;
  onDelete: () => void;
  errors?: Record<string, string>;
}) => {
  return (
    <div className="space-y-4 border rounded-lg p-4 relative hover:border-blue-200 transition-colors">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 hover:bg-red-50 hover:text-red-500"
        onClick={onDelete}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="pr-8">
        <Label className="text-sm font-medium">部位名稱</Label>
        <Input
          value={option.bodyPart || ""}
          onChange={(e) => onUpdate("bodyPart", e.target.value)}
          placeholder="例如：背部、手臂"
          className={`mt-1.5 ${errors?.bodyPart ? 'border-red-500' : ''}`}
        />
        {errors?.bodyPart && (
          <p className="text-sm text-red-500 mt-1">{errors.bodyPart}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">時長 (分鐘)</Label>
          <Input
            type="number"
            min="1"
            value={option.customDuration || ""}
            onChange={(e) => onUpdate("customDuration", e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="自定義時長"
            className={`mt-1.5 ${errors?.customDuration ? 'border-red-500' : ''}`}
          />
          {errors?.customDuration && (
            <p className="text-sm text-red-500 mt-1">{errors.customDuration}</p>
          )}
        </div>
        <div>
          <Label className="text-sm font-medium">價格 (NT$)</Label>
          <Input
            type="number"
            min="0"
            value={option.customPrice || ""}
            onChange={(e) => onUpdate("customPrice", e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="自定義價格"
            className={`mt-1.5 ${errors?.customPrice ? 'border-red-500' : ''}`}
          />
          {errors?.customPrice && (
            <p className="text-sm text-red-500 mt-1">{errors.customPrice}</p>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      type: service?.type || "SINGLE",
      category: service?.category || "",
      durations: service?.durations || [{ duration: 60, price: 0 }],
      customOptions: service?.customOptions || [],
      masseursIds: service?.masseursIds || [],
      isLimitedTime: service?.isLimitedTime || false,
      limitedTimeStart: service?.limitedTimeStart,
      limitedTimeEnd: service?.limitedTimeEnd,
      limitedSpecialPrice: service?.limitedSpecialPrice,
      limitedDiscountPercent: service?.limitedDiscountPercent,
      limitedNote: service?.limitedNote || "",
      isFlashSale: service?.isFlashSale || false,
      flashSaleStart: service?.flashSaleStart,
      flashSaleEnd: service?.flashSaleEnd,
      flashSaleNote: service?.flashSaleNote || "",
      active: service?.active ?? true,
      genderPrices: service?.genderPrices || [],
      areaPrices: service?.areaPrices || [],
      addons: service?.addons || [],
    },
  });

  // 服務類型狀態
  const [serviceType, setServiceType] = useState<string>(
    service?.type === "COMBO" ? "COMBO" :
    service?.areaPrices?.length ? "AREA_PRICING" :
    service?.genderPrices?.length ? "GENDER_PRICING" : "SINGLE"
  );

  // 多時長價格管理
  const durations = form.watch("durations") || [];
  
  // 自定義選項管理
  const customOptions = form.watch("customOptions") || [];

  // 添加測試代碼
  useEffect(() => {
    console.log("當前服務類型:", serviceType);
    console.log("自定義欄位:", customOptions);
  }, [serviceType, customOptions]);

  // 添加時長
  const addDuration = () => {
    const newDurations = [...durations, { duration: 60, price: 0 }];
    form.setValue("durations", newDurations);
  };

  // 移除時長
  const removeDuration = (index: number) => {
    const newDurations = [...durations];
    newDurations.splice(index, 1);
    form.setValue("durations", newDurations);
  };

  // 更新時長
  const updateDuration = (index: number, field: "duration" | "price", value: number) => {
    const newDurations = [...durations];
    newDurations[index][field] = value;
    form.setValue("durations", newDurations);
  };

  // 自定義選項管理函數
  const addCustomOption = () => {
    const newCustomOptions = [...customOptions, { bodyPart: "", customDuration: undefined, customPrice: undefined }];
    form.setValue("customOptions", newCustomOptions);
  };

  const removeCustomOption = (index: number) => {
    const newCustomOptions = [...customOptions];
    newCustomOptions.splice(index, 1);
    form.setValue("customOptions", newCustomOptions);
  };

  const updateCustomOption = (index: number, field: keyof CustomOption, value: string | number | undefined) => {
    const newCustomOptions = [...customOptions];
    newCustomOptions[index] = {
      ...newCustomOptions[index],
      [field]: value
    };
    form.setValue("customOptions", newCustomOptions);
  };

  // 限時優惠狀態
  const isLimitedTime = form.watch("isLimitedTime");
  const limitedTimeStart = form.watch("limitedTimeStart");
  const limitedTimeEnd = form.watch("limitedTimeEnd");
  
  // 限時閃購狀態
  const isFlashSale = form.watch("isFlashSale");
  const flashSaleStart = form.watch("flashSaleStart");
  const flashSaleEnd = form.watch("flashSaleEnd");

  // 處理服務類型變更，重置相關欄位
  useEffect(() => {
    console.log("服務類型變更為:", serviceType);
    
    if (serviceType === "SINGLE") {
      form.setValue("genderPrices", []);
      form.setValue("areaPrices", []);
      // 確保 customOptions 不被清除
      const currentCustomOptions = form.watch("customOptions") || [];
      if (currentCustomOptions.length === 0) {
        form.setValue("customOptions", []);
      }
    } else if (serviceType === "COMBO") {
      form.setValue("genderPrices", []);
      form.setValue("areaPrices", []);
      form.setValue("customOptions", []); // 清除自定義選項
    }
  }, [serviceType, form]);

  // 表單提交處理
  const onSaveService = (data: ServiceFormData) => {
    console.log("提交服務數據:", data, "服務類型:", serviceType);
    
    // 根據服務類型調整數據
    if (serviceType === "SINGLE") {
      data.genderPrices = [];
      data.areaPrices = [];
    } else if (serviceType === "GENDER_PRICING") {
      data.areaPrices = [];
      
      // 驗證性別定價數據
      if (!data.genderPrices?.length || !data.genderPrices.every(gp => gp.gender && gp.price !== undefined)) {
        alert("性別定價服務至少需要設定一個性別價格，且必須包含性別和價格");
        return;
      }
    } else if (serviceType === "AREA_PRICING") {
      data.genderPrices = [];
      
      // 驗證區域定價數據
      if (!data.areaPrices?.length || !data.areaPrices.every(ap => ap.area && ap.price !== undefined)) {
        alert("區域定價服務至少需要設定一個區域價格，且必須包含區域名稱和價格");
        return;
      }
    }

    // 檢查必填字段
    if (!data.name) {
      alert("請填寫服務名稱");
      return;
    }
    
    if (serviceType === "SINGLE" && (!data.durations.length || data.durations.every(item => item.duration === undefined || item.price === undefined))) {
      alert("單項服務必須提供至少一個時長和價格選項");
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
    <form onSubmit={form.handleSubmit(onSaveService)} className="space-y-6">
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
                {...form.register("name")}
                className="mb-2"
                placeholder="請輸入服務名稱"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">服務描述</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                className="mb-2"
                placeholder="請輸入服務描述"
              />
            </div>

            <div>
              <Label htmlFor="category">服務分類</Label>
              <select
                id="category"
                value={form.watch("category") || ""}
                onChange={(e) => form.setValue("category", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">請選擇分類</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={form.watch("active") || false}
                onCheckedChange={(checked) => form.setValue("active", checked)}
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
                variant={serviceType === "SINGLE" ? "default" : "outline"}
                onClick={() => setServiceType("SINGLE")}
                className="w-full justify-start"
              >
                <span className="mr-2">單項服務</span>
                <span className="text-xs opacity-70">(固定價格)</span>
              </Button>
              
              <Button
                type="button"
                variant={serviceType === "COMBO" ? "default" : "outline"}
                onClick={() => setServiceType("COMBO")}
                className="w-full justify-start"
              >
                <span className="mr-2">套餐服務</span>
                <span className="text-xs opacity-70">(多項服務組合)</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 價格部分 - 根據服務類型顯示不同的價格編輯器 */}
      {serviceType === "SINGLE" && (
        <div className="space-y-6">
          <Card className="border rounded-lg p-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-semibold">服務時長與價格</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="space-y-6">
                {/* 多時長選項 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>服務時長與價格設定</Label>
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
                      請添加至少一個時長與價格選項。
                    </p>
                  )}

                  {durations.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div>
                          <Label>時長 (分鐘)</Label>
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
                          <Label>價格 (NT$)</Label>
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
                        disabled={durations.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 自定義選項卡片 */}
          <Card className="border rounded-lg p-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-semibold">自定義選項</CardTitle>
              <p className="text-sm text-gray-500">可以為服務添加特定部位、時長和價格的設定（全部選填）</p>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentOptions = form.watch("customOptions") || [];
                      form.setValue("customOptions", [
                        ...currentOptions,
                        { bodyPart: "", customDuration: undefined, customPrice: undefined }
                      ]);
                    }}
                    className="w-[140px]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加選項
                  </Button>
                </div>

                {(!form.watch("customOptions") || form.watch("customOptions").length === 0) && (
                  <p className="text-sm text-gray-500 mt-2 mb-4">
                    尚未添加自定義選項。點擊「添加選項」按鈕添加部位、時長和價格的自定義設定。
                  </p>
                )}

                <div className="space-y-4">
                  {form.watch("customOptions")?.map((option, index) => (
                    <CustomOptionCard
                      key={index}
                      option={option}
                      onUpdate={(field: keyof CustomOption, value: string | number | undefined) => {
                        const currentOptions = [...(form.watch("customOptions") || [])];
                        currentOptions[index] = { ...currentOptions[index], [field]: value };
                        form.setValue("customOptions", currentOptions);
                      }}
                      onDelete={() => {
                        const currentOptions = [...(form.watch("customOptions") || [])];
                        currentOptions.splice(index, 1);
                        form.setValue("customOptions", currentOptions);
                      }}
                      errors={form.formState.errors.customOptions?.[index] as Record<string, string>}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {serviceType === "GENDER_PRICING" && (
        <Card className="border rounded-lg p-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">性別定價</CardTitle>
            <p className="text-sm text-gray-500">設定不同性別的價格</p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ServiceGenderPricing 
              genderPrices={form.watch("genderPrices") || [
                { gender: "MALE" as Gender, price: 0, serviceName: "" },
                { gender: "FEMALE" as Gender, price: 0, serviceName: "" }
              ]}
              onChange={(genderPrices: GenderPrice[]) => form.setValue("genderPrices", genderPrices)}
            />
          </CardContent>
        </Card>
      )}
      
      {serviceType === "AREA_PRICING" && (
        <Card className="border rounded-lg p-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">區域定價</CardTitle>
            <p className="text-sm text-gray-500">針對不同部位設定不同價格（適用於除毛等服務）</p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ServiceAreaPricing 
              areaPrices={form.watch("areaPrices")?.map(ap => ({
                id: ap.id,
                area: ap.area || "",
                areaName: ap.area || "",
                price: ap.price,
                gender: ap.gender as Gender | null | undefined
              })) || []}
              onChange={(prices) => {
                console.log("更新區域價格:", prices);
                form.setValue("areaPrices", prices.map(p => ({
                  id: p.id,
                  area: p.areaName || "",
                  areaName: p.areaName || "",
                  price: p.price,
                  gender: p.gender
                })));
              }}
            />
          </CardContent>
        </Card>
      )}
      
      {/* 附加項目 - 針對標準服務和性別定價服務 */}
      {(serviceType === "SINGLE" || serviceType === "GENDER_PRICING") && (
        <Card className="border rounded-lg p-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">附加選項</CardTitle>
            <p className="text-sm text-gray-500">添加可選的服務附加項目</p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ServiceAddonOptions 
              addonOptions={(form.watch("addons") || []).map(addon => ({
                ...addon,
                description: addon.description || undefined
              }))}
              onChange={(options: AddonOption[]) => {
                form.setValue("addons", options);
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
                onCheckedChange={(checked) => form.setValue("isLimitedTime", checked)}
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
                            onSelect={(date) => form.setValue("limitedTimeStart", date)}
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
                            onSelect={(date) => form.setValue("limitedTimeEnd", date)}
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
                      {...form.register("limitedSpecialPrice", { valueAsNumber: true })}
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
                      {...form.register("limitedDiscountPercent", { valueAsNumber: true })}
                      className="mb-2"
                      placeholder="例如：80代表八折"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="limitedNote">優惠說明</Label>
                  <Textarea
                    id="limitedNote"
                    {...form.register("limitedNote")}
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
                onCheckedChange={(checked) => form.setValue("isFlashSale", checked)}
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
                            onSelect={(date) => form.setValue("flashSaleStart", date)}
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
                            onSelect={(date) => form.setValue("flashSaleEnd", date)}
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
                    {...form.register("flashSaleNote")}
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
                  const currentMasseurs = form.watch("masseursIds") || [];
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
                            form.setValue("masseursIds", newMasseursIds);
                          } else {
                            const newMasseursIds = currentMasseurs.filter((id) => id !== masseur.id);
                            form.setValue("masseursIds", newMasseursIds);
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