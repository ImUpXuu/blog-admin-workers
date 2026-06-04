# Blog Admin Worker API

Cloudflare Worker providing a blog admin backend and image hosting system.
Data stored in GitHub repos, accessed via **GraphQL** (primary) + **REST** (fallback).

---

## Authentication

All `/api/*` routes require:

```
Authorization: Bearer <ADMIN_PASSWORD>
```

`ADMIN_PASSWORD` is a Worker secret (`wrangler secret put ADMIN_PASSWORD`).
Returning `401 Unauthorized` if missing or incorrect.

---

## Configuration

Variables from `wrangler.toml [vars]` (also deployable via Cloudflare dashboard):

| Variable         | Value                              | Purpose                   |
|------------------|------------------------------------|---------------------------|
| GITHUB_OWNER     | `ImUpXuu`                          | Blog repo owner           |
| GITHUB_REPO      | `xuhome`                           | Blog repo name            |
| GITHUB_BRANCH    | `main`                             | Blog repo branch          |
| POSTS_PATH       | `src/posts`                        | Posts directory           |
| TALK_OWNER       | `ImUpXuu`                          | Talk repo owner           |
| TALK_REPO        | `xuhome`                           | Talk repo name            |
| TALK_BRANCH      | `main`                             | Talk repo branch          |
| TALK_PATH        | `src/talk`                         | Talk directory            |
| IMAGE_PATH       | `public/images`                    | Legacy images directory   |
| BLOG_URL         | `https://upxuu.com`                | Blog URL for IndexNow     |
| PHOTO_OWNER      | `ImUpXuu`                          | Photo repo owner          |
| PHOTO_REPO       | `photo`                            | Photo repo name           |
| PHOTO_BRANCH     | `main`                             | Photo repo branch         |
| PHOTO_PATH       | `images`                           | Photo directory           |

Secrets (set via `wrangler secret put`):

| Secret          | Purpose                                      |
|-----------------|----------------------------------------------|
| GITHUB_TOKEN    | GitHub personal access token (with repo scope)|
| ADMIN_PASSWORD  | Admin panel Bearer token                     |

---

## Frontend Routes

These routes return `ADMIN_HTML` (the embedded SPA). The frontend handles
client-side routing via `history.pushState` and `popstate`.

| Route            | SPA View                               |
|------------------|----------------------------------------|
| `/`       | Editor (new post — uses `src/posts/`) |
| `/new`          | Editor (same as `/`)                   |
| `/edit/:filename` | Editor (loads existing post)         |
| `/list`         | Post list with timeline filter         |
| `/gallery`      | Image gallery with timeline            |
| `/settings`     | Blog settings editor (`config.ts` + `Layout.astro`) |
| `/talk`         | Talk editor                            |
| `/edittalk/:filename` | Edit existing talk               |

---

## Public Proxy Routes

These require **no authentication** — they proxy images from GitHub raw URLs.

### `GET /image/<path>`

Proxy for **legacy images** in the blog repo (`GITHUB_REPO` / `IMAGE_PATH`).

```
GET /image/2023/hero.jpg
→ https://raw.githubusercontent.com/ImUpXuu/xuhome/main/public/images/2023/hero.jpg
```

- Cache: `public, max-age=31536000` (1 year)
- Returns `404 Image not found` if missing

### `GET /img/<path>`

Proxy for **new images** in the photo repo (`ImUpXuu/photo`).

```
GET /img/2025/6/4/20250604_123_abc.webp
→ https://raw.githubusercontent.com/ImUpXuu/photo/main/images/2025/6/4/20250604_123_abc.webp
```

- Path segments are `encodeURIComponent`-encoded individually (handles `year/month/day/` hierarchy)
- Cache: `public, max-age=31536000` (1 year)
- Returns `404 Image not found` if missing

---

## API Routes

All under `/api/`, all require `Authorization: Bearer <ADMIN_PASSWORD>`.

### Posts

#### `GET /api/posts` (or `/api/list`)

List all posts.

- **GraphQL first**: queries `branch:src/posts` expression on GitHub, parses YAML frontmatter inline (avoids N+1)
- **REST fallback**: if GraphQL fails, falls back to `GET /repos/.../contents/src/posts`

Response:

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

Get single post content.

```
GET /api/post/2025-01-01-hello.md
```

Response:

```json
{
  "content": "---\ntitle: \"Hello\"\n---\n\nPost body here...",
  "sha": "abc123def456"
}
```

- `content` is base64-decoded from GitHub API, UTF-8 decoded
- `sha` is the file's SHA for subsequent updates

#### `PUT /api/post/:filename`

Create or update a post.

Request:

```json
{
  "content": "---\ntitle: \"Hello\"\n---\n\nMarkdown body",
  "sha": "abc123def456"
}
```

- `sha` is optional for new files; if omitted, the worker auto-fetches existing SHA to avoid accidental overwrite
- `content` is UTF-8 encoded → base64 before sending to GitHub

Response (success):

```json
{
  "content": { "sha": "newsha123..." },
  "indexNow": { "status": "pending", "url": "https://upxuu.com/posts/2025-01-01-hello" }
}
```

- **IndexNow**: on success, `ctx.waitUntil` asynchronously submits the post URL to `https://api.indexnow.org/indexnow` (Bing). The response includes a `pending` status immediately; actual submission happens in the background.

#### `DELETE /api/post/:filename`

Delete a post.

