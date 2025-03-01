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
  // 輸出配置，設為適合Cloudflare的方式
  distDir: '.next',
  output: 'standalone',
  // 禁用壓縮，讓Cloudflare處理
  compress: false,
  // 啟用實驗性appDir功能
  experimental: {
    appDocumentPreloading: true,
    serverComponentsExternalPackages: []
  },
  // 添加transpilePackages處理模組兼容性問題
  transpilePackages: ['next-auth'],
  // 優化webpack配置，解決檔案大小限制問題
  webpack: (config, { isServer, dev }) => {
    // 只在生產構建階段進行優化
    if (!isServer && !dev) {
      // 超級激進的代碼分割設置，確保文件不超過Cloudflare的25MB限制
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        minSize: 5000,
        maxSize: 5000000, // 減小到5MB以確保安全
        cacheGroups: {
          // 框架核心 - 拆成更小塊
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'framework',
            priority: 50,
          },
          // UI庫
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|tailwindcss)[\\/]/,
            name: 'ui-lib',
            priority: 40,
          },
          // 第三方庫
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'lib',
            priority: 30,
          },
          // 應用代碼
          app: {
            test: /[\\/]src[\\/]/,
            name: 'app',
            priority: 20,
          },
        },
      };
      
      // 增加Tree Shaking的積極性
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;
      
      // 啟用高壓縮率模式
      config.optimization.minimize = true;
    }
    
    return config;
  },
}

module.exports = nextConfig; 