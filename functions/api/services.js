// Cloudflare Pages Function for services API
export async function onRequest(context) {
  // 設置響應頭，允許跨域訪問
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
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
        // 獲取服務列表邏輯
        // 使用模擬數據，實際部署時替換為數據庫查詢
        const services = [
          {
            id: "1",
            name: "全身按摩",
            description: "專業全身放鬆按摩，舒緩疲勞",
            price: 2000,
            duration: 60,
            type: "general",
            category: "massage",
            isRecommend: true,
            masseurs: [
              {
                id: "1",
                name: "王小明",
                image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
              }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "2",
            name: "精油按摩",
            description: "使用頂級精油，深層放鬆",
            price: 2500,
            duration: 90,
            type: "special",
            category: "massage",
            isRecommend: false,
            masseurs: [
              {
                id: "2",
                name: "林小華",
                image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
              }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        return new Response(JSON.stringify(services), { headers });

      case "POST":
        // 創建服務邏輯
        const data = await context.request.json();
        
        // 模擬創建成功
        return new Response(JSON.stringify({
          id: "new-service-" + Date.now(),
          ...data
        }), { 
          headers, 
          status: 201 
        });

      case "PUT":
        // 更新服務邏輯
        const updateData = await context.request.json();
        
        // 模擬更新成功
        return new Response(JSON.stringify({
          ...updateData,
          updatedAt: new Date().toISOString()
        }), { headers });

      case "DELETE":
        // 刪除服務邏輯
        const url = new URL(context.request.url);
        const id = url.searchParams.get('id');
        
        if (!id) {
          return new Response(JSON.stringify({ error: "缺少服務 ID" }), { 
            headers, 
            status: 400 
          });
        }
        
        // 模擬刪除成功
        return new Response(JSON.stringify({ success: true }), { headers });

      default:
        return new Response(JSON.stringify({ error: "不支持的請求方法" }), { 
          headers, 
          status: 405 
        });
    }
  } catch (error) {
    console.error("處理服務API時發生錯誤:", error);
    
    return new Response(JSON.stringify({ 
      error: "處理請求時發生錯誤", 
      details: error.message 
    }), { 
      headers, 
      status: 500 
    });
  }
} 