# CNUserGroup Website

亚马逊云科技 User Group 社区官方网站

## 技术栈

- **框架**: Astro 4.x
- **样式**: Tailwind CSS 3.x
- **语言**: TypeScript
- **部署**: GitHub Pages

## 项目结构

```
src/
├── components/           # 可复用 UI 组件
│   ├── layout/          # 布局组件 (Header, Footer, Navigation)
│   ├── sections/        # 页面区块组件
│   └── ui/              # 基础 UI 组件 (Button, Card, etc.)
├── layouts/             # 页面布局模板
├── pages/               # 路由页面和 API 端点
│   ├── cities/          # 动态城市详情页面
│   └── [lang]/          # 国际化路由
├── data/                # 配置文件
│   ├── cities.json      # 城市信息和元数据
│   ├── translations/    # 语言文件 (zh.json, en.json)
│   └── config.yaml      # 网站配置
├── assets/              # 静态资源 (images, icons)
└── styles/              # 全局样式和 Tailwind 配置
```

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 功能特性

- 🌐 双语支持 (中文/英文)
- 📱 响应式设计
- 🚀 静态站点生成
- 🎨 现代化 UI 设计
- 📊 配置文件驱动的内容管理
- 🔍 SEO 优化

## 部署

### 自动部署

网站通过 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建和部署
3. 访问 https://cnusergrouporg.github.io/cnusergroup-website

### 手动部署

```bash
# 部署前检查
npm run pre-deploy

# 构建和部署
npm run deploy

# 本地预览生产版本
npm run preview:prod
```

详细部署指南请参考 [DEPLOYMENT.md](docs/DEPLOYMENT.md)。
