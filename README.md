# 伊林SPA预约系统

## 项目概述
伊林SPA是一个提供泰式、中式按摩为主的线上预约系统。采用低调、简约、舒适的设计风格，为用户提供便捷的预约体验。

## 技术架构
- **前端框架**: Next.js 14 (App Router)
- **UI框架**: Tailwind CSS
- **数据库**: PostgreSQL (Neon)
- **ORM**: Prisma
- **身份验证**: NextAuth.js
- **部署**: Vercel

## 核心功能模块

### 用户功能
- 账号管理
  - 注册/登入/登出
  - 个人资料管理
- 预约服务  
  - 线上预约按摩服务
  - 取消预约
  - 查看预约记录
  - 查看按摩师可预约时段

### 管理者功能
- 按摩师管理
  - 新增/删除按摩师资料
  - 查看/修改按摩师班表
  - 管理按摩项目与价格
- 预约管理
  - 查看/修改预约记录
- 用户管理
  - 查看/修改用户资料
  - 管理用户预约记录

### 按摩师功能
- 账号管理
  - 登入/登出 
- 班表管理
  - 查看/修改个人班表
  - 管理预约记录

## 开发与安装

### 环境需求
- Node.js 18.0+
- PostgreSQL 15.0+

### 安装步骤
1. 克隆代码库
   ```bash
   git clone https://github.com/yourusername/eilin-spa.git
   cd eilin-spa
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 设置环境变量
   创建 `.env` 文件并添加必要的环境变量:
   ```
   NEON_POSTGRES_PRISMA_URL=your_postgres_url
   NEXTAUTH_SECRET=your_auth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. 初始化数据库
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. 启动开发服务器
   ```bash
   npm run dev
   ```

6. 访问应用
   打开浏览器，访问 http://localhost:3000

## 部署指南
详细的部署指南可在 `/docs/deployment` 目录下找到。

## 开发规范
请参阅 `/docs/development` 目录下的开发规范文档。

## 贡献指南
欢迎贡献代码和提出改进建议！请先阅读我们的贡献指南。

## 许可证
本项目采用 MIT 许可证。
