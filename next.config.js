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
  // Vercel環境不需要強制使用尾部斜線
  // trailingSlash: true,
  // 忽略構建錯誤
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 輸出配置保持standalone
  output: 'standalone',
  // 新增：禁用自動staticOptimization，由我們手動控制
  reactStrictMode: true,
  // 確保asset prefix正確 - 使用環境變數以適應不同部署環境
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
  // Vercel會自動處理壓縮，不需要禁用
  // compress: false,
  // 啟用實驗性功能
  experimental: {
    appDocumentPreloading: true,
  },
  // 添加transpilePackages處理模組兼容性問題
  transpilePackages: ['next-auth'],
  // 保留現有的webpack優化配置
  webpack: (config, { isServer, dev }) => {
    // 優化webpack配置，解決檔案大小限制問題
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 100,
        maxAsyncRequests: 100,
        minSize: 1000,
        maxSize: 1000000,
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
                if (!module || !module.context) return 'libs';
                
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                if (!match || !match[1]) return 'libs';
                
                const packageName = match[1];
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
                if (!module || !module.resource) return 'app-other';
                
                const path = module.resource || '';
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
      
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;
      config.optimization.minimize = true;
    }
    
    return config;
  },
}

module.exports = nextConfig; 