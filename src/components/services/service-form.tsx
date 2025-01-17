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
import { Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const serviceSchema = z.object({
  name: z.string().min(1, "名稱為必填"),
  description: z.string().min(1, "描述為必填"),
  type: z.enum(["SINGLE", "COMBO"]),
  category: z.enum(["MASSAGE", "CARE", "TREATMENT"]),
  isRecommended: z.boolean(),
  recommendOrder: z.number().min(0),
  durations: z.array(
    z.object({
      duration: z.number().min(1, "時長為必填"),
      price: z.number().min(1, "價格為必填"),
    })
  ).min(1, "至少需要一個時長"),
  masseurs: z.array(
    z.object({
      id: z.string(),
    })
  ).min(1, "至少需要一個按摩師"),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData?: ServiceFormData;
  masseurs: Array<{ id: string; name: string }>;
  onSubmit: (data: ServiceFormData) => void;
}

export function ServiceForm({ initialData, masseurs, onSubmit }: ServiceFormProps) {
  const [durations, setDurations] = useState(
    initialData?.durations || [{ duration: 0, price: 0 }]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData || {
      type: "SINGLE",
      category: "MASSAGE",
      isRecommended: false,
      recommendOrder: 0,
      masseurs: [],
    },
  });

  const selectedMasseurs = watch("masseurs") || [];
  const isRecommended = watch("isRecommended");

  const addDuration = () => {
    setDurations([...durations, { duration: 0, price: 0 }]);
  };

  const removeDuration = (index: number) => {
    const newDurations = durations.filter((_, i) => i !== index);
    setDurations(newDurations);
    setValue("durations", newDurations);
  };

  const handleDurationChange = (
    index: number,
    field: "duration" | "price",
    value: string
  ) => {
    const newDurations = [...durations];
    newDurations[index][field] = Number(value);
    setDurations(newDurations);
    setValue("durations", newDurations);
  };

  const toggleMasseur = (masId: string) => {
    const currentMasseurs = selectedMasseurs;
    const exists = currentMasseurs.some((m) => m.id === masId);

    if (exists) {
      setValue(
        "masseurs",
        currentMasseurs.filter((m) => m.id !== masId)
      );
    } else {
      setValue("masseurs", [...currentMasseurs, { id: masId }]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              {...register("recommendOrder", { valueAsNumber: true })}
            />
            {errors.recommendOrder && (
              <p className="text-sm text-red-500">{errors.recommendOrder.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Label>服務時長與價格</Label>
        {durations.map((duration, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="時長(分鐘)"
                value={duration.duration}
                onChange={(e) =>
                  handleDurationChange(index, "duration", e.target.value)
                }
              />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="價格"
                value={duration.price}
                onChange={(e) =>
                  handleDurationChange(index, "price", e.target.value)
                }
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeDuration(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addDuration}>
          新增時長
        </Button>
        {errors.durations && (
          <p className="text-sm text-red-500">{errors.durations.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label>選擇按摩師</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {masseurs.map((masseur) => (
            <div
              key={masseur.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedMasseurs.some((m) => m.id === masseur.id)
                  ? "border-primary bg-primary/10"
                  : ""
              }`}
              onClick={() => toggleMasseur(masseur.id)}
            >
              {masseur.name}
            </div>
          ))}
        </div>
        {errors.masseurs && (
          <p className="text-sm text-red-500">{errors.masseurs.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        {initialData ? "更新服務" : "新增服務"}
      </Button>
    </form>
  );
} 