# AI小说站 - NOVEL.OS

基于 Astro 架构的静态 AI 小说网站。

## 特性

- 🤖 AI 生成小说内容（预生成静态数据）
- 🎨 后现代线条设计风格
- 📱 响应式布局
- ⚡ 静态生成，极低开销
- 🌐 支持静态部署到任意静态托管服务

## 技术栈

- **Astro** - 静态站点生成器
- **纯 CSS** - 无框架依赖
- **静态数据** - JavaScript 模块

## 开始使用

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建静态站点
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
src/
├── data/
│   └── novels.js      # 小说数据（可扩展AI生成逻辑）
├── layouts/
│   └── BaseLayout.astro  # 基础布局
├── pages/
│   ├── index.astro       # 首页
│   ├── genre/[id].astro  # 分类页
│   └── novel/
│       ├── [id].astro    # 小说详情
│       └── [id]/[chapterId].astro  # 章节页
└── public/
    └── favicon.svg
```

## 部署

构建完成后，`dist` 目录包含静态文件，可部署到：
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- 任意静态服务器

## 自定义

修改 `src/data/novels.js` 添加更多小说内容。
