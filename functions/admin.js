// 後台管理入口頁面
export async function onRequest(context) {
  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>伊林SPA管理系統</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Noto Sans TC', sans-serif;
      background-color: #f9fafb;
    }
    .login-gradient {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
    }
  </style>
</head>
<body class="flex min-h-screen">
  <!-- 左側登入區塊 -->
  <div class="hidden lg:flex login-gradient w-1/2 p-12 text-white flex-col justify-between">
    <div>
      <h1 class="text-3xl font-bold mb-6">伊林SPA按摩預約系統</h1>
      <p class="text-lg opacity-90 mb-8">為您提供最優質的預約管理體驗</p>
      
      <div class="space-y-6">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 bg-white bg-opacity-20 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-xl">安全可靠</h3>
            <p class="opacity-80 mt-1">使用最新的安全技術保護您的數據</p>
          </div>
        </div>
        
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 bg-white bg-opacity-20 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-xl">效率優先</h3>
            <p class="opacity-80 mt-1">節省管理時間，提高工作效率</p>
          </div>
        </div>
        
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 bg-white bg-opacity-20 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-xl">數據分析</h3>
            <p class="opacity-80 mt-1">提供完整預約數據和分析報表</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="text-sm opacity-75">
      &copy; 2025 伊林SPA預約系統. 版權所有
    </div>
  </div>
  
  <!-- 右側登入表單 -->
  <div class="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24">
    <div class="lg:hidden mb-10">
      <h1 class="text-3xl font-bold text-indigo-600 mb-6">伊林SPA按摩預約系統</h1>
      <p class="text-gray-600">為您提供最優質的預約管理體驗</p>
    </div>
    
    <div class="mb-10">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">登入系統</h2>
      <p class="text-gray-600">請輸入您的帳號密碼以登入系統</p>
    </div>
    
    <form id="loginForm" class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
        <input type="email" id="email" name="email" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="請輸入電子郵件">
      </div>
      
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">密碼</label>
        <input type="password" id="password" name="password" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="請輸入密碼">
      </div>
      
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input type="checkbox" id="remember" name="remember" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
          <label for="remember" class="ml-2 block text-sm text-gray-700">記住我</label>
        </div>
        
        <a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">忘記密碼?</a>
      </div>
      
      <div>
        <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          登入
        </button>
      </div>
      
      <div id="loginMessage" class="hidden p-3 rounded-md text-center">
        <!-- 登入結果訊息將顯示在這裡 -->
      </div>
    </form>
    
    <div class="flex gap-4 mt-10">
      <button class="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onclick="loginDemo('admin@example.com', 'password')">
        管理員測試帳號
      </button>
      <button class="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onclick="loginDemo('user@example.com', 'password')">
        一般用戶測試帳號
      </button>
    </div>
    
    <p class="mt-8 text-center text-sm text-gray-600">
      沒有帳號? <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">創建新帳號</a>
    </p>
  </div>

  <script>
    // 登入表單提交處理
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        // 實際登入處理
        await handleLogin(email, password);
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
    
    // 使用演示帳號填充表單
    function loginDemo(email, password) {
      document.getElementById('email').value = email;
      document.getElementById('password').value = password;
      // 自動提交表單
      document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
    
    // 處理登入邏輯
    async function handleLogin(email, password) {
      try {
        showMessage('登入中...', 'info');
        
        // 發送登入請求
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '登入失敗');
        }
        
        // 登入成功
        showMessage('登入成功！正在跳轉到系統...', 'success');
        
        // 儲存令牌（實際應用中會使用更安全的方式）
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 跳轉到儀表板
        setTimeout(() => {
          if (data.user.role === 'ADMIN') {
            window.location.href = '/dashboard';
          } else {
            window.location.href = '/booking';
          }
        }, 1000);
        
      } catch (error) {
        console.error('登入錯誤:', error);
        showMessage(error.message || '登入發生錯誤', 'error');
        throw error;
      }
    }
    
    // 顯示訊息函數
    function showMessage(message, type) {
      const messageEl = document.getElementById('loginMessage');
      messageEl.textContent = message;
      messageEl.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700', 'bg-blue-100', 'text-blue-700');
      
      switch (type) {
        case 'error':
          messageEl.classList.add('bg-red-100', 'text-red-700');
          break;
        case 'success':
          messageEl.classList.add('bg-green-100', 'text-green-700');
          break;
        case 'info':
          messageEl.classList.add('bg-blue-100', 'text-blue-700');
          break;
      }
      
      messageEl.classList.remove('hidden');
    }
    
    // 模擬服務器響應 - 實際部署時會被真實API替代
    window.fetch = async (url, options) => {
      // 模擬網絡延遲
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (url === '/api/auth/login') {
        const body = JSON.parse(options.body);
        
        // 簡單的用戶認證邏輯
        if (body.email === 'admin@example.com' && body.password === 'password') {
          return {
            ok: true,
            json: () => Promise.resolve({
              user: { id: '1', name: '管理員', email: 'admin@example.com', role: 'ADMIN' },
              token: 'MOCK_ADMIN_TOKEN',
              expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })
          };
        } else if (body.email === 'user@example.com' && body.password === 'password') {
          return {
            ok: true,
            json: () => Promise.resolve({
              user: { id: '2', name: '一般用戶', email: 'user@example.com', role: 'USER' },
              token: 'MOCK_USER_TOKEN',
              expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })
          };
        } else {
          return {
            ok: false,
            json: () => Promise.resolve({ error: '電子郵件或密碼不正確' })
          };
        }
      }
      
      // 其他API請求處理
      return { ok: false, json: () => Promise.resolve({ error: '未實現的API' }) };
    };
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
    },
  });
} 