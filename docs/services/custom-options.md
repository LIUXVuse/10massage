# 伊林SPA預約系統 - 自定義選項功能

![Last Updated](https://img.shields.io/badge/last%20updated-2025--03--06-orange.svg)

本文件詳細說明伊林SPA預約系統的自定義選項功能，包括功能說明、使用指南、API文檔等。

## 📋 目錄

- [功能概述](#功能概述)
- [使用指南](#使用指南)
- [API文檔](#api文檔)
- [資料結構](#資料結構)
- [前端實現](#前端實現)
- [後端實現](#後端實現)

## 💡 功能概述

自定義選項功能允許管理員為每個服務項目添加額外的選項，例如不同的按摩部位、時長或特殊要求。每個選項可以有獨立的價格和時長設定。

### 主要特點

1. **靈活定價**
   - 每個選項可設置獨立價格
   - 支援按時長定價
   - 支援組合定價

2. **時長管理**
   - 可設置選項額外時長
   - 自動計算總服務時長
   - 智能時段安排

3. **選項分類**
   - 按部位分類
   - 按服務類型分類
   - 按價格區間分類

## 📖 使用指南

### 管理員操作

1. **添加自定義選項**
   - 進入服務管理頁面
   - 選擇目標服務
   - 點擊"添加自定義選項"
   - 填寫選項信息：
     - 名稱
     - 價格
     - 時長
     - 描述

2. **管理自定義選項**
   - 編輯現有選項
   - 停用/啟用選項
   - 調整選項順序
   - 刪除選項

### 用戶操作

1. **預約流程**
   - 選擇基礎服務
   - 瀏覽可用選項
   - 選擇需要的選項
   - 查看總價和時長
   - 確認預約

2. **查看預約詳情**
   - 檢視已選選項
   - 查看價格明細
   - 修改選項（如可用）

## 🔌 API文檔

### 自定義選項管理API

#### 1. 獲取服務的自定義選項

```typescript
GET /api/services/:serviceId/custom-options

// 響應格式
interface CustomOptionResponse {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

// 示例響應
{
  "success": true,
  "data": [
    {
      "id": "option-1",
      "name": "頭部按摩",
      "price": 300,
      "duration": 30,
      "description": "專業頭部按摩，緩解頭痛",
      "isActive": true,
      "sortOrder": 1
    }
  ]
}
```

#### 2. 創建自定義選項

```typescript
POST /api/services/:serviceId/custom-options

// 請求格式
interface CreateCustomOptionRequest {
  name: string;
  price: number;
  duration: number;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// 示例請求
{
  "name": "頭部按摩",
  "price": 300,
  "duration": 30,
  "description": "專業頭部按摩，緩解頭痛"
}
```

#### 3. 更新自定義選項

```typescript
PUT /api/services/:serviceId/custom-options/:optionId

// 請求格式
interface UpdateCustomOptionRequest {
  name?: string;
  price?: number;
  duration?: number;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}
```

#### 4. 刪除自定義選項

```typescript
DELETE /api/services/:serviceId/custom-options/:optionId
```

### 預約相關API

#### 1. 計算預約價格

```typescript
POST /api/bookings/calculate-price

// 請求格式
interface CalculatePriceRequest {
  serviceId: string;
  customOptionIds: string[];
}

// 響應格式
interface PriceCalculationResponse {
  basePrice: number;
  optionsPrice: number;
  totalPrice: number;
  totalDuration: number;
}
```

## 📊 資料結構

### 資料庫模型

```typescript
// 自定義選項模型
interface CustomOption {
  id: string;
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// 預約選項關聯模型
interface BookingCustomOption {
  id: string;
  bookingId: string;
  customOptionId: string;
  price: number;
  createdAt: Date;
}
```

### Prisma Schema

```prisma
model CustomOption {
  id          String   @id @default(uuid())
  serviceId   String
  name        String
  price       Decimal  @db.Decimal(10,2)
  duration    Int      // 以分鐘為單位
  description String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  service     Service  @relation(fields: [serviceId], references: [id])
  bookings    BookingCustomOption[]

  @@index([serviceId])
  @@index([isActive])
}

model BookingCustomOption {
  id             String   @id @default(uuid())
  bookingId      String
  customOptionId String
  price          Decimal  @db.Decimal(10,2)
  createdAt      DateTime @default(now())

  booking       Booking      @relation(fields: [bookingId], references: [id])
  customOption  CustomOption @relation(fields: [customOptionId], references: [id])

  @@unique([bookingId, customOptionId])
}
```

## 🎨 前端實現

### 組件結構

```typescript
// 自定義選項選擇器組件
interface CustomOptionSelectorProps {
  serviceId: string;
  selectedOptions: string[];
  onChange: (options: string[]) => void;
}

const CustomOptionSelector: React.FC<CustomOptionSelectorProps> = ({
  serviceId,
  selectedOptions,
  onChange,
}) => {
  // 組件實現
};

// 自定義選項卡片組件
interface CustomOptionCardProps {
  option: CustomOption;
  selected: boolean;
  onSelect: (optionId: string) => void;
}

const CustomOptionCard: React.FC<CustomOptionCardProps> = ({
  option,
  selected,
  onSelect,
}) => {
  // 組件實現
};
```

### 狀態管理

```typescript
// 使用 React Query 管理服務選項數據
const useCustomOptions = (serviceId: string) => {
  return useQuery(['customOptions', serviceId], () =>
    fetchCustomOptions(serviceId)
  );
};

// 使用 Context 管理選中的選項
interface CustomOptionContextType {
  selectedOptions: string[];
  totalPrice: number;
  totalDuration: number;
  selectOption: (optionId: string) => void;
  unselectOption: (optionId: string) => void;
}

const CustomOptionContext = createContext<CustomOptionContextType | null>(null);
```

## 🔧 後端實現

### 服務層

```typescript
class CustomOptionService {
  constructor(private readonly prisma: PrismaClient) {}

  async getServiceOptions(serviceId: string): Promise<CustomOption[]> {
    return this.prisma.customOption.findMany({
      where: {
        serviceId,
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  async calculateTotalPrice(
    serviceId: string,
    optionIds: string[]
  ): Promise<PriceCalculation> {
    const [service, options] = await Promise.all([
      this.prisma.service.findUnique({
        where: { id: serviceId },
      }),
      this.prisma.customOption.findMany({
        where: {
          id: { in: optionIds },
          serviceId,
          isActive: true,
        },
      }),
    ]);

    if (!service) {
      throw new Error('Service not found');
    }

    const optionsPrice = options.reduce((sum, option) => sum + option.price, 0);
    const totalDuration = options.reduce(
      (sum, option) => sum + option.duration,
      service.duration
    );

    return {
      basePrice: service.basePrice,
      optionsPrice,
      totalPrice: service.basePrice + optionsPrice,
      totalDuration,
    };
  }
}
```

### 控制器層

```typescript
class CustomOptionController {
  constructor(private readonly service: CustomOptionService) {}

  async getServiceOptions(req: Request, res: Response) {
    const { serviceId } = req.params;
    const options = await this.service.getServiceOptions(serviceId);
    res.json({ success: true, data: options });
  }

  async calculatePrice(req: Request, res: Response) {
    const { serviceId, optionIds } = req.body;
    const calculation = await this.service.calculateTotalPrice(
      serviceId,
      optionIds
    );
    res.json({ success: true, data: calculation });
  }
}
```

## 🔍 測試規範

### 單元測試

```typescript
describe('CustomOptionService', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate correct total price and duration', async () => {
      const result = await service.calculateTotalPrice(
        'service-1',
        ['option-1', 'option-2']
      );

      expect(result.totalPrice).toBe(1500);
      expect(result.totalDuration).toBe(90);
    });

    it('should throw error for invalid service', async () => {
      await expect(
        service.calculateTotalPrice('invalid-id', [])
      ).rejects.toThrow('Service not found');
    });
  });
});
```

### 整合測試

```typescript
describe('CustomOption API', () => {
  it('should return service options', async () => {
    const response = await request(app)
      .get('/api/services/service-1/custom-options')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should calculate price correctly', async () => {
    const response = await request(app)
      .post('/api/bookings/calculate-price')
      .send({
        serviceId: 'service-1',
        optionIds: ['option-1', 'option-2'],
      })
      .expect(200);

    expect(response.body.data.totalPrice).toBe(1500);
  });
});
```

## 📈 效能優化

### 快取策略

1. **服務選項快取**
```typescript
const CACHE_TTL = 60 * 5; // 5分鐘

async function getServiceOptions(serviceId: string) {
  const cacheKey = `service:${serviceId}:options`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const options = await prisma.customOption.findMany({
    where: { serviceId, isActive: true },
  });

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(options));
  return options;
}
```

2. **價格計算快取**
```typescript
async function getCachedPrice(serviceId: string, optionIds: string[]) {
  const cacheKey = `price:${serviceId}:${optionIds.sort().join(',')}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const calculation = await calculatePrice(serviceId, optionIds);
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(calculation));
  return calculation;
}
```

### 查詢優化

1. **批量查詢**
```typescript
async function getMultipleServiceOptions(serviceIds: string[]) {
  return prisma.customOption.findMany({
    where: {
      serviceId: { in: serviceIds },
      isActive: true,
    },
    orderBy: { sortOrder: 'asc' },
  });
}
```

2. **分頁查詢**
```typescript
async function getServiceOptionsPage(
  serviceId: string,
  page: number,
  pageSize: number
) {
  return prisma.customOption.findMany({
    where: { serviceId, isActive: true },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { sortOrder: 'asc' },
  });
}
``` 