# 伊林SPA服務數據模型分析

*文檔創建日期：2025-03-02*
*最後更新：2025-03-06*

## 目錄

1. [現有數據模型](#現有數據模型)
2. [數據結構分析](#數據結構分析)
3. [已實現功能](#已實現功能)
4. [數據模型說明](#數據模型說明)
5. [數據關聯關係](#數據關聯關係)
6. [使用示例](#使用示例)

## 現有數據模型

伊林SPA系統使用Prisma作為ORM層，處理數據庫交互。以下是完整的服務相關數據模型：

```prisma
model Service {
  id                    String           @id @default(cuid())
  name                  String           @db.VarChar(100)
  description           String?          @db.Text
  category              String           @default("一般")
  type                  ServiceType      @default(SINGLE)
  isRecommended         Boolean          @default(false)
  recommendOrder        Int              @default(0)
  isLimitedTime         Boolean          @default(false)
  limitedStartDate      DateTime?
  limitedEndDate        DateTime?
  limitedSpecialPrice   Float?
  limitedDiscountPercent Int?
  limitedNote           String?          @db.Text
  isFlashSale           Boolean          @default(false)
  flashSaleNote         String?          @db.Text
  durations             ServiceDuration[]
  masseurs              Masseur[]
  genderPrices         ServiceGenderPrice[]
  areaPrices           ServiceAreaPrice[]
  addons               ServiceAddon[]
  customOptions        CustomOption[]
  packageItems         ServicePackageItem[]
}

model ServiceDuration {
  id        String   @id @default(cuid())
  duration  Int
  price     Int
  service   Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId String
}

model ServiceGenderPrice {
  id        String  @id @default(cuid())
  gender    Gender
  price     Int
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId String

  @@unique([serviceId, gender])
}

model ServiceAreaPrice {
  id        String   @id @default(cuid())
  areaName  String
  price     Int
  service   Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId String
  gender    Gender?

  @@unique([serviceId, areaName, gender])
}

model ServiceAddon {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Int
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  serviceId   String
  isRequired  Boolean  @default(false)
}

model CustomOption {
  id          String   @id @default(cuid())
  serviceId   String
  name        String
  price       Decimal  @db.Decimal(10,2)
  duration    Int
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

model ServicePackage {
  id          String                  @id @default(cuid())
  name        String
  description String?
  price       Int
  items       ServicePackageItem[]
  options     ServicePackageOption[]
}

model ServicePackageItem {
  id            String         @id @default(cuid())
  service       Service        @relation(fields: [serviceId], references: [id])
  serviceId     String
  duration      Int
  package       ServicePackage @relation(fields: [packageId], references: [id], onDelete: Cascade)
  packageId     String
  isRequired    Boolean        @default(true)
}

model ServicePackageOption {
  id            String         @id @default(cuid())
  name          String
  description   String?
  maxSelections Int            @default(1)
  items         ServicePackageOptionItem[]
  package       ServicePackage @relation(fields: [packageId], references: [id], onDelete: Cascade)
  packageId     String
}

model ServicePackageOptionItem {
  id              String               @id @default(cuid())
  name            String
  packageOption   ServicePackageOption @relation(fields: [packageOptionId], references: [id], onDelete: Cascade)
  packageOptionId String
}

enum ServiceType {
  SINGLE
  COMBO
}

enum Gender {
  MALE
  FEMALE
}
```

## 數據結構分析

### 服務基本信息
- 基本屬性：ID、名稱、描述、類別
- 服務類型：單項服務或套餐服務
- 推薦設置：是否推薦及排序

### 價格管理
- 基礎時長價格
- 性別差異化定價
- 身體部位定價
- 附加選項定價
- 自定義選項定價
- 套餐組合定價

### 促銷功能
- 限時優惠
- 閃購特價
- 折扣設置

## 已實現功能

1. **基礎服務管理**
   - 服務基本信息維護
   - 服務類型設置
   - 推薦服務管理

2. **多層次定價**
   - 時長基礎定價
   - 性別差異化定價
   - 身體部位定價
   - 附加選項定價

3. **套餐服務**
   - 套餐組合管理
   - 必選項設置
   - 可選項管理

4. **促銷功能**
   - 限時優惠設置
   - 閃購特價標記
   - 折扣計算

5. **自定義選項**
   - 選項管理
   - 價格設置
   - 時長調整

## 數據關聯關係

1. **服務與時長**
   - 一個服務可以有多個時長價格選項
   - 每個時長價格選項屬於一個服務

2. **服務與按摩師**
   - 多對多關係
   - 按摩師可以提供多個服務
   - 服務可以由多個按摩師提供

3. **服務與定價**
   - 一個服務可以有多個性別定價
   - 一個服務可以有多個部位定價
   - 一個服務可以有多個附加選項

4. **套餐關係**
   - 套餐包含多個服務項目
   - 套餐可以設置必選和可選項目
   - 可選項目可以設置最大選擇數量

## 使用示例

### 1. 創建基礎服務

```typescript
const service = await prisma.service.create({
  data: {
    name: "精油按摩",
    description: "專業精油按摩服務",
    category: "按摩服務",
    type: "SINGLE",
    durations: {
      create: [
        { duration: 60, price: 1200 },
        { duration: 90, price: 1800 }
      ]
    }
  }
});
```

### 2. 設置性別差異化定價

```typescript
const genderPrices = await prisma.serviceGenderPrice.createMany({
  data: [
    { serviceId: service.id, gender: "MALE", price: 2700 },
    { serviceId: service.id, gender: "FEMALE", price: 2500 }
  ]
});
```

### 3. 創建套餐服務

```typescript
const package = await prisma.servicePackage.create({
  data: {
    name: "從頭到腳套餐",
    description: "全身按摩套餐",
    price: 2000,
    items: {
      create: [
        {
          serviceId: bodyMassageId,
          duration: 60,
          isRequired: true
        },
        {
          serviceId: footMassageId,
          duration: 60,
          isRequired: true
        }
      ]
    }
  }
});
``` 