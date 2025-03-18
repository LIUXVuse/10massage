"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

// 定义按摩师接口
interface Masseur {
  id: string;
  name: string;
  description: string;
  image?: string;
  imageScale?: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  experience?: number;
  isActive: boolean;
  services: Array<{
    id: string;
    name: string;
  }>;
}

export default function MasseursPage() {
  const [masseurs, setMasseurs] = useState<Masseur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasseurs();
  }, []);

  const fetchMasseurs = async () => {
    try {
      const response = await fetch("/api/masseurs");
      const data = await response.json();
      
      // 只显示活跃的按摩师
      const activeMasseurs = data.filter((masseur: Masseur) => masseur.isActive);
      
      // 根据sortOrder排序
      activeMasseurs.sort((a: any, b: any) => (a.sortOrder || 999) - (b.sortOrder || 999));
      
      setMasseurs(activeMasseurs);
    } catch (error) {
      console.error("获取按摩师数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取按摩师图片URL
  const getMasseurImageUrl = (masseur: Masseur) => {
    if (!masseur.image) return "/images/default-avatar.jpg";
    return masseur.image;
  };

  // 获取图片样式，包括裁剪和缩放
  const getImageStyle = (masseur: Masseur) => {
    const style: React.CSSProperties = {};
    
    if (masseur.imageScale) {
      style.transform = `scale(${masseur.imageScale})`;
    }
    
    if (masseur.cropX !== undefined && masseur.cropY !== undefined) {
      style.objectPosition = `${masseur.cropX}px ${masseur.cropY}px`;
    }
    
    return style;
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8 text-amber-800 text-center">我们的专业按摩师团队</h1>
      <p className="text-gray-600 max-w-3xl mx-auto text-center mb-12">
        伊林SPA的按摩师团队拥有多年丰富经验，接受过专业训练，致力于为您提供高品质的按摩体验。
      </p>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : masseurs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">暂无按摩师信息</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {masseurs.map((masseur) => (
            <div key={masseur.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={getMasseurImageUrl(masseur)}
                  alt={masseur.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={getImageStyle(masseur)}
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-amber-800">{masseur.name}</h2>
                <p className="text-gray-600 mb-4 text-sm line-clamp-3">{masseur.description}</p>
                
                {masseur.services && masseur.services.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2 text-gray-700">擅长项目:</h3>
                    <div className="flex flex-wrap gap-2">
                      {masseur.services.map((service) => (
                        <span 
                          key={service.id} 
                          className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md"
                        >
                          {service.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <Link 
                    href={`/appointments?masseur=${masseur.id}`}
                    className="block w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white text-center rounded-md transition-colors"
                  >
                    预约此按摩师
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