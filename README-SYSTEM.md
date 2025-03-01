# 伊林SPA預約系統 - 系統架構文檔

![Last Updated](https://img.shields.io/badge/last%20updated-2025--03--01-orange.svg)

## 系統架構概覽

伊林SPA預約系統採用了現代化的多層架構設計，充分利用了 Cloudflare 和 Next.js 的能力：

```
伊林SPA預約系統
├── 靜態網站層 (Cloudflare Pages)
│   ├── 官方網站首頁
│   ├── 服務及按摩師介紹
│   └── 後台管理入口
├── API 層 (Cloudflare Functions)
│   ├── 按摩師管理 API
│   ├── 服務項目 API
│   ├── 預約管理 API
│   ├── 用戶管理 API
│   └── 認證授權 API
└── 數據存儲層
    ├── 用戶和認證信息 (Cloudflare D1)
    ├── 業務數據 (Cloudflare D1)
    └── 媒體文件 (Cloudflare R2)
```

## 部署環境說明

本系統目前有兩種配置方式：

1. **Cloudflare Pages + Functions 方案（當前）**
   - 靜態內容：通過 Cloudflare Pages 部署
   - API 功能：使用 Cloudflare Functions 實現
   - 數據存儲：規劃使用 Cloudflare D1 (SQL) 和 R2 (對象存儲)

2. **Next.js + Vercel 方案（之前）**
   - 完整應用：通過 Vercel 部署 Next.js 應用
   - API 功能：使用 Next.js API Routes
   - 數據存儲：PostgreSQL 數據庫

## 用戶流程說明

### 訪客流程
1. 通過 `https://10massage.pages.dev/` 訪問網站首頁
2. 瀏覽服務介紹、按摩師團隊和公司資訊
3. 點擊「進入系統」進入登入頁面
4. 輸入帳號密碼登入系統

### 普通用戶流程
1. 登入後進入服務預約頁面
2. 選擇服務、按摩師和時間進行預約
3. 查看和管理個人預約記錄
4. 維護個人資料

### 管理員流程
1. 登入後進入管理員儀表板
2. 管理按摩師信息（添加、編輯、刪除）
3. 管理服務項目（添加、編輯、刪除）
4. 查看和處理預約請求
5. 管理用戶帳號和權限

## 技術堆棧

### 前端
- **HTML5/CSS3/JavaScript**: 核心前端技術
- **Tailwind CSS**: 用於快速構建現代化UI
- **Alpine.js/vanilla JS**: 輕量級JS框架用於交互

### 後端 API
- **Cloudflare Functions**: 無伺服器函數
- **REST API**: 標準的HTTP方法實現API

### 數據存儲
- **Cloudflare D1**: 邊緣SQL數據庫
- **Cloudflare R2**: 對象存儲服務

## 配置指南

### wrangler.toml 配置

```toml
name = "10massage"
compatibility_date = "2023-06-28"

[site]
bucket = "./out"

[build]
command = "npm run build"

[[d1_databases]]
binding = "DB"
database_name = "10massage-db"
database_id = "<數據庫ID>"

[env.production]
workers_dev = false
route = "10massage.pages.dev/*"

# 靜態資源配置
[site.static_files]
"/images/*" = "/images/*"
"/fonts/*" = "/fonts/*"
```

### 環境變量

需要設置以下環境變量：

| 變量名 | 說明 | 示例值 |
|--------|------|--------|
| `JWT_SECRET` | JWT令牌加密密鑰 | `your-secret-key` |
| `ADMIN_EMAIL` | 初始管理員郵箱 | `admin@example.com` |
| `ADMIN_PASSWORD_HASH` | 初始管理員密碼哈希 | `hashed-password` |

## API 端點文檔

### 用戶認證 API

| 端點 | 方法 | 描述 | 權限 |
|------|------|------|------|
| `/api/auth/login` | POST | 用戶登入 | 公開 |
| `/api/auth/register` | POST | 用戶註冊 | 公開 |

### 按摩師 API

| 端點 | 方法 | 描述 | 權限 |
|------|------|------|------|
| `/api/masseurs` | GET | 獲取所有按摩師 | 公開 |
| `/api/masseurs` | POST | 創建新按摩師 | 管理員 |
| `/api/masseurs` | PUT | 更新按摩師信息 | 管理員 |
| `/api/masseurs` | PATCH | 更新按摩師排序 | 管理員 |
| `/api/masseurs` | DELETE | 刪除按摩師 | 管理員 |
| `/api/masseurs/:id` | GET | 獲取單個按摩師 | 公開 |

### 服務 API

| 端點 | 方法 | 描述 | 權限 |
|------|------|------|------|
| `/api/services` | GET | 獲取所有服務 | 公開 |
| `/api/services` | POST | 創建新服務 | 管理員 |
| `/api/services` | PUT | 更新服務信息 | 管理員 |
| `/api/services` | DELETE | 刪除服務 | 管理員 |
| `/api/services/:id` | GET | 獲取單個服務 | 公開 |

### 預約 API

| 端點 | 方法 | 描述 | 權限 |
|------|------|------|------|
| `/api/appointments` | GET | 獲取所有預約 | 登入用戶 |
| `/api/appointments` | POST | 創建新預約 | 登入用戶 |
| `/api/appointments/:id` | GET | 獲取單個預約 | 預約用戶/管理員 |
| `/api/appointments/:id` | PUT | 更新預約 | 預約用戶/管理員 |
| `/api/appointments/:id` | DELETE | 取消預約 | 預約用戶/管理員 |

## 部署流程

### 開發環境部署

1. 克隆代碼庫
   ```bash
   git clone [repository-url]
   cd 10massage
   ```

2. 安裝依賴
   ```bash
   npm install
   ```

3. 啟動本地開發服務器
   ```bash
   npm run dev
   ```

### 生產環境部署

1. 構建靜態網站文件
   ```bash
   npm run build
   ```

2. 部署到 Cloudflare Pages
   ```bash
   npx wrangler pages deploy public --project-name=10massage
   ```

## 數據庫遷移

1. 創建 Cloudflare D1 數據庫
   ```bash
   npx wrangler d1 create 10massage-db
   ```

2. 創建數據庫表結構
   ```bash
   npx wrangler d1 execute 10massage-db --file=./db/schema.sql
   ```

3. 插入初始數據
   ```bash
   npx wrangler d1 execute 10massage-db --file=./db/seed.sql
   ```

## 常見問題排解

### 登入問題
- **問題**: 用戶無法登入系統
- **解決方案**: 檢查用戶名和密碼是否正確；檢查 JWT 令牌配置

### 圖片顯示問題
- **問題**: 按摩師圖片無法正常顯示
- **解決方案**: 確保圖片路徑正確，並檢查 R2 存儲設置

### API 錯誤
- **問題**: API 返回 500 錯誤
- **解決方案**: 檢查 Cloudflare Functions 日誌，確保數據庫連接正常

## 未來規劃

1. **完善預約流程**: 添加預約確認和提醒功能
2. **移動應用開發**: 開發配套的移動應用
3. **集成支付系統**: 添加在線支付功能
4. **數據分析與報表**: 加強業務數據分析功能

## 文檔維護

本文檔最後更新於 2025年3月1日，由系統開發團隊維護。如有問題或建議，請聯絡系統管理員。 