// 这是一个简单的测试脚本，用于验证BrowserTools是否正常工作
// 在Node.js环境中运行此脚本，确保BrowserTools MCP服务正在运行

async function testBrowserTools() {
  console.log("开始测试BrowserTools...");
  console.log("请确保：");
  console.log("1. Chrome浏览器已安装BrowserTools扩展");
  console.log("2. Cursor中已启用BrowserTools MCP");
  console.log("3. Chrome浏览器至少打开了一个标签页");
  
  console.log("\n如果BrowserTools正常工作，您应该能够在Cursor中使用相关功能。");
  console.log("例如：打开网页、截取屏幕截图、获取页面内容等。");
  
  console.log("\n要手动测试，您可以：");
  console.log("1. 在Cursor中打开命令面板 (按Ctrl+Shift+P)");
  console.log("2. 搜索'MCP'，然后选择'Enable MCP'");
  console.log("3. 再次打开命令面板，搜索'Browser'，查看是否有相关命令");
}

testBrowserTools(); 