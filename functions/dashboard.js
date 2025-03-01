// 後台儀表板頁面
export async function onRequest(context) {
  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>伊林SPA管理系統 - 儀表板</title>
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
              <a href="/dashboard" class="px-3 py-2 text-sm font-medium border-b-2 border-white">儀表板</a>
              <a href="/masseurs" class="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300">按摩師管理</a>
              <a href="/services" class="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300">服務項目</a>
              <a href="/appointments" class="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300">預約管理</a>
              <a href="/users" class="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300">用戶管理</a>
            </div>
          </div>
          <div class="flex items-center">
            <div class="ml-3 relative">
              <div class="flex items-center">
                <button id="userDropdown" class="flex items-center text-sm font-medium focus:outline-none">
                  <span id="userName" class="mr-2">管理員</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div id="userMenu" class="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div class="py-1">
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">個人資料</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">設定</a>
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
          <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">歡迎回來，<span id="welcomeUserName">管理員</span></h1>
          <p class="mt-1 text-gray-500">今天是 <span id="currentDate">2025年3月1日</span>，以下是系統概覽</p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <button class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新增預約
          </button>
        </div>
      </div>

      <!-- 統計卡片 -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- 今日預約卡片 -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">今日預約</dt>
                  <dd>
                    <div class="text-lg font-bold text-gray-900">8</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <a href="/appointments" class="font-medium text-indigo-600 hover:text-indigo-500">查看全部</a>
            </div>
          </div>
        </div>

        <!-- 本週預約 -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">本週預約</dt>
                  <dd>
                    <div class="text-lg font-bold text-gray-900">32</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <a href="/appointments" class="font-medium text-indigo-600 hover:text-indigo-500">查看全部</a>
            </div>
          </div>
        </div>

        <!-- 按摩師數量 -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-orange-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">按摩師數量</dt>
                  <dd>
                    <div class="text-lg font-bold text-gray-900">6</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <a href="/masseurs" class="font-medium text-indigo-600 hover:text-indigo-500">管理按摩師</a>
            </div>
          </div>
        </div>

        <!-- 服務項目 -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">服務項目</dt>
                  <dd>
                    <div class="text-lg font-bold text-gray-900">12</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <a href="/services" class="font-medium text-indigo-600 hover:text-indigo-500">管理服務</a>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近預約 -->
      <div class="mt-8">
        <h2 class="text-lg leading-6 font-medium text-gray-900 mb-4">最近預約</h2>
        <div class="flex flex-col">
          <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客戶</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">按摩師</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">服務項目</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期時間</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                      <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">操作</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">林小明</div>
                        <div class="text-sm text-gray-500">user1@example.com</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">王按摩師</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">全身放鬆按摩</div>
                        <div class="text-sm text-gray-500">60分鐘</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">2025-03-10</div>
                        <div class="text-sm text-gray-500">14:00</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">已確認</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" class="text-indigo-600 hover:text-indigo-900">詳情</a>
                      </td>
                    </tr>
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">張美美</div>
                        <div class="text-sm text-gray-500">user2@example.com</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">李按摩師</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">精油芳療按摩</div>
                        <div class="text-sm text-gray-500">90分鐘</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">2025-03-12</div>
                        <div class="text-sm text-gray-500">16:30</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">待確認</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" class="text-indigo-600 hover:text-indigo-900">詳情</a>
                      </td>
                    </tr>
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">王大華</div>
                        <div class="text-sm text-gray-500">user3@example.com</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">陳按摩師</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">深層組織按摩</div>
                        <div class="text-sm text-gray-500">90分鐘</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">2025-03-15</div>
                        <div class="text-sm text-gray-500">10:00</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">已確認</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" class="text-indigo-600 hover:text-indigo-900">詳情</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
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
    // 設置當前日期
    function setCurrentDate() {
      const now = new Date();
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      document.getElementById('currentDate').textContent = now.toLocaleDateString('zh-TW', options);
    }
    
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
        document.getElementById('welcomeUserName').textContent = user.name;
        
        // 檢查用戶角色
        if (user.role !== 'ADMIN') {
          // 如果不是管理員，跳轉到預約頁面
          window.location.href = '/booking';
        }
      } catch (error) {
        console.error('解析用戶信息錯誤:', error);
        // 登出用戶
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin';
      }
    }
    
    // 頁面初始化
    function init() {
      setCurrentDate();
      setupUserMenu();
      setupUserInfo();
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