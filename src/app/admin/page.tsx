import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireAdminServer } from "@/lib/auth/auth.server";
import {
  Users,
  Brush,
  CalendarPlus,
  Home,
  Wrench,
  Settings
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // 確保只有管理員可以訪問
  await requireAdminServer();
  
  // 管理選項
  const adminOptions = [
    {
      title: "首頁",
      description: "返回網站首頁",
      href: "/",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "用戶管理",
      description: "查看和管理系統用戶",
      href: "/admin/users",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "按摩師管理",
      description: "管理按摩師資料",
      href: "/admin/masseurs",
      icon: <Brush className="mr-2 h-4 w-4" />,
    },
    {
      title: "訂單管理",
      description: "查看和管理用戶預約",
      href: "/admin/orders",
      icon: <CalendarPlus className="mr-2 h-4 w-4" />,
    },
    {
      title: "系統修復",
      description: "修復系統問題",
      href: "/admin/repair",
      icon: <Wrench className="mr-2 h-4 w-4" />,
    },
    {
      title: "系統設置",
      description: "配置系統參數",
      href: "/admin/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">後台管理</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminOptions.map((option, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                {option.icon}
                {option.title}
              </CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={option.href}>
                  前往{option.title}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 