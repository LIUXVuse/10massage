// 用戶註冊API
export async function onRequest(context) {
  const { request } = context;
  
  // 處理跨域請求
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
      status: 204,
    });
  }

  // 只允許POST請求
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const body = await request.json();
    
    // 驗證必填欄位
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "所有欄位都是必填的" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 模擬郵箱檢查 (實際應用應查詢數據庫)
    if (email === "test@example.com") {
      return new Response(
        JSON.stringify({ error: "此電子郵件已被使用" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 模擬用戶創建 (實際應用應將數據存入數據庫)
    // 這裡僅返回成功響應
    return new Response(
      JSON.stringify({
        success: true,
        message: "註冊成功",
        user: {
          id: "new-user-id-123",
          name,
          email,
          role: "user",
          createdAt: new Date().toISOString(),
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("註冊錯誤:", error);
    return new Response(
      JSON.stringify({ error: "註冊時發生錯誤" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
} 