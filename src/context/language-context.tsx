"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 定義支援的語言
export type LanguageType = 'zh-TW' | 'zh-CN' | 'en' | 'ja';

// 語言設置的上下文類型
interface LanguageContextType {
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;
}

// 創建語言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 語言提供者組件的屬性
interface LanguageProviderProps {
  children: ReactNode;
}

// 語言提供者組件
export function LanguageProvider({ children }: LanguageProviderProps) {
  // 默認使用繁體中文，並檢查本地存儲
  const [language, setLanguageState] = useState<LanguageType>('zh-TW');

  // 初始化時從本地存儲加載語言設置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as LanguageType;
    if (savedLanguage && ['zh-TW', 'zh-CN', 'en', 'ja'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // 設置語言並保存到本地存儲
  const setLanguage = (newLanguage: LanguageType) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement.lang = newLanguage;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 使用語言的鉤子
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage 必須在 LanguageProvider 內部使用');
  }
  return context;
}; 