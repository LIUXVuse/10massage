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
  // 改為靜態輸出，完全減小文件大小限制
  output: 'export',
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
              // 獲取npm包名稱並分割成更小塊
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              // 使用包名第一個字母分組
              const firstLetter = packageName.charAt(0);
              return `lib-${firstLetter}`;
            },
            priority: 30,
          },
          app: {
            test: /[\\/]src[\\/]/,
            name(module) {
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