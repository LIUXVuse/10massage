# 伊林SPA預約系統 - 系統架構文檔

![Last Updated](https://img.shields.io/badge/last%20updated-2025--03--06-orange.svg)

本文件詳細說明伊林SPA預約系統的系統架構、技術棧和核心功能實現。

## 📋 目錄

- [系統概述](#系統概述)
- [技術棧](#技術棧)
- [系統架構](#系統架構)
- [核心功能實現](#核心功能實現)
- [資料庫設計](#資料庫設計)
- [API設計](#api設計)
- [安全性考慮](#安全性考慮)

## 💫 系統概述

伊林SPA預約系統是一個現代化的預約管理平台，採用最新的Web技術棧，提供高效、可靠的預約服務管理解決方案。

### 主要功能模組

1. **預約管理**
   - 線上預約
   - 預約狀態追蹤
   - 預約提醒
   - 預約歷史記錄

2. **服務管理**
   - 服務項目管理
   - 價格管理
   - 服務時間管理
   - 自定義選項

3. **按摩師管理**
   - 按摩師資料管理
   - 排班管理
   - 績效追蹤
   - 專長管理

4. **會員管理**
   - 會員註冊/登入
   - 會員資料管理
   - 會員等級管理
   - 會員優惠管理

## 🛠 技術棧

### 前端技術

- **框架**: Next.js 14 (App Router)
- **UI庫**: 
  - Tailwind CSS 3.4
  - Radix UI (無障礙組件)
  - Framer Motion (動畫效果)
- **狀態管理**: React Context + Hooks
- **表單處理**: React Hook Form + Zod
- **HTTP客戶端**: Axios
- **日期處理**: Day.js

### 後端技術

- **運行時**: Node.js 18+
- **API框架**: Next.js API Routes
- **資料庫**: 
  - PostgreSQL 15.0 (Neon)
  - Prisma ORM
- **認證**: NextAuth.js 4.24
- **檔案存儲**: Vercel Blob Storage
- **快取**: Vercel Edge Cache

### 開發工具

- **語言**: TypeScript 5.0
- **程式碼品質**:
  - ESLint
  - Prettier
  - TypeScript Strict Mode
- **測試**:
  - Jest
  - React Testing Library
  - Playwright (E2E)

## 🏗 系統架構

### 整體架構

```
伊林SPA預約系統
├── 前端層
│   ├── 使用者介面 (Next.js Pages)
│   ├── 狀態管理 (React Context)
│   └── API 整合 (Axios)
├── 應用層
│   ├── 業務邏輯
│   ├── 資料驗證
│   └── 錯誤處理
├── 資料存取層
│   ├── Prisma ORM
│   └── 資料庫操作
└── 基礎設施層
    ├── 資料庫 (PostgreSQL)
    ├── 認證服務 (NextAuth)
    └── 檔案存儲 (Vercel Blob)
```

### 目錄結構

```
src/
├── app/                # Next.js App Router 結構
├── components/         # React 組件
├── lib/               # 共用函式庫
├── types/             # TypeScript 類型定義
└── utils/             # 工具函數
```

## 💎 核心功能實現

### 1. 預約系統

預約系統採用事件驅動架構，確保高效處理並發預約請求：

```typescript
interface Booking {
  id: string;
  userId: string;
  masseurId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  customOptions?: CustomOption[];
}

enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
```

### 2. 服務管理

服務管理系統支援複雜的定價策略和自定義選項：

```typescript
interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: number;
  customOptions?: {
    name: string;
    price: number;
    duration: number;
  }[];
}
```

### 3. 按摩師管理

按摩師管理系統包含排班和專長管理：

```typescript
interface Masseur {
  id: string;
  name: string;
  specialties: string[];
  schedule: Schedule[];
  status: MasseurStatus;
  sortOrder: number;
}
```

## 📊 資料庫設計

### 主要資料表

1. **Users** - 用戶資料
2. **Masseurs** - 按摩師資料
3. **Services** - 服務項目
4. **Bookings** - 預約記錄
5. **CustomOptions** - 自定義選項

### 關聯圖

```
Users 1:N Bookings N:1 Masseurs
Services 1:N Bookings
Services 1:N CustomOptions
```

## 🔌 API設計

### RESTful API

所有API端點遵循RESTful設計原則：

```
GET    /api/services     # 獲取服務列表
POST   /api/bookings    # 創建預約
PUT    /api/masseurs/1  # 更新按摩師資料
DELETE /api/bookings/1  # 取消預約
```

### API響應格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

## 🔒 安全性考慮

1. **認證與授權**
   - JWT based authentication
   - Role-based access control
   - Session management

2. **資料安全**
   - 資料加密
   - SQL注入防護
   - XSS防護

3. **API安全**
   - Rate limiting
   - CORS設置
   - Request validation

## 📈 效能優化

1. **前端優化**
   - 圖片優化
   - 代碼分割
   - 靜態生成

2. **後端優化**
   - 資料庫索引
   - 查詢優化
   - 快取策略

3. **部署優化**
   - CDN分發
   - Edge Functions
   - 自動擴展 