# 说说（Talk）API 文档

说说功能用于管理博客的「微语录/碎碎念」内容。数据存储在 GitHub 仓库
`ImUpXuu/xuhome` 的 `src/talk/` 目录下，每个说说对应一个 `.md` 文件。

---

## 基础信息

| 项目         | 值                                         |
|-------------|--------------------------------------------|
| 基础 URL    | `https://edit.upxuu.com`                  |
| API 前缀    | `/api/`                                   |
| 认证方式    | `Authorization: Bearer <ADMIN_PASSWORD>`   |
| 内容类型    | `application/json`                        |
| CORS        | 全开（`Access-Control-Allow-Origin: *`）    |

---

## 认证

所有请求必须携带 Bearer Token：

```bash
# 请求头示例
Authorization: Bearer your-admin-password-here
```

Token 错误或缺失返回 `401 Unauthorized`。

---

## 文件格式

每个说说是一个 Markdown 文件，文件扩展名 `.md`。
文件包含 YAML frontmatter + 正文。

**文件名命名规则**（前端自动生成）：

```
<YYYY-MM-DD>-<标题(取前30字符,去特殊符号)> .md
# 示例
2025-06-07-今日份的随笔.md
```

**文件内容格式**：

```markdown
---
title: "今日份的随笔"
date: "2025-06-07 14:30:00"
tags: ["生活", "随笔"]
---

这是说说的正文内容，可以包含 **Markdown** 格式。
```

### Frontmatter 字段

| 字段    | 必填 | 类型             | 说明                |
|---------|------|------------------|---------------------|
| `title` | 是   | 带引号的字符串   | 说说标题            |
| `date`  | 是   | 带引号的字符串   | 发布时间（`YYYY-MM-DD HH:mm:ss`） |
| `tags`  | 否   | 字符串数组       | 标签，方括号包裹    |

---

## 配置变量

说说功能依赖以下 Worker 环境变量：

| 变量          | 当前值         | 说明              |
|--------------|---------------|-------------------|
| TALK_OWNER   | `ImUpXuu`     | 说说仓库所有者     |
| TALK_REPO    | `xuhome`      | 说说仓库名称       |
| TALK_BRANCH  | `main`        | 说说仓库分支       |
| TALK_PATH    | `src/talk`    | 说说文件目录       |

**注意**：说说和文章共用同一个仓库（`xuhome`），但目录不同（`src/talk/` vs `src/posts/`），
Worker 内部使用独立的 Talk helper 函数来处理。

---

## API 端点

### 1. 获取说说列表

```
GET https://edit.upxuu.com/api/talks
Authorization: Bearer <ADMIN_PASSWORD>
```

#### 说明

优先使用 **GitHub GraphQL** 一次性获取 `src/talk/` 下的所有文件及其内容，
解析 YAML frontmatter 提取 `title` 和 `date`。
GraphQL 失败时自动降级到 **GitHub REST API**。

#### 请求示例

```bash
curl -H "Authorization: Bearer your-password" \
  https://edit.upxuu.com/api/talks
```

#### 成功响应（200）

```json
[
  {
    "name": "2025-06-07-今日份的随笔.md",
    "path": "src/talk/2025-06-07-今日份的随笔.md",
    "sha": "a1b2c3d4e5f6...",
    "title": "今日份的随笔",
    "date": "2025-06-07",
    "type": "file"
  },
  {
    "name": "2025-06-06-昨天的感悟.md",
    "path": "src/talk/2025-06-06-昨天的感悟.md",
    "sha": "f6e5d4c3b2a1...",
    "title": "昨天的感悟",
    "date": "2025-06-06",
    "type": "file"
  }
]
```

| 字段    | 类型   | 说明                        |
|---------|--------|-----------------------------|
| `name`  | string | 文件名（含扩展名）          |
| `path`  | string | 完整仓库路径                |
| `sha`   | string | Git OID（SHA，用于后续修改）|
| `title` | string | 从 frontmatter 解析的标题   |
| `date`  | string | 从 frontmatter 解析的日期   |
| `type`  | string | 固定 `"file"`               |

> **提示**：当 GraphQL 降级到 REST 时，返回的数据中 `title` 等于 `name`（文件名），
> `date` 为 `null`，因为 REST API 无法批量获取文件内容。

#### 错误响应

