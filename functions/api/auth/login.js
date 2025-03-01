// Cloudflare Pages Function for login API
export async function onRequest(context) {
  // 設置響應頭，允許跨域訪問
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // 對於 OPTIONS 請求（預檢請求）直接返回成功
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  // 只允許 POST 請求
  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ error: "方法不允許" }), { 
      headers, 
      status: 405 
    });
  }

  try {
    const { email, password } = await context.request.json();

    // 簡單驗證
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "缺少電子郵件或密碼" }), { 
        headers, 
        status: 400 
      });
    }

    // 簡單模擬用戶驗證
    // 實際部署時應替換為真實的身份驗證邏輯
    let user;
    if (email === "admin@example.com" && password === "password") {
      user = {
        id: "admin-id",
        name: "管理員",
        email: "admin@example.com",
        role: "ADMIN"
      };
    } else if (email === "user@example.com" && password === "password") {
      user = {
        id: "user-id",
        name: "一般用戶",
        email: "user@example.com",
        role: "USER"
      };
    } else {
      // 登入失敗
      return new Response(JSON.stringify({ error: "無效的電子郵件或密碼" }), { 
        headers, 
        status: 401 
      });
    }

    // 在實際部署中，這裡應該創建JWT等安全令牌
    // 為簡單起見，我們只返回用戶對象和一個簡單的令牌
    return new Response(JSON.stringify({
      user,
      token: `mock-token-${Date.now()}`,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天後過期
    }), { headers });

  } catch (error) {
    console.error("處理登入請求時發生錯誤:", error);
    
    return new Response(JSON.stringify({ 
      error: "處理登入請求時發生錯誤", 
      details: error.message 
    }), { 
      headers, 
      status: 500 
    });
  }
} 