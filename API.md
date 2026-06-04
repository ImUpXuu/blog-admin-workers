# Blog Admin Worker API

Cloudflare Worker，提供博客管理后台与图片托管服务。
数据存储在 GitHub 仓库中，通过 **GraphQL**（优先）+ **REST**（降级）访问。

---

## 基础信息

- **基础 URL（生产）**: `https://edit.upxuu.com`
- **基础 URL（本地开发）**: `http://localhost:8787`
- **CORS**: 全开 (`Access-Control-Allow-Origin: *`)，支持跨域调用

---

## 认证方式

所有 `/api/*` 路由都需要在请求头中携带 Bearer Token：

```
Authorization: Bearer <ADMIN_PASSWORD>
```

`ADMIN_PASSWORD` 是 Worker 的 secret（通过 `wrangler secret put ADMIN_PASSWORD` 设置）。

错误响应：

```json
401 Unauthorized
```

---

## 配置变量

`wrangler.toml [vars]` 中定义（也支持在 Cloudflare Dashboard 中覆盖）：

| 变量             | 值             | 说明                         |
|------------------|----------------|------------------------------|
| GITHUB_OWNER     | `ImUpXuu`      | 博客仓库所有者               |
| GITHUB_REPO      | `xuhome`       | 博客仓库名称                 |
| GITHUB_BRANCH    | `main`         | 博客仓库分支                 |
| POSTS_PATH       | `src/posts`    | 文章存放目录                 |
| TALK_OWNER       | `ImUpXuu`      | 说说仓库所有者               |
| TALK_REPO        | `xuhome`       | 说说仓库名称                 |
| TALK_BRANCH      | `main`         | 说说仓库分支                 |
| TALK_PATH        | `src/talk`     | 说说存放目录                 |
| IMAGE_PATH       | `public/images`| 旧版图片目录                 |
| BLOG_URL         | `https://upxuu.com` | 博客首页 URL（用于 IndexNow）|
| PHOTO_OWNER      | `ImUpXuu`      | 图片仓库所有者（硬编码）      |
| PHOTO_REPO       | `photo`        | 图片仓库名称（硬编码）        |
| PHOTO_BRANCH     | `main`         | 图片仓库分支（硬编码）        |
| PHOTO_PATH       | `images`       | 图片存放目录（硬编码）        |

Secret（通过 `wrangler secret put` 设置）：

| Secret           | 说明                                      |
|------------------|-------------------------------------------|
| GITHUB_TOKEN     | GitHub 个人访问令牌（需要 repo 权限）      |
| ADMIN_PASSWORD   | 管理后台 Bearer Token                      |

---

## 前端路由（SPA）

以下路由返回 `ADMIN_HTML`（内嵌的单页应用），前端通过 `history.pushState` + `popstate` 做客户端路由。

| 路由                     | 视图               |
|--------------------------|--------------------|
| `/`                      | 编辑器（新建文章） |
| `/new`                   | 编辑器（同 `/`）   |
| `/edit/:filename`        | 编辑器（加载已有文章）|
| `/list`                  | 文章列表 + 时间筛选 |
| `/gallery`               | 图片库 + 时间导航   |
| `/settings`              | 博客设置（config.ts + Layout.astro） |
| `/talk`                  | 说说编辑器          |
| `/edittalk/:filename`    | 编辑已有说说        |

---

## 公开代理路由（无需认证）

通过 Worker 代理图片请求，不暴露 GitHub 真实 URL。

### `GET /image/<path>`

代理博客仓库（`GITHUB_REPO` / `IMAGE_PATH`）中的**旧版图片**。

```
GET https://edit.upxuu.com/image/2023/hero.jpg
→ https://raw.githubusercontent.com/ImUpXuu/xuhome/main/public/images/2023/hero.jpg
```

- 缓存: `public, max-age=31536000`（1 年）
- 不存在时返回 `404 Image not found`

### `GET /img/<path>`

代理图片仓库（`ImUpXuu/photo`）中的**新版图片**。

```
GET https://edit.upxuu.com/img/2025/6/4/20250604_123_abc.webp
→ https://raw.githubusercontent.com/ImUpXuu/photo/main/images/2025/6/4/20250604_123_abc.webp
```

- 路径段逐个 `encodeURIComponent` 编码（正确处理 `年/月/日/` 层级）
- 缓存: `public, max-age=31536000`（1 年）
- 不存在时返回 `404 Image not found`

