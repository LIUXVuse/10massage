// 預約管理API
export async function onRequest(context) {
  const { request } = context;
  
  // 處理跨域請求
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
  // 假設任何有效token都能查看預約，但要區分管理員和普通用戶
  const isAdmin = token === "MOCK_ADMIN_TOKEN";
  const userId = token === "MOCK_ADMIN_TOKEN" ? "admin" : "user-1";

  try {
    // 模擬預約數據
    const mockAppointments = [
      {
        id: "1",
        userId: "2",
        userName: "林小明",
        masseurId: "1",
        masseurName: "王按摩師",
        serviceId: "1",
        serviceName: "全身放鬆按摩",
        date: "2025-03-10",
        time: "14:00",
        duration: 60,
        status: "confirmed",
        price: 2000,
        createdAt: "2025-03-01T10:30:00Z",
      },
      {
        id: "2",
        userId: "3",
        userName: "張美美",
        masseurId: "2",
        masseurName: "李按摩師",
        serviceId: "2",
        serviceName: "精油芳療按摩",
        date: "2025-03-12",
        time: "16:30",
        duration: 90,
        status: "pending",
        price: 2500,
        createdAt: "2025-03-02T09:15:00Z",
      },
      {
        id: "3",
        userId: "4",
        userName: "王大華",
        masseurId: "3",
        masseurName: "陳按摩師",
        serviceId: "3",
        serviceName: "深層組織按摩",
        date: "2025-03-15",
        time: "10:00",
        duration: 90,
        status: "confirmed",
        price: 2800,
        createdAt: "2025-03-03T14:45:00Z",
      },
      {
        id: "4",
        userId: "2",
        userName: "林小明",
        masseurId: "1",
        masseurName: "王按摩師",
        serviceId: "1",
        serviceName: "全身放鬆按摩",
        date: "2025-03-18",
        time: "11:30",
        duration: 60,
        status: "cancelled",
        price: 2000,
        createdAt: "2025-03-05T16:20:00Z",
      }
    ];

    // 處理不同的HTTP方法
    switch (request.method) {
      case "GET":
        // 根據用戶角色過濾預約
        let filteredAppointments = mockAppointments;
        
        // 如果不是管理員，只返回該用戶的預約
        if (!isAdmin) {
          filteredAppointments = mockAppointments.filter(
            appointment => appointment.userId === userId
          );
        }
        
        // 處理查詢參數
        const url = new URL(request.url);
        const statusParam = url.searchParams.get("status");
        const dateParam = url.searchParams.get("date");
        
        if (statusParam) {
          filteredAppointments = filteredAppointments.filter(
            appointment => appointment.status === statusParam
          );
        }
        
        if (dateParam) {
          filteredAppointments = filteredAppointments.filter(
            appointment => appointment.date === dateParam
          );
        }
        
        return new Response(
          JSON.stringify({ appointments: filteredAppointments }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
        
      case "POST":
        // 模擬創建新預約
        const body = await request.json();
        const { masseurId, serviceId, date: appointmentDate, time } = body;
        
        // 驗證必填欄位
        if (!masseurId || !serviceId || !appointmentDate || !time) {
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
        
        // 模擬創建預約
        const newAppointment = {
          id: `new-${Date.now()}`,
          userId: userId,
          userName: "當前用戶",
          masseurId,
          masseurName: masseurId === "1" ? "王按摩師" : masseurId === "2" ? "李按摩師" : "陳按摩師",
          serviceId,
          serviceName: serviceId === "1" ? "全身放鬆按摩" : serviceId === "2" ? "精油芳療按摩" : "深層組織按摩",
          date: appointmentDate,
          time,
          duration: serviceId === "1" ? 60 : 90,
          status: "pending",
          price: serviceId === "1" ? 2000 : serviceId === "2" ? 2500 : 2800,
          createdAt: new Date().toISOString(),
        };
        
        return new Response(
          JSON.stringify({ 
            message: "預約創建成功", 
            appointment: newAppointment 
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
    console.error("預約API錯誤:", error);
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