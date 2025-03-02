"use client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// 附加選項類型
export interface AddonOption {
  id?: string;
  name: string;
  description?: string;
  price: number;
  isRequired: boolean;
}

interface ServiceAddonOptionsProps {
  addonOptions: AddonOption[];
  onChange: (addonOptions: AddonOption[]) => void;
}

export function ServiceAddonOptions({ addonOptions, onChange }: ServiceAddonOptionsProps) {
  // 添加新的附加選項
  const addAddonOption = () => {
    onChange([...addonOptions, { name: "", price: 0, isRequired: false }]);
  };

  // 刪除附加選項
  const removeAddonOption = (index: number) => {
    const newOptions = [...addonOptions];
    newOptions.splice(index, 1);
    onChange(newOptions);
  };

  // 更新附加選項
  const updateAddonOption = (index: number, field: keyof AddonOption, value: any) => {
    const newOptions = [...addonOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange(newOptions);
  };

  return (
    <Card className="border rounded-lg p-4 mb-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-semibold">附加選項</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="space-y-6">
          {addonOptions.length === 0 && (
            <div className="text-sm text-gray-500 mb-2">
              目前沒有附加選項。點擊下方按鈕添加選項。
            </div>
          )}

          {addonOptions.map((option, index) => (
            <div key={index} className="space-y-4 border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <Label>選項名稱</Label>
                  <Input
                    value={option.name}
                    onChange={(e) => updateAddonOption(index, "name", e.target.value)}
                    placeholder="例如：鼻毛、手指頭等"
                    className="mb-2"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAddonOption(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label>價格 (NT$)</Label>
                <Input
                  type="number"
                  value={option.price}
                  onChange={(e) => updateAddonOption(index, "price", Number(e.target.value))}
                  placeholder="例如：200"
                  className="mb-2"
                />
              </div>

              <div>
                <Label>選項描述 (選填)</Label>
                <Textarea
                  value={option.description || ""}
                  onChange={(e) => updateAddonOption(index, "description", e.target.value)}
                  placeholder="選項描述..."
                  className="mb-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={option.isRequired}
                  onCheckedChange={(checked) => updateAddonOption(index, "isRequired", checked)}
                  id={`required-${index}`}
                />
                <Label htmlFor={`required-${index}`}>必選項</Label>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addAddonOption}>
            <Plus className="h-4 w-4 mr-2" />
            添加附加選項
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 