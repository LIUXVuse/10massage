// 使用者管理API
export async function onRequest(context) {
  const { request } = context;
  
  // 處理跨域請求
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
      status: 204,
    });
  }

  // 獲取請求頭中的授權信息
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "未授權訪問" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  // 模擬 token 驗證
  const token = authHeader.split(" ")[1];
  if (token !== "MOCK_ADMIN_TOKEN") {
    return new Response(
      JSON.stringify({ error: "無效的令牌或無權限" }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  try {
    // 模擬用戶數據
    const mockUsers = [
      {
        id: "1",
        name: "管理員",
        email: "admin@example.com",
        role: "admin",
        createdAt: "2025-01-10T10:00:00Z",
      },
      {
        id: "2",
        name: "林小明",
        email: "user1@example.com",
        role: "user",
        createdAt: "2025-01-15T14:30:00Z",
      },
      {
        id: "3",
        name: "張美美",
        email: "user2@example.com",
        role: "user",
        createdAt: "2025-02-05T09:15:00Z",
      },
      {
        id: "4",
        name: "王大華",
        email: "user3@example.com",
        role: "user",
        createdAt: "2025-02-20T16:45:00Z",
      }
    ];

    // 處理不同的HTTP方法
    switch (request.method) {
      case "GET":
        // 返回所有使用者
        return new Response(
          JSON.stringify({ users: mockUsers }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
        
      case "POST":
        // 模擬創建新使用者
        const body = await request.json();
        const { name, email, role } = body;
        
        if (!name || !email) {
          return new Response(
            JSON.stringify({ error: "名稱和郵箱為必填欄位" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
        
        // 模擬建立新使用者
        const newUser = {
          id: `new-${Date.now()}`,
          name,
          email,
          role: role || "user",
          createdAt: new Date().toISOString(),
        };
        
        return new Response(
          JSON.stringify({ 
            message: "使用者創建成功", 
            user: newUser 
          }),
          {
            status: 201,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
        
      default:
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          {
            status: 405,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
    }
  } catch (error) {
    console.error("使用者API錯誤:", error);
    return new Response(
      JSON.stringify({ error: "處理請求時發生錯誤" }),
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