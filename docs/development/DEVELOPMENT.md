# 伊林SPA預約系統 - 開發指南

*文檔創建日期：2025-03-02*
*最後更新：2025-03-02*

## 目錄

1. [開發環境設置](#開發環境設置)
2. [項目結構](#項目結構)
3. [編碼規範](#編碼規範)
4. [開發工作流](#開發工作流)
5. [API開發](#api開發)
6. [前端開發](#前端開發)
7. [數據庫操作](#數據庫操作)
8. [測試](#測試)
9. [擴展指南](#擴展指南)
10. [貢獻指南](#貢獻指南)

## 開發環境設置

### 必要工具

- Node.js (v20+)
- npm (v10+)
- Git
- VSCode 或其他編輯器
- PostgreSQL (本地開發)

### 環境設置步驟

1. 克隆代碼庫
```bash
git clone https://github.com/yourusername/10massage.git
cd 10massage
```

2. 安裝依賴
```bash
npm install
```

3. 設置環境變量
```bash
cp .env.example .env.local
```

編輯 `.env.local` 文件，設置必要的環境變量：
```
DATABASE_URL=postgresql://user:password@localhost:5432/massage
NEXTAUTH_SECRET=your-development-secret
NEXTAUTH_URL=http://localhost:3000
```

4. 初始化數據庫
```bash
npx prisma migrate dev
```

5. 啟動開發服務器
```bash
npm run dev
```

6. 訪問開發環境
```
http://localhost:3000
```

## 項目結構

伊林SPA預約系統基於Next.js App Router，採用以下目錄結構：

```
10massage/
├── .github/             # GitHub Actions配置
├── docs/                # 項目文檔
├── prisma/              # Prisma模型和遷移
│   ├── migrations/      # 數據庫遷移文件
│   └── schema.prisma    # Prisma數據模型
├── public/              # 靜態資源
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (auth)/      # 認證相關路由
│   │   ├── (dashboard)/ # 管理後台路由
│   │   │   ├── services/  # 服務管理頁面
│   │   │   ├── masseurs/  # 按摩師管理頁面
│   │   │   └── ...
│   │   ├── api/         # API路由
│   │   │   ├── auth/    # 認證API
│   │   │   ├── services/# 服務API
│   │   │   └── ...
│   │   └── ...
│   ├── components/      # React組件
│   ├── lib/             # 通用工具庫
│   ├── hooks/           # React鉤子
│   ├── context/         # React上下文
│   ├── styles/          # 樣式文件
│   └── types/           # TypeScript類型定義
├── .eslintrc.js         # ESLint配置
├── .gitignore           # Git忽略文件
├── next.config.js       # Next.js配置
├── package.json         # 項目依賴
├── README.md            # 項目描述
└── tsconfig.json        # TypeScript配置
```

## 編碼規範

### TypeScript

- 所有新代碼應使用TypeScript編寫
- 使用嚴格模式 (`"strict": true`)
- 為所有變量、參數和返回值提供類型註解

### React組件

- 使用函數組件和Hooks
- 適當分離關注點，遵循單一職責原則
- 遵循命名約定:
  - 組件使用PascalCase: `ServiceList.tsx`
  - 工具函數使用camelCase: `formatDate.ts`

### 樣式

- 使用Tailwind CSS作為主要樣式解決方案
- 對於複雜組件，使用CSS模塊或styled-components
- 遵循響應式設計原則，確保在所有設備上有良好體驗

## 開發工作流

### 功能開發流程

1. **創建分支**：從`main`分支創建功能分支
```bash
git checkout -b feature/my-new-feature
```

2. **開發**：實現功能，編寫測試

3. **提交**：使用清晰的提交消息
```bash
git commit -m "feat: 添加服務多時長價格設定功能"
```
*遵循[約定式提交](https://www.conventionalcommits.org/)標準*

4. **推送**：將分支推送到GitHub
```bash
git push origin feature/my-new-feature
```

5. **創建PR**：在GitHub上創建Pull Request，等待代碼審查

6. **合併**：審查通過後合併到`main`分支

### 代碼審查清單

- 代碼是否符合編碼規範
- 是否有充分的測試覆蓋
- 性能是否得到考慮
- 是否有適當的錯誤處理
- 是否有必要的文檔

## API開發

### API路由規範

伊林SPA預約系統使用Next.js API Routes實現服務端功能。API路由應遵循以下規範：

1. **路由命名**：使用RESTful風格
   - GET `/api/services` - 獲取所有服務
   - POST `/api/services` - 創建新服務
   - PUT `/api/services` - 更新服務
   - DELETE `/api/services` - 刪除服務

2. **錯誤處理**：統一錯誤響應格式
```typescript
// src/app/api/services/route.ts
export async function GET() {
  try {
    // 業務邏輯
    return Response.json(data);
  } catch (error) {
    console.error('獲取服務錯誤:', error);
    return Response.json({ error: '獲取服務失敗' }, { status: 500 });
  }
}
```

3. **資料驗證**：使用Zod進行資料驗證
```typescript
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  // ...其他字段
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validatedData = serviceSchema.parse(data);
    // 業務邏輯
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: '資料驗證失敗', details: error.errors }, { status: 400 });
    }
    // 處理其他錯誤
  }
}
```

### API文檔

所有API路由應該在代碼中包含JSDoc註釋，說明:
- 接口功能
- 請求參數
- 響應格式
- 錯誤碼

```typescript
/**
 * 獲取服務列表API
 * 
 * @route GET /api/services
 * @query {string} category - 可選，按類別篩選
 * @query {boolean} isRecommended - 可選，篩選推薦服務
 * @returns {Service[]} 服務列表
 * @throws {400} 請求參數無效
 * @throws {500} 服務器內部錯誤
 */
export async function GET(request: Request) {
  // 實現
}
```

## 前端開發

### 組件設計

1. **組件拆分**：將UI拆分為小型、可重用的組件
2. **狀態管理**：
   - 本地狀態: React useState
   - 全局狀態: React Context
   - 服務器狀態: React Query
3. **佈局組件**：使用`<Layout>`組件確保各頁面保持一致的佈局

### 表單處理

使用React Hook Form進行表單管理:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(1, '服務名稱不能為空'),
  // 其他字段
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export function ServiceForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema)
  });
  
  const onSubmit = async (data: ServiceFormData) => {
    // 處理表單提交
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 表單字段 */}
    </form>
  );
}
```

### 數據獲取

使用React Query進行服務器狀態管理:

```typescript
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';

// 獲取服務列表
const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('獲取服務失敗');
      return res.json();
    }
  });
};

// 創建服務
const useCreateService = () => {
  const queryClient = new QueryClient();
  
  return useMutation({
    mutationFn: async (newService: ServiceFormData) => {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      
      if (!res.ok) throw new Error('創建服務失敗');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    }
  });
};
```

## 數據庫操作

### Prisma使用指南

1. **模型定義**：在`prisma/schema.prisma`中定義數據模型
```prisma
model Service {
  id             String           @id @default(cuid())
  name           String           @db.VarChar(100)
  description    String?          @db.Text
  category       String           @default("一般")
  isRecommended  Boolean          @default(false)
  recommendOrder Int              @default(0)
  durations      ServiceDuration[]
  masseurs       Masseur[]
}
```

2. **遷移生成**：修改模型後生成遷移
```bash
npx prisma migrate dev --name add_new_field
```

3. **客戶端使用**：在代碼中使用Prisma客戶端
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 獲取所有服務
const services = await prisma.service.findMany({
  include: {
    durations: true,
    masseurs: true
  }
});

// 創建服務
const newService = await prisma.service.create({
  data: {
    name: '精油按摩',
    description: '舒緩壓力的精油按摩',
    category: '按摩',
    durations: {
      create: [
        { duration: 60, price: 1200 },
        { duration: 90, price: 1800 }
      ]
    }
  },
  include: {
    durations: true
  }
});
```

### 數據庫最佳實踐

1. **事務處理**：使用事務確保數據一致性
```typescript
const result = await prisma.$transaction(async (tx) => {
  // 刪除舊的時長
  await tx.serviceDuration.deleteMany({
    where: { serviceId: id }
  });
  
  // 創建新的時長
  await tx.service.update({
    where: { id },
    data: {
      durations: {
        create: newDurations
      }
    }
  });
});
```

2. **連接池管理**：在生產環境中適當配置連接池
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // 配置連接池
  connection_limit: 5,
  pool_timeout: 30
});
```

## 測試

### 測試類型

1. **單元測試**：測試獨立功能和工具函數
2. **集成測試**：測試組件和API交互
3. **端到端測試**：模擬用戶行為的完整流程測試

### 測試工具

- 單元測試: Jest + React Testing Library
- 端到端測試: Playwright

### 寫測試示例

1. **單元測試**
```typescript
// src/lib/utils.test.ts
import { formatPrice, calculateDuration } from './utils';