---

## API 路由

所有路由前缀 `/api/`，全部需要 `Authorization: Bearer <ADMIN_PASSWORD>`。

### 文章管理

#### `GET /api/posts`（或 `/api/list`）

获取文章列表。

- **GraphQL 优先**：查询 `branch:src/posts` 表达式，内联解析 YAML frontmatter（避免 N+1 查询）
- **REST 降级**：GraphQL 失败时回退到 `GET /repos/.../contents/src/posts`

响应：

```json
[
  {
    "name": "2025-01-01-hello.md",
    "path": "src/posts/2025-01-01-hello.md",
    "sha": "abc123def456",
    "title": "Hello World",
    "date": "2025-01-01",
    "type": "file"
  }
]
```

#### `GET /api/post/:filename`

获取单篇文章内容。

```
GET https://edit.upxuu.com/api/post/2025-01-01-hello.md
```

响应：

```json
{
  "content": "---\ntitle: \"Hello\"\n---\n\n文章正文...",
  "sha": "abc123def456"
}
```

- `content` 从 GitHub API 的 base64 解码，UTF-8 处理
- `sha` 用于后续更新

#### `PUT /api/post/:filename`

创建或更新文章。

请求：

```json
{
  "content": "---\ntitle: \"Hello\"\n---\n\nMarkdown 正文",
  "sha": "abc123def456"
}
```

- `sha` 对新文件可选；如果省略，Worker 自动获取已存在的 SHA（防止意外覆盖）
- `content` 经过 UTF-8 编码 → base64 再发送到 GitHub

成功响应：

```json
{
  "content": { "sha": "newsha123..." },
  "indexNow": { "status": "pending", "url": "https://upxuu.com/posts/2025-01-01-hello" }
}
```

- **IndexNow**：保存成功后通过 `ctx.waitUntil` 异步将文章 URL 提交到 `https://api.indexnow.org/indexnow`（Bing）。响应立即返回 `pending`，实际提交在后台执行。

#### `DELETE /api/post/:filename`

删除文章。

```
DELETE https://edit.upxuu.com/api/post/2025-01-01-hello.md
```

请求：

```json
{
  "sha": "abc123def456"
}
```

- `sha` 必填（GitHub API 要求）
- 提交信息：`Delete <filename> via Admin`

---

### 图片管理

#### `GET /api/images`

获取图片仓库（`ImUpXuu/photo/images/`）中的**全部图片**。

- **递归 GraphQL**：遍历整个目录树（年/月/日 层级）
- 返回扁平数组

响应：

```json
[
  {
    "name": "20250604_123_abc.webp",
    "path": "2025/6/4/20250604_123_abc.webp",
    "sha": "oid123..."
  }
]
```

- 扩展名过滤：`.jpg` `.jpeg` `.png` `.gif` `.webp` `.svg`

#### `POST /api/upload`

上传图片到图片仓库。

```
POST https://edit.upxuu.com/api/upload
```

请求：

```json
{
  "filename": "2025/6/4/20250604_123_abc.webp",
  "content": "<base64 编码的图片数据>"
}
```

- `filename` 使用 `年/月/日/` 路径结构（客户端生成）
- `content` 必须是**纯 base64**（不是 data URI，Worker 不做二次编码）
- 直接上传到 GitHub REST API（绕过 `updateGitHubFile` 的 UTF-8 重新编码，避免二进制文件损坏）

成功响应：

```json
{
  "url": "https://edit.upxuu.com/img/2025/6/4/20250604_123_abc.webp"
}
```

- URL 指向 Worker 的 `/img/` 代理，非 GitHub 原始链接

#### `DELETE /api/img/:filename`

删除图片仓库中的图片。

```
DELETE https://edit.upxuu.com/api/img/2025/6/4/20250604_123_abc.webp
```

请求：

```json
{
  "sha": "abc123..."
}
```

- 路径为 `images/<filename>`
- 使用硬编码的 `PHOTO_OWNER` / `PHOTO_REPO`（非环境变量）

#### `DELETE /api/image/:filename`

删除博客仓库中的旧版图片。

```
DELETE https://edit.upxuu.com/api/image/2023/hero.jpg
```

请求：

```json
{
  "sha": "abc123..."
}
```

