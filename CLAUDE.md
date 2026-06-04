# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Single-file Cloudflare Worker that serves as a blog admin backend and image hosting system. The entire frontend (HTML/CSS/JS SPA) is a template literal string embedded in `src/html.js`. All data is stored in GitHub repos accessed via the GitHub API (GraphQL primarily, REST fallback).

## Architecture

**Two source files — that's the whole app:**
- `src/index.js` — Cloudflare Worker entry point. Contains the fetch handler, all API routes, GitHub API helpers (GraphQL + REST), and IndexNow submission logic.
- `src/html.js` — Exports `ADMIN_HTML`, a single template literal string containing the complete admin SPA: CSS, HTML, and vanilla JS with Vditor editor, client-side routing, image management, settings editor, and gallery views.

**No build step, no bundler, no `package.json`.** Frontend dependencies (Vditor, TailwindCSS, Font Awesome) are loaded from CDN at runtime.

**Two external GitHub repos** are accessed via API:
- `myblog` — stores posts (`src/content/posts/`), old images (`public/images/`), config (`src/config.ts`), and layout (`src/layouts/Layout.astro`)
- `photo` — stores new uploaded images under `images/YYYY/M/D/` structure. A GitHub Action (not in this repo) auto-generates JSON indexes at each directory level.

**Image proxying:** The worker proxies image requests through `/image/` (old → myblog) and `/img/` (new → photo) routes, fetching from GitHub raw URLs with 1-year cache headers.

**Authentication:** Bearer token checked against `ADMIN_PASSWORD` secret (set via `wrangler secret put`). Frontend stores the token in `localStorage`.

**IndexNow:** On post save, asynchronously submits the post URL to Bing's IndexNow API via `ctx.waitUntil`.

## Commands

```bash
# Local dev server (secrets must be set first via wrangler secret put)
npx wrangler dev

# Deploy to Cloudflare
npx wrangler deploy

# Set required secrets (one-time)
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put ADMIN_PASSWORD
```

## Configuration

All config lives in `wrangler.toml` under `[vars]`. Secrets (`GITHUB_TOKEN`, `ADMIN_PASSWORD`) are set separately. The photo repo credentials are currently hardcoded near the top of `src/index.js` — these should eventually reference env vars for consistency with the myblog repo vars.

## API Routes

All under `/api/`, all require `Authorization: Bearer <ADMIN_PASSWORD>` header:
- `GET /api/posts` — list posts (GraphQL, falls back to REST)
- `GET /api/post/:filename` — get single post content + sha
- `PUT /api/post/:filename` — create/update post (body: `{content, sha?}`)
- `DELETE /api/post/:filename` — delete post (body: `{sha}`)
- `GET /api/images` — recursive image list from photo repo (GraphQL)
- `POST /api/upload` — upload image (body: `{filename, content: base64}`)
- `DELETE /api/img/:filename` — delete image from photo repo (body: `{sha}`)
- `DELETE /api/image/:filename` — delete image from myblog repo (body: `{sha}`)
- `GET /api/settings` — get blog config.ts and layout.astro contents
- `PUT /api/settings` — update config or layout file (body: `{file, content, sha}`)

## Frontend Views (client-side routing)

- `/`, `/new` — Editor view with Vditor
- `/list` — Post list with timeline panel (filter by year-month)
- `/gallery` — Image gallery with timeline panel
- `/settings` — Blog settings editor
- `/friends` — Stub/placeholder
- `/edit/:filename` — Edit existing post

## Key Technical Details

- **Vditor** is initialized lazily on first editor view navigation (`initVditor()`)
- **Auto-save** runs every 30s, stores drafts in `localStorage` keyed by `draft_<filename>`
- **Image paths** use format `YYYY/M/D/<timestamp>_<random>.<ext>` generated client-side
- **Image compression**: Client-side WebP conversion via Canvas API before upload (toggleable in image manager modal)
- **GraphQL** is used for listing (single request gets names + content for frontmatter parsing). REST API is the fallback.
- **`ctx.waitUntil`** is used for IndexNow submissions — non-blocking background work that outlives the response.
- **Photo repo credentials** (PHOTO_OWNER, PHOTO_REPO, etc.) are hardcoded at the top of `src/index.js` rather than read from `env` — a deviation from the myblog repo pattern.
- The **Typora upload script** (`scripts/typora-upload.py`) is a standalone Python script that uploads images to the same worker — it's for desktop Markdown editor integration, not part of the Worker itself.
