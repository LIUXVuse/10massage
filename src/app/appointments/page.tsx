"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format, addDays } from "date-fns";
import { zhTW, zhCN, enUS, ja } from "date-fns/locale";
import { ChevronRight, Calendar, Clock, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLanguage, LanguageType } from "@/context/language-context";
import { t } from "@/lib/translations";
import LanguageSwitcher from "@/components/language-switcher";

// 根據語言獲取日期本地化設置
const getDateLocale = (lang: LanguageType) => {
  switch (lang) {
    case "zh-TW": return zhTW;
    case "zh-CN": return zhCN;
    case "en": return enUS;
    case "ja": return ja;
    default: return zhTW;
  }
};

// 接口定義
interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durations: Array<{
    id: string;
    duration: number;
    price: number;
  }>;
}

interface Masseur {
  id: string;
  name: string;
  image: string | null;
  experience: number;
  description: string | null;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function AppointmentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  
  // 選擇狀態
  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [masseurs, setMasseurs] = useState<Masseur[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<{id: string, duration: number, price: number} | null>(null);
  const [selectedMasseur, setSelectedMasseur] = useState<Masseur | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 認證檢查
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callback=/appointments");
    }
  }, [status, router]);

  // 加載服務和按摩師資料
  useEffect(() => {
    if (status === "authenticated") {
      fetchServices();
    }
  }, [status]);

  // 獲取服務列表
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/services");
      const data = await response.json();
      
      // 只顯示啟用的服務
      const activeServices = data.filter((service: any) => service.isActive);
      setServices(activeServices);
      setIsLoading(false);
    } catch (error) {
      console.error(t("error.fetchServicesFailed", language), error);
      setIsLoading(false);
    }
  };

  // 獲取按摩師列表
  const fetchMasseurs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/masseurs?active=true");
      const data = await response.json();
      setMasseurs(data);
      setIsLoading(false);
    } catch (error) {
      console.error(t("error.fetchMasseursFailed", language), error);
      setIsLoading(false);
    }
  };

  // 當選擇服務後，獲取按摩師列表
  useEffect(() => {
    if (selectedService) {
      fetchMasseurs();
    }
  }, [selectedService]);

  // 生成時間槽
  useEffect(() => {
    if (selectedMasseur && selectedDate) {
      // 模擬時間槽，實際應從API獲取
      const slots = generateTimeSlots();
      setTimeSlots(slots);
    }
  }, [selectedMasseur, selectedDate]);

  // 生成虛擬時間槽
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const startHour = 10; // 從上午10點開始
    const endHour = 20;   // 到晚上8點結束
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const available = Math.random() > 0.3; // 70%的機率為可用
        slots.push({ time, available });
      }
    }
    
    return slots;
  };

  // 提交預約
  const handleSubmit = async () => {
    if (!selectedService || !selectedDuration || !selectedMasseur || !selectedDate || !selectedTime) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceDurationId: selectedDuration.id,
          masseurId: selectedMasseur.id,
          date: selectedDate,
          time: selectedTime,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("error.bookingFailed", language));
      }
      
      // 預約成功，導向成功頁面
      router.push("/appointments/success");
    } catch (error) {
      console.error(t("error.bookingFailed", language), error);
      setIsLoading(false);
    }
  };

  // 導航到下一步
  const goToNextStep = () => {
    setStep(step + 1);
  };

  // 導航到上一步
  const goToPreviousStep = () => {
    setStep(step - 1);
  };

  // 獲取所選時長的價格
  const getSelectedDurationPrice = () => {
    if (!selectedDuration) return 0;
    return selectedDuration.price;
  };

  // 格式化時長顯示
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}${t("time.minutes", language)}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}${t("time.hours", language)}${mins}${t("time.minutes", language)}` : `${hours}${t("time.hours", language)}`;
  };

  // 如果正在加載或未認證，顯示加載提示
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-amber-800">
          {t("appointment.title", language)}
        </h1>
        <LanguageSwitcher />
      </div>
      
      {/* 預約步驟指示器 */}
      <div className="flex items-center mb-8">
        <div 
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white",
            step >= 1 ? "bg-amber-600" : "bg-gray-300"
          )}
        >
          1
        </div>
        <div className={cn(
          "flex-1 h-1 mx-2",
          step >= 2 ? "bg-amber-600" : "bg-gray-300"
        )}></div>
        <div 
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white",
            step >= 2 ? "bg-amber-600" : "bg-gray-300"
          )}
        >
          2
        </div>
        <div className={cn(
          "flex-1 h-1 mx-2",
          step >= 3 ? "bg-amber-600" : "bg-gray-300"
        )}></div>
        <div 
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white",
            step >= 3 ? "bg-amber-600" : "bg-gray-300"
          )}
        >
          3
        </div>
        <div className={cn(
          "flex-1 h-1 mx-2",
          step >= 4 ? "bg-amber-600" : "bg-gray-300"
        )}></div>
        <div 
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white",
            step >= 4 ? "bg-amber-600" : "bg-gray-300"
          )}
        >
          4
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && t("appointment.selectService", language)}
            {step === 2 && t("appointment.selectMasseur", language)}
            {step === 3 && t("appointment.selectTime", language)}
            {step === 4 && t("appointment.confirm", language)}
          </CardTitle>
          <CardDescription>
            {step === 1 && t("appointment.selectServiceDesc", language)}
            {step === 2 && t("appointment.selectMasseurDesc", language)}
            {step === 3 && t("appointment.selectTimeDesc", language)}
            {step === 4 && t("appointment.confirmDesc", language)}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* 步驟內容... */}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              disabled={isLoading}
            >
              {t("appointment.previous", language)}
            </Button>
          ) : (
            <div></div>
          )}
          
          {step < 4 ? (
            <Button 
              onClick={goToNextStep}
              disabled={
                isLoading || 
                (step === 1 && (!selectedService || !selectedDuration)) ||
                (step === 2 && !selectedMasseur) ||
                (step === 3 && !selectedTime)
              }
              className="bg-amber-600 hover:bg-amber-700"
            >
              {t("appointment.next", language)}
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {t("appointment.confirm", language)}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 