- 路径为 `public/images/<filename>`（使用 `IMAGE_PATH` 环境变量）
- 提交信息：`Delete image <filename> via Admin`

---

### 博客设置

#### `GET /api/settings`

获取博客仓库中的 `src/config.ts` 和 `src/layouts/Layout.astro`。

```
GET https://edit.upxuu.com/api/settings
```

响应：

```json
{
  "config": {
    "content": "export default {\n  title: \"UpXuu\",\n  ...\n}",
    "sha": "abc123..."
  },
  "layout": {
    "content": "---\n---\n<html>...",
    "sha": "def456..."
  }
}
```

#### `PUT /api/settings`

更新 `config` 或 `layout` 文件。

```
PUT https://edit.upxuu.com/api/settings
```

请求：

```json
{
  "file": "config",
  "content": "export default {\n  title: \"新标题\",\n  ...\n}",
  "sha": "abc123..."
}
```

- `file` 可选值：`"config"` 或 `"layout"`
- 提交信息：`Update <file> via Admin Settings`

---

### 说说管理

说说文件存放在 `xuhome` 仓库的 `src/talk/` 下，使用独立的 GitHub 请求函数
（`TALK_OWNER` / `TALK_REPO` / `TALK_BRANCH`）。

#### `GET /api/talks`

获取说说列表。

响应：

```json
[
  {
    "name": "2025-06-01.mdx",
    "path": "src/talk/2025-06-01.mdx",
    "sha": "oid123...",
    "title": "Some Talk",
    "date": "2025-06-01",
    "type": "file"
  }
]
```

- 解析 YAML frontmatter 中的 `title` 和 `date` 字段
- GraphQL 优先，REST 降级

#### `GET /api/talk/:filename`

获取单条说说内容。

```
GET https://edit.upxuu.com/api/talk/2025-06-01.mdx
```

响应：`{ "content": "...", "sha": "..." }`

#### `PUT /api/talk/:filename`

创建或更新说说。

- 自动获取已有 SHA 逻辑同文章
- 使用 Talk 专用的 GitHub helpers（`TALK_OWNER` / `TALK_REPO` / `TALK_BRANCH`）

#### `DELETE /api/talk/:filename`

删除说说。

请求：`{ "sha": "..." }`

---

## 内部架构

### 数据流

```
客户端 → Worker → GitHub GraphQL API（首选）
                  → GitHub REST API（降级）
```

### GitHub 凭据

涉及两个仓库：

| 仓库     | 所有者    | 用途                 | 凭据方式                         |
|----------|-----------|----------------------|----------------------------------|
| `xuhome` | `ImUpXuu` | 文章、设置、说说     | `GITHUB_TOKEN` + 环境变量         |
| `photo`  | `ImUpXuu` | 图片                 | `GITHUB_TOKEN` + 硬编码常量       |

### 图片代理

图片不直接暴露 GitHub 链接，通过 Worker 代理：

```
前端 → Worker /img/ → GitHub raw URL
      ← Worker 缓存 1 年
```

好处：隐藏真实 GitHub URL、添加 CORS 头、添加长缓存。

### IndexNow

`PUT /api/post/:filename` 成功后：

1. 保存文章到 GitHub
2. 读取响应数据
3. 在响应中添加 `indexNow.pending`
4. 调用 `ctx.waitUntil(async () => fetch('https://api.indexnow.org/indexnow', {...}))`

IndexNow key 和 keyLocation 目前硬编码在代码中（后续应迁移到环境变量）。

### 说说独立函数

`xuhome` 仓库同时存放 `src/posts/`（文章）和 `src/talk/`（说说），
Worker 维护了两套独立的 GitHub 请求函数（通用的 `githubRequest` 和专用的
`talkGithubRequest`），区别仅在于读取的仓库变量不同。后续可以参数化
仓库目标来消除重复。

---

## 错误响应

| 状态码 | 返回体                                     | 说明                               |
|--------|--------------------------------------------|------------------------------------|
| 401    | `Unauthorized`                             | Bearer Token 缺失或错误             |
| 404    | `Not Found`                                | 未知路由                           |
| 404    | `Image not found`                          | GitHub 上未找到图片                 |
| 4xx    | GitHub 返回的 JSON 错误信息                | REST API 错误透传                   |
| 500    | `Failed to fetch settings files`           | 无法读取 config.ts 或 Layout.astro  |
