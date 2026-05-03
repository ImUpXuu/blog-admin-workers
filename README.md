# Blog Admin Worker

基于 Cloudflare Workers 的博客管理后台，使用 Vditor 作为 Markdown 编辑器。

## 功能特性

- ✨ 支持三种编辑模式：即时渲染 (IR)、所见即所得 (WYSIWYG)、分屏预览 (SV)
- 💾 自动保存草稿，防止意外丢失
- 🖼️ 图片上传和管理，支持批量操作
  - 新图片上传到 ImUpXuu/photo 仓库（`/img/` 路由）
  - 历史图片保留在 myblog 仓库（`/image/` 路由）
  - 按 `年/月/日/时间戳_随机数.扩展名` 结构存储
  - 递归获取所有子目录中的图片
- 📅 时间轴筛选文章
- 🎨 多主题支持
- 🔒 安全认证
- 📱 移动端优化，底部工具栏设计

## 移动端优化

### 底部工具栏

在移动端（屏幕宽度 ≤ 768px）时，Vditor 编辑器工具栏会自动固定在屏幕底部，呈现为一个小横条，方便单手握持和操作。

**特性：**
- ✅ 工具栏固定在底部，不会遮挡编辑内容
- ✅ 单行可左右滑动，所有工具触手可及
- ✅ 按钮大小适中（18x18px 图标），不会过大
- ✅ 带有阴影效果，视觉层次分明
- ✅ 电脑端保持原有顶部工具栏样式
- ✅ 全屏模式下工具栏依然在底部
- ✅ 自动调整编辑器高度，避免内容被遮挡
- ✅ **智能下拉框定位**：自动检测键盘状态，防止下拉框被键盘遮挡
- ✅ 隐藏滚动条但保留滚动功能，界面更简洁

## 技术栈

- **前端**：原生 JavaScript + TailwindCSS + Vditor
- **后端**：Cloudflare Workers
- **存储**：GitHub API（文章和图片存储在 GitHub 仓库）

## 部署

### 环境要求

- Node.js 20.18+
- Cloudflare 账号
- GitHub Token

### 部署步骤

1. 安装依赖
```bash
npm install
```

2. 配置环境变量

编辑 `wrangler.toml` 文件，配置以下变量：
- `GITHUB_OWNER`: GitHub 用户名
- `GITHUB_REPO`: 博客仓库名
- `GITHUB_BRANCH`: 分支名
- `POSTS_PATH`: 文章路径
- `IMAGE_PATH`: 图片路径
- `BLOG_URL`: 博客地址

3. 设置 Secrets

```bash
# 设置 GitHub Token
wrangler secret put GITHUB_TOKEN

# 设置管理员密码
wrangler secret put ADMIN_PASSWORD
```

4. 部署

```bash
npm run deploy
```

## 开发

本地开发模式：

```bash
npm run dev
```

## 项目结构

```
admin-worker/
├── src/
│   ├── index.js        # Cloudflare Workers 主入口
│   └── html.js         # 管理后台 HTML 和 JavaScript
├── wrangler.toml       # Wrangler 配置文件
├── package.json        # 项目依赖配置
└── README.md          # 项目说明文档
```

## API 接口

- `GET /api/posts` - 获取文章列表
- `GET /api/post/:filename` - 获取文章内容
- `PUT /api/post/:filename` - 创建/更新文章
- `DELETE /api/post/:filename` - 删除文章
- `GET /api/images` - 获取图片列表
- `POST /api/upload` - 上传图片
- `GET /api/settings` - 获取设置
- `PUT /api/settings` - 更新设置

## 许可证

MIT

## 鸣谢

- [Vditor](https://github.com/Vanessa219/vditor) - 优秀的 Markdown 编辑器
- [Cloudflare Workers](https://workers.cloudflare.com/) - 无服务器平台
- [TailwindCSS](https://tailwindcss.com/) - 实用工具 CSS 框架
