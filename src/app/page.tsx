export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* 顶部背景图区域 */}
      <div className="h-[60vh] bg-[url('/images/hero-bg.jpg')] bg-cover bg-center flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">伊林SPA专业按摩预约系统</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            体验专业的泰式与中式按摩，为您的身心带来舒适与放松
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/login" 
              className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition duration-300 text-lg font-semibold"
            >
              立即登录
            </a>
            <a 
              href="/register" 
              className="px-8 py-3 bg-white text-amber-800 hover:bg-gray-100 rounded-md transition duration-300 text-lg font-semibold"
            >
              注册账号
            </a>
          </div>
        </div>
      </div>

      {/* 服务特色部分 */}
      <div className="py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-amber-800">我们的特色服务</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-amber-600 text-4xl mb-4">🧘</div>
              <h3 className="text-xl font-semibold mb-3 text-amber-800">传统泰式按摩</h3>
              <p className="text-gray-600">结合瑜伽拉伸和穴位按压的传统泰式按摩，缓解肌肉紧张，增强身体柔韧性。</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-amber-600 text-4xl mb-4">👐</div>
              <h3 className="text-xl font-semibold mb-3 text-amber-800">精油SPA按摩</h3>
              <p className="text-gray-600">使用优质精油的全身按摩，促进血液循环，带来深度放松和舒缓体验。</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-amber-600 text-4xl mb-4">🦶</div>
              <h3 className="text-xl font-semibold mb-3 text-amber-800">足部反射按摩</h3>
              <p className="text-gray-600">专业足部反射区按摩，刺激身体各部位的反射点，促进整体健康。</p>
            </div>
          </div>
        </div>
      </div>

      {/* 关于我们部分 */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="/images/about-spa.jpg" 
                alt="伊林SPA环境" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-amber-800">关于伊林SPA</h2>
              <p className="text-gray-700 mb-4">
                伊林SPA创立于2023年，专注于提供高品质的泰式、中式按摩服务。我们的按摩师均经过严格培训和认证，拥有多年专业经验。
              </p>
              <p className="text-gray-700 mb-4">
                我们注重每一位顾客的独特需求，提供个性化的按摩服务方案，让您在舒适的环境中享受专业的按摩体验。
              </p>
              <p className="text-gray-700">
                伊林SPA的使命是通过专业的按摩服务，帮助客户缓解日常压力，改善身体状况，提升生活品质。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 联系信息部分 */}
      <div className="py-12 bg-amber-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold mb-6">联系我们预约</h2>
          <p className="mb-2">地址: 台北市信义区松高路88号</p>
          <p className="mb-2">电话: (02) 2345-6789</p>
          <p>营业时间: 每日 10:00 - 22:00</p>
        </div>
      </div>
    </main>
  );
} 