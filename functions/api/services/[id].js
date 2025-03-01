// Cloudflare Pages Function for single service API
export async function onRequest(context) {
  // 設置響應頭，允許跨域訪問
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, DELETE",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  // 對於 OPTIONS 請求（預檢請求）直接返回成功
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  try {
    // 從 URL 中獲取服務 ID
    const url = new URL(context.request.url);
    const paths = url.pathname.split('/');
    const id = paths[paths.length - 1]; // 獲取 URL 中的最後一部分作為 ID

    console.log(`處理服務 ID: ${id} 的 ${context.request.method} 請求`);

    // 根據請求方法處理不同類型的請求
    switch (context.request.method) {
      case "GET":
        // 獲取單個服務邏輯
        // 使用模擬數據，實際部署時替換為數據庫查詢
        const service = {
          id: id,
          name: id === "1" ? "全身按摩" : "精油按摩",
          description: id === "1" ? "專業全身放鬆按摩，舒緩疲勞" : "使用頂級精油，深層放鬆",
          price: id === "1" ? 2000 : 2500,
          duration: id === "1" ? 60 : 90,
          type: id === "1" ? "general" : "special",
          category: "massage",
          isRecommend: id === "1",
          durations: [
            {
              id: `${id}-1`,
              duration: id === "1" ? 60 : 90,
              price: id === "1" ? 2000 : 2500,
              serviceId: id
            }
          ],
          masseurs: {
            masseur: {
              id: id,
              name: id === "1" ? "王小明" : "林小華"
            }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return new Response(JSON.stringify(service), { headers });

      case "PUT":
        // 更新單個服務邏輯
        const updateData = await context.request.json();
        
        // 模擬更新成功
        return new Response(JSON.stringify({
          ...updateData,
          id: id,
          updatedAt: new Date().toISOString()
        }), { headers });

      case "DELETE":
        // 刪除單個服務邏輯
        
        // 模擬刪除成功
        return new Response(JSON.stringify({ success: true }), { headers });

      default:
        return new Response(JSON.stringify({ error: "不支持的請求方法" }), { 
          headers, 
          status: 405 
        });
    }
  } catch (error) {
    console.error("處理單個服務API時發生錯誤:", error);
    
    return new Response(JSON.stringify({ 
      error: "處理請求時發生錯誤", 
      details: error.message 
    }), { 
      headers, 
      status: 500 
    });
  }
} 