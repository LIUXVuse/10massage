# 伊林SPA服務數據模型分析

*文檔創建日期：2025-03-02*
*最後更新：2025-03-02*

## 目錄

1. [現有數據模型](#現有數據模型)
2. [數據結構分析](#數據結構分析)
3. [功能缺口分析](#功能缺口分析)
4. [數據模型擴展方案](#數據模型擴展方案)
5. [數據遷移策略](#數據遷移策略)

## 現有數據模型

伊林SPA系統目前使用Prisma作為ORM層，處理數據庫交互。以下是與服務相關的現有數據模型：

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

model ServiceDuration {
  id        String   @id @default(cuid())
  duration  Int
  price     Int
  service   Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId String
}
```

## 數據結構分析

### 服務基本信息

`Service`模型包含基本服務信息：
- `id`: 唯一標識符
- `name`: 服務名稱
- `description`: 服務描述
- `category`: 服務類別
- `isRecommended`: 是否為推薦服務
- `recommendOrder`: 推薦排序順序

### 服務時長與價格

`ServiceDuration`模型處理服務的時長與價格關係：
- `id`: 唯一標識符
- `duration`: 服務時長(分鐘)
- `price`: 服務價格(台幣)
- `serviceId`: 關聯到的服務ID

### 服務與按摩師關聯

`Service`與`Masseur`多對多關係允許將服務與能提供該服務的按摩師關聯起來。

## 功能缺口分析

基於伊林SPA服務項目的實際需求，我們識別出以下數據模型功能缺口：

### 1. 性別差異定價

**需求**: 例如熱蠟美肌淨毛服務中，巴西式私密處全除對男女有不同價格。
**缺口**: 當前模型無法支持基於性別的差異化定價。

### 2. 身體部位定價

**需求**: 脫毛服務根據身體不同部位有不同價格。
**缺口**: 當前模型無法將價格與特定身體部位關聯。

### 3. 附加選項定價

**需求**: 基礎服務外的額外選項，如脫毛服務的"加購區"選項。
**缺口**: 缺少支持附加選項及其價格的結構。

### 4. 套餐組合服務

**需求**: 多個服務組合成一個套餐，如"從頭到腳"套餐。
**缺口**: 缺少表示服務組合及其優惠價格的結構。

### 5. 定制選項組合

**需求**: 如中式元氣套餐中的"免費六選二"附加項目。
**缺口**: 缺少表示可選組合及其規則的結構。

## 數據模型擴展方案

為了支持所有需要的功能，我們提出以下數據模型擴展方案：

### 1. 性別定價模型

```prisma
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

### 2. 身體部位定價模型

```prisma
model ServiceAreaPrice {
  id        String      @id @default(cuid())
  areaName  String      // 身體部位名稱
  price     Int         // 該部位的服務價格
  service   Service     @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId String
  gender    Gender?     // 可選性別限制
  
  @@unique([serviceId, areaName, gender])
}
```

### 3. 附加選項模型

```prisma
model ServiceAddon {
  id          String      @id @default(cuid())
  name        String      // 附加選項名稱
  description String?     // 選項描述
  price       Int         // 選項價格
  service     Service     @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId   String
  isRequired  Boolean     @default(false)  // 是否為必選項
}
```

### 4. 套餐組合模型

```prisma
model ServicePackage {
  id          String                  @id @default(cuid())
  name        String                  // 套餐名稱
  description String?                 // 套餐描述
  price       Int                     // 套餐總價
  items       ServicePackageItem[]    // 套餐包含的服務項目
  options     ServicePackageOption[]  // 套餐可選擇項目
}

model ServicePackageItem {
  id            String         @id @default(cuid())
  service       Service        @relation(fields: [serviceId], references: [id])
  serviceId     String
  duration      Int            // 服務時長
  package       ServicePackage @relation(fields: [packageId], references: [id], onDelete: Cascade)
  packageId     String
}

model ServicePackageOption {
  id            String         @id @default(cuid())
  name          String         // 選項名稱
  description   String?        // 選項描述
  maxSelections Int            @default(1)  // 最多可選數量
  items         ServicePackageOptionItem[]
  package       ServicePackage @relation(fields: [packageId], references: [id], onDelete: Cascade)
  packageId     String
}

model ServicePackageOptionItem {
  id              String               @id @default(cuid())
  name            String               // 選項項目名稱
  packageOption   ServicePackageOption @relation(fields: [packageOptionId], references: [id], onDelete: Cascade)
  packageOptionId String
}
```

## 數據遷移策略

為了確保系統升級過程中的數據完整性，我們建議以下遷移策略：

### 階段一：準備階段

1. **數據備份**：
   - 對生產數據庫進行完整備份
   - 創建測試環境副本用於遷移測試

2. **舊模型數據分析**：
   - 分析現有服務數據
   - 識別需要特殊處理的複雜服務

### 階段二：模型擴展

1. **建立新數據表**：
   - 添加所有新的數據模型表
   - 保持與現有表的外鍵關係

2. **基本數據遷移**：
   - 將現有Service數據映射到擴展模型
   - 保留原始服務ID以維持引用完整性

### 階段三：應用層適配

1. **API層更新**：
   - 更新服務API以使用新模型
   - 確保向後兼容，支持舊版客戶端

2. **前端適配**：
   - 更新前端組件以支持新的數據結構
   - 添加新UI元素支持高級定價功能

### 階段四：驗證與優化

1. **數據驗證**：
   - 驗證所有服務數據正確遷移
   - 檢查所有外鍵關係的完整性

2. **性能優化**：
   - 添加必要的數據庫索引
   - 優化查詢以支持複雜定價邏輯

## 實施風險與緩解策略

| 風險 | 可能性 | 影響 | 緩解策略 |
|------|--------|------|----------|
| 數據丟失 | 低 | 高 | 多層次備份；增量部署；回滾計劃 |
| 服務中斷 | 中 | 高 | 非峰值時段部署；藍綠部署策略 |
| 性能下降 | 中 | 中 | 數據庫索引優化；查詢緩存引入 |
| 用戶體驗混亂 | 中 | 中 | 詳細的變更文檔；用戶培訓；漸進式UI更新 | 