Request:

```json
{
  "sha": "abc123def456"
}
```

- `sha` is required (GitHub API requirement for content deletion)
- Commits with message: `Delete <filename> via Admin`

---

### Images (Photo Repo)

#### `GET /api/images`

List ALL images from the **photo repo** (`ImUpXuu/photo/images/`).

- **Recursive GraphQL**: walks the tree structure (year/month/day subdirectories)
- Returns flat array of all images

Response:

```json
[
  {
    "name": "20250604_123_abc.webp",
    "path": "2025/6/4/20250604_123_abc.webp",
    "sha": "oid123..."
  }
]
```

- Images are filtered by extension: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`

#### `POST /api/upload`

Upload an image to the **photo repo**.

Request:

```json
{
  "filename": "2025/6/4/20250604_123_abc.webp",
  "content": "<base64-encoded image data>"
}
```

- `filename` uses `year/month/day/` path structure (generated client-side)
- `content` must be **raw base64** (NOT a data URI, NOT re-encoded by the worker)
- Uploads directly to GitHub REST API (bypasses the UTF-8 re-encoding in `updateGitHubFile` to avoid corrupting binary data)

Response (success):

```json
{
  "url": "https://blog-admin.upxuu.workers.dev/img/2025/6/4/20250604_123_abc.webp"
}
```

- The URL points to the worker's `/img/` proxy, NOT the raw GitHub URL

#### `DELETE /api/img/:filename`

Delete an image from the **photo repo**.

```
DELETE /api/img/2025/6/4/20250604_123_abc.webp
```

Request:

```json
{
  "sha": "abc123..."
}
```

- Path is `images/<filename>`
- Uses hardcoded `PHOTO_OWNER` / `PHOTO_REPO` constants (not env vars)

#### `DELETE /api/image/:filename`

Delete a legacy image from the **blog repo**.

```
DELETE /api/image/2023/hero.jpg
```

Request:

```json
{
  "sha": "abc123..."
}
```

- Path is `public/images/<filename>` (uses `IMAGE_PATH` env var)
- Commits with message: `Delete image <filename> via Admin`

---

### Settings (Blog Repo)

#### `GET /api/settings`

Fetch `src/config.ts` and `src/layouts/Layout.astro` from the **blog repo**.

Response:

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

- Content is base64-decoded from GitHub with UTF-8 handling

#### `PUT /api/settings`

Update `config` or `layout` file.

Request:

```json
{
  "file": "config",
  "content": "export default {\n  title: \"New Title\",\n  ...\n}",
  "sha": "abc123..."
}
```

- `file` must be `"config"` or `"layout"`
- Commits with message: `Update <file> via Admin Settings`

---

### Talks

Talk files are stored in the same `xuhome` repo but under `src/talk/` with
dedicated helper functions that talk to `TALK_OWNER`/`TALK_REPO` vars.

#### `GET /api/talks`

List all talk files (from `TALK_PATH`).

- Same GraphQL + fallback pattern as posts
- Parses YAML frontmatter for `title` and `date` fields

Response:

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

#### `GET /api/talk/:filename`

Get single talk content.

Response: `{ "content": "...", "sha": "..." }`

#### `PUT /api/talk/:filename`

Create or update a talk.

- Same auto-fetch SHA logic as posts
- Uses TALK-specific GitHub helpers (`TALK_OWNER`, `TALK_REPO`, `TALK_BRANCH`)

#### `DELETE /api/talk/:filename`

Delete a talk.

Request: `{ "sha": "..." }`

---

## Internal Architecture

### Data Flow

```
Client → Worker → GitHub GraphQL API (primary)
                  → GitHub REST API (fallback)
```

### GitHub Credentials

Two repos are accessed:

| Repo       | Owner      | Purpose            | Credentials                 |
|------------|------------|--------------------|-----------------------------|
| `xuhome`   | `ImUpXuu`  | Posts, settings, talk | `GITHUB_TOKEN` + env vars |
| `photo`    | `ImUpXuu`  | Images             | `GITHUB_TOKEN` + hardcoded constants |

### Image Proxying

Images are NOT served directly from GitHub. The worker proxies them:

```
Frontend → Worker /img/ → GitHub raw URL
         ← Worker caches 1 year
```

Benefits: hides the real GitHub URL, adds CORS headers, adds long cache.

### IndexNow

On `PUT /api/post/:filename`, the worker:

1. Saves the post to GitHub
2. Reads the updated response
3. Adds `indexNow.pending` to the response
4. Calls `ctx.waitUntil(async () => fetch('https://api.indexnow.org/indexnow', {...}))`

The IndexNow key and key location are currently hardcoded (should move to env vars).

### Talk Refs

Since `xuhome` hosts both `src/posts/` and `src/talk/`, the worker maintains
two separate sets of GitHub helpers (generic `githubRequest` vs. `talkGithubRequest`)
that differ only in which repo variables they read. A future refactor could
parameterize the repo target to eliminate this duplication.

---

## Error Responses

| Status | Body         | When                              |
|--------|--------------|-----------------------------------|
| 401    | `Unauthorized` | Missing/invalid Bearer token    |
| 404    | `Not Found`    | Unknown route                   |
| 404    | `Image not found` | Image not in GitHub raw       |
| 4xx    | GitHub error JSON | REST API failures forwarded   |
| 5xx    | `Failed to fetch settings files` | Config/layout not readable |
