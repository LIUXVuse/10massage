"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { CalendarIcon, X, Plus } from "lucide-react";

// 服務表單的驗證規則
const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "服務名稱不能為空"),
  description: z.string().optional(),
  type: z.enum(["SINGLE", "COMBO"]),
  category: z.enum(["MASSAGE", "CARE", "TREATMENT"]),
  
  // 期間限定相關字段
  isLimitedTime: z.boolean().default(false),
  limitedStartDate: z.date().optional().nullable(),
  limitedEndDate: z.date().optional().nullable(),
  limitedSpecialPrice: z.number().optional().nullable(),
  limitedDiscountPercent: z.number().optional().nullable(),
  limitedNote: z.string().optional().nullable(),
  
  // 快閃方案相關字段
  isFlashSale: z.boolean().default(false),
  flashSaleNote: z.string().optional().nullable(),
  
  // 推薦服務相關字段
  isRecommended: z.boolean().default(false),
  recommendOrder: z.number().optional().nullable(),
  
  // 關聯字段
  masseurs: z.array(z.object({
    id: z.string()
  })).optional(),
}).refine(data => {
  // 如果是期間限定服務，則開始日期和結束日期都必須提供
  if (data.isLimitedTime) {
    if (!data.limitedStartDate || !data.limitedEndDate) {
      return false;
    }
  }
  return true;
}, {
  message: "期間限定服務必須提供開始和結束日期",
  path: ["isLimitedTime"],
}).refine(data => {
  // 如果是期間限定服務，則結束日期必須晚於開始日期
  if (data.isLimitedTime && data.limitedStartDate && data.limitedEndDate) {
    return data.limitedEndDate > data.limitedStartDate;
  }
  return true;
}, {
  message: "結束日期必須晚於開始日期",
  path: ["limitedEndDate"],
}).refine(data => {
  // 如果是期間限定服務，則折扣百分比或特價至少提供一個
  if (data.isLimitedTime) {
    if (data.limitedDiscountPercent === undefined && data.limitedSpecialPrice === undefined) {
      return false;
    }
  }
  return true;
}, {
  message: "期間限定服務必須提供折扣百分比或特價",
  path: ["isLimitedTime"],
}).refine(data => {
  // 如果提供了折扣百分比，則必須在0到100之間
  if (data.limitedDiscountPercent !== undefined && data.limitedDiscountPercent !== null) {
    return data.limitedDiscountPercent >= 0 && data.limitedDiscountPercent <= 100;
  }
  return true;
}, {
  message: "折扣百分比必須在0到100之間",
  path: ["limitedDiscountPercent"],
}).refine(data => {
  // 如果是快閃方案，則開始日期和結束日期都必須提供
  if (data.isFlashSale) {
    if (!data.limitedStartDate || !data.limitedEndDate) {
      return false;
    }
  }
  return true;
}, {
  message: "快閃方案必須提供開始和結束日期",
  path: ["isFlashSale"],
}).refine(data => {
  // 如果是快閃方案，則結束日期必須晚於開始日期
  if (data.isFlashSale && data.limitedStartDate && data.limitedEndDate) {
    return data.limitedEndDate > data.limitedStartDate;
  }
  return true;
}, {
  message: "結束日期必須晚於開始日期",
  path: ["limitedEndDate"],
});

// 定義組件屬性
interface ServiceFormProps {
  initialData?: any;
  masseurs?: any[];
  onSubmit: (data: any) => void;
}

