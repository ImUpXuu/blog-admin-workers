# Implementation Plan: 说说 (Micro-blog) Feature

## Overview
Add a minimalist short-post ("说说") editing system to the admin worker. Talks are stored as markdown files with frontmatter in `src/content/talks/` in the myblog repo, parallel to posts at `src/content/posts/`.

## Files to Modify

### 1. `wrangler.toml` — Add `TALKS_PATH` variable
- Add `TALKS_PATH = "src/content/talks"` to `[vars]`

### 2. `src/index.js` — Backend changes (5 edit locations)

**A. Add `/talk` and `/edittalk/` to SPA routing** (line ~22)
- Add `path === '/talk'` and `path.startsWith('/edittalk/')` to the HTML-serving condition

**B. Add Talk API routes** (inside the `/api/` block, ~after line 281)
Four routes following the exact same pattern as posts:
- `GET /api/talks` → `listGitHubFiles(env, env.TALKS_PATH)` — list all talks
- `GET /api/talk/:filename` → `getGitHubFile(env, \`${env.TALKS_PATH}/${filename}\`)` — get talk content
- `PUT /api/talk/:filename` → `updateGitHubFile(env, \`${env.TALKS_PATH}/${filename}\`, body.content, sha, msg)` — create/update (same sha auto-fetch safety check as posts)
- `DELETE /api/talk/:filename` → `deleteGitHubFile(env, \`${env.TALKS_PATH}/${filename}\`, body.sha, msg)` — delete

### 3. `src/html.js` — Frontend changes (6 edit locations)

**A. CSS styles** — Add styles for:
- `.talk-editor-wrapper` — container layout
- `.talk-meta-row` — title + datetime input row
- `.talk-toolbar` / `.talk-toolbar button` — minimal MD toolbar buttons
- `.talk-textarea` — main editing textarea
- `.talk-list-modal` / `.talk-list-overlay` — list modal overlay
- `.talk-list-item` — each talk entry in the list

**B. Sidebar nav** — Add nav item for 说说:
```html
<a href="javascript:void(0)" onclick="navigate('/talk')" id="nav-talk">
  <i class="fas fa-comment-dots"></i> 说说
</a>
```

**C. Talk editor view** (`#view-talk`) — New view after `#view-editor`:
- Top row: title input + datetime-local input (auto-filled with current time) + save button
- Middle: minimal MD toolbar (Bold, Italic, Strikethrough, Code, Link, Image, Quote buttons)
- Main area: large `<textarea>` for content
- "列表" button to open talk list modal

**D. Talk list modal** — Overlay modal (similar to image manager modal but simpler):
- Lists all talks from `/api/talks`
- Each item shows title, date, with edit (→ `/edittalk/:name`) and delete buttons
- Delete with confirmation

**E. JavaScript functions** — Add handlers:
- `loadTalks()` — fetch and render talk list modal
- `deleteTalk(name, sha)` — talk deletion
- `saveTalk()` — save current talk (build frontmatter + textarea content)
- `editTalk(name)` — load a talk for editing
- `newTalk()` — reset talk editor to blank state
- MD toolbar functions (`insertBold`, `insertItalic`, `insertStrike`, `insertCode`, `insertLink`, `insertImage`, `insertQuote`) — wrap selected text with markdown syntax
- `showTalkList()` / `hideTalkList()` — modal toggle

**F. Routing updates** in `handleRoute()`:
- `/talk` → new talk (blank editor)
- `/edittalk/:filename` → load existing talk for editing

## Data Format

Talk frontmatter:
```yaml
---
title: "说说标题"
published: 2026-05-31 14:30:00
---
```

## Minimal MD Editor Design

Simple toolbar buttons that insert markdown syntax around selected text in textarea:
- **Bold**: `**selected**`
- *Italic*: `*selected*`
- ~~Strike~~: `~~selected~~`
- `Code`: `` `selected` ``
- Link: prompts for URL, inserts `[text](url)`
- Image: prompts for URL, inserts `![alt](url)`
- Quote: prefixes each selected line with `> `

## Implementation Order
1. `wrangler.toml` — add TALKS_PATH
2. `src/index.js` — add API routes + SPA routing
3. `src/html.js` — CSS + HTML views + JS + routing
