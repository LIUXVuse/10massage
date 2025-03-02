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
- [系統修復工具](#系統修復工具)
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
| DIRECT_URL               | 直接連接到Neon PostgreSQL的URL        | postgresql://user:pass@hostname:port/database        |
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
2. 在 Vercel 專案設置中添加環境變數 `NEON_POSTGRES_PRISMA_URL` 和 `DIRECT_URL`
3. 複製連接字串時確保包含完整 URL，包括用戶名、密碼等
4. NEON_POSTGRES_PRISMA_URL 應包含 `pgbouncer=true` 參數
5. DIRECT_URL 應直接連接到資料庫，不使用連接池

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
   DIRECT_URL=postgresql://user:pass@hostname:port/database
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
   - 郵箱: admin@eilinspa.com
   - 密碼: admin123

### 驗證功能

依次檢查以下功能:

1. 登入管理員帳戶
2. 創建按摩師/服務項目
3. 上傳圖片
4. 保存和查看資料

## 系統修復工具

為解決部署後可能遇到的帳戶和角色問題，系統提供了自動修復工具。

### 使用修復工具

1. 如果登入預設帳戶出現 "CredentialsSignin" 錯誤，或按摩師角色卡不顯示
2. 訪問 `/admin/repair` 頁面
3. 點擊 "開始修復" 按鈕
4. 等待修復程序完成，查看診斷報告
5. 使用預設帳號重新登入

### 修復內容

系統修復工具可解決以下問題:

1. **帳戶密碼問題**:
   - 統一所有帳戶的密碼雜湊方法
   - 確保所有環境中密碼驗證的一致性

2. **角色數據問題**:
   - 為具有MASSEUR角色的用戶創建對應的按摩師記錄
   - 確保角色與資料記錄之間的關聯正確

3. **系統初始化問題**:
   - 確保所有預設帳戶正確創建
   - 驗證權限設置和角色分配

## 常見問題與解決方案

### 1. PrismaClientInitializationError

**問題**: 部署後出現 `PrismaClientInitializationError` 或「設置預設帳戶失敗」錯誤。

**解決方案**:
- 確保建置命令已設為 `npx prisma generate && next build`
- 檢查 `NEON_POSTGRES_PRISMA_URL` 環境變數是否正確
- 確認 `DIRECT_URL` 環境變數已正確設置
- 確認 Neon 資料庫允許來自 Vercel 的連接
- 嘗試使用 URL 友好的格式:
  ```
  postgres://user:pass@hostname:port/database
  ```

### 2. 模組找不到錯誤

**問題**: 部署後出現 `Module not found: Can't resolve '@radix-ui/react-separator'` 等錯誤。

**解決方案**:
- 確保已安裝所有必要的Radix UI套件:
  ```bash
  npm install @radix-ui/react-separator --save
  ```
- 檢查 `package.json` 中是否包含所有必要的依賴
- 在本地執行 `npm ci` 確保依賴安裝正確，然後再次部署

### 3. 預設帳戶登入失敗

**問題**: 使用預設帳戶登入時出現 "CredentialsSignin" 錯誤。

**解決方案**:
- 訪問 `/admin/repair` 頁面使用系統修復工具
- 工具會自動修復所有帳戶的密碼雜湊問題
- 修復完成後使用預設帳號重新登入

### 4. 按摩師角色卡不顯示

**問題**: 指派了按摩師角色的用戶，但在按摩師列表中沒有顯示對應的角色卡。

**解決方案**:
- 訪問 `/admin/repair` 頁面使用系統修復工具
- A工具會自動為具有按摩師角色的用戶創建對應的按摩師資料記錄
- 修復完成後刷新按摩師列表頁面查看結果

### 5. 資料庫遷移錯誤

**問題**: P3019 錯誤 - Cannot find migration

**解決方案**:
- 這通常發生在從 SQLite 遷移到 PostgreSQL 時
- 依照[資料庫遷移](#資料庫遷移)部分的步驟重新執行遷移
- 確保 `schema.prisma` 和 `.env` 文件設置一致

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

2. 在 Vercel 儀表板中的 "Functions" 部分查看日誌

3. 使用 Vercel CLI 在本地模擬生產環境:
   ```bash
   npx vercel dev
   ``` 