describe('Utils', () => {
  test('formatPrice formats currency correctly', () => {
    expect(formatPrice(1200)).toBe('NT$1,200');
    expect(formatPrice(999)).toBe('NT$999');
  });
  
  test('calculateDuration works for various inputs', () => {
    expect(calculateDuration(60)).toBe('1小時');
    expect(calculateDuration(90)).toBe('1小時30分鐘');
  });
});
```

2. **API測試**
```typescript
// src/app/api/services/route.test.ts
import { GET } from './route';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    service: {
      findMany: jest.fn().mockResolvedValue([
        { id: '1', name: '測試服務' }
      ])
    }
  }))
}));

describe('Services API', () => {
  test('GET returns services', async () => {
    const response = await GET(new Request('http://localhost:3000/api/services'));
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual([{ id: '1', name: '測試服務' }]);
  });
});
```

## 擴展指南

### 添加新功能

1. **規劃**：明確需求，設計數據模型和UI
2. **數據模型**：更新Prisma模型，生成遷移
3. **API開發**：實現API路由
4. **前端開發**：創建UI組件和頁面
5. **測試**：編寫測試，確保功能正常
6. **文檔**：更新文檔，說明新功能的使用方法

### 開發新服務功能的範例

假設我們要添加服務性別差異定價功能：

1. **更新Prisma模型**
```prisma
// prisma/schema.prisma
model ServiceGenderPrice {
  id        String  @id @default(cuid())
  gender    Gender  // 性別枚舉：MALE, FEMALE
  price     Int     // 針對特定性別的價格
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId String

  @@unique([serviceId, gender])
}

