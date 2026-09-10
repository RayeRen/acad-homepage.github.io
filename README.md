# Chenhao Si Academic Homepage

原创中英双语个人学术主页，针对 GitHub Pages 配置。页面采用单页编辑式设计，右上角可即时切换英文与中文，语言选择会保存在当前浏览器。

## 已收录内容

- Chenhao Si，香港中文大学（深圳）数据科学学院 2022 级博士生
- Scientific Machine Learning、AI for Science、Physics-informed Learning
- Google Scholar 当前列出的 7 项成果
- Google Scholar 2026 年 9 月指标快照：59 citations、h-index 3
- GitHub、Google Scholar、ORCID 和公开学术邮箱
- 1200 × 630 社交分享预览图
- 桌面与移动端响应式布局

## 本地预览

需要 Node.js 22.13 或更高版本以及 pnpm。

```bash
pnpm install
pnpm run dev
```

浏览器访问终端显示的本地地址。生成 GitHub Pages 静态文件：

```bash
pnpm run build:pages
```

生成结果位于 `out/`。

## 发布到你的 GitHub

与你的用户名严格匹配的主页仓库是：

`S-Chenhao/S-Chenhao.github.io`

发布地址将是：

`https://s-chenhao.github.io`

建议先给旧模板创建备份分支，再把本项目文件放到该仓库的 `main` 分支。项目自带 `.github/workflows/deploy-pages.yml`，推送后会自动构建并发布。

第一次使用时，在 GitHub 仓库中打开：

1. **Settings**
2. **Pages**
3. **Build and deployment → Source**
4. 选择 **GitHub Actions**

随后每次向 `main` 分支推送修改，主页都会自动更新。

## 常用修改位置

- 个人介绍、中英文文字、论文列表、联系方式：`app/page.tsx`
- 颜色、排版和响应式样式：`app/globals.css`
- 搜索引擎与分享元数据：`app/layout.tsx`
- 分享预览图：`public/og.png`
- GitHub Pages 自动部署：`.github/workflows/deploy-pages.yml`

## 发布前请确认

当前邮箱 `222042011@link.cuhk.edu.cn` 与 ORCID `0009-0006-5314-4632` 来自公开论文/学术索引。发布前请确认你希望公开展示它们。

论文数量与引用次数会随时间变化；页面当前写明这是 2026 年 9 月的快照，实时数据始终链接到 Google Scholar。
