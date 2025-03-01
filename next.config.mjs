/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      }
    ],
    unoptimized: true
  },
  // 移除靜態導出配置
  // output: 'export',
  trailingSlash: true,
  // 忽略構建錯誤
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Cloudflare Pages 支持
  experimental: {
    // 防止Node.js模塊錯誤
    // serverComponentsExternalPackages 已移至 serverExternalPackages
    serverExternalPackages: ['bcrypt', '@mapbox/node-pre-gyp', 'fs', 'path', 'crypto', 'os'],
    // 移除 Edge Runtime 支持，因為我們需要Node.js運行時
    // runtime: 'edge',
    // serverComponents: true,
  },
  // 添加Webpack配置，解決檔案大小限制問題
  webpack: (config, { isServer }) => {
    // 生產環境中啟用程式碼拆分
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // 拆分大型庫和框架
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next|@next)[\\/]/,
            name: 'framework',
            priority: 40,
            chunks: 'all',
            enforce: true,
          },
          // 拆分UI組件庫
          uiComponents: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|tailwindcss)[\\/]/,
            name: 'ui-components',
            priority: 30,
            chunks: 'all',
          },
          // 拆分其他第三方庫
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'lib',
            priority: 20,
            chunks: 'all',
          },
          // 應用代碼拆分
          app: {
            name: 'app',
            minChunks: 2,
            priority: 10,
            chunks: 'all',
          },
        },
        maxInitialRequests: 25,
        minSize: 20000,
      };
    }
    return config;
  },
  // 添加transpilePackages處理模組兼容性問題
  transpilePackages: ['next-auth'],
}

export default nextConfig 