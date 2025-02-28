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
  // 排除需要原生編譯的模塊
  serverExternalPackages: ['bcrypt', '@mapbox/node-pre-gyp'],
  // 添加webpack配置，防止客戶端嘗試導入特定模塊
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 在客戶端構建時，排除這些模塊
      config.resolve.alias = {
        ...config.resolve.alias,
        'bcrypt': false,
        '@mapbox/node-pre-gyp': false,
        '@auth/prisma-adapter': false
      };
      
      // 使用空實現替代NODE原生模塊
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        zlib: false
      };
    }
    
    return config;
  }
}

export default nextConfig 