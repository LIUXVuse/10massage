"use client";

import { useEffect, useState } from "react";
import { ServiceForm } from "@/components/services/service-form";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/auth-utils";

interface Service {
  id: string;
  name: string;
  description: string;
  type: "SINGLE" | "COMBO";
  category: "MASSAGE" | "CARE" | "TREATMENT";
  isRecommended: boolean;
  recommendOrder: number;
  durations: Array<{
    id: string;
    duration: number;
    price: number;
  }>;
  masseurs: Array<{
    masseur: {
      id: string;
      name: string;
    };
  }>;
}

interface Masseur {
  id: string;
  name: string;
}

const categoryLabels = {
  MASSAGE: "按摩",
  CARE: "護理",
  TREATMENT: "療程",
};

const categoryColors = {
  MASSAGE: "bg-blue-100 text-blue-800",
  CARE: "bg-green-100 text-green-800",
  TREATMENT: "bg-purple-100 text-purple-800",
};

export default function ServicesPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })

  // 使用統一的權限檢查函數
  console.log("SESSION DATA:", session);
  const userIsAdmin = isAdmin(session);
  console.log("IS ADMIN:", userIsAdmin, "ROLE:", session?.user?.role);

  const [services, setServices] = useState<Service[]>([]);
  const [masseurs, setMasseurs] = useState<Masseur[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    fetchServices();
    fetchMasseurs();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchMasseurs = async () => {
    try {
      const response = await fetch("/api/masseurs");
      if (!response.ok) throw new Error("Failed to fetch masseurs");
      const data = await response.json();
      setMasseurs(data);
    } catch (error) {
      console.error("Error fetching masseurs:", error);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const url = selectedService
        ? `/api/services/${selectedService.id}`
        : "/api/services";
      const method = selectedService ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save service");

      setIsEditing(false);
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!userIsAdmin) return; // 非管理員不能刪除
    if (!confirm("確定要刪除這個服務嗎？")) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete service");
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleEdit = (service: Service) => {
    if (!userIsAdmin) return; // 非管理員不能編輯
    setSelectedService(service);
    setIsEditing(true);
  };

  const filteredServices = selectedCategory === "ALL"
    ? services
    : selectedCategory === "RECOMMENDED"
    ? services.filter(service => service.isRecommended)
    : services.filter(service => service.category === selectedCategory);

  const sortedServices = [...filteredServices].sort((a, b) => {
    if (a.isRecommended && b.isRecommended) {
      return a.recommendOrder - b.recommendOrder;
    }
    if (a.isRecommended) return -1;
    if (b.isRecommended) return 1;
    return 0;
  });

  if (isEditing) {
    const initialData = selectedService
      ? {
          ...selectedService,
          masseurs: selectedService.masseurs.map((m) => ({
            id: m.masseur.id,
          })),
        }
      : undefined;

    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {selectedService ? "編輯服務" : "新增服務"}
          </h1>
          <Button variant="outline" onClick={() => {
            setIsEditing(false);
            setSelectedService(null);
          }}>
            返回
          </Button>
        </div>
        <ServiceForm
          initialData={initialData}
          masseurs={masseurs}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">服務列表</h1>
        {userIsAdmin && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="mr-2 h-4 w-4" /> 新增服務
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === "ALL" ? "default" : "outline"}
          onClick={() => setSelectedCategory("ALL")}
        >
          全部
        </Button>
        <Button
          variant={selectedCategory === "RECOMMENDED" ? "default" : "outline"}
          onClick={() => setSelectedCategory("RECOMMENDED")}
        >
          推薦服務
        </Button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? "default" : "outline"}
            onClick={() => setSelectedCategory(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedServices.map((service) => (
          <div
            key={service.id}
            className="border rounded-lg p-6 space-y-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">{service.name}</h2>
                  {service.isRecommended && (
                    <Badge variant="secondary">推薦</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{service.type === "SINGLE" ? "單人服務" : "組合服務"}</Badge>
                  <Badge className={categoryColors[service.category]}>
                    {categoryLabels[service.category]}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                {userIsAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-600">{service.description}</p>

            <div className="space-y-2">
              <h3 className="font-medium">服務時長與價格：</h3>
              {service.durations.map((duration) => (
                <div
                  key={duration.id}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>{duration.duration} 分鐘</span>
                  <span>${duration.price}</span>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-medium mb-2">提供按摩師：</h3>
              <div className="flex flex-wrap gap-2">
                {service.masseurs.map((m) => (
                  <span
                    key={m.masseur.id}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {m.masseur.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 