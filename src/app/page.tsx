export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">伊林SPA預約系統</h1>
      <p className="text-xl mb-8">歡迎使用我們的線上預約平台</p>
      <div className="flex gap-4">
        <a 
          href="/login" 
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          登入系統
        </a>
        <a 
          href="/register" 
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          註冊帳號
        </a>
      </div>
    </main>
  );
} 