// 服務表單組件
export function ServiceForm({ initialData, masseurs = [], onSubmit }: ServiceFormProps) {
  const [durations, setDurations] = useState<{ id?: string, duration: number, price: number }[]>(
    initialData?.durations?.length 
      ? initialData.durations.map((d: any) => ({ 
          id: d.id, 
          duration: d.duration, 
          price: d.price 
        })) 
      : [{ duration: 60, price: 2000 }]
  );

  // 初始化表單
  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData 
      ? {
          ...initialData,
          limitedStartDate: initialData.limitedStartDate ? new Date(initialData.limitedStartDate) : null,
          limitedEndDate: initialData.limitedEndDate ? new Date(initialData.limitedEndDate) : null,
        }
      : {
          name: "",
          description: "",
          type: "SINGLE",
          category: "MASSAGE",
          isLimitedTime: false,
          limitedStartDate: null,
          limitedEndDate: null,
          limitedSpecialPrice: null,
          limitedDiscountPercent: null,
          limitedNote: null,
          isFlashSale: false,
          flashSaleNote: null,
          isRecommended: false,
          recommendOrder: null,
          masseurs: [],
        },
  });

  // 監聽表單的變化，例如當限時方案關閉時，清除相關字段
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "isLimitedTime" && value.isLimitedTime === false) {
        form.setValue("limitedStartDate", null);
        form.setValue("limitedEndDate", null);
        form.setValue("limitedSpecialPrice", null);
        form.setValue("limitedDiscountPercent", null);
        form.setValue("limitedNote", null);
      }

      if (name === "isFlashSale" && value.isFlashSale === false) {
        form.setValue("flashSaleNote", null);
        // 如果前面沒有設置期間限定，也清除日期
        if (!value.isLimitedTime) {
          form.setValue("limitedStartDate", null);
          form.setValue("limitedEndDate", null);
        }
      }

      if (name === "isRecommended" && value.isRecommended === false) {
        form.setValue("recommendOrder", null);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // 處理時長的變更
  const handleDurationChange = (idx: number, field: 'duration' | 'price', value: string) => {
    const newDurations = [...durations];
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue) && numValue > 0) {
      newDurations[idx][field] = field === 'duration' ? Math.floor(numValue) : numValue;
      setDurations(newDurations);
    }
  };

  // 添加新的時長選項
  const addDuration = () => {
    setDurations([...durations, { duration: 90, price: 2500 }]);
  };

  // 移除時長選項
  const removeDuration = (idx: number) => {
    if (durations.length > 1) {
      setDurations(durations.filter((_, i) => i !== idx));
    }
  };

  // 切換按摩師選擇
  const toggleMasseur = (id: string) => {
    const currentMasseurs = form.getValues("masseurs") || [];
    const exists = currentMasseurs.some((m: any) => m.id === id);
    
    if (exists) {
      form.setValue(
        "masseurs",
        currentMasseurs.filter((m: any) => m.id !== id)
      );
    } else {
      form.setValue("masseurs", [...currentMasseurs, { id }]);
    }
  };

  // 檢查按摩師是否已選中
  const isMasseurSelected = (id: string) => {
    const currentMasseurs = form.getValues("masseurs") || [];
    return currentMasseurs.some((m: any) => m.id === id);
  };

  // 提交表單
  const handleFormSubmit = (values: z.infer<typeof serviceSchema>) => {
    // 提取第一個時長作為主時長和價格
    const primaryDuration = durations[0];
    
    // 構建提交數據
    const submitData = {
      ...values,
      price: primaryDuration.price,
      duration: primaryDuration.duration,
      durations,
      // 後端接口需要的字段名兼容
      isRecommend: values.isRecommended,
      recommendOrder: values.isRecommended ? values.recommendOrder : 0,
    };
    
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* 服務名稱 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>服務名稱</FormLabel>
              <FormControl>
                <Input placeholder="請輸入服務名稱" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 服務描述 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>服務描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="請輸入服務描述"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 服務類型 */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>服務類型</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="SINGLE" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      單項服務
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="COMBO" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      套餐服務
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 服務類別 */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>服務類別</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="MASSAGE" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      按摩
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="CARE" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      護理
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="TREATMENT" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      療程
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 期間限定服務 */}
        <FormField
          control={form.control}
          name="isLimitedTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>期間限定服務</FormLabel>
                  <FormDescription>
                    設置服務在特定時間段內提供特殊價格
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormMessage />
              
              {/* 期間限定起始日期 */}
              {form.watch("isLimitedTime") && (
                <div className="space-y-4 mt-4 border p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="limitedStartDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>開始日期</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "yyyy-MM-dd", { locale: zhTW })
                                  ) : (
                                    <span>選擇開始日期</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="limitedEndDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>結束日期</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "yyyy-MM-dd", { locale: zhTW })
                                  ) : (
                                    <span>選擇結束日期</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="limitedDiscountPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>折扣百分比 (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="例如: 80 表示八折"
                              {...field}
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => {
                                const value = e.target.value === "" ? null : parseInt(e.target.value);
                                field.onChange(value);
                                if (value !== null) {
                                  form.setValue("limitedSpecialPrice", null);
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            設置折扣百分比，例如80表示打八折 (原價的80%)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="limitedSpecialPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>特價金額</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="例如: 1800"
                              {...field}
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => {
                                const value = e.target.value === "" ? null : parseFloat(e.target.value);
                                field.onChange(value);
                                if (value !== null) {
                                  form.setValue("limitedDiscountPercent", null);
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            直接設置特價金額，與折扣百分比二選一
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="limitedNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>期間限定備註</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="添加備註說明"
                            className="resize-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </FormItem>
          )}
        />

        {/* 快閃方案 */}
        <FormField
          control={form.control}
          name="isFlashSale"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>快閃方案</FormLabel>
                  <FormDescription>
                    設置服務在特定時間段內快閃可用，不涉及價格變動
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormMessage />
              
              {form.watch("isFlashSale") && (
                <div className="space-y-4 mt-4 border p-4 rounded-lg">
                  {!form.watch("isLimitedTime") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="limitedStartDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>開始日期</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "yyyy-MM-dd", { locale: zhTW })
                                    ) : (
                                      <span>選擇開始日期</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="limitedEndDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>結束日期</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "yyyy-MM-dd", { locale: zhTW })
                                    ) : (
                                      <span>選擇結束日期</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="flashSaleNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>快閃備註</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="添加快閃備註說明"
                            className="resize-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </FormItem>
          )}
        />

        {/* 推薦服務 */}
        <FormField
          control={form.control}
          name="isRecommended"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>推薦服務</FormLabel>
                  <FormDescription>
                    將此服務標記為推薦服務，會在首頁和服務列表中優先顯示
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormMessage />
              
              {/* 推薦排序 */}
              {form.watch("isRecommended") && (
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="recommendOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>推薦排序</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="排序數字，越小越靠前"
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          數字越小排序越靠前，可以調整多個推薦服務的顯示順序
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </FormItem>
          )}
        />

        {/* 服務時長與價格 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">服務時長與價格</h3>
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
          
          {durations.map((duration, idx) => (
            <div key={idx} className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  時長 (分鐘)
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="服務時長"
                  value={duration.duration}
                  onChange={(e) => handleDurationChange(idx, 'duration', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  價格 (NT$)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="10"
                  placeholder="服務價格"
                  value={duration.price}
                  onChange={(e) => handleDurationChange(idx, 'price', e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mb-1"
                  onClick={() => removeDuration(idx)}
                  disabled={durations.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {form.formState.errors.durations && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.durations.message}
            </p>
          )}
        </div>

        {/* 按摩師選擇 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">選擇提供此服務的按摩師</h3>
          <div className="flex flex-wrap gap-2">
            {masseurs.map((masseur) => (
              <Badge
                key={masseur.id}
                variant={isMasseurSelected(masseur.id) ? "default" : "outline"}
                className="cursor-pointer text-sm py-2 px-3"
                onClick={() => toggleMasseur(masseur.id)}
              >
                {masseur.name}
              </Badge>
            ))}
          </div>
          {form.formState.errors.masseurs && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.masseurs.message}
            </p>
          )}
        </div>

        {/* 提交按鈕 */}
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "處理中..."
              : initialData
              ? "更新服務"
              : "創建服務"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 