"use client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// 性別定價類型
export interface GenderPrice {
  id?: string;
  gender: "MALE" | "FEMALE";
  price: number;
  serviceName?: string; // 例如: "巴西式私密處全除"
}

interface ServiceGenderPricingProps {
  genderPrices: GenderPrice[];
  onChange: (genderPrices: GenderPrice[]) => void;
}

export function ServiceGenderPricing({ genderPrices, onChange }: ServiceGenderPricingProps) {
  // 確保至少有一組男女價格
  const ensureGenderPrices = () => {
    const hasGenderPrices = genderPrices.length > 0;
    if (!hasGenderPrices) {
      onChange([
        { gender: "MALE", price: 0, serviceName: "" },
        { gender: "FEMALE", price: 0, serviceName: "" }
      ]);
    }
  };

  // 添加新的性別定價
  const addGenderPrice = () => {
    const currentServiceName = genderPrices.length > 0 ? genderPrices[0].serviceName : "";
    const hasMale = genderPrices.some(gp => gp.gender === "MALE");
    const hasFemale = genderPrices.some(gp => gp.gender === "FEMALE");
    
    if (!hasMale) {
      onChange([...genderPrices, { gender: "MALE", price: 0, serviceName: currentServiceName }]);
    } else if (!hasFemale) {
      onChange([...genderPrices, { gender: "FEMALE", price: 0, serviceName: currentServiceName }]);
    }
  };

  // 刪除性別定價
  const removeGenderPrice = (index: number) => {
    const newGenderPrices = [...genderPrices];
    newGenderPrices.splice(index, 1);
    onChange(newGenderPrices);
  };

  // 更新性別定價
  const updateGenderPrice = (index: number, field: keyof GenderPrice, value: any) => {
    const newGenderPrices = [...genderPrices];
    newGenderPrices[index] = { ...newGenderPrices[index], [field]: value };
    
    // 如果更新了服務名稱，同步到所有性別定價
    if (field === "serviceName") {
      newGenderPrices.forEach((gp, i) => {
        if (i !== index) {
          newGenderPrices[i] = { ...newGenderPrices[i], serviceName: value };
        }
      });
    }
    
    onChange(newGenderPrices);
  };

  return (
    <Card className="border rounded-lg p-4 mb-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-semibold">性別差異定價</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="space-y-4">
          {genderPrices.length === 0 && (
            <div className="text-sm text-gray-500 mb-2">
              目前沒有性別差異定價。點擊下方按鈕添加定價。
            </div>
          )}

          {genderPrices.length > 0 && (
            <div className="mb-4">
              <Label>服務名稱</Label>
              <Input
                value={genderPrices[0].serviceName || ""}
                onChange={(e) => updateGenderPrice(0, "serviceName", e.target.value)}
                placeholder="例如：巴西式私密處全除"
                className="mb-4"
              />
            </div>
          )}

          {genderPrices.map((genderPrice, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <Label>性別</Label>
                <div className="text-base font-medium mt-2">
                  {genderPrice.gender === "MALE" ? "男性" : "女性"}
                </div>
              </div>
              <div className="md:col-span-6">
                <Label>價格 (NT$)</Label>
                <Input
                  type="number"
                  value={genderPrice.price}
                  onChange={(e) => updateGenderPrice(index, "price", Number(e.target.value))}
                  placeholder="例如：2500"
                />
              </div>
              <div className="md:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGenderPrice(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addGenderPrice}
            disabled={genderPrices.length >= 2}
          >
            <Plus className="h-4 w-4 mr-2" />
            添加性別定價
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 