/**
 * 伊林SPA預約系統 - 檔案結構優化腳本
 * 
 * 此腳本用於執行檔案結構優化的清理工作，包括：
 * 1. 刪除冗餘的D1相關代碼
 * 2. 刪除重複的admin路由
 * 
 * 使用方法：
 * node cleanup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 要刪除的目錄和文件
const toDelete = [
  'src/app/api/d1',
  'src/lib/db.ts',
  'src/app/admin'
];

// 顯示腳本標題
console.log('\n=== 伊林SPA預約系統 - 檔案結構優化腳本 ===\n');

// 檢查每個路徑是否存在，並刪除
toDelete.forEach(itemPath => {
  const fullPath = path.join(process.cwd(), itemPath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        console.log(`刪除目錄: ${itemPath}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        console.log(`刪除文件: ${itemPath}`);
        fs.unlinkSync(fullPath);
      }
      
      console.log(`✅ 成功刪除: ${itemPath}`);
    } else {
      console.log(`⚠️ 路徑不存在，跳過: ${itemPath}`);
    }
  } catch (error) {
    console.error(`❌ 刪除失敗: ${itemPath}`);
    console.error(`   錯誤: ${error.message}`);
  }
});

// 從package.json中移除未使用的依賴
console.log('\n正在從package.json中移除未使用的依賴...');

try {
  console.log('執行: npm uninstall @cloudflare/workers-types');
  execSync('npm uninstall @cloudflare/workers-types', { stdio: 'inherit' });
  console.log('✅ 成功移除依賴: @cloudflare/workers-types');
} catch (error) {
  console.error('❌ 移除依賴失敗');
  console.error(`   錯誤: ${error.message}`);
}

console.log('\n=== 檔案結構優化完成 ===\n');
console.log('請檢查以下文件是否有引用已刪除的模塊:');
console.log('1. 檢查是否有引用 src/lib/db.ts');
console.log('2. 檢查是否有引用 src/app/api/d1/');
console.log('3. 檢查是否有引用 src/app/admin/');
console.log('\n如有需要，請手動更新這些引用。'); 