# 伊林SPA服務項目數據模型分析

## 1. 目前系統實現

### 1.1 數據庫模型

目前系統使用PostgreSQL透過Prisma ORM管理兩個主要模型：

**Service (服務)**
```prisma
model Service {
  id          String            @id @default(cuid())
  name        String
  description String?
  price       Float             // 基本價格
  duration    Int               // 基本時長
  type        String            @default("SINGLE")
  category    String            @default("MASSAGE")
  isActive    Boolean           @default(true)
  isRecommend Boolean           @default(false)
  masseurs    Masseur[]
  durations   ServiceDuration[] // 服務的多價格選項
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}
```

**ServiceDuration (服務時長價格)**
```prisma
model ServiceDuration {
  id        String   @id @default(cuid())
  duration  Int      // 時長（分鐘）
  price     Float    // 此時長的價格
  service   Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 1.2 服務項目表單

目前的表單設計允許：
- 設置服務名稱和描述
- 選擇服務類型（單人/組合）
- 選擇服務類別（按摩/護理/療程）
- 設置推薦狀態和排序
- 添加多個時長和價格組合
- 關聯多個按摩師

### 1.3 已知限制

1. **缺乏複雜定價支持**：
   - 無法根據性別設置不同價格
   - 無法根據身體部位設置不同價格
   - 無法添加額外選項和加價服務
   - 無法設置套餐組合和折扣

2. **前端表單問題**：
   - 服務保存時出現客戶端異常
   - 可能存在表單驗證或數據處理問題

## 2. 實際業務需求

根據提供的服務項目圖片和分析，實際業務需要支持：

### 2.1 性別相關定價
- 如「巴西式私密處全除」男女價格不同
  - 女性: 2,500元
  - 男性: 2,700元

### 2.2 身體部位定價
- 熱蠟美肌淨毛服務需根據不同身體部位設置不同價格：
  - 全腿：2,500元
  - 全手：2,000元
  - 腹部：1,500元
  - 腋下：799元
  - 等多達十幾種部位價格

### 2.3 附加選項定價
- 如熱蠟服務的附加選項：
  - 鼻毛：+200元
  - 乳頭毛：+200元
  - 髡角毛：+200元
  - 等

### 2.4 套餐組合定價
- 中式課程方案的多種套餐：
  - 「從頭到腳」：2,000元/120分鐘（結合兩種服務）
  - 「溫暖排濕」：2,300元/120分鐘（結合兩種服務）
  - 「頭壓解放」：2,500元/120分鐘（結合兩種服務）

### 2.5 自選項目套餐
- 「中式元氣」套餐允許客戶從6個選項中任選2個

### 2.6 按摩師專屬服務
- 某些服務僅由特定按摩師提供，如：
  - 泰皇密宗課程僅由「方真JOY」提供
  - 熱蠟服務僅由「琳」、「雷」、「萱」提供

## 3. 數據模型差距分析

| 實際業務需求 | 目前模型支持 | 差距/解決方案 |
|--------------|--------------|---------------|
| 多時長多價格 | ✅ 支持 | 已通過ServiceDuration實現 |
| 性別相關定價 | ❌ 不支持 | 需擴展ServiceDuration模型加入性別字段 |
| 身體部位定價 | ❌ 不支持 | 需新增BodyPartPrice模型 |
| 附加選項定價 | ❌ 不支持 | 需新增ServiceAddon模型 |
| 套餐組合定價 | ❌ 部分支持 | 已有type="COMBO"，但需關聯子服務 |
| 自選項目套餐 | ❌ 不支持 | 需新增ServiceOption模型 |
| 按摩師專屬服務 | ✅ 支持 | 已通過Service-Masseur關聯實現 |

## 4. 問題診斷與原因推測

服務項目表單出現客戶端異常可能是由於以下原因：

1. **數據模型與UI不匹配**：
   - 實際業務需求的複雜定價邏輯超出了現有數據模型能力
   - 表單可能嘗試提交不符合API預期的數據結構

2. **表單提交邏輯問題**：
   - ServiceForm.tsx中的handleSubmit函數可能缺少錯誤處理或數據驗證
   - 可能存在數據類型轉換問題（如字符串和數字間轉換）

3. **API端驗證與處理問題**：
   - `/api/services/route.ts`可能無法處理某些特殊情況
   - 可能存在權限處理問題

## 5. 建議解決方案

1. **短期修復**：
   - 修復現有表單以確保基本功能正常
   - 增強錯誤處理和日誌記錄，更容易診斷具體問題

2. **中期解決方案**：
   - 擴展現有數據模型以支持更多定價方式
   - 重構服務表單，分階段支持更複雜的定價邏輯

3. **長期戰略**：
   - 實現完整的服務定價引擎
   - 設計更靈活的產品配置系統

## 6. 下一步行動建議

1. 根據service-data.json中的數據結構重新設計數據庫模型
2. 測試API端點以確定具體錯誤點
3. 逐步實現多元定價功能，優先實現最常用的功能
4. 設計更直觀的服務項目管理界面 