"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// 定义服务项目接口
interface Service {
  id: string;
  name: string;
  description: string;
  type: "SINGLE" | "COMBO";
  category: "MASSAGE" | "CARE" | "TREATMENT";
  isActive: boolean;
  isRecommend: boolean;
  isFlashSale: boolean;
  flashSaleNote?: string;
  isLimitedTime: boolean;
  limitedStartDate?: string;
  limitedEndDate?: string;
  limitedSpecialPrice?: number;
  limitedDiscountPercent?: number;
  limitedNote?: string;
  durations: Array<{
    id: string;
    duration: number;
    price: number;
  }>;
}

// 获取类别名称
const getCategoryName = (category: string) => {
  const categories: Record<string, string> = {
    MASSAGE: "按摩",
    CARE: "护理",
    TREATMENT: "疗程"
  };
  return categories[category] || category;
};

// 获取服务类型名称
const getServiceTypeName = (type: string) => {
  const types: Record<string, string> = {
    SINGLE: "单项服务",
    COMBO: "套餐组合"
  };
  return types[type] || type;
};

// 格式化时长（分钟转为小时和分钟）
const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};

// 格式化价格
const formatPrice = (price: number) => {
  return `¥${price.toFixed(0)}`;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      
      // 只显示活跃的服务
      const activeServices = data.filter((service: Service) => service.isActive);
      
      // 按推荐和类别排序
      activeServices.sort((a: Service, b: Service) => {
        // 先按推荐排序
        if (a.isRecommend && !b.isRecommend) return -1;
        if (!a.isRecommend && b.isRecommend) return 1;
        
        // 再按类别排序
        return a.category.localeCompare(b.category);
      });
      
      setServices(activeServices);
      
      // 提取所有类别
      const uniqueCategories = Array.from(
        new Set(activeServices.map((service: Service) => service.category))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("获取服务数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤服务
  const filteredServices = services.filter(service => 
    activeCategory === "ALL" || service.category === activeCategory
  );

  // 判断是否有优惠价格
  const hasDiscountPrice = (service: Service) => {
    return service.isLimitedTime && (
      (service.limitedSpecialPrice !== undefined && service.limitedSpecialPrice > 0) ||
      (service.limitedDiscountPercent !== undefined && service.limitedDiscountPercent > 0)
    );
  };

  // 计算折扣价格
  const getDiscountPrice = (originalPrice: number, service: Service) => {
    if (!service.isLimitedTime) return originalPrice;
    
    if (service.limitedSpecialPrice !== undefined && service.limitedSpecialPrice > 0) {
      return service.limitedSpecialPrice;
    }
    
    if (service.limitedDiscountPercent !== undefined && service.limitedDiscountPercent > 0) {
      return originalPrice * (1 - service.limitedDiscountPercent / 100);
    }
    
    return originalPrice;
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6 text-amber-800 text-center">我们的服务项目</h1>
      <p className="text-gray-600 max-w-3xl mx-auto text-center mb-10">
        伊林SPA提供多种专业按摩和护理服务，满足您的各种需求。从传统泰式按摩到精油SPA，我们的服务项目丰富多样。
      </p>

      {/* 类别筛选 */}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setActiveCategory("ALL")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === "ALL"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-800 hover:bg-amber-100"
          }`}
        >
          全部
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            {getCategoryName(category)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">暂无服务项目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div 
              key={service.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border border-amber-100 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-amber-800">{service.name}</h2>
                  <div className="flex flex-wrap gap-2">
                    {service.isRecommend && (
                      <Badge className="bg-amber-600">推荐</Badge>
                    )}
                    {service.isFlashSale && (
                      <Badge className="bg-rose-600 gap-1">
                        <Zap size={14} />
                        限时特惠
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">{service.description}</p>
                
                <div className="mb-3">
                  <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                    {getCategoryName(service.category)}
                  </span>
                  <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full ml-2">
                    {getServiceTypeName(service.type)}
                  </span>
                </div>
                
                {service.durations && service.durations.length > 0 && (
                  <div className="space-y-3 mt-4 border-t pt-4">
                    {service.durations.map((duration) => (
                      <div key={duration.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Clock size={16} className="text-amber-600 mr-2" />
                          <span className="text-gray-700">{formatDuration(duration.duration)}</span>
                        </div>
                        <div className="text-right">
                          {hasDiscountPrice(service) ? (
                            <>
                              <span className="text-gray-400 line-through text-sm mr-2">
                                {formatPrice(duration.price)}
                              </span>
                              <span className="text-rose-600 font-bold">
                                {formatPrice(getDiscountPrice(duration.price, service))}
                              </span>
                            </>
                          ) : (
                            <span className="text-amber-800 font-bold">
                              {formatPrice(duration.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-5">
                  <Link 
                    href={`/appointments?service=${service.id}`}
                    className="block w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white text-center rounded-md transition-colors"
                  >
                    立即预约
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 