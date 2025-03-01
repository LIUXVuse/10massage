// 單個使用者管理API
export async function onRequest(context) {
  const { request, params } = context;
  const userId = params.id;
  
  // 處理跨域請求
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
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
    // 模擬用戶數據庫
    const mockUsers = {
      "1": {
        id: "1",
        name: "管理員",
        email: "admin@example.com",
        role: "admin",
        createdAt: "2025-01-10T10:00:00Z",
      },
      "2": {
        id: "2",
        name: "林小明",
        email: "user1@example.com",
        role: "user",
        createdAt: "2025-01-15T14:30:00Z",
      },
      "3": {
        id: "3",
        name: "張美美",
        email: "user2@example.com",
        role: "user",
        createdAt: "2025-02-05T09:15:00Z",
      },
      "4": {
        id: "4",
        name: "王大華",
        email: "user3@example.com",
        role: "user",
        createdAt: "2025-02-20T16:45:00Z",
      }
    };

    // 檢查用戶是否存在
    if (!mockUsers[userId]) {
      return new Response(
        JSON.stringify({ error: "找不到該使用者" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 處理不同的HTTP方法
    switch (request.method) {
      case "GET":
        // 返回特定使用者
        return new Response(
          JSON.stringify({ user: mockUsers[userId] }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
        
      case "PUT":
        // 模擬更新使用者
        const body = await request.json();
        const { name, email, role } = body;
        
        // 檢查必填欄位
        if (!name && !email && !role) {
          return new Response(
            JSON.stringify({ error: "至少需要提供一個更新欄位" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
        
        // 模擬更新使用者資料
        const updatedUser = {
          ...mockUsers[userId],
          name: name || mockUsers[userId].name,
          email: email || mockUsers[userId].email,
          role: role || mockUsers[userId].role,
          updatedAt: new Date().toISOString(),
        };
        
        return new Response(
          JSON.stringify({ 
            message: "使用者更新成功", 
            user: updatedUser 
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
        
      case "DELETE":
        // 檢查是否為管理員帳號，不允許刪除
        if (userId === "1") {
          return new Response(
            JSON.stringify({ error: "不能刪除主管理員帳號" }),
            {
              status: 403,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
        
        // 模擬刪除操作
        return new Response(
          JSON.stringify({ 
            message: "使用者刪除成功", 
            id: userId 
          }),
          {
            status: 200,
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