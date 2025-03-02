"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Trash2, Loader2, CalendarIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { zhTW } from "date-fns/locale";

const serviceSchema = z.object({
  name: z.string().min(1, "名稱為必填"),
  description: z.string().min(1, "描述為必填"),
  type: z.enum(["SINGLE", "COMBO"]),
  category: z.enum(["MASSAGE", "CARE", "TREATMENT"]),
  isRecommended: z.boolean(),
  recommendOrder: z.number().min(0),
  // 期間限定功能
  isLimitedTime: z.boolean().default(false),
  limitedStartDate: z.date().nullable().optional(),
  limitedEndDate: z.date().nullable().optional(),
  // 快閃方案功能
  isFlashSale: z.boolean().default(false),
  flashSalePercent: z.number().min(0).max(100).nullable().optional(),
  flashSalePrice: z.number().min(0).nullable().optional(),
  flashSaleNote: z.string().nullable().optional(),
  durations: z.array(
    z.object({
      duration: z.number().int().min(1, "時長為必填且必須是正數"),
      price: z.number().min(1, "價格為必填且必須是正數"),
    })
  ).min(1, "至少需要一個時長"),
  masseurs: z.array(
    z.object({
      id: z.string(),
    })
  ).min(1, "至少需要一個按摩師"),
}).refine((data) => {
  // 如果是期間限定，則開始日期和結束日期都必須提供
  if (data.isLimitedTime) {
    if (!data.limitedStartDate || !data.limitedEndDate) {
      return false;
    }
    // 確保結束日期大於開始日期
    if (data.limitedStartDate && data.limitedEndDate) {
      return data.limitedEndDate > data.limitedStartDate;
    }
  }
  return true;
}, {
  message: "期間限定服務必須設置有效的開始和結束日期，且結束日期必須晚於開始日期",
  path: ["limitedEndDate"],
}).refine((data) => {
  // 如果是快閃方案，則折扣百分比或特價必須提供其中一項
  if (data.isFlashSale) {
    return (data.flashSalePercent !== null && data.flashSalePercent !== undefined) || 
           (data.flashSalePrice !== null && data.flashSalePrice !== undefined);
  }
  return true;
}, {
  message: "快閃方案必須設置折扣百分比或特價",
  path: ["flashSalePercent"],
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData?: ServiceFormData;
  masseurs: Array<{ id: string; name: string }>;
  onSubmit: (data: ServiceFormData) => void;
}

export function ServiceForm({ initialData, masseurs, onSubmit }: ServiceFormProps) {
  const [durations, setDurations] = useState(
    initialData?.durations || [{ duration: 60, price: 1000 }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData || {
      type: "SINGLE",
      category: "MASSAGE",
      isRecommended: false,
      recommendOrder: 0,
      isLimitedTime: false,
      isFlashSale: false,
      masseurs: [],
      durations: [{ duration: 60, price: 1000 }]
    },
  });

  const selectedMasseurs = watch("masseurs") || [];
  const isRecommended = watch("isRecommended");
  const isLimitedTime = watch("isLimitedTime");
  const isFlashSale = watch("isFlashSale");
  const limitedStartDate = watch("limitedStartDate");
  const limitedEndDate = watch("limitedEndDate");

  const addDuration = () => {
    setDurations([...durations, { duration: 60, price: 1000 }]);
  };

  const removeDuration = (index: number) => {
    if (durations.length <= 1) {
      toast({
        title: "無法刪除",
        description: "至少需要保留一個時長價格組合",
        variant: "destructive"
      });
      return;
    }
    
    const newDurations = durations.filter((_, i) => i !== index);
    setDurations(newDurations);
    setValue("durations", newDurations);
  };

  const handleDurationChange = (
    index: number,
    field: "duration" | "price",
    value: string
  ) => {
    // 確保輸入值為有效數字
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      // 提示使用者，但不更新狀態
      if (value !== "") {
        toast({
          title: "無效輸入",
          description: `${field === "duration" ? "時長" : "價格"}必須是大於0的數字`,
          variant: "destructive"
        });
      }
      return;
    }
    
    const newDurations = [...durations];
    newDurations[index][field] = field === "duration" ? Math.floor(numericValue) : numericValue;
    setDurations(newDurations);
    setValue("durations", newDurations);
  };

  const toggleMasseur = (masId: string) => {
    const currentMasseurs = selectedMasseurs;
    const exists = currentMasseurs.some((m) => m.id === masId);

    if (exists) {
      const newMasseurs = currentMasseurs.filter((m) => m.id !== masId);
      if (newMasseurs.length === 0) {
        toast({
          title: "無法移除",
          description: "至少需要選擇一位按摩師",
          variant: "destructive"
        });
        return;
      }
      setValue("masseurs", newMasseurs);
    } else {
      setValue("masseurs", [...currentMasseurs, { id: masId }]);
    }
  };

  const handleFormSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 確保所有時長和價格都是有效數字
      const validDurations = data.durations.map(d => ({
        duration: typeof d.duration === 'number' ? d.duration : Math.floor(Number(d.duration)),
        price: typeof d.price === 'number' ? d.price : Number(d.price)
      }));
      
      // 驗證價格和時間有效性
      const invalidDurations = validDurations.filter(
        d => isNaN(d.duration) || d.duration <= 0 || isNaN(d.price) || d.price <= 0
      );
      
      if (invalidDurations.length > 0) {
        throw new Error("所有時長必須是大於0的整數，價格必須是大於0的數字");
      }
      
      // 使用有效的數據
      const formData = {
        ...data,
        durations: validDurations,
        recommendOrder: typeof data.recommendOrder === 'number' ? 
          data.recommendOrder : Number(data.recommendOrder),
        flashSalePercent: data.isFlashSale && data.flashSalePercent ? 
          Number(data.flashSalePercent) : null,
        flashSalePrice: data.isFlashSale && data.flashSalePrice ? 
          Number(data.flashSalePrice) : null,
        price: 0, // 先設定一個默認值
        duration: 0 // 先設定一個默認值
      };
      
      // 使用第一個時長和價格作為主要價格和時長
      if (formData.durations.length > 0) {
        formData.price = formData.durations[0].price;
        formData.duration = formData.durations[0].duration;
      }
      
      console.log("提交的表單數據:", JSON.stringify(formData, null, 2));
      
      await onSubmit(formData);
      
      toast({
        title: "成功",
        description: initialData ? "服務更新成功" : "服務創建成功",
      });
    } catch (err) {
      console.error("服務表單提交錯誤:", err);
      setError(err instanceof Error ? err.message : "服務保存失敗，請稍後再試");
      toast({
        title: "錯誤",
        description: err instanceof Error ? err.message : "服務保存失敗，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 mb-4 border border-red-400 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">服務名稱</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">服務描述</Label>
        <Textarea id="description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>服務類型</Label>
        <RadioGroup
          defaultValue={initialData?.type || "SINGLE"}
          onValueChange={(value: "SINGLE" | "COMBO") => setValue("type", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="SINGLE" id="single" />
            <Label htmlFor="single">單人服務</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="COMBO" id="combo" />
            <Label htmlFor="combo">組合服務</Label>
          </div>
        </RadioGroup>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>服務分類</Label>
        <RadioGroup
          defaultValue={initialData?.category || "MASSAGE"}
          onValueChange={(value: "MASSAGE" | "CARE" | "TREATMENT") => setValue("category", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="MASSAGE" id="massage" />
            <Label htmlFor="massage">按摩</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="CARE" id="care" />
            <Label htmlFor="care">護理</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="TREATMENT" id="treatment" />
            <Label htmlFor="treatment">療程</Label>
          </div>
        </RadioGroup>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* 期間限定選項 */}
      <div className="space-y-4 p-4 border rounded-md bg-gray-50">
        <div className="flex items-center justify-between">
          <Label htmlFor="isLimitedTime" className="text-base font-semibold">期間限定服務</Label>
          <Switch
            id="isLimitedTime"
            checked={isLimitedTime}
            onCheckedChange={(checked) => setValue("isLimitedTime", checked)}
          />
        </div>
        
        {isLimitedTime && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="limitedStartDate">開始日期</Label>
                <div className="mt-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !limitedStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {limitedStartDate ? format(limitedStartDate, "yyyy-MM-dd") : "選擇開始日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={limitedStartDate || undefined}
                        onSelect={(date) => setValue("limitedStartDate", date)}
                        locale={zhTW}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.limitedStartDate && (
                  <p className="text-sm text-red-500">{errors.limitedStartDate.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="limitedEndDate">結束日期</Label>
                <div className="mt-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !limitedEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {limitedEndDate ? format(limitedEndDate, "yyyy-MM-dd") : "選擇結束日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={limitedEndDate || undefined}
                        onSelect={(date) => setValue("limitedEndDate", date)}
                        locale={zhTW}
                        disabled={(date) => (limitedStartDate ? date < limitedStartDate : false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.limitedEndDate && (
                  <p className="text-sm text-red-500">{errors.limitedEndDate.message}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500">
              期間限定服務將僅在指定的日期範圍內顯示，超出日期範圍後將自動隱藏。
            </p>
          </div>
        )}
      </div>

      {/* 快閃方案選項 */}
      <div className="space-y-4 p-4 border rounded-md bg-gray-50">
        <div className="flex items-center justify-between">
          <Label htmlFor="isFlashSale" className="text-base font-semibold">快閃方案</Label>
          <Switch
            id="isFlashSale"
            checked={isFlashSale}
            onCheckedChange={(checked) => setValue("isFlashSale", checked)}
          />
        </div>
        
        {isFlashSale && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flashSalePercent">折扣百分比 (%)</Label>
                <div className="relative">
                  <Input 
                    id="flashSalePercent"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="例如: 80 (表示8折)"
                    {...register("flashSalePercent", {
                      setValueAs: (v) => v === "" ? null : Number(v)
                    })}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2">%</span>
                </div>
                <p className="text-xs text-gray-500">輸入0到100之間的數字，表示折扣百分比</p>
                {errors.flashSalePercent && (
                  <p className="text-sm text-red-500">{errors.flashSalePercent.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="flashSalePrice">特價 (元)</Label>
                <div className="relative">
                  <Input 
                    id="flashSalePrice"
                    type="number"
                    min="0"
                    placeholder="例如: 1000"
                    {...register("flashSalePrice", {
                      setValueAs: (v) => v === "" ? null : Number(v)
                    })}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2">NT$</span>
                </div>
                <p className="text-xs text-gray-500">直接輸入特價金額，優先於折扣百分比</p>
                {errors.flashSalePrice && (
                  <p className="text-sm text-red-500">{errors.flashSalePrice.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="flashSaleNote">快閃備註</Label>
              <Textarea 
                id="flashSaleNote"
                placeholder="例如: 限時七天特價，數量有限！"
                {...register("flashSaleNote")}
              />
              <p className="text-xs text-gray-500">添加快閃方案的額外說明，如限制條件或其他備註</p>
            </div>
            
            <p className="text-sm text-gray-500">
              快閃方案將使用特殊樣式顯示在服務列表中，吸引用戶注意。如果同時設置了特價和折扣百分比，系統將優先使用特價。
            </p>
          </div>
        )}
      </div>

      {/* 其他表單內容 */}
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="isRecommended">設為推薦服務</Label>
          <Switch
            id="isRecommended"
            checked={isRecommended}
            onCheckedChange={(checked) => setValue("isRecommended", checked)}
          />
        </div>
        {isRecommended && (
          <div className="mt-2">
            <Label htmlFor="recommendOrder">推薦排序</Label>
            <Input
              id="recommendOrder"
              type="number"
              min="0"
              {...register("recommendOrder", {
                valueAsNumber: true,
              })}
            />
            <p className="text-xs text-gray-500 mt-1">數字越小排序越靠前</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>服務時長與價格</Label>
          <Button type="button" variant="outline" size="sm" onClick={addDuration}>
            添加時長
          </Button>
        </div>
        {durations.map((duration, index) => (
          <div key={index} className="flex space-x-2 items-center">
            <div className="flex-1">
              <Label htmlFor={`duration-${index}`}>時長 (分鐘)</Label>
              <Input
                id={`duration-${index}`}
                type="number"
                value={duration.duration}
                onChange={(e) => handleDurationChange(index, "duration", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`price-${index}`}>價格 (元)</Label>
              <Input
                id={`price-${index}`}
                type="number"
                value={duration.price}
                onChange={(e) => handleDurationChange(index, "price", e.target.value)}
              />
            </div>
            <button
              type="button"
              className="mt-6 p-2 text-red-500 hover:text-red-700"
              onClick={() => removeDuration(index)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {errors.durations && (
          <p className="text-sm text-red-500">{errors.durations.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>選擇按摩師</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {masseurs.map((masseur) => {
            const isSelected = selectedMasseurs.some((m) => m.id === masseur.id);
            return (
              <button
                key={masseur.id}
                type="button"
                className={`p-2 rounded border ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => toggleMasseur(masseur.id)}
              >
                {masseur.name}
              </button>
            );
          })}
        </div>
        {errors.masseurs && (
          <p className="text-sm text-red-500">{errors.masseurs.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              儲存中...
            </>
          ) : initialData ? (
            "更新服務"
          ) : (
            "創建服務"
          )}
        </Button>
      </div>
    </form>
  );
} 