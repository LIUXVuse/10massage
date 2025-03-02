# 伊林SPA預約系統 - 部署指南

*文檔創建日期：2025-03-02*
*最後更新：2025-03-02*

## 目錄

1. [部署概述](#部署概述)
2. [環境需求](#環境需求)
3. [部署選項](#部署選項)
   - [Vercel部署](#vercel部署)
   - [自托管部署](#自托管部署)
4. [數據庫設置](#數據庫設置)
5. [環境變量配置](#環境變量配置)
6. [持續集成/持續部署](#持續集成持續部署)
7. [監控與日誌](#監控與日誌)
8. [常見問題排查](#常見問題排查)

## 部署概述

伊林SPA預約系統是基於Next.js構建的全棧應用，可以通過多種方式進行部署。本指南將介紹最常用的部署方法，包括Vercel平台部署和自托管部署。

## 環境需求

無論選擇哪種部署方式，系統都需要以下基本環境：

- **Node.js**: 20.x 或更高版本
- **數據庫**: PostgreSQL 15 或更高版本
- **存儲**: 用於存儲圖片和文檔的服務（可選）
- **網絡**: 支持HTTPS的域名和SSL證書

## 部署選項

### Vercel部署

Vercel是官方推薦的部署平台，提供了最簡單的部署體驗和良好的性能。

#### 步驟1: 準備Vercel帳戶

1. 註冊或登錄 [Vercel](https://vercel.com)
2. 在Dashboard中創建新項目

#### 步驟2: 導入GitHub倉庫

1. 點擊「Import Project」
2. 選擇「Import Git Repository」
3. 連接您的GitHub帳戶並選擇10massage倉庫
4. 點擊「Import」

#### 步驟3: 配置環境變量

在Vercel項目設置中，添加以下環境變量：

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

#### 步驟4: 部署設置

在「Build & Development Settings」中確認以下設置：

- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

#### 步驟5: 觸發部署

1. 點擊「Deploy」按鈕
2. 等待部署完成
3. 訪問分配的域名或設置自定義域名

### 自托管部署

如果需要更多的控制權或特定的基礎設施需求，可以選擇自托管部署。

#### 步驟1: 服務器準備

1. 準備一台Linux服務器（推薦Ubuntu 20.04或更高版本）
2. 安裝必要的依賴：
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm postgresql nginx
   ```

3. 設置Node.js環境：
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

#### 步驟2: 克隆代碼庫

```bash
git clone https://github.com/yourusername/10massage.git
cd 10massage
npm install
```

#### 步驟3: 構建應用

```bash
npm run build
```

#### 步驟4: 設置環境變量

創建`.env`文件：

```bash
cp .env.example .env
nano .env
```

編輯環境變量：

```
DATABASE_URL=postgresql://username:password@localhost:5432/massage
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

#### 步驟5: 設置PM2進程管理

```bash
npm install -g pm2
pm2 start npm --name "massage" -- start
pm2 save
pm2 startup
```

#### 步驟6: 配置Nginx

創建Nginx配置：

```bash
sudo nano /etc/nginx/sites-available/massage
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

啟用站點：

```bash
sudo ln -s /etc/nginx/sites-available/massage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 步驟7: 設置SSL證書

使用Certbot安裝SSL證書：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 數據庫設置

系統需要一個PostgreSQL數據庫，可以使用本地數據庫或雲服務提供商（如Supabase, Neon等）。

### 本地PostgreSQL設置

1. 安裝PostgreSQL：
   ```bash
   sudo apt install -y postgresql postgresql-contrib
   ```

2. 創建數據庫和用戶：
   ```bash
   sudo -u postgres psql
   ```

   ```sql
   CREATE DATABASE massage;
   CREATE USER massageuser WITH ENCRYPTED PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE massage TO massageuser;
   \q
   ```

3. 應用數據庫遷移：
   ```bash
   npx prisma migrate deploy
   ```

### 雲數據庫設置

1. 在雲提供商（如Supabase, Neon, AWS RDS等）創建PostgreSQL數據庫
2. 獲取連接字符串並更新環境變量
3. 應用數據庫遷移：
   ```bash
   npx prisma migrate deploy
   ```

## 環境變量配置

系統使用以下環境變量：

| 變量名 | 描述 | 示例 |
|--------|------|------|
| DATABASE_URL | 數據庫連接字符串 | postgresql://user:pass@host:port/db |
| NEXTAUTH_SECRET | NextAuth加密密鑰 | a-random-string |
| NEXTAUTH_URL | 應用的完整URL | https://your-domain.com |
| NEXT_PUBLIC_API_URL | API基礎URL（可選） | https://your-domain.com/api |
| LOG_LEVEL | 日誌級別（可選） | info |

## 持續集成/持續部署

### GitHub Actions設置

在`.github/workflows`目錄下創建`deploy.yml`文件：

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 監控與日誌

### 日誌管理

1. 在Vercel部署中，日誌可以通過Vercel Dashboard訪問
2. 在自托管部署中，使用PM2查看日誌：
   ```bash
   pm2 logs massage
   ```

### 應用監控

建議集成以下監控工具：

1. Sentry：用於錯誤跟踪和性能監控
   ```bash
   npm install @sentry/nextjs
   ```

2. Google Analytics或Plausible：用於用戶行為分析

## 常見問題排查

### 數據庫連接錯誤

**問題**：應用無法連接到數據庫
**解決方案**：
1. 確認DATABASE_URL環境變量正確設置
2. 檢查數據庫服務器防火牆設置
3. 驗證數據庫用戶權限
4. 使用`ping`和`telnet`測試連接

### 構建失敗

**問題**：Vercel或本地構建失敗
**解決方案**：
1. 檢查構建日誌確定具體錯誤
2. 確保所有依賴正確安裝
3. 檢查Node.js版本兼容性
4. 清除`.next`目錄後重新構建

### API返回500錯誤

**問題**：API調用返回500內部服務器錯誤
**解決方案**：
1. 檢查服務器日誌了解具體錯誤
2. 驗證API路由處理邏輯
3. 確認數據庫查詢正確
4. 添加更詳細的錯誤日誌記錄

### 會話過期問題

**問題**：用戶頻繁被登出或會話無法維持
**解決方案**：
1. 檢查NEXTAUTH_SECRET是否在環境變量中設置
2. 確認NEXTAUTH_URL指向正確域名
3. 檢查cookies設置和跨域問題
4. 適當延長會話過期時間 