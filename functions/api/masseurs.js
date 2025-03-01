// Cloudflare Pages Function for masseurs API
export async function onRequest(context) {
  // 設置響應頭，允許跨域訪問
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  // 對於 OPTIONS 請求（預檢請求）直接返回成功
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  try {
    // 根據請求方法處理不同類型的請求
    switch (context.request.method) {
      case "GET":
        // 獲取按摩師列表邏輯
        // 這裡使用模擬數據，實際部署時替換為數據庫查詢
        const masseurs = [
          {
            id: "1",
            name: "王小明",
            description: "專業按摩師，有5年經驗",
            imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
            imageScale: 1,
            cropX: 0,
            cropY: 0,
            cropWidth: 300,
            cropHeight: 225,
            services: [{ id: "1", name: "全身按摩" }],
            sortOrder: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "2",
            name: "林小華",
            description: "芳療專家，擅長精油按摩",
            imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
            imageScale: 1,
            cropX: 0,
            cropY: 0,
            cropWidth: 300,
            cropHeight: 225,
            services: [{ id: "2", name: "精油按摩" }],
            sortOrder: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        return new Response(JSON.stringify(masseurs), { headers });

      case "POST":
        // 創建按摩師邏輯
        const data = await context.request.json();
        
        // 模擬創建成功
        return new Response(JSON.stringify({ id: "new-id-" + Date.now() }), { 
          headers, 
          status: 201 
        });

      case "PUT":
        // 更新按摩師邏輯
        const updateData = await context.request.json();
        
        // 模擬更新成功
        return new Response(JSON.stringify({ 
          success: true, 
          masseur: { ...updateData, imageUrl: updateData.image }
        }), { headers });

      case "PATCH":
        // 更新按摩師排序邏輯
        const { masseurOrders } = await context.request.json();
        
        // 模擬排序更新成功
        return new Response(JSON.stringify({ 
          success: true, 
          message: "按摩師排序已更新" 
        }), { headers });

      case "DELETE":
        // 刪除按摩師邏輯
        const deleteData = await context.request.json();
        
        // 模擬刪除成功
        return new Response(JSON.stringify({ success: true }), { headers });

      default:
        return new Response(JSON.stringify({ error: "不支持的請求方法" }), { 
          headers, 
          status: 405 
        });
    }
  } catch (error) {
    console.error("處理按摩師API時發生錯誤:", error);
    
    return new Response(JSON.stringify({ 
      error: "處理請求時發生錯誤", 
      details: error.message 
    }), { 
      headers, 
      status: 500 
    });
  }
} 