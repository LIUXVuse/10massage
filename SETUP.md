# 伊林SPA預約系統 - 安裝與設置指南

![Last Updated](https://img.shields.io/badge/last%20updated-2025--03--01-orange.svg)

本文件提供詳細的安裝、設置和開發指南，協助開發者快速建立開發環境並開始貢獻程式碼。

## 📋 目錄

- [系統需求](#系統需求)
- [安裝步驟](#安裝步驟)
- [環境設置](#環境設置)
- [開發工具](#開發工具)
- [開發流程](#開發流程)
- [常見問題](#常見問題)

## 💻 系統需求

在開始安裝前，請確保你的開發環境符合以下要求：

- **Node.js**: 18.x 或更高版本
- **PostgreSQL**: 15.0 或更高版本
- **npm**: 9.x 或 **yarn**: 1.22.x
- **Git**: 最新版本

## 🔧 安裝步驟

### 1. 克隆儲存庫

```bash
git clone https://github.com/your-username/eilin-spa.git
cd eilin-spa
```

### 2. 安裝相依套件

```bash
npm install
```

或使用 yarn：

```bash
yarn install
```

### 3. 設定環境變數

從範例檔案複製並設置你自己的環境變數：

```bash
cp .env.example .env
```

打開 `.env` 檔案並填入以下設定值：

```
# 資料庫連接設置
DATABASE_URL="postgresql://postgres:password@localhost:5432/eilin_spa"

# NextAuth 設置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="your-verified-sender-email"
```

### 4. 初始化資料庫

```bash
npx prisma migrate dev
```

此命令會建立資料庫結構並套用所有遷移。如果你想要產生初始資料，可以執行：

```bash
npx prisma db seed
```

### 5. 啟動開發伺服器

```bash
npm run dev
```

或使用 yarn：

```bash
yarn dev
```

### 6. 訪問應用程式

開啟瀏覽器並訪問 `http://localhost:3000`

## ⚙️ 環境設置

### 資料庫設置

1. **本地開發**：
   - 安裝 PostgreSQL 15.0
   - 創建一個名為 `eilin_spa` 的資料庫
   - 設定用戶名和密碼，並更新你的 `.env` 檔案

2. **生產環境**：
   - 使用受管理的 PostgreSQL 服務（如 AWS RDS、Heroku Postgres）
   - 設置資料庫定期備份
   - 使用連接池管理資料庫連接

### 認證系統設置

1. **開發環境**：
   - 產生一個隨機 NextAuth 密鑰
   - 配置 NextAuth 提供者（電子郵件、社交媒體等）

2. **生產環境**：
   - 使用強密鑰並妥善保管
   - 配置有效的回調 URL
   - 設置 HTTPS

## 🛠️ 開發工具

### Prisma Studio

Prisma Studio 是一個視覺化資料庫管理工具，可協助你檢視和編輯資料庫資料。

#### 啟動方式

```bash
npx prisma studio
```

開啟瀏覽器訪問 `http://localhost:5555`

#### 主要功能

- **資料瀏覽**: 檢視所有資料表與記錄
- **資料編輯**: 直接修改數據並儲存
- **資料過濾**: 使用搜索功能找到特定記錄

#### 使用技巧

1. **批量編輯**：選擇多筆記錄進行批量編輯
2. **關聯查看**：檢視記錄間的關聯關係
3. **資料匯出**：將查詢結果匯出為 JSON 或 CSV

### 開發工具推薦

- **編輯器**: Visual Studio Code
  - 推薦擴充功能: Prisma, Tailwind CSS IntelliSense, ESLint, Prettier
- **API 測試**: Postman 或 Insomnia
- **Git 工具**: GitKraken 或 SourceTree

## 🚀 開發流程

### 分支策略

我們採用 Git Flow 分支策略：

- `main`: 生產環境程式碼
- `develop`: 開發中的程式碼
- `feature/*`: 新功能分支
- `bugfix/*`: 錯誤修復分支
- `release/*`: 發布準備分支

### 程式碼貢獻流程

1. 從最新的 `develop` 分支建立功能分支
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/amazing-feature
   ```

2. 開發新功能並撰寫測試

3. 提交變更
   ```bash
   git add .
   git commit -m "Add: detailed description of the feature"
   ```

4. 推送到遠端並建立 Pull Request
   ```bash
   git push origin feature/amazing-feature
   ```

5. 等待程式碼審查並解決回饋意見

### 程式碼審查指南

- 確保程式碼遵循項目的編碼風格
- 檢查程式碼的效能和安全性
- 確認新功能有足夠的測試覆蓋率
- 檢查是否有文檔更新

## ❓ 常見問題

### 資料庫連接問題

**問題**: 無法連接到 PostgreSQL 資料庫

**解決方案**:
- 確認 PostgreSQL 服務已啟動
- 檢查 `.env` 檔案中的連接字串
- 確認用戶名和密碼正確
- 檢查防火牆設置

### 按摩師管理功能問題 (2025/03/01 新增)

**問題**: 按摩師圖片顯示不正確或裁剪參數無效

**解決方案**:
- 確認API返回的數據包含完整的裁剪參數 (`cropX`, `cropY`, `cropWidth`, `cropHeight`)
- 檢查圖片路徑是否正確，且文件存在於指定位置
- 在開發者工具中查看圖片加載日誌，確認加載過程無誤
- 檢查數據庫中的裁剪參數是否有正確保存

**問題**: 按摩師排序功能無法永久保存

**解決方案**:
- 確認使用者具有管理員權限
- 檢查瀏覽器控制台是否有API錯誤
- 確認數據庫模型中包含 `sortOrder` 欄位
- 確認PATCH請求格式正確:
  ```json
  { 
    "masseurOrders": [
      { "id": "masseur-id-1", "order": 1 },
      { "id": "masseur-id-2", "order": 2 }
    ]
  }
  ```
- 檢查查詢邏輯是否正確包含 `orderBy: [{ sortOrder: 'asc' }]`

### 認證系統問題

**問題**: NextAuth 認證失敗

**解決方案**:
- 確認 `NEXTAUTH_URL` 和 `NEXTAUTH_SECRET` 已正確設置
- 檢查提供者配置
- 確認回調 URL 已在提供者的控制台中設置

### 部署問題

**問題**: Vercel 部署失敗

**解決方案**:
- 檢查構建日誌尋找錯誤
- 確保所有環境變數都已正確設置
- 檢查 Node.js 版本兼容性
- 確認資料庫 URL 可以從 Vercel 訪問 