# 伊林SPA預約系統 - 開發規範

![Last Updated](https://img.shields.io/badge/last%20updated-2025--03--06-orange.svg)

本文件定義了伊林SPA預約系統的開發規範，包括程式碼風格、架構設計、測試要求等。所有開發者都必須遵循這些規範。

## 📋 目錄

- [程式碼風格](#程式碼風格)
- [架構設計](#架構設計)
- [資料庫規範](#資料庫規範)
- [API設計規範](#api設計規範)
- [測試規範](#測試規範)
- [文檔規範](#文檔規範)
- [Git工作流程](#git工作流程)

## 💻 程式碼風格

### TypeScript 規範

1. **型別定義**
   - 使用明確的型別註解
   - 避免使用 `any`
   - 優先使用介面（interface）而非型別（type）
   ```typescript
   // 好的做法
   interface User {
     id: string;
     name: string;
     age: number;
   }
   
   // 避免的做法
   type User = {
     id: any;
     name: any;
     age: any;
   }
   ```

2. **命名規範**
   - 使用有意義的變數名稱
   - 使用 PascalCase 命名類別和介面
   - 使用 camelCase 命名變數和函數
   ```typescript
   // 好的做法
   interface UserProfile {}
   class BookingService {}
   const getUserBookings = () => {}
   
   // 避免的做法
   interface user_profile {}
   class bookingservice {}
   const get_user_bookings = () => {}
   ```

3. **註解規範**
   - 為所有公開 API 添加 JSDoc 註解
   - 使用明確的中文註解說明複雜邏輯
   ```typescript
   /**
    * 取得使用者的預約記錄
    * @param userId 使用者ID
    * @param status 預約狀態（可選）
    * @returns 預約記錄列表
    */
   async function getUserBookings(
     userId: string,
     status?: BookingStatus
   ): Promise<Booking[]> {
     // 實作邏輯
   }
   ```

### React 組件規範

1. **組件結構**
   - 使用函數組件和 Hooks
   - 將大型組件拆分為小型可重用組件
   - 使用 TypeScript 定義 Props 介面
   ```typescript
   interface BookingCardProps {
     booking: Booking;
     onCancel: (id: string) => void;
     onConfirm: (id: string) => void;
   }
   
   const BookingCard: React.FC<BookingCardProps> = ({
     booking,
     onCancel,
     onConfirm,
   }) => {
     // 組件實作
   };
   ```

2. **狀態管理**
   - 使用 React Context 管理全局狀態
   - 使用 React Query 管理伺服器狀態
   - 使用 local state 管理組件內部狀態
   ```typescript
   const BookingContext = createContext<BookingContextType | null>(null);
   
   export const useBooking = () => {
     const context = useContext(BookingContext);
     if (!context) {
       throw new Error('useBooking must be used within BookingProvider');
     }
     return context;
   };
   ```

## 🏗 架構設計

### 目錄結構

```
src/
├── components/          # React 組件
│   ├── common/         # 共用組件
│   ├── layout/         # 佈局組件
│   └── features/       # 功能組件
├── hooks/              # 自定義 Hooks
├── contexts/           # React Contexts
├── services/           # API 服務
├── utils/              # 工具函數
└── types/              # TypeScript 型別定義
```

### 依賴注入

使用依賴注入模式管理服務：

```typescript
interface IBookingService {
  createBooking(data: BookingCreateDTO): Promise<Booking>;
  cancelBooking(id: string): Promise<void>;
}

class BookingService implements IBookingService {
  constructor(private readonly prisma: PrismaClient) {}
  
  async createBooking(data: BookingCreateDTO): Promise<Booking> {
    // 實作邏輯
  }
  
  async cancelBooking(id: string): Promise<void> {
    // 實作邏輯
  }
}
```

## 📊 資料庫規範

### 命名規範

1. **表格命名**
   - 使用複數名詞
   - 使用小寫字母和底線
   ```sql
   CREATE TABLE users (...)
   CREATE TABLE booking_records (...)
   CREATE TABLE service_categories (...)
   ```

2. **欄位命名**
   - 使用小寫字母和底線
   - 主鍵統一使用 `id`
   - 外鍵使用 `表名_id`
   ```sql
   CREATE TABLE bookings (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     service_id UUID REFERENCES services(id),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

### 索引規範

1. **必要索引**
   - 所有外鍵欄位
   - 常用查詢條件
   - 排序欄位
   ```sql
   CREATE INDEX idx_bookings_user_id ON bookings(user_id);
   CREATE INDEX idx_bookings_created_at ON bookings(created_at);
   ```

## 🔌 API設計規範

### RESTful API

1. **URL 命名**
   - 使用複數名詞
   - 使用小寫字母和連字符
   ```
   GET    /api/bookings
   POST   /api/bookings
   GET    /api/bookings/:id
   PUT    /api/bookings/:id
   DELETE /api/bookings/:id
   ```

2. **請求/響應格式**
   ```typescript
   // 請求格式
   interface ApiRequest<T> {
     data: T;
     meta?: Record<string, unknown>;
   }
   
   // 響應格式
   interface ApiResponse<T> {
     success: boolean;
     data?: T;
     error?: {
       code: string;
       message: string;
     };
   }
   ```

### 錯誤處理

1. **錯誤碼規範**
   ```typescript
   enum ErrorCode {
     VALIDATION_ERROR = 'VALIDATION_ERROR',
     NOT_FOUND = 'NOT_FOUND',
     UNAUTHORIZED = 'UNAUTHORIZED',
     FORBIDDEN = 'FORBIDDEN',
     INTERNAL_ERROR = 'INTERNAL_ERROR',
   }
   ```

2. **錯誤響應格式**
   ```typescript
   interface ApiError {
     code: ErrorCode;
     message: string;
     details?: Record<string, unknown>;
   }
   ```

## 🧪 測試規範

### 單元測試

1. **測試文件命名**
   - 使用 `.test.ts` 或 `.spec.ts` 後綴
   - 測試文件與被測試文件放在同一目錄
   ```
   src/
   ├── services/
   │   ├── booking.service.ts
   │   └── booking.service.test.ts
   ```

2. **測試結構**
   ```typescript
   describe('BookingService', () => {
     describe('createBooking', () => {
       it('should create a new booking', async () => {
         // 測試實作
       });
       
       it('should throw error if invalid data', async () => {
         // 測試實作
       });
     });
   });
   ```

### 整合測試

1. **API 測試**
   - 測試所有 API 端點
   - 測試各種請求參數組合
   - 測試錯誤處理
   ```typescript
   describe('Booking API', () => {
     it('should create booking', async () => {
       const response = await request(app)
         .post('/api/bookings')
         .send(mockBookingData);
       
       expect(response.status).toBe(201);
       expect(response.body.data).toHaveProperty('id');
     });
   });
   ```

## 📝 文檔規範

### 程式碼註解

1. **函數註解**
   ```typescript
   /**
    * 創建新的預約記錄
    * @param data - 預約資料
    * @throws {ValidationError} 當資料驗證失敗時
    * @throws {ConflictError} 當時段已被預約時
    * @returns 新建的預約記錄
    */
   async function createBooking(data: BookingCreateDTO): Promise<Booking> {
     // 實作邏輯
   }
   ```

2. **組件註解**
   ```typescript
   /**
    * 預約卡片組件
    * @component
    * @example
    * ```tsx
    * <BookingCard
    *   booking={bookingData}
    *   onCancel={handleCancel}
    *   onConfirm={handleConfirm}
    * />
    * ```
    */
   const BookingCard: React.FC<BookingCardProps> = () => {
     // 組件實作
   };
   ```

## 🔄 Git工作流程

### 分支命名

1. **功能分支**
   ```
   feature/add-booking-calendar
   feature/implement-payment
   ```

2. **修復分支**
   ```
   bugfix/fix-booking-validation
   bugfix/resolve-date-format
   ```

### Commit 訊息

1. **格式**
   ```
   <type>(<scope>): <subject>
   
   <body>
   
   <footer>
   ```

2. **Type 類型**
   - feat: 新功能
   - fix: 錯誤修復
   - docs: 文檔更新
   - style: 程式碼格式調整
   - refactor: 重構
   - test: 測試相關
   - chore: 建置/工具相關

3. **範例**
   ```
   feat(booking): 新增預約日曆功能
   
   - 實作月曆視圖
   - 添加時段選擇
   - 整合預約表單
   
   Closes #123
   ```

## 🔍 程式碼審查

### 審查清單

1. **功能性**
   - [ ] 功能是否符合需求
   - [ ] 是否處理了邊界情況
   - [ ] 錯誤處理是否完善

2. **程式碼品質**
   - [ ] 是否遵循程式碼風格
   - [ ] 是否有適當的註解
   - [ ] 是否有適當的測試覆蓋

3. **效能**
   - [ ] 是否有效能問題
   - [ ] 是否有記憶體洩漏
   - [ ] 是否有不必要的計算

4. **安全性**
   - [ ] 是否有安全漏洞
   - [ ] 是否正確處理敏感資料
   - [ ] 是否有適當的權限控制 