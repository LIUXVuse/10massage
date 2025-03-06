# Vercel 部署指南

![Last Updated](https://img.shields.io/badge/last%20updated-2025--03--06-orange.svg)

本文件提供在 Vercel 平台上部署伊林SPA預約系統的詳細指南。

## 📋 目錄

- [前置準備](#前置準備)
- [部署步驟](#部署步驟)
- [環境變數設置](#環境變數設置)
- [域名設置](#域名設置)
- [監控與維護](#監控與維護)
- [常見問題](#常見問題)

## 🔧 前置準備

1. **Vercel 帳號**
   - 註冊 Vercel 帳號
   - 安裝 Vercel CLI: `npm i -g vercel`

2. **GitHub 整合**
   - 將專案推送到 GitHub
   - 在 Vercel 中連接 GitHub 帳號

3. **資料庫準備**
   - 在 Neon 建立 PostgreSQL 資料庫
   - 取得資料庫連接字串

## 🚀 部署步驟

### 1. 初始化部署

```bash
# 登入 Vercel
vercel login

# 初始化專案
vercel init

# 部署專案
vercel deploy
```

### 2. 配置構建設置

在 `vercel.json` 中配置：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  }
}
```

### 3. 設置環境變數

在 Vercel 控制台中設置以下環境變數：

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=your-email
```

### 4. 配置域名

1. 在 Vercel 控制台添加自定義域名
2. 設置 DNS 記錄
3. 等待 SSL 證書生成

## ⚙️ 環境變數設置

### 必要環境變數

| 變數名 | 說明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | 資料庫連接字串 | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | NextAuth URL | `https://your-domain.com` |
| `NEXTAUTH_SECRET` | NextAuth 密鑰 | `your-secret-key` |

### 可選環境變數

| 變數名 | 說明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_URL` | API 基礎 URL | `https://api.your-domain.com` |
| `SENDGRID_API_KEY` | SendGrid API 密鑰 | `SG.xxxxx` |

## 🌐 域名設置

### DNS 記錄設置

```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

### SSL 設置

Vercel 自動提供 SSL 證書，無需手動配置。

## 📊 監控與維護

### 1. 性能監控

- 使用 Vercel Analytics 監控性能
- 設置性能預算
- 監控 API 響應時間

### 2. 錯誤追蹤

- 設置 Sentry 整合
- 配置錯誤通知
- 監控錯誤率

### 3. 日誌管理

- 使用 Vercel Logs
- 設置日誌保留期
- 配置日誌導出

## ❓ 常見問題

### 1. 構建失敗

**問題**: 部署時構建失敗

**解決方案**:
- 檢查 `package.json` 中的構建腳本
- 確認所有依賴都已正確安裝
- 檢查環境變數是否正確設置

### 2. 資料庫連接問題

**問題**: 無法連接到資料庫

**解決方案**:
- 確認資料庫連接字串格式
- 檢查資料庫防火牆設置
- 確認資料庫服務狀態

### 3. 域名問題

**問題**: 域名無法訪問

**解決方案**:
- 檢查 DNS 記錄是否正確
- 等待 DNS 傳播完成
- 確認 SSL 證書狀態

## 📝 部署檢查清單

### 部署前檢查

- [ ] 所有環境變數已設置
- [ ] 資料庫遷移已完成
- [ ] 測試已通過
- [ ] 依賴已更新到最新版本
- [ ] Git 分支已同步

### 部署後檢查

- [ ] 網站可以正常訪問
- [ ] API 端點正常運作
- [ ] 資料庫連接正常
- [ ] SSL 證書有效
- [ ] 監控工具已啟動

## 🔄 回滾流程

如果需要回滾到之前的版本：

1. 在 Vercel 控制台找到之前的部署
2. 點擊 "Redeploy"
3. 確認回滾後的版本運作正常

## 📈 效能優化建議

1. **前端優化**
   - 啟用自動圖片優化
   - 配置頁面預渲染
   - 啟用增量靜態再生成

2. **API 優化**
   - 使用 Edge Functions
   - 配置 API 快取
   - 啟用請求合併

3. **資料庫優化**
   - 使用連接池
   - 配置查詢快取
   - 優化索引使用 