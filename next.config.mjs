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
    // 較為簡單的分割配置，避免複雜的module.context匹配
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 30,
      minSize: 20000,
      maxSize: 18000000, // 減小到18MB
      cacheGroups: {
        framework: {
          name: 'framework',
          test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
          priority: 40,
          reuseExistingChunk: true,
        },
        lib: {
          test: /[\\/]node_modules[\\/]/,
          name: 'lib',
          priority: 30,
          reuseExistingChunk: true,
        },
        commons: {
          name: 'commons',
          minChunks: 2,
          priority: 20,
          reuseExistingChunk: true,
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          priority: 10,
          enforce: true,
        }
      },
    };
    
    return config;
  },
}

export default nextConfig 