```json
// GraphQL/REST 失败（透传 GitHub 错误）
Status: 4xx
Body: { "message": "Not Found", ... }
```

---

### 2. 获取单条说说

```
GET https://edit.upxuu.com/api/talk/:filename
Authorization: Bearer <ADMIN_PASSWORD>
```

#### 说明

获取指定说说的完整内容（frontmatter + 正文）。`:filename` 需做 URL 编码。

#### 请求示例

```bash
curl -H "Authorization: Bearer your-password" \
  "https://edit.upxuu.com/api/talk/2025-06-07-今日份的随笔.md"
```

或者对文件名做 URL 编码：

```bash
curl -H "Authorization: Bearer your-password" \
  "https://edit.upxuu.com/api/talk/2025-06-07-%E4%BB%8A%E6%97%A5%E4%BB%BD%E7%9A%84%E9%9A%8F%E7%AC%94.md"
```

#### 成功响应（200）

```json
{
  "content": "---\ntitle: \"今日份的随笔\"\ndate: \"2025-06-07 14:30:00\"\ntags: [\"生活\", \"随笔\"]\n---\n\n这是说说的正文内容，可以包含 **Markdown** 格式。",
  "sha": "a1b2c3d4e5f6..."
}
```

| 字段      | 类型   | 说明                              |
|----------|--------|----------------------------------|
| `content`| string | 完整的文件内容（frontmatter + 正文）|
| `sha`    | string | 文件 SHA（更新时必须附带）         |

#### 错误响应（404）

```json
Status: 404
Body: { "message": "Not Found" }
```

---

### 3. 创建/更新说说

```
PUT https://edit.upxuu.com/api/talk/:filename
Authorization: Bearer <ADMIN_PASSWORD>
```

#### 说明

创建新说说或更新已有说说。提供 `sha` 表示更新已有文件，省略 `sha` 表示新建。
如果更新时未提供 `sha`，Worker 会自动从 GitHub 获取当前 SHA，防止覆盖冲突。

#### 请求示例（新建）

```bash
curl -X PUT \
  -H "Authorization: Bearer your-password" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "---\ntitle: \"今日份的随笔\"\ndate: \"2025-06-07 14:30:00\"\ntags: [\"生活\", \"随笔\"]\n---\n\n这是正文内容。"
  }' \
  "https://edit.upxuu.com/api/talk/2025-06-07-今日份的随笔.md"
```

#### 请求示例（更新）

```bash
curl -X PUT \
  -H "Authorization: Bearer your-password" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "---\ntitle: \"今日份的随笔（修订版）\"\ndate: \"2025-06-07 15:00:00\"\n---\n\n更新后的内容。",
    "sha": "a1b2c3d4e5f6..."
  }' \
  "https://edit.upxuu.com/api/talk/2025-06-07-今日份的随笔.md"
```

#### 请求体

| 字段      | 类型   | 必填 | 说明                        |
|----------|--------|------|-----------------------------|
| `content`| string | 是   | 完整的文件内容（frontmatter + 正文）|
| `sha`    | string | 否   | 更新时必须提供；新建时可省略  |

#### 成功响应（200/201）

```json
{
  "content": {
    "name": "2025-06-07-今日份的随笔.md",
    "path": "src/talk/2025-06-07-今日份的随笔.md",
    "sha": "new-sha-value-here...",
    "size": 123,
    ...
  }
}
```

响应体直接透传 GitHub API 的返回值，包含新的 `content.sha`（后续操作需使用）。
状态码 `200`（更新）或 `201`（新建）。

#### 错误响应

```json
// SHA 冲突或参数错误
Status: 409
Body: { "message": "sha wasnt supplied", ... }

// 认证失败
Status: 401
Body: Unauthorized
```

---

### 4. 删除说说

```
DELETE https://edit.upxuu.com/api/talk/:filename
Authorization: Bearer <ADMIN_PASSWORD>
```

#### 说明

从仓库中删除指定说说文件。必须提供 `sha`。
`:filename` 需做 URL 编码。

#### 请求示例

```bash
curl -X DELETE \
  -H "Authorization: Bearer your-password" \
  -H "Content-Type: application/json" \
  -d '{
    "sha": "a1b2c3d4e5f6..."
  }' \
  "https://edit.upxuu.com/api/talk/2025-06-07-今日份的随笔.md"
```

#### 请求体

