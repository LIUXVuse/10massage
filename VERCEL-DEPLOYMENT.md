# Vercel 部署指南

![Last Updated](https://img.shields.io/badge/last%20updated-2025--03--02-orange.svg)

本文檔提供在 Vercel 平台上部署伊林SPA預約系統的詳細步驟和解決方案。

## 目錄

- [準備工作](#準備工作)
- [設置 Vercel 專案](#設置-vercel-專案)
- [環境變數配置](#環境變數配置)
- [Neon PostgreSQL 設置](#neon-postgresql-設置)
- [資料庫遷移](#資料庫遷移)
- [部署後驗證](#部署後驗證)
- [常見問題與解決方案](#常見問題與解決方案)
- [重要參考資料](#重要參考資料)

## 準備工作

### 源碼準備

1. 確保你的代碼已經 push 到 GitHub 倉庫
2. 確保 `prisma/schema.prisma` 文件已正確配置為使用 PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("NEON_POSTGRES_PRISMA_URL")
   }
   ```

### Neon PostgreSQL 註冊

1. 前往 [Neon.tech](https://neon.tech) 註冊帳號
2. 創建一個新的 PostgreSQL 資料庫專案
3. 獲取連接字串 (Connection String)

## 設置 Vercel 專案

### 導入專案

1. 登入 [Vercel](https://vercel.com) 平台
2. 點擊 "Add New" > "Project"
3. 從 GitHub 導入你的專案倉庫
4. 選擇 "Next.js" 作為框架預設

### 建置配置

1. 在 "Build and Development Settings" 部分:
   - 建置命令: `npx prisma generate && next build`
   - 輸出目錄: `.next`
   - Node.js 版本: 18.x

## 環境變數配置

必要的環境變數:

| 變數名                    | 描述                                  | 範例                                                  |
|--------------------------|--------------------------------------|------------------------------------------------------|
| NEON_POSTGRES_PRISMA_URL | Neon PostgreSQL 連接字串              | postgresql://user:pass@hostname:port/database        |
| NEXTAUTH_URL             | 完整的網站 URL                        | https://10massage.vercel.app                         |
| NEXTAUTH_SECRET          | 認證加密密鑰                          | complex_random_string                                |
| NODE_ENV                 | 環境設定                              | production                                           |

## Neon PostgreSQL 設置

### 通過 Vercel 整合 Neon

1. 在 Vercel 專案頁面，點擊 "Storage" 標籤
2. 在市場部分找到 "Neon" 並點擊 "Create"
3. 登入 Neon 帳號並授權 Vercel 訪問
4. 選擇新建或使用現有的 Neon 專案
5. 確保服務連接到正確的 Vercel 專案
6. 連接完成後，Vercel 會自動添加必要的環境變數

### 手動設置 Neon 連接

如無法使用整合功能，可手動設置:

1. 複製 Neon PostgreSQL 連接字串
2. 在 Vercel 專案設置中添加環境變數 `NEON_POSTGRES_PRISMA_URL`
3. 複製連接字串時確保包含完整 URL，包括用戶名、密碼等

## 資料庫遷移

由於 Vercel 的無伺服器環境限制，需要在本地執行遷移並將結構同步到 Neon PostgreSQL 資料庫。

### 從 SQLite 遷移到 PostgreSQL

如之前使用的是 SQLite，需執行以下步驟:

1. 刪除現有的遷移文件:
   ```powershell
   Remove-Item -Path "prisma\migrations" -Recurse -Force
   ```

2. 更新本地 `.env` 文件以連接到 Neon:
   ```
   NEON_POSTGRES_PRISMA_URL=postgresql://user:pass@hostname:port/database
   ```

3. 重新生成 Prisma 客戶端:
   ```powershell
   npx prisma generate
   ```

4. 創建新的初始遷移:
   ```powershell
   npx prisma migrate dev --name initial
   ```

### 驗證資料庫結構

執行以下命令檢查資料庫結構是否正確:

```powershell
npx prisma db pull
```

## 部署後驗證

### 初始化管理員帳戶

1. 完成部署後，訪問 `/api/admin/init-accounts` 端點
2. 應看到成功訊息，表示管理員帳戶已創建
3. 使用預設帳號登入:
   - 郵箱: admin@example.com
   - 密碼: Admin123

### 驗證功能

依次檢查以下功能:

1. 登入管理員帳戶
2. 創建按摩師/服務項目
3. 上傳圖片
4. 保存和查看資料

## 常見問題與解決方案

### 1. PrismaClientInitializationError

**問題**: 部署後出現 `PrismaClientInitializationError` 或「設置預設帳戶失敗」錯誤。

**解決方案**:
- 確保建置命令已設為 `npx prisma generate && next build`
- 檢查 `NEON_POSTGRES_PRISMA_URL` 環境變數是否正確
- 確認 Neon 資料庫允許來自 Vercel 的連接
- 嘗試使用 URL 友好的格式:
  ```
  postgres://user:pass@hostname:port/database
  ```

### 2. 樣式載入問題

**問題**: 網站部署後樣式不正確，看起來「很醜」。

**解決方案**:
- 如存在 `NEXT_PUBLIC_ASSET_PREFIX` 環境變數，先移除它
- 確保 `next.config.js` 中的資源前綴配置正確:
  ```javascript
  const nextConfig = {
    output: 'standalone',
    images: {
      domains: ['vercel.app'],
    }
  };
  ```
- 清除瀏覽器快取後重新訪問網站

### 3. 資料庫遷移錯誤

**問題**: P3019 錯誤 - Cannot find migration

**解決方案**:
- 這通常發生在從 SQLite 遷移到 PostgreSQL 時
- 依照[資料庫遷移](#資料庫遷移)部分的步驟重新執行遷移
- 確保 `schema.prisma` 和 `.env` 文件設置一致

### 4. 免費版部署限制

**問題**: Vercel 顯示升級到 Pro 計劃的提示。

**解決方案**:
- Vercel 免費版有每日部署次數限制
- 減少部署頻率，合併多個變更後一次部署
- 針對大型更改使用 Preview 環境測試，確認無錯誤後再部署到生產環境

## 重要參考資料

- [Vercel 文檔 - Next.js 部署](https://vercel.com/docs/frameworks/nextjs)
- [Neon 文檔 - 與 Prisma 整合](https://neon.tech/docs/guides/prisma)
- [Prisma 文檔 - 部署到 Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js 文檔 - 環境變數](https://nextjs.org/docs/basic-features/environment-variables)

## 故障排除小貼士

為協助故障排除，可以在 Vercel Functions 日誌中添加調試信息:

1. 在 API 路由中添加詳細日誌:
   ```typescript
   console.log('Database connection details:', {
     url: process.env.NEON_POSTGRES_PRISMA_URL?.substring(0, 20) + '...',
     nodeEnv: process.env.NODE_ENV,
     prismaVersion: require('@prisma/client/package.json').version
   });
   ```

2. 在 Vercel 儀表板中的 "Functions" 部分查看日誌。

3. 使用 Vercel CLI 在本地模擬生產環境:
   ```bash
   npx vercel dev
   ``` 