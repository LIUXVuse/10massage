"use client";

import { useLanguage, LanguageType } from "@/context/language-context";
import { t } from "@/lib/translations";
import { useState, useEffect } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // 避免水合錯誤
  useEffect(() => {
    setMounted(true);
  }, []);

  // 語言選項
  const languages: { code: LanguageType; icon: string }[] = [
    { code: "zh-TW", icon: "🇹🇼" },
    { code: "zh-CN", icon: "🇨🇳" },
    { code: "en", icon: "🇺🇸" },
    { code: "ja", icon: "🇯🇵" },
  ];

  // 獲取當前語言的圖標
  const getCurrentLanguageIcon = () => {
    const lang = languages.find((l) => l.code === language);
    return lang ? lang.icon : "🇹🇼";
  };

  const handleLanguageChange = (lang: LanguageType) => {
    setLanguage(lang);
  };

  // 如果還沒有掛載，返回null以避免水合錯誤
  if (!mounted) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-fit gap-1 px-2 sm:gap-2 sm:px-4"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {t("language.select", language)}
          </span>
          <span className="inline-block sm:pl-1">{getCurrentLanguageIcon()}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="space-y-1">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 font-normal",
                language === lang.code && "bg-amber-50 font-medium text-amber-800"
              )}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span>{lang.icon}</span>
              <span>{t(`language.${lang.code === "zh-TW" ? "zhTW" : lang.code === "zh-CN" ? "zhCN" : lang.code}`, language)}</span>
              {language === lang.code && (
                <Check className="ml-auto h-4 w-4 text-amber-800" />
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
} 