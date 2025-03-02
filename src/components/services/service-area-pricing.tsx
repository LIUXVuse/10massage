"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { X, Plus } from "lucide-react";
import { FormLabel } from "../ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// 區域定價類型
export interface AreaPrice {
  id?: string;
  areaName: string;
  price: number;
  gender?: "MALE" | "FEMALE" | null;
}

interface ServiceAreaPricingProps {
  areaPrices: AreaPrice[];
  onChange: (areaPrices: AreaPrice[]) => void;
}

export function ServiceAreaPricing({ areaPrices, onChange }: ServiceAreaPricingProps) {
  // 添加新的區域定價
  const addAreaPrice = () => {
    onChange([...areaPrices, { areaName: "", price: 0, gender: null }]);
  };

  // 刪除區域定價
  const removeAreaPrice = (index: number) => {
    const newAreaPrices = [...areaPrices];
    newAreaPrices.splice(index, 1);
    onChange(newAreaPrices);
  };

  // 更新區域定價
  const updateAreaPrice = (index: number, field: keyof AreaPrice, value: any) => {
    const newAreaPrices = [...areaPrices];
    newAreaPrices[index] = { ...newAreaPrices[index], [field]: value };
    onChange(newAreaPrices);
  };

  return (
    <Card className="border rounded-lg p-4 mb-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-semibold">身體部位定價</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="space-y-4">
          {areaPrices.map((area, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <Label>部位名稱</Label>
                <Input
                  value={area.areaName}
                  onChange={(e) => updateAreaPrice(index, "areaName", e.target.value)}
                  placeholder="例如：全腿、腋下、胸部等"
                />
              </div>
              <div className="md:col-span-3">
                <Label>價格 (NT$)</Label>
                <Input
                  type="number"
                  value={area.price}
                  onChange={(e) => updateAreaPrice(index, "price", Number(e.target.value))}
                  placeholder="例如：1500"
                />
              </div>
              <div className="md:col-span-3">
                <Label>適用性別 (選填)</Label>
                <Select
                  value={area.gender || ""}
                  onValueChange={(value) => updateAreaPrice(index, "gender", value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="不限性別" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">不限性別</SelectItem>
                    <SelectItem value="MALE">男性</SelectItem>
                    <SelectItem value="FEMALE">女性</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAreaPrice(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addAreaPrice}>
            <Plus className="h-4 w-4 mr-2" />
            添加部位定價
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 