| 字段   | 类型   | 必填 | 说明                        |
|-------|--------|------|-----------------------------|
| `sha` | string | 是   | 文件 SHA（从列表或 GET 中获取）|

#### 成功响应（200）

```json
{
  "content": null,
  "commit": {
    "sha": "commit-sha...",
    "message": "Delete 2025-06-07-今日份的随笔.md via Admin"
  }
}
```

#### 错误响应

```json
// SHA 不匹配
Status: 409
Body: { "message": "sha does not match ...", ... }

// 缺少 SHA
Status: 422
Body: { "message": "sha wasn't supplied", ... }
```

---

## 前端行为说明

### 说说编辑器（`/talk`）

前端编辑器使用纯文本 `<textarea>`（非 Vditor），支持：

- **粗体** `**text**` / `__text__`
- *斜体* `*text*` / `_text_`
- ~~删除线~~ `~~text~~`
- `行内代码`
- [链接](url)
- ![图片](url)
- 快捷上传图片（上传到 `photo` 仓库，自动插入 Markdown 图片语法）
- 图库选择已有图片

### 文件名自动生成

前端 `saveTalk()` 函数自动从标题和日期生成文件名：

```
1. 取标题，替换 / \ : * ? " < > | 为 -
2. 合并连续空白为 -
3. 截取前 30 个字符
4. 组合为 <YYYY-MM-DD>-<清理后标题>.md
```

### Frontmatter 构建规则

前端 `saveTalk()` 构建的 frontmatter：

```yaml
---
title: "<标题>"
date: "<YYYY-MM-DD HH:mm:ss>"
tags: ["标签1", "标签2"]
---

正文...
```

### 前端 API 调用方式

前端通过封装的 `fetchAPI()` 函数调用所有接口：

```javascript
// fetchAPI 自动注入 Bearer Token
async function fetchAPI(endpoint, options) {
  const key = localStorage.getItem('admin_key');
  const headers = { 'Authorization': 'Bearer ' + key, ... };
  const res = await fetch('/api' + endpoint, { ...options, headers });
  if (res.status === 401) { /* 提示重新登录 */ }
  return res;
}
```

---

## 完整调用流程示例

### 新建说说

```
1. 前端填写标题、日期、标签、正文
2. 前端构建 frontmatter + 正文 content
3. 前端生成文件名
4. PUT /api/talk/<文件名>
   → Worker 检查 SHA（新建时无 SHA，自动跳过）
   → Worker 对 content 做 UTF-8 → base64 编码
   → Worker 调用 GitHub REST API 写入 src/talk/<文件名>
   → 返回 GitHub 响应
5. 前端提示发布成功
```

### 编辑说说

```
1. 前端口 GET /api/talks 获取列表
2. 点击某条说说 → GET /api/talk/<文件名>
3. 前端解析 content 提取 frontmatter 字段，填入表单
4. 提交 → PUT /api/talk/<文件名>（附带 sha）
5. 更新后的新 SHA 存储在 currentTalkSha 中
```

---

## 错误码速查

| 状态码 | 含义                    | 常见原因                      |
|--------|------------------------|-----------------------------|
| 200    | 成功（GET/PUT/DELETE）  | -                           |
| 201    | 新建成功（PUT）          | -                           |
| 400    | 请求体错误              | JSON 格式错误               |
| 401    | 未认证                  | Token 缺失/错误              |
| 404    | 文件不存在              | 路径或文件名错误             |
| 409    | 冲突                    | SHA 不匹配（文件已被其他操作修改）|
| 422    | 参数错误                | 缺少必填字段 `sha`          |
| 500    | 内部错误/Woker 异常     | GitHub API 不可达等          |

---

## 与文章 API 的区别

| 特性          | 文章 API                 | 说说 API                       |
|-------------|--------------------------|-------------------------------|
| 仓库         | `ImUpXuu/xuhome`          | `ImUpXuu/xuhome`（同一仓库）    |
| 目录路径     | `src/posts/`              | `src/talk/`                   |
| 环境变量     | `GITHUB_OWNER/REPO`       | `TALK_OWNER/REPO`              |
| Frontmatter | `title`, `published`      | `title`, `date`                |
| 前端编辑器   | Vditor（富文本 Markdown）  | `<textarea>`（纯文本）          |
| IndexNow    | 保存后自动提交            | 无                             |
| 正文格式     | 完整博客文章              | 短文本/碎碎念                   |
