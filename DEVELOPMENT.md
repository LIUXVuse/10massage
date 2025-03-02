# 開發者文檔

![Last Updated](https://img.shields.io/badge/last%20updated-2025--03--02-orange.svg)

本文檔為伊林SPA預約系統的開發者文檔，提供項目設置、開發流程以及注意事項。

## 目錄

- [環境設置](#環境設置)
- [本地開發](#本地開發)
- [數據庫管理](#數據庫管理)
- [API 結構](#api-結構)
- [前端開發](#前端開發)
- [部署流程](#部署流程)
- [最佳實踐](#最佳實踐)
- [常見問題](#常見問題)

## 環境設置

### 系統需求

- Node.js 18.17 或更高版本
- npm 9.6.0 或更高版本
- Git

### 安裝步驟

1. 克隆存儲庫
   ```bash
   git clone https://github.com/your-org/10massage.git
   cd 10massage
   ```

2. 安裝依賴
   ```bash
   npm install
   ```

3. 設置環境變量
   - 複製 `.env.example` 為 `.env`
   - 根據需要修改環境變量，特別是數據庫和認證相關的設置

4. 初始化數據庫
   ```bash
   npx prisma migrate dev
   ```

5. 啟動開發服務器
   ```bash
   npm run dev
   ```

## 本地開發

### 目錄結構

詳見 README.md 的[核心文件架構](#核心文件架構)部分。

### 開發流程

1. **分支管理**
   - `main`: 生產環境分支
   - `develop`: 開發環境分支
   - 功能開發請創建 feature 分支: `feature/feature-name`
   - 錯誤修復請創建 bugfix 分支: `bugfix/issue-number`

2. **提交規範**
   - 使用清晰簡潔的提交信息
   - 格式建議: `[類型]: 描述`，例如 `[Feature]: 添加按摩師排序功能`

3. **代碼審查**
   - 所有代碼合併到 `develop` 或 `main` 前須經過審查
   - 確保代碼格式一致，遵循專案的代碼風格

## 數據庫管理

### Prisma 使用

1. **修改數據模型**
   - 編輯 `prisma/schema.prisma` 文件
   - 運行 `npx prisma migrate dev --name migration-name` 創建迁移文件

2. **生成 Prisma 客戶端**
   ```bash
   npx prisma generate
   ```

3. **查看數據庫**
   ```bash
   npx prisma studio
   ```

### 數據庫遷移注意事項

- 每次修改 schema 後必須運行 migrate 命令
- 生產環境使用 `npx prisma migrate deploy`
- 小心處理破壞性更改（如刪除列或表）

## API 結構

### 認證 API
- `POST /api/auth/login`: 使用者登入
- `POST /api/auth/register`: 使用者註冊
- `GET /api/auth/logout`: 使用者登出

### 按摩師 API
- `GET /api/masseurs`: 獲取所有按摩師
- `GET /api/masseurs/:id`: 獲取特定按摩師 (2025/03/01 新增)
- `POST /api/masseurs`: 新增按摩師
- `PUT /api/masseurs/:id`: 更新按摩師資料 (2025/03/01 更新)
- `DELETE /api/masseurs`: 刪除按摩師
- `PATCH /api/masseurs`: 更新按摩師排序 (2025/03/01 優化)

### 服務 API
- `GET /api/services`: 獲取所有服務
- `GET /api/services/:id`: 獲取特定服務
- `POST /api/services`: 新增服務
- `PUT /api/services/:id`: 更新服務資料
- `DELETE /api/services/:id`: 刪除服務

### 用戶管理 API
- `GET /api/users`: 獲取所有用戶 (僅管理員)
- `PUT /api/users`: 更新用戶角色 (僅管理員)

### 檔案上傳 API
- `POST /api/upload`: 上傳圖片檔案

## 前端開發

### 組件庫

我們使用 Radix UI + Tailwind CSS 構建自定義組件庫:

- **基礎 UI 組件**: `src/components/ui/`
- **頁面組件**: `src/components/`，按功能分類

### 添加新組件

1. 在適當的目錄創建組件文件
2. 確保組件包含適當的類型定義
3. 將複雜邏輯提取為 hooks 或工具函數
4. 確保組件是可重用的，避免重複代碼

### 狀態管理

- 使用 React Context 進行全局狀態管理
- 頁面級狀態使用 React Hooks (`useState`, `useReducer`)
- 表單狀態使用 React Hook Form

## 部署流程

### 生產環境部署

1. **準備工作**
   - 確保代碼已經過測試
   - 運行構建以確保無錯誤: `npm run build`

2. **部署到 Vercel**
   - 將代碼推送到 GitHub
   - Vercel 將自動部署 main 分支
   - 確保 Build & Development Settings 中的建置命令設為: `npx prisma generate && next build`

3. **數據庫設置**
   - 使用 Neon PostgreSQL 作為生產數據庫
   - 在 Neon.tech 建立新的 PostgreSQL 資料庫
   - 通過 Vercel 整合將 Neon 數據庫連接到專案
   - 確保 `NEON_POSTGRES_PRISMA_URL` 環境變數已正確設置

4. **數據庫遷移**
   - 本地開發使用的 SQLite 數據不能直接遷移到 PostgreSQL
   - 需要重新建立遷移歷史:
     ```powershell
     # 刪除舊的遷移記錄
     Remove-Item -Path "prisma\migrations" -Recurse -Force
     
     # 生成 Prisma 客戶端
     npx prisma generate
     
     # 創建新的遷移
     npx prisma migrate dev --name initial
     ```
   - 初始化管理員帳戶:
     在部署完成後訪問 `/api/admin/init-accounts` 端點

### 環境變量配置

Vercel 生產環境需要配置以下環境變量:
- `NEON_POSTGRES_PRISMA_URL`: Neon PostgreSQL 連接字符串
- `NEXTAUTH_URL`: 完整的網站 URL (例如 https://10massage.vercel.app)
- `NEXTAUTH_SECRET`: 認證加密密鑰
- `NODE_ENV`: 設為 "production"

### PostgreSQL 連接字符串格式

Neon PostgreSQL 的連接字符串格式如下:
```
postgresql://username:password@hostname:port/database
```

確保在 prisma/schema.prisma 中使用正確的環境變數:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("NEON_POSTGRES_PRISMA_URL")
}
```

## 最佳實踐

### 性能優化

1. **圖片優化**
   - 使用 Next.js Image 組件優化圖片
   - 為不同設備適配不同圖片尺寸

2. **代碼分割**
   - 善用 Next.js 的自動代碼分割
   - 對大型依賴使用動態導入

3. **API 效率**
   - 優化數據庫查詢，避免 N+1 問題
   - 使用適當的索引優化查詢性能

### 安全最佳實踐

1. **表單安全**
   - 始終對用戶輸入進行驗證
   - 使用 CSRF 令牌防止跨站請求偽造

2. **認證與授權**
   - 使用統一的權限檢查功能
   - 確保對敏感操作進行適當的權限檢查

3. **數據安全**
   - 敏感信息不應記錄到控制台或日誌文件
   - 確保用戶密碼使用 bcrypt 加密存儲

### 按摩師排序功能最佳實踐 (2025/03/01 更新)

按摩師排序功能在2025/03/01進行了重要優化：

1. **數據庫儲存優化**:
   - 從使用時間戳記方式轉為直接使用 `sortOrder` 欄位儲存排序信息
   - 確保排序數據永久保存在數據庫中，即使重新登入也會保持相同順序
   ```prisma
   model Masseur {
     // 其他字段...
     sortOrder   Int      @default(999)
   }
   ```

2. **查詢邏輯改進**:
   - 使用多重排序條件，確保排序穩定性
   ```typescript
   const masseurs = await prisma.masseur.findMany({
     // 其他選項...
     orderBy: [
       { sortOrder: 'asc' } as any, // 主要排序條件
       { createdAt: 'desc' as const } // 次要排序條件，確保穩定性
     ]
   });
   ```

3. **API 端點優化**:
   - 使用 Prisma 事務批量更新每個按摩師的 `sortOrder` 欄位
   ```typescript
   // 使用 Prisma 事務批量更新按摩師的排序欄位
   const updates = masseurOrders.map(({ id, order }: { id: string, order: number }) => {
     return prisma.masseur.update({
       where: { id },
       data: { 
         sortOrder: order // 直接更新 sortOrder 欄位
       } as any
     });
   });
   
   await prisma.$transaction(updates);
   ```

4. **用戶體驗增強**:
   - 更新排序提示和 Toast 通知，明確告知用戶排序更改將被自動永久保存
   ```tsx
   toast({
     title: "排序已更新",
     description: "按摩師排序已成功保存，下次登入時將保持此排序",
     duration: 3000
   });
   ```

5. **日誌增強**:
   - 為排序操作添加了更詳細的日誌記錄，方便問題排查
   ```typescript
   console.log('按摩師排序已更新:', masseurOrders);
   ```

6. **注意事項**:
   - 排序功能僅對管理員可用，確保權限驗證正確
   - 保存排序時提供清晰的視覺反饋，避免用戶重複操作
   - 實時更新前端顯示，同時確保數據庫持久化
   - 在排序操作過程中禁用其他交互，避免競態條件

### 按摩師圖片顯示優化 (2025/03/01 新增)

為解決按摩師圖片顯示問題，實施了以下改進：

1. **API 返回數據一致性優化**:
   - 確保所有 API 返回的按摩師數據包含完整的裁剪和縮放參數
   - 為避免前端錯誤，添加了默認值處理
   ```typescript
   // 將數據庫中的image字段映射到前端使用的imageUrl，並包含所有裁剪參數
   const mappedMasseur = {
     ...masseur,
     imageUrl: masseur.image,
     // 確保這些欄位具有預設值，以防資料庫中沒有這些值
     imageScale: (masseur as any).imageScale || 1,
     cropX: (masseur as any).cropX || 0,
     cropY: (masseur as any).cropY || 0,
     cropWidth: (masseur as any).cropWidth || 300,
     cropHeight: (masseur as any).cropHeight || 225
   };
   ```

2. **圖片顯示組件增強**:
   - 改進圖片加載邏輯，添加詳細的加載和錯誤記錄
   ```tsx
   <Image
     src={masseur.imageUrl}
     alt={masseur.name}
     fill
     style={{...}}
     onLoad={(e) => {
       console.log("圖片載入完成", {
         masseurId: masseur.id,
         name: masseur.name,
         imageUrl: masseur.imageUrl,
         naturalWidth: (e.target as HTMLImageElement).naturalWidth,
         naturalHeight: (e.target as HTMLImageElement).naturalHeight
       });
     }}
     onError={(e) => {
       console.error("圖片載入錯誤", {
         masseurId: masseur.id,
         imageUrl: masseur.imageUrl,
         error: e
       });
     }}
   />
   ```

3. **圖片編輯優化**:
   - 確保按摩師編輯頁面能正確加載和顯示已有的裁剪參數
   - 修復了編輯模式自動進入裁剪狀態的問題
   ```tsx
   // 設置裁剪框和相關表單值
   if (initialData.cropX !== undefined && 
       initialData.cropY !== undefined &&
       initialData.cropWidth !== undefined && 
       initialData.cropHeight !== undefined) {
     
     setCropBox({
       x: initialData.cropX,
       y: initialData.cropY,
       width: initialData.cropWidth,
       height: initialData.cropHeight
     });
     
     // 設置表單值
     form.setValue("cropX", initialData.cropX);
     form.setValue("cropY", initialData.cropY);
     form.setValue("cropWidth", initialData.cropWidth);
     form.setValue("cropHeight", initialData.cropHeight);
     
     // 預設進入預覽模式而非裁切模式
     setEditMode('view');
   }
   ```

4. **類型定義優化**:
   - 調整 TypeScript 類型定義以准確反映按摩師模型的屬性
   ```typescript
   interface Masseur {
     id: string
     name: string
     description: string
     imageUrl?: string
     imageScale?: number
     cropX?: number
     cropY?: number
     cropWidth?: number
     cropHeight?: number
     sortOrder?: number
     services: Service[]
     user?: {
       id: string
       name: string
       email: string
     } | null
   }
   ```

5. **主要問題解決**:
   - 解決了按摩師圖片在列表頁無法正確顯示的問題
   - 修復了更新按摩師後裁剪參數丟失的問題
   - 改進了API回傳裁剪參數的一致性
   - 添加了更詳細的日誌以便於問題排查

6. **額外升級**:
   - 增強了圖片處理的錯誤捕獲能力
   - 提高了代碼健壯性，可以處理缺失或不完整的圖片數據

## 常見問題

### 啟動問題

**問題**: 啟動時出現 "Error: Cannot find module '@prisma/client'"
**解決方案**: 運行 `npx prisma generate`

**問題**: 提示 "Database file is locked"
**解決方案**: 確保沒有其他進程（如 Prisma Studio）正在訪問數據庫

### 部署問題

**問題**: Vercel 部署失敗，提示 "No Output Directory"
**解決方案**: 確保 `next.config.js` 中的設置正確

**問題**: 圖片上傳後無法顯示
**解決方案**: 檢查 UPLOAD_DIR 環境變量和相應目錄的存取權限

### 認證問題

**問題**: NextAuth 會話無效或過早過期
**解決方案**: 檢查 NEXTAUTH_SECRET 是否已設置且在所有環境中一致

**問題**: 權限檢查不一致
**解決方案**: 使用 `lib/auth/auth-utils.ts` 中的統一權限檢查函數

### 按摩師管理頁面問題處理 (2025/03/02 新增)

在進行從內嵌編輯模式改為獨立編輯頁面的重構過程中，發現並修復了以下問題：

1. **縮圖顯示問題**:
   - **問題**: 按摩師卡片中的縮圖顯示不正確，無法正確應用裁剪和縮放設置。
   - **解決方案**: 
     ```tsx
     <Image
       src={masseur.imageUrl}
       alt={masseur.name}
       fill
       style={{
         objectFit: 'cover',
         objectPosition: 'center',
         transform: masseur.imageScale ? `scale(${masseur.imageScale})` : 'scale(1)',
         ...(masseur.cropX !== undefined && masseur.cropY !== undefined) && {
           objectPosition: `${-masseur.cropX}px ${-masseur.cropY}px`
         }
       }}
       className="transition-all duration-300"
     />
     ```
   - 關鍵是使用條件判斷處理 `imageScale` 和 `objectPosition`，確保在裁剪參數存在時正確設置偏移值。

2. **刪除功能問題**:
   - **問題**: 點擊刪除按鈕後，確認對話框不顯示。
   - **解決方案**: 
     ```tsx
     // 定義處理函數
     const handleDeleteClick = (masseur: Masseur) => {
       setDeletingMasseur(masseur);
       setIsDeleteDialogOpen(true);
     };
     
     // 簡化組件結構
     function SortableMasseurCard({ masseur, userIsAdmin, onDelete }) {
       // ...
       return (
         // ...
         <button onClick={() => onDelete(masseur)}>刪除</button>
         // ...
       );
     }
     
     // 在頁面組件中使用
     <SortableMasseurCard
       masseur={masseur}
       userIsAdmin={userIsAdmin}
       onDelete={handleDeleteClick}
     />
     ```
   - 關鍵是簡化事件處理流程，確保狀態更新正確觸發確認對話框。

3. **表單初始化問題**:
   - **問題**: 編輯按摩師時，表單數據未正確初始化，尤其是圖片處理相關的字段。
   - **解決方案**:
     ```tsx
     useEffect(() => {
       if (initialData) {
         // 設置基本表單值
         form.setValue("name", initialData.name)
         form.setValue("description", initialData.description || "")
         form.setValue("imageUrl", initialData.imageUrl || "")
         
         // 設置縮放
         if (initialData.imageScale) {
           setImageScale(initialData.imageScale);
           form.setValue("imageScale", initialData.imageScale);
         }
         
         // 設置裁剪框
         if (initialData.cropX !== undefined && 
             initialData.cropY !== undefined &&
             initialData.cropWidth !== undefined && 
             initialData.cropHeight !== undefined) {
           setCropBox({
             x: initialData.cropX,
             y: initialData.cropY,
             width: initialData.cropWidth,
             height: initialData.cropHeight
           });
           
           // 設置表單值
           form.setValue("cropX", initialData.cropX);
           form.setValue("cropY", initialData.cropY);
           form.setValue("cropWidth", initialData.cropWidth);
           form.setValue("cropHeight", initialData.cropHeight);
           
           // 如果有裁切數據，預設進入裁切模式
           setEditMode('crop');
         } else if (initialData.imageScale != null) {
           // 如果有縮放數據，預設進入縮放模式
           setEditMode('scale');
         }
       }
     }, [initialData, form]);
     ```
   - 關鍵是依據已存在的數據選擇適當的編輯模式，並正確設置所有相關的表單值。

4. **拖曳排序問題**:
   - **問題**: 管理員權限判斷不正確，導致拖曳功能有時無法使用。
   - **解決方案**:
     ```tsx
     // 使用統一的權限檢查函數
     import { isAdmin } from "@/lib/auth/auth-utils"
     
     const userIsAdmin = isAdmin(session)
     ```
   - 關鍵是使用專用的權限檢查函數，確保權限判斷一致性。

## 新功能開發

### 按摩師排序功能 (2025/02/28 新增)

按摩師排序功能使用了 @dnd-kit 庫來實現拖放功能：

1. **數據庫變更**:
   - 添加了 `sortOrder` 字段到 `Masseur` 模型
   ```prisma
   model Masseur {
     // 其他字段...
     sortOrder   Int      @default(999)
   }
   ```

2. **API 變更**:
   - 添加了 PATCH 方法到 `/api/masseurs` 用於更新排序
   ```typescript
   // 更新按摩師排序 - 僅管理員可訪問
   export async function PATCH(request: Request) {
     try {
       // 檢查是否為管理員
       if (!await isAdmin(request)) {
         return NextResponse.json({ error: '未授權訪問，僅管理員可以更新按摩師排序' }, { status: 403 });
       }
       
       const { masseurOrders } = await request.json();
       
       // 驗證輸入
       if (!Array.isArray(masseurOrders)) {
         return NextResponse.json({ error: '無效的請求數據' }, { status: 400 });
       }
       
       // 使用 Prisma 事務批量更新排序
       const updates = masseurOrders.map(({ id, order }: { id: string, order: number }) => 
         prisma.masseur.update({
           where: { id },
           data: { sortOrder: order }
         })
       );
       
       await prisma.$transaction(updates);
       
       return NextResponse.json({ success: true, message: '按摩師排序已更新' });
     } catch (error) {
       console.error('更新按摩師排序時發生錯誤:', error);
       return NextResponse.json({ error: '更新按摩師排序失敗' }, { status: 500 });
     }
   }
   ```
   - 更新 GET 方法以按 `sortOrder` 排序結果
   ```typescript
   const masseurs = await prisma.masseur.findMany({
     // 其他選項...
     orderBy: [
       { sortOrder: 'asc' }, // 按照 sortOrder 欄位排序
       { createdAt: 'desc' } // 次要排序方式
     ]
   });
   ```

3. **前端實現**:
   - 使用 `DndContext` 和 `SortableContext` 包裝按摩師列表
   ```tsx
   <DndContext 
     sensors={sensors}
     collisionDetection={closestCenter}
     onDragEnd={handleDragEnd}
   >
     <SortableContext 
       items={masseurs.map(m => m.id)}
       strategy={verticalListSortingStrategy}
     >
       {masseurs.map((masseur) => (
         <SortableMasseurCard
           key={masseur.id}
           masseur={masseur}
           userIsAdmin={userIsAdmin}
           onEdit={setEditingMasseur}
           onDelete={setDeletingMasseur}
         />
       ))}
     </SortableContext>
   </DndContext>
   ```
   - 實現了 `SortableMasseurCard` 組件
   ```tsx
   function SortableMasseurCard({ masseur, userIsAdmin, onEdit, onDelete }) {
     const {
       attributes,
       listeners,
       setNodeRef,
       transform,
       transition,
       isDragging
     } = useSortable({ id: masseur.id });

     const style = {
       transform: CSS.Transform.toString(transform),
       transition,
       zIndex: isDragging ? 10 : 1,
       opacity: isDragging ? 0.8 : 1,
     };

     return (
       <div
         ref={setNodeRef}
         style={style}
         className={`bg-white p-4 rounded-lg shadow relative group ${isDragging ? 'ring-2 ring-primary shadow-lg' : ''}`}
       >
         {userIsAdmin && (
           <div 
             className="absolute top-2 left-2 cursor-grab opacity-30 group-hover:opacity-100 transition-opacity"
             {...attributes}
             {...listeners}
           >
             <GripVertical className="h-6 w-6 text-gray-500" />
           </div>
         )}
         {/* 卡片內容... */}
       </div>
     );
   }
   ```
   - 處理拖放事件並通過 API 更新數據庫
   ```tsx
   const handleDragEnd = async (event: DragEndEvent) => {
     const { active, over } = event;
     
     if (over && active.id !== over.id) {
       setMasseurs((items) => {
         const oldIndex = items.findIndex((item) => item.id === active.id);
         const newIndex = items.findIndex((item) => item.id === over.id);
         
         // 顯示拖動中的通知
         toast({
           title: "正在更新排序",
           description: "正在保存新的按摩師排序...",
           duration: 2000
         });
         
         return arrayMove(items, oldIndex, newIndex);
       });
       
       // 保存新排序到伺服器
       await saveNewOrder();
     }
   };
   
   const saveNewOrder = async () => {
     if (!userIsAdmin) return;
     
     setIsSavingOrder(true);
     try {
       const masseurOrders = masseurs.map((masseur, index) => ({
         id: masseur.id,
         order: index + 1 // 從1開始的排序
       }));
       
       const response = await fetch("/api/masseurs", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ masseurOrders })
       });
       
       if (!response.ok) {
         throw new Error("更新排序失敗");
       }
       
       toast({
         title: "排序已更新",
         description: "按摩師排序已成功保存",
         duration: 3000
       });
     } catch (error) {
       console.error("保存排序時發生錯誤:", error);
       toast({
         title: "排序更新失敗",
         description: "無法保存按摩師排序，請稍後再試",
         variant: "destructive",
         duration: 5000
       });
     } finally {
       setIsSavingOrder(false);
     }
   };
   ```

4. **用戶體驗優化**:
   - 添加了拖動時的視覺反饋
   - 添加了排序提示
   ```tsx
   {userIsAdmin && (
     <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 flex items-center">
       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
       </svg>
       <span>
         <strong>排序提示：</strong> 您可以通過拖放按摩師卡片來調整顯示順序。點擊並按住卡片左上角的拖動圖標，然後拖動到所需位置。
       </span>
     </div>
   )}
   ```
   - 添加了保存排序時的加載指示器
   ```tsx
   {isSavingOrder && (
     <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
       <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
         <Loader2 className="h-6 w-6 text-primary animate-spin" />
         <span className="text-gray-700 font-medium">正在保存排序...</span>
       </div>
     </div>
   )}
   ```
   - 添加了 Toast 通知，在排序更新時提供反饋

5. **注意事項**:
   - 排序功能僅對管理員可用
   - 確保用戶有足夠的視覺反饋 (通過 Toast 通知)
   - 使用 `arrayMove` 函數來處理數組重排
   - 使用 Prisma 事務來確保所有排序更新都是原子性的

### 開發新功能的一般流程

1. 評估需求，考慮數據模型影響
2. 如需要，更新 Prisma schema 並創建遷移
3. 實現 API 端點或修改現有端點
4. 開發前端界面和交互
5. 编寫適當的測試
6. 創建詳細的文檔，包括此文件的更新 

### 按摩師管理架構優化 (2025/03/01 新增)

將按摩師管理功能從內嵌編輯模式改為獨立編輯頁面，主要變更如下：

1. **路由結構變更**:
   - 新增 `/masseurs/edit/[id]` 路由用於編輯和新增按摩師
   ```tsx
   // src/app/(dashboard)/masseurs/edit/[id]/page.tsx
   export default function MasseurEditPage({ params }) {
     const { id } = params;
     const isNewMasseur = id === 'new';
     // ...
   }
   ```

2. **列表頁面變更**:
   - 移除內嵌編輯功能
   - 按摩師卡片的「編輯」按鈕改為 Link 元件
   ```tsx
   <Link href={`/masseurs/edit/${masseur.id}`} className="...">
     編輯
   </Link>
   ```
   - 新增「新增按摩師」按鈕
   ```tsx
   <Link href="/masseurs/edit/new" className="...">
     新增按摩師
   </Link>
   ```

3. **編輯頁面實現**:
   - 使用 `params.id` 判斷是新增或編輯模式
   - 編輯模式：通過 API 獲取現有按摩師資料
   - 新增模式：使用空白表單
   ```tsx
   const fetchMasseurData = async () => {
     try {
       setIsLoading(true);
       if (!isNewMasseur) {
         const response = await fetch(`/api/masseurs/${id}`);
         // 處理回應...
       }
     } catch (error) {
       // 錯誤處理...
     } finally {
       setIsLoading(false);
     }
   };
   ```

4. **資料處理流程**:
   - 表單提交時根據是否為新增模式決定使用 POST 或 PUT 方法
   ```tsx
   const onSubmit = async (data) => {
     try {
       setIsSubmitting(true);
       
       const method = isNewMasseur ? 'POST' : 'PUT';
       const url = isNewMasseur ? '/api/masseurs' : `/api/masseurs/${id}`;
       
       const response = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });
       
       // 處理回應...
     } catch (error) {
       // 錯誤處理...
     } finally {
       setIsSubmitting(false);
     }
   };
   ```

5. **API 變更**:
   - 新增 GET `/api/masseurs/[id]` 端點用於獲取單個按摩師資料
   - 更新 POST 和 PUT 端點以支援新的工作流程

6. **用戶體驗優化**:
   - 添加載入狀態指示器
   - 提交表單時顯示處理中狀態
   - 保存成功後自動返回列表頁面
   - 錯誤發生時顯示清晰的錯誤信息

7. **主要優勢**:
   - 優化了代碼結構，減少了單一頁面的複雜性
   - 改進用戶體驗，提供更清晰的操作流程
   - 符合 SPA 應用程序的 Master-Detail 設計模式
   - 簡化表單處理邏輯，提高代碼可維護性
   - 更容易擴展添加新功能，如圖片裁剪預覽等 