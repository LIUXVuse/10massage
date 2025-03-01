# Cloudflare部署問題與解決方案

本文檔記錄了將伊林SPA預約系統部署到Cloudflare時可能遇到的問題和解決方案。

## 已知問題

### 1. 訪問按摩師管理頁面被重定向到首頁

**問題描述:**
- 在Cloudflare環境中，成功登入後訪問按摩師管理頁面（/masseurs）時，被重定向到首頁並登出
- 本地開發環境運行正常，只有在Cloudflare部署後出現此問題

**根本原因:**
- 中間件權限檢查中的路徑匹配邏輯不適合Next.js 14的應用程序目錄結構
- 在Next.js中，(dashboard)是一個分組，不會影響實際URL路徑，但中間件的匹配邏輯沒有正確處理這種情況
- Cloudflare環境和本地環境的cookie處理可能有差異，導致在Cloudflare環境中會話令牌無法正確讀取

**解決方案:**
1. 修改中間件的路徑匹配邏輯，正確處理Next.js的分組功能
2. 在`middleware.ts`中指定正確的cookie名稱:
```javascript
const token = await getToken({ 
  req: request, 
  secret: process.env.NEXTAUTH_SECRET,
  cookieName: process.env.NODE_ENV === 'production' 
    ? '__Secure-next-auth.session-token' 
    : 'next-auth.session-token'
})
```
3. 確保所有環境變數在Cloudflare Pages中正確設置，特別是`NEXTAUTH_SECRET`和`NEXTAUTH_URL`

### 2. 部署後按摩師數據不顯示

**問題描述:**
- 從本地環境部署到Cloudflare後，原有的按摩師數據不顯示
- API返回空數組，但沒有錯誤消息

**根本原因:**
- 本地和雲端使用不同的數據庫，Cloudflare使用D1數據庫而非本地SQLite
- 數據並未從本地導出並導入到D1

**解決方案:**
1. 使用Prisma導出數據:
```bash
npx prisma migrate deploy
```

2. 合併SQL遷移文件:
```bash
cat ./prisma/migrations/*/migration.sql > ./combined.sql
```

3. 將SQL導入D1數據庫:
```bash
wrangler d1 execute 10massage-db --file=./combined.sql --remote
```

4. 在Cloudflare環境中訪問初始化API來創建默認賬戶:
```
https://10massage.pages.dev/api/admin/init-accounts
```

### 3. 上傳圖片到R2存儲桶失敗

**問題描述:**
- 在Cloudflare環境中上傳圖片時返回500錯誤
- 控制台顯示無法訪問R2存儲桶

**根本原因:**
- R2綁定配置不正確
- 可能是權限問題或環境變數設置錯誤

**解決方案:**
1. 在Cloudflare Pages設置中創建R2綁定:
   - 進入Cloudflare Pages > 專案設置 > 函數 > R2儲存桶綁定
   - 添加綁定，設置變量名稱為`STORAGE`，選擇之前創建的R2儲存桶

2. 確保環境變數正確設置:
```
CLOUDFLARE_ACCOUNT_ID=<您的Cloudflare帳戶ID>
CLOUDFLARE_API_TOKEN=<具有R2管理權限的API令牌>
R2_BUCKET_NAME=10massage-storage
NEXT_PUBLIC_R2_URL=https://pub-<custom-domain>.r2.dev
CLOUDFLARE_R2_ENABLED=true
```

3. 修改上傳API，添加更多日誌以便調試

### 4. 構建檔案大小超過限制

**問題描述:**
- 部署時出現錯誤：`Error: Script is larger than 1 MiB`
- Cloudflare Pages對單個JavaScript檔案有1MB大小限制

**解決方案:**
1. 修改`next.config.mjs`來優化構建輸出:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // 生產環境中啟用程式碼拆分
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // 拆分大型庫和框架
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next|@next)[\\/]/,
            name: 'framework',
            priority: 40,
            chunks: 'all',
            enforce: true,
          },
          // 拆分UI組件庫
          uiComponents: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|tailwindcss)[\\/]/,
            name: 'ui-components',
            priority: 30,
            chunks: 'all',
          },
          // 拆分其他第三方庫
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'lib',
            priority: 20,
            chunks: 'all',
          },
          // 應用代碼拆分
          app: {
            name: 'app',
            minChunks: 2,
            priority: 10,
            chunks: 'all',
          },
        },
        maxInitialRequests: 25,
        minSize: 20000,
      };
    }
    return config;
  },
};

export default nextConfig;
```

2. 減少不必要的依賴包
3. 啟用壓縮:
```javascript
compression: true,
```

## 部署流程摘要

### Cloudflare設置
1. 創建D1數據庫: `wrangler d1 create 10massage-db`
2. 創建R2存儲桶: `wrangler r2 bucket create 10massage-storage`
3. 創建Pages項目: `wrangler pages project create 10massage`

### 更新wrangler.toml
```toml
name = "10massage"
compatibility_date = "2023-05-18"
compatibility_flags = ["nodejs_compat"]

# 啟用Edge運行時
[build]
command = "npm run build"

[site]
bucket = ".next"

[[d1_databases]]
binding = "DB"
database_name = "10massage-db"
database_id = "<your-database-id>"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "10massage-storage"

[env.production]
workers_dev = false
```

### 部署步驟
1. 構建項目: `npm run build`
2. 部署應用: `wrangler pages deploy .next --project-name=10massage`
3. 設置綁定和環境變數
4. 部署數據庫結構: `wrangler d1 execute 10massage-db --file=./combined.sql --remote`
5. 訪問初始化API: `https://10massage.pages.dev/api/admin/init-accounts`

## 故障排除建議

1. **檢查API回應**
   - 使用開發者工具檢查API請求和回應
   - 啟用詳細日誌記錄以便調試

2. **檢查環境變數**
   - 確保所有必要的環境變數都在Cloudflare Pages中正確設置
   - 區分開發和生產環境的變數

3. **檢查綁定**
   - 確保D1和R2綁定在Cloudflare Pages控制面板中正確設置
   - 確認綁定名稱與程式碼中使用的一致

4. **清除緩存**
   - 重新部署前清除Cloudflare的緩存
   - 清除瀏覽器緩存和cookies進行測試

5. **監控日誌**
   - 使用Cloudflare Dashboard中的Function Logs查看Worker日誌
   - 在關鍵功能中添加更多日誌以便調試 