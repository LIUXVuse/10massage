# 伊林SPA預約系統 (v2.0)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-green.svg)
![Last Updated](https://img.shields.io/badge/last%20updated-2025--03--02-orange.svg)

專為伊林SPA設計的全功能線上預約系統，提供簡單舒適且安全的預約體驗，支援多平台使用。

## 📋 目錄

- [專案概述](#專案概述)
- [系統架構](#系統架構)
- [核心文件架構](#核心文件架構)
- [功能特色](#功能特色)
- [開發進度](#開發進度)
- [管理員指南](#管理員指南)
- [已知問題](#已知問題)
- [Vercel部署指南](#vercel部署指南)
- [Cloudflare部署指南](#cloudflare部署指南)
- [開發者文件](#開發者文件)
- [問題回報](#問題回報)
- [授權資訊](#授權資訊)

## 📊 專案概述

- **前端框架**: Next.js 14 (App Router)
- **UI框架**: Tailwind CSS 3.4 + Radix UI
- **資料庫**: PostgreSQL 15.0 (Neon) / SQLite (本地開發)
- **ORM**: Prisma 6.2
- **認證**: NextAuth.js 4.24
- **API**: RESTful API
- **部署**: Vercel + Neon PostgreSQL
- **開發語言**: TypeScript 5.0

## 🔧 系統架構

```
伊林SPA預約系統
├── 前端 (Next.js + Tailwind CSS)
│   ├── 使用者介面 (src/app/*)
│   ├── 表單驗證 (React Hook Form + Zod)
│   └── 狀態管理 (React Context)
├── 後端 (Next.js API Routes)
│   ├── RESTful API (src/app/api/*)
│   ├── 認證系統 (NextAuth - src/lib/auth/*)
│   └── 檔案上傳處理 (src/app/api/upload)
└── 資料庫 (PostgreSQL + Prisma)
    ├── 使用者數據 (src/lib/db/prisma.ts)
    ├── 預約資訊 (prisma/schema.prisma)
    └── 業務數據 (prisma/migrations/*)
```

## 📂 核心文件架構

```
src/
├── app/                            # Next.js 14 App Router 結構
│   ├── (auth)/                     # 認證相關頁面
│   │   ├── login/                  # 登入頁面
│   │   └── register/               # 註冊頁面
│   ├── (dashboard)/                # 管理介面 (需要登入)
│   │   ├── dashboard/              # 主儀表板
│   │   ├── masseurs/               # 按摩師管理頁面
│   │   │   ├── page.tsx            # 按摩師列表頁面
│   │   │   └── edit/[id]/          # 按摩師編輯/新增頁面
│   │   ├── services/               # 服務管理頁面 
│   │   ├── users/                  # 用戶管理頁面
│   │   └── layout.tsx              # 儀表板共用佈局
│   ├── (site)/                     # 公開網站部分
│   │   ├── masseurs/               # 公開按摩師列表
│   │   └── services/               # 公開服務列表
│   ├── api/                        # API 端點
│   │   ├── auth/                   # 認證相關 API
│   │   ├── masseurs/               # 按摩師 API
│   │   ├── services/               # 服務 API
│   │   ├── upload/                 # 檔案上傳 API
│   │   └── users/                  # 用戶管理 API
│   └── page.tsx                    # 網站首頁
├── components/                     # 可復用組件
│   ├── admin/                      # 管理介面組件
│   │   └── user-role-management.tsx # 用戶角色管理組件
│   ├── auth/                       # 認證相關組件
│   ├── masseurs/                   # 按摩師相關組件
│   │   └── masseur-form.tsx        # 按摩師表單組件
│   ├── services/                   # 服務相關組件
│   └── ui/                         # UI基礎組件
├── lib/                            # 工具函數和庫
│   ├── auth/                       # 認證相關工具
│   │   └── auth-utils.ts           # 權限檢查函數
│   └── db/                         # 數據庫相關
│       └── prisma.ts               # Prisma客戶端實例
└── middleware.ts                   # Next.js中間件 (路由保護)
```

## ✨ 功能特色

### 🧑‍💻 會員系統
- **會員註冊/登入**: 支援電子郵件及社交媒體登入
- **個人資料管理**: 完整的資料編輯功能
- **預約紀錄查詢**: 歷史預約記錄及狀態追蹤
- **喜好設定**: 個人化使用體驗

### 📅 預約系統
- **服務項目瀏覽**: 智能過濾與搜尋功能
- **按摩師選擇**: 詳細資訊與評價系統
- **時段預約**: 直覺式時間選擇介面
- **預約管理**: 變更與取消功能

### 🖥️ 管理後台
- **服務項目管理**: 
  - 完整的CRUD操作介面
  - 價格、時長和分類設定
  - 服務狀態切換(啟用/停用)
  - 推薦服務設定
- **按摩師管理**: 
  - 基本資料管理
  - 照片上傳與調整 (支援裁剪、縮放及拖曳上傳)
  - 服務項目關聯
  - 按摩師狀態管理
  - **按摩師排序**: 可拖曳調整顯示順序
- **用戶角色管理**:
  - 查看所有系統用戶
  - 角色權限分配 (管理員/按摩師/一般用戶)
  - 用戶狀態管理
- **儀表板**:
  - 系統運行狀態摘要
  - 關鍵業務數據可視化
  - 預約統計與分析
- **安全控制**:
  - 基於角色的訪問控制
  - 操作日誌與記錄

### 📱 通知系統
- **預約成功通知**: 電子郵件與簡訊通知
- **預約提醒通知**: 客製化提醒時間
- **狀態更新通知**: 即時系統通知

## 📈 開發進度

### 已完成功能 (2025/03/15)
- **Cloudflare 部署優化**
  - [x] 將系統成功部署到 Cloudflare Pages
  - [x] 整合 Cloudflare D1 資料庫服務
  - [x] 整合 Cloudflare R2 儲存服務
  - [x] 優化構建過程，解決大型檔案問題
  - [x] 設置適當的綁定，確保資源訪問權限
  - [x] 記錄已知問題和解決方案

### 已完成功能 (2025/03/01)
- **按摩師管理功能全面優化**
  - [x] 完善按摩師圖片處理系統，修復裁剪和縮放參數在編輯後的顯示問題
  - [x] 強化按摩師列表頁面的圖片呈現邏輯，確保圖片正確加載和顯示
  - [x] 優化按摩師排序功能，從時間戳記排序改為直接使用sortOrder欄位，確保排序穩定性
  - [x] 改進排序儲存機制，確保排序資料在重新登入後依然保持
  - [x] 增強API效能和錯誤處理，添加詳細日誌以便排查問題
  - [x] 修復管理員權限驗證機制，確保只有管理員可以編輯按摩師資訊

### 已完成功能 (2025/02/28)
- **按摩師管理功能強化**
  - [x] 添加按摩師排序功能
  - [x] 拖曳式排序介面
  - [x] 排序結果實時儲存
  - [x] 照片裁剪功能優化
- **用戶界面體驗提升**
  - [x] 通知系統整合
  - [x] 錯誤處理優化
  - [x] 跨裝置顯示優化

### 已完成功能 (2025/02/15)
- **按摩師管理功能優化**
  - [x] 移除按摩師表單中的服務選擇項
  - [x] 添加拖曳上傳圖片功能
  - [x] 修復認證系統在客戶端/服務器端的兼容性問題
  - [x] 改進按摩師與服務項目之間的關聯方式
  - [x] 修復了Cloudflare部署中的多個問題
- **用戶角色管理**
  - [x] 實現用戶角色管理界面
  - [x] 添加用戶管理頁面
  - [x] 權限控制優化
- **檔案結構優化**
  - [x] 統一權限控制邏輯
  - [x] 移除冗餘代碼和API
  - [x] 簡化路由結構
  - [x] 優化資料庫訪問方式

### 已完成功能 (2025/01/15)
- **按摩師管理功能優化**
  - [x] 照片上傳功能
  - [x] 照片預覽與調整（縮放/位置）
  - [x] 自我介紹欄位優化
  - [x] 資料庫結構優化
- **使用者介面改進**
  - [x] 按摩師列表頁面優化
  - [x] 照片顯示優化
  - [x] 表單驗證強化
- **資料庫更新**
  - [x] 新增圖片調整相關欄位
  - [x] 資料遷移完成

### 已完成功能 (2025/01/05)
- **專案發布**
  - [x] PostgreSQL 資料庫設置
  - [x] Prisma ORM 設置與資料庫遷移
  - [x] 會員系統基礎功能
  - [x] 管理後台基礎架構
  - [x] 服務項目管理功能開發
- **認證系統**
  - [x] 登入狀態管理優化
  - [x] 登出功能實作
  - [x] 路由權限控制
  - [x] 資料庫整合

### 已完成功能 (2025/01/01)
- **專案初始化**
  - [x] Next.js 14 專案設置
  - [x] Tailwind CSS 設置
  - [x] TypeScript 設置
  - [x] 專案目錄結構建立
- **UI 元件開發**
  - [x] Button 元件
  - [x] Input 元件
  - [x] Form 元件
- **頁面開發**
  - [x] 首頁
  - [x] 登入頁面
  - [x] 註冊頁面
- **認證系統**
  - [x] NextAuth.js 設置
  - [x] API 路由設置

### 進行中功能
- **客戶體驗優化**
  - [ ] 多平台使用者體驗一致性
  - [ ] 效能優化與載入速度提升
  - [ ] 無障礙功能支援
- **商業智能**
  - [ ] 進階數據分析儀表板
  - [ ] 客戶行為分析
  - [ ] 營運決策支援系統

### 待開發功能
- **延伸功能**
  - [ ] 忠誠度計劃整合
  - [ ] 第三方支付整合
  - [ ] 多國語言支援
- **行動應用**
  - [ ] 設計行動應用原型
  - [ ] 開發跨平台應用
  - [ ] 推送通知系統整合

## 🔑 管理員指南

### 使用者角色管理
1. **登入管理員帳戶**：使用管理員帳號登入系統
2. **訪問用戶管理**：從主儀表板進入「用戶管理」頁面
3. **設置用戶角色**：使用下拉選單為用戶設置角色
   - **一般用戶**：僅可預約服務，查看個人資料
   - **按摩師**：可查看和管理與自己相關的預約
   - **管理員**：擁有系統完整管理權限

### 按摩師與服務關聯
從2025年2月版本開始，我們調整了按摩師與服務的關聯方式：
1. 首先創建按摩師基本資料（姓名、照片、介紹等）
2. 然後在服務管理頁面中將服務關聯到對應的按摩師
3. 這種方式可以更靈活地管理哪些按摩師提供哪些服務

### 按摩師排序管理
2025年3月更新功能：
1. 在按摩師管理頁面，管理員可以拖曳按摩師卡片調整顯示順序
2. 新順序會自動保存到資料庫並即時反映在前台顯示
3. 調整順序時會顯示通知提示操作結果
4. 排序資訊會永久儲存在資料庫中，重新登入後仍將保持相同順序

### 按摩師管理工作流程
2025年3月版本更新：
1. **瀏覽按摩師**：在按摩師管理頁面查看所有按摩師清單
2. **新增按摩師**：
   - 點擊頁面上方的「新增按摩師」按鈕
   - 在專屬編輯頁面填寫按摩師資訊、上傳照片並調整照片呈現
   - 填寫完成後點擊「儲存」按鈕，成功後將自動返回列表頁面
3. **編輯按摩師**：
   - 在按摩師卡片上點擊「編輯」按鈕
   - 系統導航至編輯頁面，可修改按摩師所有資訊
   - 編輯完成後點擊「儲存」按鈕，成功後將自動返回列表頁面
4. **刪除按摩師**：
   - 在按摩師卡片上點擊「刪除」按鈕
   - 確認刪除後，按摩師將從系統中移除
5. **排序按摩師**：
   - 管理員可通過拖曳按摩師卡片左上角的圖標調整顯示順序
   - 系統會自動保存新的排序，並顯示操作結果通知
   - 排序資訊在重新登入後仍將維持，無需重新調整
6. **照片處理功能**：
   - 支援多種照片上傳方式（URL、檔案選擇、拖曳上傳）
   - 提供三種照片編輯模式：預覽、縮放、裁剪
   - 裁剪模式下可調整裁剪框大小和位置
   - 縮放模式下可調整照片大小
   - 照片編輯參數會完整保存，確保顯示效果一致

### 資料部署與遷移
本地開發的資料可以順利遷移到Cloudflare生產環境：
1. **本地數據庫**：SQLite用於本地開發
2. **生產環境**：Cloudflare D1作為生產數據庫
3. **遷移方式**：
   - 使用`npx prisma migrate deploy`生成正確的SQL遷移檔案
   - 將SQL遷移檔案導入Cloudflare D1
   - 使用管理界面導入主要資料（如按摩師、服務項目）
4. **部署命令**：
   ```powershell
   # 匯出資料庫結構
   npx prisma migrate deploy
   cat ./prisma/migrations/*/migration.sql > ./combined.sql
   
   # 將結構導入D1（記得加上--remote參數）
   wrangler d1 execute 10massage-db --file=./combined.sql --remote
   
   # 構建和部署
   npm run build
   wrangler pages deploy .next --project-name=10massage
   ```

> 注意：圖片上傳功能在本地和Cloudflare環境都可正常使用，但存儲位置會有所不同。本地使用文件系統，Cloudflare使用R2。必須在Cloudflare控制台中正確設置D1和R2的綁定才能正常運作。

## ⚠️ 已知問題

在使用本系統時，請注意以下已知問題：

### 一般問題
1. **圖片上傳問題**
   - 問題：上傳圖片後無法正確顯示
   - 解決方案：確保`/public/uploads`目錄存在且有寫入權限

2. **數據庫鎖定問題**
   - 問題：偶爾會出現數據庫鎖定錯誤
   - 解決方案：重啟開發服務器，或者使用`npx prisma migrate reset`重設數據庫

### Vercel部署問題
1. **樣式載入問題**
   - 問題：部署到Vercel後，頁面樣式不正確
   - 解決方案：移除 `NEXT_PUBLIC_ASSET_PREFIX` 環境變數，或確保設置正確的URL
   
2. **Prisma初始化錯誤**
   - 問題：部署後出現 `PrismaClientInitializationError`
   - 解決方案：設置建置命令為 `npx prisma generate && next build`

3. **資料庫連接問題**
   - 問題：無法連接到Neon PostgreSQL資料庫
   - 解決方案：檢查 `NEON_POSTGRES_PRISMA_URL` 環境變數是否正確設置

更多Vercel部署相關問題及詳細解決方案，請查看 [Vercel部署指南](#vercel部署指南) 章節。

## Vercel部署指南

本系統支持部署到Vercel平台，並配合使用Neon PostgreSQL資料庫。以下是部署步驟和注意事項：

### 部署準備

1. **GitHub倉庫設置**
   - 確保代碼已推送到GitHub倉庫
   - 如使用私有倉庫，需要授權Vercel訪問

2. **Neon PostgreSQL設置**
   - 在Neon.tech建立免費PostgreSQL資料庫
   - 獲取連接字串(Connection String)

### 部署步驟

1. **Vercel專案設置**
   - 在Vercel創建新專案並連接GitHub倉庫
   - 選擇Next.js框架預設

2. **環境變數設置**
   - `NEON_POSTGRES_PRISMA_URL`: Neon PostgreSQL連接字串
   - `NEXTAUTH_URL`: 完整的Vercel網站URL
   - `NEXTAUTH_SECRET`: 認證加密密鑰
   - `NODE_ENV`: 設為 "production"

3. **建置設置**
   - 建置命令: `npx prisma generate && next build`
   - 輸出目錄: `.next`

4. **資料庫遷移**
   - 在本地運行 `npx prisma migrate dev`
   - 如果從SQLite遷移到PostgreSQL，需要刪除舊的migrations目錄
   - 按照[資料庫遷移指南](#資料庫遷移)操作

5. **部署完成後**
   - 訪問 `/api/admin/init-accounts` 初始化管理員帳戶
   - 使用預設帳號登入: admin@eilinspa.com / admin123
   - **如果登入出現問題**: 訪問 `/admin/repair` 使用系統修復工具修復帳戶問題

### 已知問題與修復方法

#### 預設帳戶登入失敗 (CredentialsSignin 錯誤)

如果您在登入預設帳戶時遇到 "CredentialsSignin" 錯誤，這可能是由於密碼雜湊方法不一致所導致的。
系統在不同環境中可能使用不同的密碼雜湊方法，導致驗證失敗。

**解決方法:**
1. 訪問 `/admin/repair` 頁面
2. 點擊 "開始修復" 按鈕
3. 系統會自動修復所有預設帳戶的密碼雜湊問題
4. 修復完成後，使用預設帳號重新登入

#### 按摩師角色卡不顯示問題

如果您發現指派了按摩師角色的用戶，但在按摩師列表中沒有顯示對應的角色卡，這是因為用戶角色與按摩師記錄之間的關聯缺失。

**解決方法:**
1. 訪問 `/admin/repair` 頁面
2. 點擊 "開始修復" 按鈕
3. 系統會自動為具有按摩師角色的用戶創建對應的按摩師資料記錄
4. 修復完成後，刷新按摩師列表頁面查看結果

### 資料庫遷移

如果您從SQLite遷移到PostgreSQL，需要遵循以下步驟：

1. **移除舊的遷移紀錄**
   ```powershell
   Remove-Item -Path "prisma\migrations" -Recurse -Force
   ```

2. **設置新的資料庫URL**
   在 `.env` 文件中更新連接字串：
   ```
   DATABASE_URL="postgresql://username:password@hostname:port/database"
   ```

3. **生成Prisma客戶端**
   ```powershell
   npx prisma generate
   ```

4. **創建新的遷移**
   ```powershell
   npx prisma migrate dev --name initial
   ```

請確保在本地成功遷移後再部署到Vercel，以避免資料庫結構不一致的問題。

## Cloudflare部署指南

本系統支持部署到Cloudflare Pages，並配合使用Cloudflare D1數據庫和R2存儲服務。部署過程中可能會遇到一些問題，我們已將這些問題及解決方案記錄在專門的部署指南中。

**查看完整部署步驟和問題解決方案：**
- [Cloudflare部署問題與解決方案](./CLOUDFLARE-DEPLOYMENT.md)

主要部署步驟：
1. 設置Cloudflare服務（D1數據庫和R2存儲桶）
2. 配置wrangler.toml
3. 構建並部署應用
4. 設置綁定和環境變數
5. 部署數據庫結構
6. 初始化賬戶

## 👨‍💻 開發者文件

### 資料庫結構

- **User**: 使用者資料表
  - `id`: 唯一識別碼 (主鍵)
  - `name`: 使用者名稱
  - `email`: 電子郵件 (唯一)
  - `password`: 密碼 (已加密)
  - `phone`: 電話號碼
  - `role`: 使用者角色 (預設: user)
  - `createdAt`: 建立時間
  - `updatedAt`: 更新時間

- **Masseur**: 按摩師資料表
  - `id`: 唯一識別碼 (主鍵)
  - `name`: 按摩師名稱
  - `image`: 圖片路徑
  - `imageScale`: 圖片縮放比例
  - `cropX/cropY`: 裁剪座標
  - `cropWidth/cropHeight`: 裁剪尺寸
  - `description`: 按摩師描述
  - `experience`: 經驗年資
  - `sortOrder`: 排序順序 (2025/03/01優化)
  - `isActive`: 是否啟用
  - `services`: 提供的服務項目 (關聯)
  - `createdAt`: 建立時間
  - `updatedAt`: 更新時間

詳細的資料庫結構請參考 `prisma/schema.prisma` 文件。

## 📝 問題回報

如發現系統問題或有功能建議，請透過以下方式回報：

1. **GitHub Issue**: 在專案儲存庫上創建新的 Issue
2. **Email**: 寄送至 support@eilinspa.com
3. **管理面板**: 使用系統內建的問題回報功能

## 📄 授權資訊

© 2025 伊林SPA. All Rights Reserved.
