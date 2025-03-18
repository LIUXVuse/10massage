export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* 頂部背景圖區域 */}
      <div className="h-[60vh] bg-[url('/images/hero-bg.jpg')] bg-cover bg-center flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">伊林SPA專業按摩預約系統</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            體驗專業的泰式與中式按摩，為您的身心帶來舒適與放鬆
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/login" 
              className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition duration-300 text-lg font-semibold"
            >
              立即登入
            </a>
            <a 
              href="/register" 
              className="px-8 py-3 bg-white text-amber-800 hover:bg-gray-100 rounded-md transition duration-300 text-lg font-semibold"
            >
              註冊帳號
            </a>
          </div>
        </div>
      </div>

      {/* 服務特色部分 */}
      <div className="py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-amber-800">我們的特色服務</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-amber-600 text-4xl mb-4">🧘</div>
              <h3 className="text-xl font-semibold mb-3 text-amber-800">傳統泰式按摩</h3>
              <p className="text-gray-600">結合瑜伽拉伸和穴位按壓的傳統泰式按摩，緩解肌肉緊張，增強身體柔韌性。</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-amber-600 text-4xl mb-4">👐</div>
              <h3 className="text-xl font-semibold mb-3 text-amber-800">精油SPA按摩</h3>
              <p className="text-gray-600">使用優質精油的全身按摩，促進血液循環，帶來深度放鬆和舒緩體驗。</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-amber-600 text-4xl mb-4">🦶</div>
              <h3 className="text-xl font-semibold mb-3 text-amber-800">足部反射按摩</h3>
              <p className="text-gray-600">專業足部反射區按摩，刺激身體各部位的反射點，促進整體健康。</p>
            </div>
          </div>
        </div>
      </div>

      {/* 關於我們部分 */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="/images/about-spa.jpg" 
                alt="伊林SPA環境" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-amber-800">關於伊林SPA</h2>
              <p className="text-gray-700 mb-4">
                伊林SPA創立於2023年，專注於提供高品質的泰式、中式按摩服務。我們的按摩師均經過嚴格培訓和認證，擁有多年專業經驗。
              </p>
              <p className="text-gray-700 mb-4">
                我們注重每一位顧客的獨特需求，提供個性化的按摩服務方案，讓您在舒適的環境中享受專業的按摩體驗。
              </p>
              <p className="text-gray-700">
                伊林SPA的使命是通過專業的按摩服務，幫助客戶緩解日常壓力，改善身體狀況，提升生活品質。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 聯絡資訊部分 */}
      <div className="py-12 bg-amber-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold mb-6">聯絡我們預約</h2>
          <p className="mb-2">地址：大里區樹王路439巷38號</p>
          <p className="mb-2 text-yellow-300 font-bold">⚠️一定要導航439巷⚠️</p>
          <p className="mb-2">Line ID：@10spa</p>
          <p>營業時間：10點-24點</p>
        </div>
      </div>
    </main>
  );
} 