enum Gender {
  MALE
  FEMALE
}
```

2. **生成遷移**
```bash
npx prisma migrate dev --name add_gender_pricing
```

3. **更新API路由**
```typescript
// src/app/api/services/route.ts
export async function PUT(request: Request) {
  const data = await request.json();
  
  // 包含性別定價的更新邏輯
  const result = await prisma.service.update({
    where: { id: data.id },
    data: {
      // 基本字段更新
      name: data.name,
      // ...
      
      // 性別定價更新
      genderPrices: {
        deleteMany: {},
        create: data.genderPrices.map((gp) => ({
          gender: gp.gender,
          price: gp.price
        }))
      }
    },
    include: {
      durations: true,
      masseurs: true,
      genderPrices: true
    }
  });
  
  return Response.json(result);
}
```

4. **更新前端表單**
```tsx
// src/components/ServiceForm.tsx
<FormSection title="性別差異定價">
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="genderPrices.male"
        render={({ field }) => (
          <FormItem>
            <FormLabel>男性價格</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="genderPrices.female"
        render={({ field }) => (
          <FormItem>
            <FormLabel>女性價格</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </div>
</FormSection>
```

## 貢獻指南

### 提交PR流程

1. Fork項目倉庫
2. 創建功能分支
3. 實現功能和測試
4. 提交變更
5. 創建Pull Request
6. 等待代碼審查
7. 根據反饋修改代碼
8. 合併PR

### 提交規範

使用約定式提交格式:

```
<類型>(<範圍>): <描述>

[可選的正文]

[可選的頁腳]
```

類型:
- **feat**: 新功能
- **fix**: Bug修復
- **docs**: 文檔更新
- **style**: 代碼風格變更（不影響功能）
- **refactor**: 代碼重構
- **perf**: 性能優化
- **test**: 添加或修改測試
- **chore**: 構建過程或工具變更

例如:
```
feat(service): 添加服務性別差異定價功能

實現了服務項目的性別差異定價功能，包括:
- 數據庫模型擴展
- API路由更新
- 前端表單開發

解決了 #123
```

---

希望本指南能幫助你快速上手伊林SPA預約系統的開發。如有任何問題，請參考項目文檔或聯繫開發團隊。 