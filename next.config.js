/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me'
      }
    ],
    unoptimized: true
  },
  // 使用trailingSlash以確保路由一致性
  trailingSlash: true,
  // 忽略構建錯誤
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 輸出配置，使用標準模式以支持API
  output: 'standalone',
  // 禁用壓縮，讓Cloudflare處理
  compress: false,
  // 啟用實驗性功能
  experimental: {
    appDocumentPreloading: true,
  },
  // 添加transpilePackages處理模組兼容性問題
  transpilePackages: ['next-auth'],
  // 優化webpack配置，解決檔案大小限制問題
  webpack: (config, { isServer, dev }) => {
    // 只在生產構建階段進行優化
    if (!isServer && !dev) {
      // 使用極限代碼分割設置，解決文件大小問題
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 100,
        maxAsyncRequests: 100,
        minSize: 1000,
        maxSize: 1000000, // 1MB大小限制，確保分割更徹底
        cacheGroups: {
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'framework',
            priority: 40,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              try {
                // 安全處理模塊上下文
                if (!module || !module.context) return 'libs';
                
                // 獲取npm包名稱並分割成更小塊
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                if (!match || !match[1]) return 'libs';
                
                const packageName = match[1];
                // 使用包名第一個字母分組
                const firstLetter = packageName.charAt(0);
                return `lib-${firstLetter || 'x'}`;
              } catch (e) {
                return 'libs';
              }
            },
            priority: 30,
          },
          app: {
            test: /[\\/]src[\\/]/,
            name(module) {
              try {
                // 安全處理模塊資源
                if (!module || !module.resource) return 'app-other';
                
                // 獲取代碼的路徑
                const path = module.resource || '';
                // 根據路徑分割成更小的塊
                if (path.includes('/components/')) {
                  return 'components';
                } else if (path.includes('/app/')) {
                  return 'app-pages';
                } else {
                  return 'app-other';
                }
              } catch (e) {
                return 'app-other';
              }
            },
            priority: 20,
          },
        },
      };
      
      // 強制啟用Tree Shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;
      
      // 啟用高壓縮率模式
      config.optimization.minimize = true;
    }
    
    return config;
  },
}

module.exports = nextConfig; 