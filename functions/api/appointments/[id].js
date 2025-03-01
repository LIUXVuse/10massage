// 單個預約管理API
export async function onRequest(context) {
  const { request, params } = context;
  const appointmentId = params.id;
  
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
  // 假設任何有效token都能查看預約，但要區分管理員和普通用戶
  const isAdmin = token === "MOCK_ADMIN_TOKEN";
  const currentUserId = token === "MOCK_ADMIN_TOKEN" ? "admin" : "user-1";

  try {
    // 模擬預約數據庫
    const mockAppointments = {
      "1": {
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
      "2": {
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
      "3": {
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
      "4": {
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
    };

    // 檢查預約是否存在
    if (!mockAppointments[appointmentId]) {
      return new Response(
        JSON.stringify({ error: "找不到該預約" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 檢查訪問權限
    const appointment = mockAppointments[appointmentId];
    if (!isAdmin && appointment.userId !== currentUserId) {
      return new Response(
        JSON.stringify({ error: "無權訪問此預約" }),
        {
          status: 403,
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
        // 返回特定預約
        return new Response(
          JSON.stringify({ appointment }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
        
      case "PUT":
        // 模擬更新預約
        const body = await request.json();
        const { status: newStatus, masseurId, serviceId, date, time } = body;
        
        // 檢查是否可以修改
        if (appointment.status === "cancelled") {
          return new Response(
            JSON.stringify({ error: "已取消的預約不能修改" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
        
        // 管理員可以變更狀態，用戶只能取消
        if (newStatus && !isAdmin && newStatus !== "cancelled") {
          return new Response(
            JSON.stringify({ error: "用戶只能取消預約，不能變更其他狀態" }),
            {
              status: 403,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
        
        // 模擬更新預約
        const updatedAppointment = {
          ...appointment,
          masseurId: masseurId || appointment.masseurId,
          masseurName: masseurId ? (masseurId === "1" ? "王按摩師" : masseurId === "2" ? "李按摩師" : "陳按摩師") : appointment.masseurName,
          serviceId: serviceId || appointment.serviceId,
          serviceName: serviceId ? (serviceId === "1" ? "全身放鬆按摩" : serviceId === "2" ? "精油芳療按摩" : "深層組織按摩") : appointment.serviceName,
          date: date || appointment.date,
          time: time || appointment.time,
          status: newStatus || appointment.status,
          duration: serviceId ? (serviceId === "1" ? 60 : 90) : appointment.duration,
          price: serviceId ? (serviceId === "1" ? 2000 : serviceId === "2" ? 2500 : 2800) : appointment.price,
          updatedAt: new Date().toISOString(),
        };
        
        return new Response(
          JSON.stringify({ 
            message: "預約更新成功", 
            appointment: updatedAppointment 
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
        // 模擬刪除/取消預約
        if (appointment.status === "cancelled") {
          return new Response(
            JSON.stringify({ error: "預約已經被取消" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
        
        // 檢查是否為過期預約
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        const now = new Date();
        if (appointmentDate < now) {
          return new Response(
            JSON.stringify({ error: "不能取消過期的預約" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
        
        // 模擬取消預約
        const cancelledAppointment = {
          ...appointment,
          status: "cancelled",
          updatedAt: new Date().toISOString(),
        };
        
        return new Response(
          JSON.stringify({ 
            message: "預約取消成功", 
            appointment: cancelledAppointment 
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