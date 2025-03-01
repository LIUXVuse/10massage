// 預約頁面
export async function onRequest(context) {
  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>伊林SPA管理系統 - 預約服務</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Noto Sans TC', sans-serif;
      background-color: #f9fafb;
    }
  </style>
</head>
<body class="bg-gray-100">
  <div class="min-h-screen flex flex-col">
    <!-- 頂部導航欄 -->
    <nav class="bg-indigo-600 text-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="text-xl font-bold">伊林SPA</span>
            </div>
            <div class="hidden md:ml-6 md:flex md:space-x-8">
              <a href="/booking" class="px-3 py-2 text-sm font-medium border-b-2 border-white">預約服務</a>
              <a href="/mybookings" class="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300">我的預約</a>
              <a href="/profile" class="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300">個人資料</a>
            </div>
          </div>
          <div class="flex items-center">
            <div class="ml-3 relative">
              <div class="flex items-center">
                <button id="userDropdown" class="flex items-center text-sm font-medium focus:outline-none">
                  <span id="userName" class="mr-2">用戶名稱</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div id="userMenu" class="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div class="py-1">
                  <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">個人資料</a>
                  <a href="#" id="logoutBtn" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">登出</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主內容區 -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="md:flex md:items-center md:justify-between mb-8">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">預約服務</h1>
          <p class="mt-1 text-gray-500">選擇您想要的服務和按摩師，輕鬆預約按摩療程</p>
        </div>
      </div>

      <!-- 預約流程 -->
      <div class="mb-8">
        <div class="relative">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-between">
            <div class="px-2 bg-gray-100">
              <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white">1</span>
              <span class="ml-2 text-sm font-medium text-gray-900">選擇服務</span>
            </div>
            <div class="px-2 bg-gray-100">
              <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-300 text-white">2</span>
              <span class="ml-2 text-sm font-medium text-gray-500">選擇按摩師</span>
            </div>
            <div class="px-2 bg-gray-100">
              <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-300 text-white">3</span>
              <span class="ml-2 text-sm font-medium text-gray-500">選擇時間</span>
            </div>
            <div class="px-2 bg-gray-100">
              <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-300 text-white">4</span>
              <span class="ml-2 text-sm font-medium text-gray-500">完成預約</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 服務選擇 -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6">
          <h2 class="text-lg leading-6 font-medium text-gray-900">選擇您的服務</h2>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">請選擇您想要預約的服務項目</p>
        </div>
        <div class="border-t border-gray-200">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
            <!-- 服務卡片 1 -->
            <div class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 cursor-pointer service-card" data-id="1" data-name="全身放鬆按摩" data-price="2000" data-duration="60">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">全身放鬆按摩</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  熱門
                </span>
              </div>
              <p class="text-sm text-gray-500 mb-4">專業全身按摩，幫助舒緩疲勞和壓力，讓您全身放鬆。</p>
              <div class="flex justify-between items-center">
                <p class="text-sm font-medium text-indigo-600">60分鐘</p>
                <p class="text-base font-bold text-gray-900">NT$2,000</p>
              </div>
              <div class="absolute top-2 right-2 selected-icon hidden">
                <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <!-- 服務卡片 2 -->
            <div class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 cursor-pointer service-card" data-id="2" data-name="精油芳療按摩" data-price="2500" data-duration="90">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">精油芳療按摩</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  推薦
                </span>
              </div>
              <p class="text-sm text-gray-500 mb-4">使用高品質精油，結合專業按摩技術，提供深層放鬆體驗。</p>
              <div class="flex justify-between items-center">
                <p class="text-sm font-medium text-indigo-600">90分鐘</p>
                <p class="text-base font-bold text-gray-900">NT$2,500</p>
              </div>
              <div class="absolute top-2 right-2 selected-icon hidden">
                <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <!-- 服務卡片 3 -->
            <div class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 cursor-pointer service-card" data-id="3" data-name="深層組織按摩" data-price="2800" data-duration="90">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">深層組織按摩</h3>
              </div>
              <p class="text-sm text-gray-500 mb-4">針對深層肌肉和筋膜，幫助釋放長期緊張和疼痛。</p>
              <div class="flex justify-between items-center">
                <p class="text-sm font-medium text-indigo-600">90分鐘</p>
                <p class="text-base font-bold text-gray-900">NT$2,800</p>
              </div>
              <div class="absolute top-2 right-2 selected-icon hidden">
                <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下一步按鈕 -->
      <div class="mt-8 flex justify-end">
        <button id="nextStepBtn" disabled class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed">
          下一步：選擇按摩師
          <svg class="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </main>

    <!-- 頁腳 -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">© 2025 伊林SPA預約系統. 版權所有.</p>
      </div>
    </footer>
  </div>

  <script>
    // 用戶菜單控制
    function setupUserMenu() {
      const userDropdown = document.getElementById('userDropdown');
      const userMenu = document.getElementById('userMenu');
      
      // 顯示/隱藏下拉菜單
      userDropdown.addEventListener('click', function() {
        userMenu.classList.toggle('hidden');
      });
      
      // 點擊其他區域關閉菜單
      document.addEventListener('click', function(event) {
        if (!userDropdown.contains(event.target) && !userMenu.contains(event.target)) {
          userMenu.classList.add('hidden');
        }
      });
      
      // 登出按鈕
      document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        
        // 清除本地存儲
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 跳轉到登入頁面
        window.location.href = '/admin';
      });
    }
    
    // 設置用戶信息
    function setupUserInfo() {
      // 從本地存儲中獲取用戶信息
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        // 如果沒有登入，跳轉到登入頁面
        window.location.href = '/admin';
        return;
      }
      
      try {
        const user = JSON.parse(userStr);
        
        // 更新用戶名
        document.getElementById('userName').textContent = user.name;
        
        // 如果是管理員，跳轉到儀表板
        if (user.role === 'ADMIN') {
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('解析用戶信息錯誤:', error);
        // 登出用戶
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin';
      }
    }
    
    // 服務選擇功能
    function setupServiceSelection() {
      const serviceCards = document.querySelectorAll('.service-card');
      const nextStepBtn = document.getElementById('nextStepBtn');
      let selectedService = null;
      
      serviceCards.forEach(card => {
        card.addEventListener('click', function() {
          // 取消之前的選擇
          if (selectedService) {
            selectedService.classList.remove('ring-2', 'ring-indigo-500', 'border-indigo-500');
            selectedService.querySelector('.selected-icon').classList.add('hidden');
          }
          
          // 選擇當前服務
          this.classList.add('ring-2', 'ring-indigo-500', 'border-indigo-500');
          this.querySelector('.selected-icon').classList.remove('hidden');
          selectedService = this;
          
          // 啟用下一步按鈕
          nextStepBtn.disabled = false;
          nextStepBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
          nextStepBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
          
          // 儲存選擇的服務資訊
          const serviceId = this.getAttribute('data-id');
          const serviceName = this.getAttribute('data-name');
          const servicePrice = this.getAttribute('data-price');
          const serviceDuration = this.getAttribute('data-duration');
          
          localStorage.setItem('selectedService', JSON.stringify({
            id: serviceId,
            name: serviceName,
            price: servicePrice,
            duration: serviceDuration
          }));
        });
      });
      
      // 下一步按鈕點擊
      nextStepBtn.addEventListener('click', function() {
        if (!this.disabled) {
          // 跳轉到選擇按摩師頁面
          window.location.href = '/select-masseur';
        }
      });
    }
    
    // 頁面初始化
    function init() {
      setupUserMenu();
      setupUserInfo();
      setupServiceSelection();
    }
    
    // 頁面加載完成後執行初始化
    document.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
    },
  });
} 