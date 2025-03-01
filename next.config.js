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
  // 輸出配置，優化Cloudflare部署
  output: 'export',
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
          framework1: {
            test: /[\\/]node_modules[\\/]react[\\/]/,
            name: 'framework-react',
            priority: 50,
          },
          framework2: {
            test: /[\\/]node_modules[\\/]react-dom[\\/]/,
            name: 'framework-reactdom',
            priority: 49,
          },
          framework3: {
            test: /[\\/]node_modules[\\/]next[\\/]/,
            name: 'framework-next',
            priority: 48,
          },
          // UI庫 - 細分
          radiux1: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]react-dialog[\\/]/,
            name: 'ui-radix-dialog',
            priority: 45,
          },
          radiux2: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]react-popover[\\/]/,
            name: 'ui-radix-popover',
            priority: 44,
          },
          radiux3: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]react-select[\\/]/,
            name: 'ui-radix-select',
            priority: 43,
          },
          radiux4: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]react-label[\\/]/,
            name: 'ui-radix-label',
            priority: 42,
          },
          radiux5: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'ui-radix-other',
            priority: 41,
          },
          // 其他UI庫
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'ui-lucide',
            priority: 40,
          },
          tailwind: {
            test: /[\\/]node_modules[\\/]tailwindcss[\\/]/,
            name: 'ui-tailwind',
            priority: 39,
          },
          // 表單和驗證庫
          zod: {
            test: /[\\/]node_modules[\\/]zod[\\/]/,
            name: 'form-zod',
            priority: 38,
          },
          hookform1: {
            test: /[\\/]node_modules[\\/]@hookform[\\/]resolvers[\\/]/,
            name: 'form-resolvers',
            priority: 37,
          },
          hookform2: {
            test: /[\\/]node_modules[\\/]react-hook-form[\\/]/,
            name: 'form-rhf',
            priority: 36,
          },
          // 認證相關
          nextAuth1: {
            test: /[\\/]node_modules[\\/]next-auth[\\/]react[\\/]/,
            name: 'auth-react',
            priority: 35,
          },
          nextAuth2: {
            test: /[\\/]node_modules[\\/]next-auth[\\/]core[\\/]/,
            name: 'auth-core',
            priority: 34,
          },
          nextAuth3: {
            test: /[\\/]node_modules[\\/]next-auth[\\/]/,
            name: 'auth-other',
            priority: 33,
          },
          // 數據庫相關
          prisma: {
            test: /[\\/]node_modules[\\/]@prisma[\\/]/,
            name: 'db-prisma',
            priority: 32,
          },
          // 工具庫
          utils1: {
            test: /[\\/]node_modules[\\/]lodash[\\/]/,
            name: 'util-lodash',
            priority: 31,
          },
          utils2: {
            test: /[\\/]node_modules[\\/]date-fns[\\/]/,
            name: 'util-datefns',
            priority: 30,
          },
          // 其他node_modules
          vendor1: {
            test: /[\\/]node_modules[\\/](?!.*\.(css|less|sass|scss)$)/,
            name(module) {
              // 獲取npm包名稱
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              // 取前兩個字母作為分組名稱前綴
              const prefix = packageName.substring(0, 2);
              return `vendor-${prefix}`;
            },
            priority: 25,
            reuseExistingChunk: true,
          },
          // 應用代碼 - 按目錄細分
          app1: {
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            name: 'app-ui',
            priority: 20,
            reuseExistingChunk: true,
          },
          app2: {
            test: /[\\/]src[\\/]components[\\/]auth[\\/]/,
            name: 'app-auth',
            priority: 19,
            reuseExistingChunk: true,
          },
          app3: {
            test: /[\\/]src[\\/]components[\\/]masseurs[\\/]/,
            name: 'app-masseurs',
            priority: 18,
            reuseExistingChunk: true,
          },
          app4: {
            test: /[\\/]src[\\/]components[\\/]services[\\/]/,
            name: 'app-services',
            priority: 17,
            reuseExistingChunk: true,
          },
          app5: {
            test: /[\\/]src[\\/]components[\\/]/,
            name: 'app-components',
            priority: 16,
            reuseExistingChunk: true,
          },
          app6: {
            test: /[\\/]src[\\/]lib[\\/]/,
            name: 'app-lib',
            priority: 15,
            reuseExistingChunk: true,
          },
          app7: {
            test: /[\\/]src[\\/]app[\\/]/,
            name: 'app-pages',
            priority: 14,
            reuseExistingChunk: true,
          },
          // 通用app代碼
          app: {
            test: /[\\/]src[\\/](?!.*\.css$)/,
            name: 'app-common',
            priority: 10,
            reuseExistingChunk: true,
          },
          // CSS文件
          styles: {
            test: /\.css$/,
            name: 'styles',
            priority: 5,
            reuseExistingChunk: true,
          }
        },
      };
      
      // 增加Tree Shaking的積極性
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;
      
      // 啟用高壓縮率模式
      config.optimization.minimize = true;
      if (config.optimization.minimizer) {
        for (const minimizer of config.optimization.minimizer) {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions?.compress,
                ecma: 5,
                warnings: false,
                comparisons: false,
                inline: 2,
                drop_console: false,  // 保留console.log便於調試
                passes: 3,
              },
              output: {
                ...minimizer.options.terserOptions?.output,
                ecma: 5,
                comments: false,
                ascii_only: true,
              },
            };
          }
        }
      }
    }
    
    return config;
  },
}

module.exports = nextConfig; 