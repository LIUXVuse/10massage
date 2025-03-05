"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// 套餐項目類型
export interface PackageItem {
  id?: string;
  serviceId: string;
  serviceName: string;
  duration: number;
  isRequired: boolean;
  bodyPart?: string;      // 選填：部位
  customDuration?: number; // 選填：自定義時長
  customPrice?: number;    // 選填：自定義價格
}

// 套餐類型
export interface ServicePackage {
  id?: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  items: PackageItem[];
}

interface ServicePackageProps {
  servicePackage: ServicePackage;
  availableServices: { id: string; name: string }[];
  onChange: (packageData: ServicePackage) => void;
}

export function ServicePackageComponent({
  servicePackage,
  availableServices,
  onChange
}: ServicePackageProps) {
  // 更新套餐基本信息
  const updatePackageInfo = (field: keyof ServicePackage, value: any) => {
    onChange({ ...servicePackage, [field]: value });
  };

  // 添加套餐項目
  const addPackageItem = () => {
    if (availableServices.length === 0) return;
    
    const firstService = availableServices[0];
    const newItem: PackageItem = {
      serviceId: firstService.id,
      serviceName: firstService.name,
      duration: 60,
      isRequired: true
    };
    
    onChange({
      ...servicePackage,
      items: [...servicePackage.items, newItem]
    });
  };

  // 移除套餐項目
  const removePackageItem = (index: number) => {
    const newItems = [...servicePackage.items];
    newItems.splice(index, 1);
    onChange({ ...servicePackage, items: newItems });
  };

  // 更新套餐項目
  const updatePackageItem = (index: number, field: keyof PackageItem, value: any) => {
    const newItems = [...servicePackage.items];
    
    if (field === 'serviceId' && availableServices) {
      const selectedService = availableServices.find(s => s.id === value);
      if (selectedService) {
        newItems[index] = { 
          ...newItems[index], 
          [field]: value,
          serviceName: selectedService.name
        };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    
    onChange({ ...servicePackage, items: newItems });
  };

  return (
    <div className="space-y-6">
      {/* 套餐基本信息 */}
      <Card className="border rounded-lg p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold">套餐基本信息</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            <div>
              <Label>套餐名稱</Label>
              <Input
                value={servicePackage.name}
                onChange={(e) => updatePackageInfo("name", e.target.value)}
                placeholder="例如：中式元氣套餐"
                className="mb-2"
              />
            </div>

            <div>
              <Label>套餐描述</Label>
              <Textarea
                value={servicePackage.description || ""}
                onChange={(e) => updatePackageInfo("description", e.target.value)}
                placeholder="套餐描述..."
                className="mb-2"
              />
            </div>

            <div>
              <Label>套餐價格 (NT$)</Label>
              <Input
                type="number"
                value={servicePackage.price}
                onChange={(e) => updatePackageInfo("price", Number(e.target.value))}
                placeholder="例如：2000"
                className="mb-2"
              />
            </div>

            <div>
              <Label>套餐總時長 (分鐘)</Label>
              <Input
                type="number"
                value={servicePackage.duration}
                onChange={(e) => updatePackageInfo("duration", Number(e.target.value))}
                placeholder="例如：120"
                className="mb-2"
                disabled={true}
              />
              <p className="text-xs text-gray-500">總時長將根據所選服務自動計算</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 套餐服務項目 */}
      <Card className="border rounded-lg p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold">套餐包含服務</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-6">
            {servicePackage.items.length === 0 && (
              <div className="text-sm text-gray-500 mb-2">
                套餐中尚未添加服務項目。點擊下方按鈕添加服務。
              </div>
            )}

            {servicePackage.items.map((item, index) => (
              <div key={index} className="space-y-4 border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <Label>服務名稱</Label>
                    <select
                      value={item.serviceId}
                      onChange={(e) => updatePackageItem(index, "serviceId", e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {availableServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePackageItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label>時長 (分鐘)</Label>
                  <Input
                    type="number"
                    value={item.duration}
                    onChange={(e) => updatePackageItem(index, "duration", Number(e.target.value))}
                    placeholder="例如：60"
                    className="mb-2"
                  />
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Switch
                    checked={item.isRequired}
                    onCheckedChange={(checked) => updatePackageItem(index, "isRequired", checked)}
                    id={`required-item-${index}`}
                  />
                  <Label htmlFor={`required-item-${index}`}>必選項</Label>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-500 mb-3">選填項目 (根據需要填寫)</p>
                  
                  <div className="mb-3">
                    <Label>部位</Label>
                    <Input
                      value={item.bodyPart || ""}
                      onChange={(e) => updatePackageItem(index, "bodyPart", e.target.value)}
                      placeholder="例如：背部、手臂"
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500">選填：指定此服務項目的施作部位</p>
                  </div>

                  <div className="mb-3">
                    <Label>自定義時長 (分鐘)</Label>
                    <Input
                      type="number"
                      value={item.customDuration || ""}
                      onChange={(e) => updatePackageItem(index, "customDuration", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="如需自定義時長，請填寫"
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500">選填：若需要特別指定此項目的時長，請填寫</p>
                  </div>

                  <div className="mb-3">
                    <Label>自定義價格 (NT$)</Label>
                    <Input
                      type="number"
                      value={item.customPrice || ""}
                      onChange={(e) => updatePackageItem(index, "customPrice", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="如需自定義價格，請填寫"
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500">選填：若需要特別指定此項目的價格，請填寫</p>
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addPackageItem}>
              <Plus className="h-4 w-4 mr-2" />
              添加服務
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 