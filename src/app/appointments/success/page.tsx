"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function AppointmentSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  // 10秒後自動返回首頁
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle size={80} className="text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-6 text-gray-800">預約成功!</h1>
        
        <div className="text-gray-600 space-y-4 mb-8">
          <p className="text-lg">
            您的伊林SPA按摩預約已成功提交。我們期待為您提供優質的服務體驗。
          </p>
          
          <p>
            預約確認簡訊已發送至您的手機，請注意查收。
          </p>
          
          <p className="font-medium text-amber-600">
            如需修改或取消預約，請提前2小時聯繫我們。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <Button asChild variant="outline">
            <Link href="/appointments">繼續預約</Link>
          </Button>
          
          <Button asChild>
            <Link href="/">返回首頁</Link>
          </Button>
        </div>
        
        <p className="text-sm text-gray-500">
          頁面將在{countdown}秒後自動跳轉至首頁...
        </p>
      </div>
    </div>
  );
} 