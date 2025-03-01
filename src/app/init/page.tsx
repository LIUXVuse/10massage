"use client";

import { useState } from "react";
import Link from "next/link";

export default function InitializationPage() {
  const [testAccountsResult, setTestAccountsResult] = useState<any>(null);
  const [masseursResult, setMasseursResult] = useState<any>(null);
  const [loading, setLoading] = useState({
    accounts: false,
    masseurs: false
  });
  const [error, setError] = useState({
    accounts: null,
    masseurs: null
  });

  const initTestAccounts = async () => {
    try {
      setLoading(prev => ({ ...prev, accounts: true }));
      setError(prev => ({ ...prev, accounts: null }));
      
      const response = await fetch('/api/admin/init-test-accounts');
      if (!response.ok) {
        throw new Error(`初始化測試帳號失敗: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setTestAccountsResult(data);
    } catch (err: any) {
      console.error("初始化測試帳號錯誤:", err);
      setError(prev => ({ ...prev, accounts: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, accounts: false }));
    }
  };

  const initMasseurs = async () => {
    try {
      setLoading(prev => ({ ...prev, masseurs: true }));
      setError(prev => ({ ...prev, masseurs: null }));
      
      const response = await fetch('/api/admin/init-masseurs');
      if (!response.ok) {
        throw new Error(`初始化按摩師數據失敗: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setMasseursResult(data);
    } catch (err: any) {
      console.error("初始化按摩師數據錯誤:", err);
      setError(prev => ({ ...prev, masseurs: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, masseurs: false }));
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">系統初始化工具</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* 測試帳號初始化 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">測試帳號初始化</h2>
          <p className="text-gray-600 mb-4">
            創建系統所需的測試帳號，包括管理員、按摩師和一般用戶。
          </p>
          
          <button 
            onClick={initTestAccounts} 
            disabled={loading.accounts}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading.accounts ? "初始化中..." : "初始化測試帳號"}
          </button>
          
          {error.accounts && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error.accounts}
            </div>
          )}
          
          {testAccountsResult && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">初始化結果:</h3>
              <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                <pre className="text-sm">{JSON.stringify(testAccountsResult, null, 2)}</pre>
              </div>
              
              {testAccountsResult.success && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                  <p className="font-medium">測試帳號已創建!</p>
                  <p className="mt-1">您可以使用以下帳號登入:</p>
                  <ul className="mt-2 list-disc list-inside">
                    <li>管理員: admin@example.com / password123</li>
                    <li>按摩師: masseur@example.com / password123</li>
                    <li>用戶: user@example.com / password123</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 按摩師數據初始化 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">按摩師數據初始化</h2>
          <p className="text-gray-600 mb-4">
            創建系統所需的示範按摩師數據，包括基本資料和圖片。
          </p>
          
          <button 
            onClick={initMasseurs} 
            disabled={loading.masseurs}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            {loading.masseurs ? "初始化中..." : "初始化按摩師數據"}
          </button>
          
          {error.masseurs && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error.masseurs}
            </div>
          )}
          
          {masseursResult && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">初始化結果:</h3>
              <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                <pre className="text-sm">{JSON.stringify(masseursResult, null, 2)}</pre>
              </div>
              
              {masseursResult.success && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                  <p>按摩師數據已成功初始化!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/login" className="text-blue-600 hover:underline">
          返回登入頁面
        </Link>
      </div>
    </div>
  );
} 