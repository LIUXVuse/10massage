# 伊林SPA預約系統開發文件

![Version](https://img.shields.io/badge/version-2.0.0-green.svg)
![Last Updated](https://img.shields.io/badge/last%20updated-2025--03--02-orange.svg)

本文件為開發者提供關於伊林SPA預約系統的詳細開發指南，包含環境設置、資料庫管理、API結構、前端開發等內容。

## 📋 目錄

- [環境設置](#環境設置)
- [本地開發](#本地開發)
- [資料庫管理](#資料庫管理)
- [API結構](#api結構)
- [前端開發](#前端開發)
- [部署流程](#部署流程)
- [最佳實踐](#最佳實踐)
- [已知問題](#已知問題)

## 💻 環境設置

### 系統需求
- **Node.js**: v18.0.0 或更高版本
- **npm**: v9.0.0 或更高版本
- **Git**: 用於版本控制

### 安裝步驟

1. **克隆儲存庫**
   ```bash
   git clone https://github.com/yourusername/eilin-spa-booking.git
   cd eilin-spa-booking
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **環境變數設置**
   複製 `.env.example` 到 `.env`，並根據需要修改值:
   ```bash
   cp .env.example .env
   ```

4. **設置資料庫**
   - 本地開發使用 SQLite
   - 初始化資料庫:
     ```bash
     npx prisma migrate dev --name initial
     ```

5. **啟動開發服務器**
   ```bash
   npm run dev
   ```
   服務器默認在 http://localhost:3000 運行

## 🚀 本地開發

### 開發指令
- **啟動開發服務器**: `npm run dev`
- **建置專案**: `npm run build`
- **啟動生產環境**: `npm start`
- **執行測試**: `npm test`
- **執行Lint**: `npm run lint`

### 程式碼架構

```
src/
├── app/                        # Next.js 14 App Router 結構
│   ├── (auth)/                 # 認證相關頁面
│   │   ├── login/              # 登入頁面
│   │   └── register/           # 註冊頁面
│   ├── (dashboard)/            # 管理介面 (需要登入)
│   │   ├── dashboard/          # 主儀表板
│   │   ├── masseurs/           # 按摩師管理頁面
│   │   │   ├── page.tsx        # 按摩師列表頁面
│   │   │   └── edit/[id]/      # 按摩師編輯/新增頁面
│   │   ├── services/           # 服務管理頁面 
│   │   ├── users/              # 用戶管理頁面
│   │   └── layout.tsx          # 儀表板共用佈局
│   ├── admin/                  # 系統管理功能
│   │   └── repair/             # 系統修復工具頁面
│   ├── (site)/                 # 公開網站部分
│   │   ├── masseurs/           # 公開按摩師列表
│   │   └── services/           # 公開服務列表
│   ├── api/                    # API 端點
│   │   ├── admin/              # 管理相關API
│   │   │   ├── init-accounts/  # 初始化帳戶API
│   │   │   └── repair-accounts/# 修復帳戶API
│   │   ├── auth/               # 認證相關 API
│   │   ├── masseurs/           # 按摩師 API
│   │   ├── services/           # 服務 API
│   │   ├── upload/             # 檔案上傳 API
│   │   └── users/              # 用戶管理 API
│   └── page.tsx                # 網站首頁
├── components/                 # 可復用組件
├── lib/                        # 工具函數和庫
├── public/                     # 靜態資源
└── prisma/                     # Prisma 資料庫設定
    ├── schema.prisma           # 資料庫模型定義
    └── migrations/             # 資料庫遷移紀錄
```

## 📊 資料庫管理

### Prisma 設置
我們使用 Prisma 作為 ORM 工具，資料庫模型定義在 `prisma/schema.prisma`。

### 資料庫模型

#### 主要實體關係圖
```
User 1--* Booking *--1 Service
      \
       \
        *--* Masseur
```

#### 主要資料表描述

**User**
- 使用者資料表，存儲所有用戶信息
- 包含角色區分: ADMIN, MASSEUR, USER

**Masseur**
- 按摩師資料表
- 與用戶表關聯，一個MASSEUR角色用戶可以關聯到一個按摩師記錄
- 包含照片處理相關欄位 (imageScale, cropX/Y, cropWidth/Height)
- 2025/03/01 新增: sortOrder 欄位用於控制排序順序

**Service**
- 服務項目資料表
- 記錄名稱、價格、時長、描述等信息
- 與按摩師存在多對多關聯

**Booking**
- 預約記錄資料表
- 關聯用戶、服務項目和按摩師
- 記錄預約日期、時間、狀態等

### 資料庫操作

#### 生成遷移計劃
```bash
npx prisma migrate dev --name 遷移名稱
```

#### 直接應用遷移
```bash
npx prisma migrate deploy
```

#### 重置本地開發資料庫
```bash
npx prisma migrate reset
```

#### 生成Prisma客戶端
```bash
npx prisma generate
```

## 📡 API結構

### RESTful API 端點

#### 按摩師 API
- `GET /api/masseurs` - 獲取所有按摩師
- `GET /api/masseurs/:id` - 獲取特定按摩師
- `POST /api/masseurs` - 創建新按摩師
- `PUT /api/masseurs/:id` - 更新按摩師信息
- `DELETE /api/masseurs/:id` - 刪除按摩師
- `POST /api/masseurs/reorder` - 重新排序按摩師 (2025/03/01 新增)

#### 服務 API
- `GET /api/services` - 獲取所有服務
- `GET /api/services/:id` - 獲取特定服務
- `POST /api/services` - 創建新服務
- `PUT /api/services/:id` - 更新服務信息
- `DELETE /api/services/:id` - 刪除服務

#### 用戶管理 API
- `GET /api/users` - 獲取所有用戶 (僅管理員)
- `PUT /api/users/:id/role` - 更新用戶角色 (僅管理員)
- `GET /api/users/me` - 獲取當前用戶信息

#### 管理 API
- `GET /api/admin/init-accounts` - 初始化默認帳戶
- `GET /api/admin/repair-accounts` - 修復系統帳戶問題 (2025/03/03 新增)

### API 調用示例

```typescript
// 使用 fetch 獲取按摩師列表
const fetchMasseurs = async () => {
  const response = await fetch('/api/masseurs');
  if (!response.ok) {
    throw new Error('Failed to fetch masseurs');
  }
  return response.json();
};

// 創建新按摩師
const createMasseur = async (data) => {
  const response = await fetch('/api/masseurs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create masseur');
  }
  return response.json();
};

// 更新用戶角色
const updateUserRole = async (userId, role) => {
  const response = await fetch(`/api/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    throw new Error('Failed to update user role');
  }
  return response.json();
};
```

## 🎨 前端開發

### UI 組件庫
- **Radix UI**: 提供基礎無樣式組件
- **shadcn/ui**: 基於Radix UI的高質量組件集合
- **Tailwind CSS**: 用於所有樣式設計

### 重要組件

#### 按摩師相關組件
- `MasseurForm`: 按摩師資料編輯表單 (`src/components/masseurs/masseur-form.tsx`)
- `ImageUploader`: 圖片上傳和裁剪組件 (`src/components/shared/image-uploader.tsx`)
- `SortableMasseurCard`: 可排序的按摩師卡片組件 (src/app/(dashboard)/masseurs/page.tsx)

#### 認證相關組件
- `LoginForm`: 登入表單 (`src/components/auth/login-form.tsx`)
- `RegisterForm`: 註冊表單 (`src/components/auth/register-form.tsx`)

### 數據獲取模式

使用Server Components獲取數據：

```typescript
// 在Server Component中直接訪問資料庫
import { prisma } from "@/lib/db/prisma";

export default async function MasseursPage() {
  const masseurs = await prisma.masseur.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { services: true }
  });
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {masseurs.map(masseur => (
        <MasseurCard key={masseur.id} masseur={masseur} />
      ))}
    </div>
  );
}
```

使用Client Components中獲取數據：

```typescript
'use client';
import { useState, useEffect } from 'react';

export default function MasseursList() {
  const [masseurs, setMasseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/masseurs')
      .then(res => res.json())
      .then(data => {
        setMasseurs(data);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {masseurs.map(masseur => (
        <MasseurCard key={masseur.id} masseur={masseur} />
      ))}
    </div>
  );
}
```

## 🚢 部署流程

### 生產環境部署

#### Vercel部署 (推薦)

1. **準備工作**:
   - 在GitHub上建立專案倉庫
   - 在Neon.tech建立PostgreSQL資料庫

2. **Vercel項目設置**:
   - 連接GitHub倉庫
   - 設置建置命令: `npx prisma generate && next build`
   - 設置環境變數

3. **關鍵環境變數**:
   ```
   # 數據庫連接
   NEON_POSTGRES_PRISMA_URL="postgresql://username:password@db.eu-central-1.neon.tech/database?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://username:password@db.eu-central-1.neon.tech/database?sslmode=require"
   
   # NextAuth設置
   NEXTAUTH_URL="https://your-app.vercel.app"
   NEXTAUTH_SECRET="your-auth-secret"
   
   # 應用設置
   NODE_ENV="production"
   ```

4. **PostgreSQL連接字串格式**:
   Neon PostgreSQL的連接字串格式通常為:
   ```
   postgresql://[user]:[password]@[neon-host]/[dbname]?sslmode=require
   ```
   
   - 生產環境需要添加以下參數:
     - `pgbouncer=true`: 啟用連接池
     - `sslmode=require`: 啟用SSL加密

5. **部署後步驟**:
   - 訪問 `/api/admin/init-accounts` 初始化管理員帳戶
   - 使用預設帳號登入 (admin@eilinspa.com / admin123)
   - 如果帳號登入有問題，訪問 `/admin/repair` 使用修復工具

### 系統修復工具開發 (2025/03/03 新增)

系統修復工具設計為解決帳戶相關問題的自動化解決方案。

#### 關鍵檔案
- 修復頁面: `src/app/admin/repair/page.tsx`
- 修復API: `src/app/api/admin/repair-accounts/route.ts`

#### 主要功能
1. **密碼雜湊一致化**:
   - 檢測並統一所有帳戶的密碼雜湊方法
   - 確保所有環境中密碼驗證的一致性

2. **角色與資料關聯修復**:
   - 為所有具有MASSEUR角色的用戶創建對應的masseur記錄
   - 確保角色權限與資料記錄的一致性

#### 核心實現
```typescript
// 簡化的修復邏輯示例
async function repairAccounts() {
  // 1. 修復所有帳戶的密碼雜湊
  const users = await prisma.user.findMany();
  for (const user of users) {
    // 使用統一的雜湊方法重新雜湊密碼
    const hashedPassword = await hashPassword(user.password);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
  }
  
  // 2. 修復MASSEUR角色用戶的資料關聯
  const masseurUsers = await prisma.user.findMany({
    where: { role: 'MASSEUR' }
  });
  
  for (const user of masseurUsers) {
    // 檢查是否已有對應的masseur記錄
    const existingMasseur = await prisma.masseur.findFirst({
      where: { userId: user.id }
    });
    
    // 如果沒有，創建一個新的masseur記錄
    if (!existingMasseur) {
      await prisma.masseur.create({
        data: {
          name: user.name || '按摩師',
          userId: user.id,
          description: '按摩師簡介',
          isActive: true
        }
      });
    }
  }
  
  return { success: true };
}
```

## 🏆 最佳實踐

### 程式碼風格
- 使用ESLint和Prettier保持代碼風格一致
- 遵循TypeScript嚴格模式開發
- 使用命名約定: 
  - 組件使用PascalCase
  - 函數使用camelCase
  - 常量使用UPPER_SNAKE_CASE

### 開發工作流
1. 創建功能分支進行開發
2. 完成功能後提交PR並進行代碼審查
3. 合併PR後自動部署到預發環境測試
4. 確認無問題後手動部署到生產環境

### 安全性實踐
- 使用NextAuth處理認證和授權
- 遵循最小權限原則設計API
- 所有數據庫操作使用參數化查詢防止注入攻擊
- 所有文件上傳進行嚴格驗證和安全處理

### 性能優化
- 使用Next.js的Image組件優化圖片加載
- 實施資料預取和緩存策略
- 使用Suspense和React.lazy實現代碼拆分
- 關鍵API路由實施速率限制

## ⚠️ 已知問題

### 開發環境問題
1. **Hot Reload失效**
   - 問題: 有時修改代碼後熱重載失效
   - 解決方案: 重啟開發服務器或清除`.next`目錄

2. **Prisma連接錯誤**
   - 問題: 偶爾出現"Prisma Client was unable to connect"錯誤
   - 解決方案: 檢查DATABASE_URL配置，確保資料庫服務運行正常

### 部署環境問題
1. **Radix UI組件加載錯誤**
   - 問題: 某些Radix UI組件可能在部署環境出現"Module not found"錯誤
   - 解決方案: 確保安裝所有必要的Radix UI套件，如`npm install @radix-ui/react-separator --save`

2. **NextAuth配置問題**
   - 問題: 認證功能在部署環境中失效
   - 解決方案: 確保正確設置NEXTAUTH_URL和NEXTAUTH_SECRET環境變數

3. **Neon PostgreSQL連接問題**
   - 問題: 連接到Neon PostgreSQL時出現超時或SSL錯誤
   - 解決方案: 
     - 確保URL格式正確，包含所有必要參數
     - 檢查在Vercel環境變數中是否正確設置了DIRECT_URL
     - 確保Neon資料庫允許來自Vercel的連接 