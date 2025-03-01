// Cloudflare Pages Function for single masseur API
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
    // 從 URL 中獲取按摩師 ID
    const url = new URL(context.request.url);
    const paths = url.pathname.split('/');
    const id = paths[paths.length - 1]; // 獲取 URL 中的最後一部分作為 ID

    console.log(`處理按摩師 ID: ${id} 的 ${context.request.method} 請求`);

    // 根據請求方法處理不同類型的請求
    switch (context.request.method) {
      case "GET":
        // 獲取單個按摩師邏輯
        // 使用模擬數據，實際部署時替換為數據庫查詢
        const masseur = {
          id: id,
          name: id === "1" ? "王小明" : "林小華",
          description: id === "1" ? "專業按摩師，有5年經驗" : "芳療專家，擅長精油按摩",
          imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          imageScale: 1,
          cropX: 0,
          cropY: 0,
          cropWidth: 300,
          cropHeight: 225,
          services: [{ id: id === "1" ? "1" : "2", name: id === "1" ? "全身按摩" : "精油按摩" }],
          sortOrder: id === "1" ? 1 : 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return new Response(JSON.stringify(masseur), { headers });

      case "PUT":
        // 更新單個按摩師邏輯
        const updateData = await context.request.json();
        
        // 模擬更新成功
        return new Response(JSON.stringify({ 
          success: true, 
          masseur: { 
            ...updateData,
            id: id,
            imageUrl: updateData.image || updateData.imageUrl
          }
        }), { headers });

      case "DELETE":
        // 刪除單個按摩師邏輯
        
        // 模擬刪除成功
        return new Response(JSON.stringify({ success: true }), { headers });

      default:
        return new Response(JSON.stringify({ error: "不支持的請求方法" }), { 
          headers, 
          status: 405 
        });
    }
  } catch (error) {
    console.error("處理單個按摩師API時發生錯誤:", error);
    
    return new Response(JSON.stringify({ 
      error: "處理請求時發生錯誤", 
      details: error.message 
    }), { 
      headers, 
      status: 500 
    });
  }
} 