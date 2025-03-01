export default function StaticPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-3xl w-full mx-auto p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          十步按摩預約系統
        </h1>
        
        <p className="text-xl text-gray-700 mb-6 text-center">
          歡迎使用伊林SPA的線上預約平台
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">專業服務</h2>
            <p className="text-gray-600">
              我們提供多種專業按摩服務，包括舒壓按摩、深層組織按摩、芳香療法按摩等，
              由經驗豐富的按摩師為您提供一流的服務體驗。
            </p>
          </div>
          
          <div className="p-6 bg-indigo-50 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">便捷預約</h2>
            <p className="text-gray-600">
              透過我們的線上預約系統，您可以隨時隨地查看可用時段、選擇喜愛的按摩師，
              並輕鬆完成預約，享受無縫的預約體驗。
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a href="/" className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center">
            返回首頁
          </a>
          <a href="/login" className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-center">
            立即登入
          </a>
        </div>
      </div>
    </div>
  )
} 