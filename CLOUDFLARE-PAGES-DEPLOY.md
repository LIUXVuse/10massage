# Cloudflare Pages 部署指南

本文檔提供在Cloudflare Pages上部署伊林SPA預約系統的詳細步驟和常見問題解決方案。

## 目錄

- [部署方式](#部署方式)
  - [自動部署](#自動部署)
  - [手動部署](#手動部署)
- [首次部署設置](#首次部署設置)
- [環境變數配置](#環境變數配置)
- [解決文件大小限制問題](#解決文件大小限制問題)
- [常見問題和解決方案](#常見問題和解決方案)

## 部署方式

### 自動部署

Cloudflare Pages支持通過GitHub自動部署，當您推送代碼到GitHub儲存庫時，Cloudflare會自動構建並部署您的應用。

#### 設置步驟

1. 登入Cloudflare控制台，進入"Pages"部分
2. 點擊"創建應用程序"
3. 選擇"連接到Git"
4. 選擇GitHub並授權Cloudflare訪問您的儲存庫
5. 選擇10massage儲存庫
6. 配置構建設置：
   - **項目名稱**: `10massage`
   - **生產分支**: `master`
   - **構建命令**: `npm run build`
   - **構建輸出目錄**: `.next/standalone`
7. 設置環境變量（詳見[環境變數配置](#環境變數配置)）
8. 點擊"保存並部署"

### 手動部署

如果您想手動控制部署過程，可以使用Wrangler CLI工具。

#### 前提條件

1. 安裝Wrangler CLI: `npm install -g wrangler`
2. 登入Cloudflare: `wrangler login`

#### 部署步驟

1. 構建項目: `npm run build`
2. 使用wrangler部署:
```bash
wrangler pages deploy .next/standalone --project-name=10massage
```

## 首次部署設置

### 1. 創建Cloudflare Pages項目

如果您尚未創建Cloudflare Pages項目：

1. 登入Cloudflare控制台
2. 進入Pages部分，點擊"創建應用程序"
3. 按照上述自動部署的步驟進行設置

### 2. 設置資料庫和存儲

伊林SPA預約系統需要D1數據庫和R2存儲：

1. **創建D1數據庫**:
```bash
wrangler d1 create 10massage-db
```

2. **創建R2存儲桶**:
```bash
wrangler r2 bucket create 10massage-storage
```

3. **在Cloudflare Pages的設置中添加綁定**:
   - 進入Pages專案 -> 設定 -> 功能
   - D1數據庫：添加綁定，名稱為"DB"，選擇您創建的D1數據庫
   - R2存儲桶：添加綁定，名稱為"STORAGE"，選擇您創建的R2存儲桶

### 3. 初始化數據

部署完成後，訪問以下URL初始化系統：

1. 初始化測試帳號：
```
https://10massage.pages.dev/init
```

## 環境變數配置

在Cloudflare Pages中設置以下環境變數：

| 變數名 | 說明 | 示例值 |
|-------|------|-------|
| `DATABASE_URL` | 數據庫連接字符串 | 不需要，使用D1綁定 |
| `NEXTAUTH_URL` | 應用程序的完整URL | `https://10massage.pages.dev` |
| `NEXTAUTH_SECRET` | 用於加密會話的密鑰 | 生成的隨機字符串 |
| `CLOUDFLARE_R2_ENABLED` | 啟用R2存儲 | `true` |

### 生成NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## 解決文件大小限制問題

Cloudflare Pages對單個文件有25MB大小限制。我們通過以下方式解決：

1. **優化webpack配置**：
   - 在`next.config.mjs`中配置更細粒度的代碼分割
   - 設置較小的`maxSize`來強制分割大文件
   - 啟用文件壓縮

2. **使用`standalone`輸出**：
   - 設置`output: 'standalone'`生成更優化的構建

3. **更新wrangler.toml**：
   - 指定正確的構建輸出目錄

如果部署仍然失敗，查看構建日誌來識別哪些文件超出大小限制，並進一步優化webpack配置。

## 常見問題和解決方案

### 部署錯誤：文件大小超過限制

**問題**:
```
Error: Pages only supports files up to 25 MiB in size
```

**解決方案**:
1. 確保使用了優化的webpack配置
2. 檢查哪個文件超出限制，進一步優化分割配置
3. 考慮移除不必要的依賴

### 訪問API路由時顯示404

**問題**: 部署後API路由無法訪問

**解決方案**:
1. 確保使用了`output: 'standalone'`而非`output: 'export'`
2. 確認`wrangler.toml`中設置了正確的`pages_build_output_dir`
3. 檢查環境變量是否正確設置

### 中間件不生效

**問題**: 路由保護或重定向不工作

**解決方案**:
1. 確保middleware.ts中公開API路由列表包含必要的路徑
2. 檢查cookie名稱配置，特別是生產環境
3. 確認環境變量NEXTAUTH_SECRET已正確設置

### 登入後不保持會話

**問題**: 登入後刷新頁面後需要重新登入

**解決方案**:
1. 確保NEXTAUTH_SECRET和NEXTAUTH_URL正確設置
2. 檢查cookie設置，特別是在Cloudflare環境中
3. 確保nextauth相關的API路由正確處理

### D1數據庫連接問題

**問題**: API返回500錯誤，無法訪問數據庫

**解決方案**:
1. 確認D1綁定已正確設置
2. 檢查Prisma配置是否適配Cloudflare環境
3. 訪問初始化API創建必要的數據庫表和數據 