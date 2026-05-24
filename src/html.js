export const ADMIN_HTML = /* html */`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UpXuu Blog Admin</title>
<link rel="stylesheet" href="https://unpkg.com/vditor/dist/index.css" />
<script src="https://unpkg.com/vditor/dist/index.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
<style>
/* ============================================================
   CSS Custom Properties & Reset
   ============================================================ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow: hidden; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; color: #1e293b; }

:root {
  --sidebar-w: 256px;
  --panel-w: 304px;
  --header-h: 0px;
  --primary: #3b82f6;
  --primary-dark: #2563eb;
  --sidebar-bg: #0f172a;
  --sidebar-hover: #1e293b;
  --border: #e2e8f0;
  --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============================================================
   Scrollbar
   ============================================================ */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* ============================================================
   Loading Overlay
   ============================================================ */
#loading { position: fixed; inset: 0; z-index: 999; background: rgba(0,0,0,0.35); display: none; align-items: center; justify-content: center; flex-direction: column; backdrop-filter: blur(2px); }
#loading.active { display: flex; }
.spinner { border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; width: 40px; height: 40px; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ============================================================
   Login Screen
   ============================================================ */
#login-screen { position: fixed; inset: 0; z-index: 1000; display: none; align-items: center; justify-content: center; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); }
#login-screen.active { display: flex; }

/* ============================================================
   App Layout — CSS Grid
   ============================================================ */
#app-screen { display: none; height: 100vh; overflow: hidden; }
#app-screen.active { display: grid; grid-template-columns: auto 1fr; grid-template-rows: 1fr; }

/* Sidebar */
#sidebar { width: var(--sidebar-w); background: var(--sidebar-bg); color: #fff; display: flex; flex-direction: column; z-index: 50; transition: transform var(--transition); flex-shrink: 0; }
#sidebar .brand { padding: 20px 24px; border-bottom: 1px solid #1e293b; display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
#sidebar .brand-icon { width: 32px; height: 32px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
#sidebar nav { flex: 1; overflow-y: auto; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
#sidebar nav .nav-section { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; padding: 12px 12px 6px; }
#sidebar nav a { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.15s; }
#sidebar nav a:hover { background: var(--sidebar-hover); color: #e2e8f0; }
#sidebar nav a.active { background: #1e293b; color: #fff; }
#sidebar nav a.active i { color: var(--primary); }
#sidebar nav a i { width: 20px; text-align: center; font-size: 15px; }
#sidebar .logout-btn { margin: 12px; padding: 10px 16px; border-radius: 10px; border: none; background: transparent; color: #94a3b8; cursor: pointer; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; width: calc(100% - 24px); transition: all 0.15s; }
#sidebar .logout-btn:hover { background: rgba(239,68,68,0.1); color: #f87171; }
#sidebar .logout-btn i { width: 20px; text-align: center; }

/* Sidebar overlay (mobile) */
#sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 49; }
#sidebar-overlay.active { display: block; }

/* Main content area */
#main-content { display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

/* ============================================================
   Mobile Header
   ============================================================ */
#mobile-header { display: none; align-items: center; justify-content: space-between; padding: 0 16px; height: 56px; background: #fff; border-bottom: 1px solid var(--border); flex-shrink: 0; }
#mobile-header .menu-btn, #mobile-header .panel-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: none; background: transparent; color: #475569; cursor: pointer; font-size: 20px; }
#mobile-header .menu-btn:hover, #mobile-header .panel-btn:hover { background: #f1f5f9; }
#mobile-header .title { font-weight: 700; font-size: 16px; }
#mobile-header .panel-btn.hidden { visibility: hidden; }

/* ============================================================
   Views
   ============================================================ */
.view { display: none; flex: 1; overflow: hidden; flex-direction: column; min-width: 0; }
.view.active { display: flex; }

/* View layouts that have a side panel */
.view-has-panel { flex-direction: row; }
.view-has-panel .view-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.view-has-panel .view-panel { width: var(--panel-w); border-left: 1px solid var(--border); background: #fff; display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0; }

/* Panel header */
.view-panel .panel-header { padding: 16px 20px; border-bottom: 1px solid var(--border); font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; background: #f8fafc; flex-shrink: 0; }
.view-panel .panel-body { flex: 1; overflow-y: auto; padding: 8px; }

/* Panel overlay (mobile) */
.panel-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 29; }
.panel-overlay.active { display: block; }

/* ============================================================
   View: Editor
   ============================================================ */
#view-editor .editor-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: #fff; border-bottom: 1px solid var(--border); gap: 12px; flex-shrink: 0; flex-wrap: wrap; }
#view-editor .editor-toolbar .filename-input { flex: 1; min-width: 120px; font-size: 18px; font-weight: 700; border: none; border-bottom: 2px solid transparent; padding: 4px 8px; outline: none; background: transparent; transition: border-color 0.15s; }
#view-editor .editor-toolbar .filename-input:focus { border-bottom-color: var(--primary); }
#view-editor .editor-toolbar .filename-input::placeholder { color: #cbd5e1; }
#view-editor .editor-toolbar .toolbar-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
#view-editor .editor-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }
#view-editor .editor-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
#view-editor #vditor { flex: 1; min-height: 0; }

/* Editor panel (meta sidebar) */
#view-editor .editor-panel { width: var(--panel-w); border-left: 1px solid var(--border); background: #fff; display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0; }
#view-editor .editor-panel .panel-inner { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

/* Panel toggle button inline (for desktop collapse) */
.panel-toggle-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: none; background: #f1f5f9; color: #64748b; cursor: pointer; font-size: 16px; flex-shrink: 0; }
.panel-toggle-btn:hover { background: #e2e8f0; }

/* ============================================================
   View: List
   ============================================================ */
#view-list .list-toolbar { padding: 12px 20px; background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px; flex-wrap: wrap; flex-shrink: 0; }
#view-list .list-toolbar h2 { font-size: 18px; font-weight: 700; white-space: nowrap; }
#view-list .list-toolbar .search-box { flex: 1; min-width: 160px; position: relative; }
#view-list .list-toolbar .search-box input { width: 100%; padding: 8px 12px 8px 36px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; outline: none; background: #f8fafc; transition: border-color 0.15s; }
#view-list .list-toolbar .search-box input:focus { border-color: var(--primary); }
#view-list .list-toolbar .search-box i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 14px; }
#view-list .list-toolbar .badge { background: #eff6ff; color: #3b82f6; font-size: 12px; font-weight: 600; padding: 2px 10px; border-radius: 999px; }
#view-list .list-toolbar .filter-tag { display: none; align-items: center; gap: 6px; background: #f1f5f9; color: #475569; font-size: 12px; padding: 4px 10px; border-radius: 6px; margin-left: 4px; }
#view-list .list-toolbar .filter-tag.active { display: flex; }
#view-list .list-toolbar .filter-tag button { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 12px; padding: 0 2px; }
#view-list .list-toolbar .filter-tag button:hover { color: #ef4444; }
#view-list .list-container { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 8px; }

/* Post card */
.post-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; cursor: pointer; transition: all 0.15s; }
.post-card:hover { border-color: #bfdbfe; box-shadow: 0 2px 8px rgba(59,130,246,0.08); }
.post-card .card-icon { width: 40px; height: 40px; border-radius: 999px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.post-card .card-body { flex: 1; min-width: 0; }
.post-card .card-title { font-weight: 600; font-size: 15px; line-height: 1.3; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color 0.15s; }
.post-card:hover .card-title { color: var(--primary); }
.post-card .card-meta { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 10px; }
.post-card .card-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.post-card .card-actions button { width: 34px; height: 34px; border-radius: 8px; border: none; background: transparent; color: #94a3b8; cursor: pointer; font-size: 14px; transition: all 0.15s; }
.post-card .card-actions button:hover.edit { background: #eff6ff; color: #3b82f6; }
.post-card .card-actions button:hover.delete { background: #fef2f2; color: #ef4444; }

/* ============================================================
   View: Gallery
   ============================================================ */
#view-gallery .gallery-toolbar { padding: 12px 20px; background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; flex-shrink: 0; }
#view-gallery .gallery-toolbar h2 { font-size: 18px; font-weight: 700; }
#view-gallery .gallery-container { flex: 1; overflow-y: auto; padding: 16px 20px; }
.gallery-group { margin-bottom: 32px; }
.gallery-group h3 { font-size: 15px; font-weight: 700; color: #475569; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; position: sticky; top: 0; background: #f1f5f9; padding: 8px 0; z-index: 2; backdrop-filter: blur(4px); }
.gallery-group h3 .ym-badge { font-size: 11px; font-weight: 400; color: #64748b; background: #fff; padding: 1px 8px; border-radius: 999px; border: 1px solid var(--border); }
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.gallery-item { aspect-ratio: 1; border-radius: 10px; border: 1px solid var(--border); overflow: hidden; position: relative; background: #fff; cursor: pointer; transition: all 0.15s; }
.gallery-item:hover { border-color: #bfdbfe; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.gallery-item:hover img { transform: scale(1.05); }
.gallery-item .item-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); transition: background 0.2s; display: flex; align-items: flex-start; justify-content: flex-end; padding: 8px; gap: 4px; opacity: 0; }
.gallery-item:hover .item-overlay { background: rgba(0,0,0,0.08); opacity: 1; }
.gallery-item .item-overlay button { width: 30px; height: 30px; border-radius: 999px; border: none; background: rgba(255,255,255,0.9); color: #475569; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.gallery-item .item-overlay button:hover.link { background: #3b82f6; color: #fff; }
.gallery-item .item-overlay button:hover.md { background: #22c55e; color: #fff; }
.gallery-item .item-overlay button:hover.del { background: #ef4444; color: #fff; }
.gallery-item .item-name { position: absolute; bottom: 0; left: 0; right: 0; padding: 6px 8px; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: #fff; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ============================================================
   View: Settings
   ============================================================ */
#view-settings { overflow-y: auto; }
#view-settings .settings-inner { max-width: 720px; margin: 0 auto; padding: 32px 24px; width: 100%; }
#view-settings h2 { font-size: 22px; font-weight: 700; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
#view-settings .settings-card { background: #fff; border-radius: 16px; border: 1px solid var(--border); padding: 28px; display: flex; flex-direction: column; gap: 28px; }
#view-settings .settings-section h3 { font-size: 15px; font-weight: 700; color: #334155; margin-bottom: 16px; padding-left: 12px; border-left: 3px solid var(--primary); }
#view-settings .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
#view-settings .settings-field { display: flex; flex-direction: column; gap: 6px; }
#view-settings .settings-field label { font-size: 13px; font-weight: 600; color: #64748b; }
#view-settings .settings-field input, #view-settings .settings-field textarea { padding: 10px 14px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; outline: none; background: #f8fafc; transition: border-color 0.15s; }
#view-settings .settings-field input:focus, #view-settings .settings-field textarea:focus { border-color: var(--primary); }
#view-settings .settings-field .input-row { display: flex; gap: 8px; }
#view-settings .settings-field .input-row input { flex: 1; }
#view-settings .settings-actions { display: flex; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--border); }

/* ============================================================
   View: Friends
   ============================================================ */
#view-friends .friends-inner { max-width: 1000px; margin: 0 auto; padding: 32px 24px; width: 100%; text-align: center; }
#view-friends .friends-placeholder { background: #fff; border-radius: 16px; border: 1px solid var(--border); padding: 60px 40px; color: #94a3b8; }
#view-friends .friends-placeholder i { font-size: 48px; margin-bottom: 16px; display: block; }

/* ============================================================
   Buttons
   ============================================================ */
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.btn:active { transform: scale(0.97); }
.btn-primary { background: var(--primary); color: #fff; box-shadow: 0 2px 8px rgba(59,130,246,0.3); }
.btn-primary:hover { background: var(--primary-dark); }
.btn-secondary { background: #f1f5f9; color: #475569; }
.btn-secondary:hover { background: #e2e8f0; }
.btn-success { background: #22c55e; color: #fff; }
.btn-success:hover { background: #16a34a; }
.btn-danger { background: transparent; color: #ef4444; }
.btn-danger:hover { background: #fef2f2; }
.btn-ghost { background: transparent; color: #64748b; padding: 6px 10px; }
.btn-ghost:hover { background: #f1f5f9; }
.btn-sm { padding: 6px 12px; font-size: 13px; border-radius: 8px; }

/* ============================================================
   Form controls (shared)
   ============================================================ */
.input-field { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; outline: none; background: #f8fafc; transition: border-color 0.15s; }
.input-field:focus { border-color: var(--primary); }
.form-label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 6px; }
.form-group { margin-bottom: 14px; }
.form-row { display: flex; gap: 8px; }
.form-row .input-field { flex: 1; }

/* ============================================================
   Image Manager Modal
   ============================================================ */
#image-manager-modal { position: fixed; inset: 0; z-index: 200; display: none; }
#image-manager-modal.active { display: flex; align-items: center; justify-content: center; }
#image-manager-modal .modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); }
#image-manager-modal .modal-content { position: relative; background: #fff; border-radius: 16px; width: min(880px, 95vw); max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.25); animation: modalIn 0.2s ease-out; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
#image-manager-modal .modal-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: #f8fafc; flex-shrink: 0; }
#image-manager-modal .modal-header h3 { font-size: 16px; font-weight: 700; }
#image-manager-modal .modal-header .close-btn { width: 36px; height: 36px; border-radius: 999px; border: none; background: transparent; cursor: pointer; font-size: 18px; color: #64748b; display: flex; align-items: center; justify-content: center; }
#image-manager-modal .modal-header .close-btn:hover { background: #e2e8f0; }
#image-manager-modal .modal-body { flex: 1; overflow-y: auto; }
#image-manager-modal .drop-zone { margin: 16px 20px; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 32px; text-align: center; cursor: pointer; transition: all 0.15s; }
#image-manager-modal .drop-zone:hover, #image-manager-modal .drop-zone.drag-over { border-color: var(--primary); background: #eff6ff; }
#image-manager-modal .drop-zone i { font-size: 36px; color: #94a3b8; margin-bottom: 8px; display: block; }
#image-manager-modal .drop-zone p { font-size: 14px; color: #64748b; font-weight: 500; }
#image-manager-modal .drop-zone .hint { font-size: 12px; color: #94a3b8; margin-top: 4px; }
#image-manager-modal .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; padding: 0 20px 20px; }
#image-manager-modal .image-grid .img-item { aspect-ratio: 1; border-radius: 10px; border: 1px solid var(--border); overflow: hidden; position: relative; cursor: pointer; background: #fff; transition: all 0.15s; }
#image-manager-modal .image-grid .img-item:hover { border-color: #bfdbfe; }
#image-manager-modal .image-grid .img-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
#image-manager-modal .image-grid .img-item:hover img { transform: scale(1.1); }
#image-manager-modal .image-grid .img-item .img-check { position: absolute; top: 6px; right: 6px; z-index: 2; }
#image-manager-modal .image-grid .img-item .img-check input { width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; }
#image-manager-modal .image-grid .img-item .img-label { position: absolute; bottom: 0; left: 0; right: 0; padding: 4px 6px; background: rgba(0,0,0,0.65); color: #fff; font-size: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
#image-manager-modal .modal-footer { padding: 12px 20px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 12px; flex-shrink: 0; background: #f8fafc; flex-wrap: wrap; }
#image-manager-modal .modal-footer label { font-size: 13px; color: #475569; display: flex; align-items: center; gap: 4px; cursor: pointer; }
#image-manager-modal .modal-footer input[type="number"] { width: 56px; padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px; text-align: center; font-size: 13px; }
#image-manager-modal .no-images { display: none; flex-direction: column; align-items: center; padding: 60px 20px; color: #94a3b8; }
#image-manager-modal .no-images.active { display: flex; }
#image-manager-modal .no-images i { font-size: 40px; margin-bottom: 12px; }

/* ============================================================
   Image FAB
   ============================================================ */
#image-fab { position: fixed; bottom: 28px; right: 28px; z-index: 150; width: 52px; height: 52px; border-radius: 999px; background: var(--primary); color: #fff; border: none; cursor: pointer; font-size: 22px; display: none; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(59,130,246,0.4); transition: all 0.15s; }
#image-fab:hover { background: var(--primary-dark); transform: translateY(-2px); }
#image-fab:active { transform: scale(0.95); }
#image-fab.visible { display: flex; }

/* ============================================================
   Toast
   ============================================================ */
.toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 300; padding: 12px 24px; border-radius: 12px; color: #fff; font-size: 14px; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.2); animation: toastIn 0.3s ease-out; display: flex; align-items: center; gap: 8px; }
.toast.success { background: #22c55e; }
.toast.error { background: #ef4444; }
.toast.info { background: #3b82f6; }
@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

/* ============================================================
   Auto-save indicator
   ============================================================ */
#autosave-indicator { position: fixed; bottom: 20px; left: 20px; z-index: 200; padding: 8px 16px; border-radius: 999px; background: #22c55e; color: #fff; font-size: 12px; font-weight: 600; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
#autosave-indicator.show { opacity: 1; }

/* ============================================================
   Fullscreen editor
   ============================================================ */
#view-editor.fullscreen { position: fixed; inset: 0; z-index: 200; background: #fff; }

/* ============================================================
   Responsive — Mobile (< 768px)
   ============================================================ */
@media (max-width: 768px) {
  :root { --header-h: 56px; }
  #app-screen.active { grid-template-columns: 1fr; }
  #mobile-header { display: flex; }

  /* Sidebar becomes slide-in drawer */
  #sidebar { position: fixed; top: 0; left: 0; bottom: 0; z-index: 50; transform: translateX(-100%); }
  #sidebar.open { transform: translateX(0); }

  /* Right panels become slide-in from right, below mobile header */
  .view-has-panel .view-panel,
  #view-editor .editor-panel { position: fixed; top: var(--header-h); right: 0; bottom: 0; width: min(var(--panel-w), 85vw); z-index: 30; transform: translateX(100%); transition: transform var(--transition); }
  .view-has-panel .view-panel.open,
  #view-editor .editor-panel.open { transform: translateX(0); }

  /* Hide desktop panel-toggle buttons on mobile */
  .panel-toggle-btn.desktop-only { display: none; }

  /* Gallery grid tighter */
  .gallery-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }

  /* Settings grid single column */
  #view-settings .settings-grid { grid-template-columns: 1fr; }

  /* Image grid tighter */
  #image-manager-modal .image-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }

  /* Drop zone less padding */
  #image-manager-modal .drop-zone { padding: 20px; }
}

@media (min-width: 769px) {
  /* On desktop, always show panels */
  .view-has-panel .view-panel,
  #view-editor .editor-panel { position: static !important; transform: none !important; }
}

/* ============================================================
   Timeline in panel
   ============================================================ */
.timeline-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #475569; transition: all 0.15s; }
.timeline-item:hover { background: #f1f5f9; color: var(--primary); }
.timeline-item.active { background: #eff6ff; color: var(--primary); font-weight: 600; }
.timeline-item .count { font-size: 11px; background: #e2e8f0; color: #64748b; padding: 1px 8px; border-radius: 999px; }
.timeline-item.active .count { background: #bfdbfe; color: #1d4ed8; }

/* ============================================================
   Misc
   ============================================================ */
.text-shadow { text-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
</head>
<body>

<!-- Loading Overlay -->
<div id="loading">
  <div class="spinner"></div>
  <p style="color:#fff; margin-top:12px; font-weight:500;">处理中...</p>
</div>

<!-- Login Screen -->
<div id="login-screen">
  <div style="background:#fff; border-radius:20px; padding:36px 28px; width:min(380px,90vw); box-shadow:0 20px 50px rgba(0,0,0,0.3);">
    <div style="text-align:center; margin-bottom:28px;">
      <div style="width:56px; height:56px; background:#eff6ff; border-radius:99px; display:inline-flex; align-items:center; justify-content:center; font-size:24px; color:var(--primary); margin-bottom:12px;">
        <i class="fas fa-user-shield"></i>
      </div>
      <h2 style="font-size:22px; font-weight:700; color:#1e293b;">博客管理后台</h2>
      <p style="color:#94a3b8; font-size:13px; margin-top:4px;">请登录以继续</p>
    </div>
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div>
        <label class="form-label">用户名</label>
        <input type="text" id="username-input" class="input-field" placeholder="Enter username" autocomplete="username">
      </div>
      <div>
        <label class="form-label">密码</label>
        <input type="password" id="password-input" class="input-field" placeholder="Enter password" autocomplete="current-password">
      </div>
      <button onclick="login()" class="btn btn-primary" style="width:100%; justify-content:center; padding:12px; font-size:15px; margin-top:4px;">登录系统</button>
    </div>
  </div>
</div>

<!-- Main App Screen -->
<div id="app-screen">

  <!-- Mobile Header -->
  <div id="mobile-header">
    <button class="menu-btn" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>
    <span class="title">UpXuu Admin</span>
    <button class="panel-btn" id="mobile-panel-btn" onclick="toggleCurrentPanel()"><i class="fas fa-chevron-left"></i></button>
  </div>

  <!-- Sidebar Overlay -->
  <div id="sidebar-overlay" onclick="toggleSidebar()"></div>

  <!-- Sidebar -->
  <aside id="sidebar">
    <div class="brand">
      <div class="brand-icon"><i class="fas fa-feather-alt"></i></div>
      <span>UpXuu</span>
    </div>
    <nav>
      <div class="nav-section">菜单</div>
      <a href="javascript:void(0)" onclick="navigate('/')" id="nav-new"><i class="fas fa-pen-nib"></i> 写文章</a>
      <a href="javascript:void(0)" onclick="navigate('/list')" id="nav-list"><i class="fas fa-list"></i> 文章管理</a>
      <a href="javascript:void(0)" onclick="navigate('/gallery')" id="nav-gallery"><i class="fas fa-images"></i> 图库管理</a>
      <a href="javascript:void(0)" onclick="navigate('/friends')" id="nav-friends"><i class="fas fa-handshake"></i> 友链管理</a>
      <a href="javascript:void(0)" onclick="navigate('/settings')" id="nav-settings"><i class="fas fa-cog"></i> 博客设置</a>
    </nav>
    <button class="logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i> 退出登录</button>
  </aside>

  <!-- Main Content Area -->
  <div id="main-content">

    <!-- ============================================================
         View: Editor
         ============================================================ -->
    <div id="view-editor" class="view">
      <div class="editor-toolbar">
        <button onclick="navigate('/list')" class="btn btn-ghost btn-sm" style="display:none;" id="editor-back-btn"><i class="fas fa-arrow-left"></i></button>
        <input type="text" id="post-filename" class="filename-input" placeholder="输入文件名...">
        <div class="toolbar-actions">
          <button onclick="toggleFullscreen()" id="btn-fullscreen" class="btn btn-secondary btn-sm" title="全屏编辑"><i class="fas fa-expand"></i></button>
          <button onclick="toggleMeta()" class="btn btn-ghost btn-sm panel-toggle-btn desktop-only" id="meta-toggle-desktop" title="文章设置"><i class="fas fa-cog"></i></button>
          <button onclick="savePost()" class="btn btn-primary"><i class="fas fa-paper-plane"></i> <span class="save-label">发布</span></button>
        </div>
      </div>
      <div class="editor-body">
        <div class="editor-main">
          <div id="vditor"></div>
        </div>
        <aside class="editor-panel" id="meta-panel">
          <div class="panel-header" style="display:flex; justify-content:space-between;">
            <span>文章设置</span>
            <button onclick="toggleMeta()" class="panel-toggle-btn" style="width:28px;height:28px;font-size:14px;"><i class="fas fa-times"></i></button>
          </div>
          <div class="panel-inner">
            <div class="form-group">
              <label class="form-label">文章标题</label>
              <input type="text" id="fm-title" class="input-field" placeholder="输入标题">
            </div>
            <div class="form-group">
              <label class="form-label">发布时间</label>
              <input type="datetime-local" id="fm-date" step="1" class="input-field">
            </div>
            <div class="form-group">
              <label class="form-label">分类</label>
              <input type="text" id="fm-category" class="input-field" placeholder="例如: 生活">
            </div>
            <div class="form-group">
              <label class="form-label">标签</label>
              <input type="text" id="fm-tags" class="input-field" placeholder="逗号分隔">
            </div>
            <div class="form-group">
              <label class="form-label">描述 (Description)</label>
              <textarea id="fm-description" class="input-field" rows="3" placeholder="文章简短描述，用于SEO" style="resize:none;"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">文章头图 (Cover)</label>
              <div class="form-row">
                <input type="text" id="fm-image" class="input-field" placeholder="图片URL">
                <button onclick="toggleImageManager('cover')" class="btn btn-secondary btn-sm">选择</button>
              </div>
            </div>
            <div style="border-top:1px solid var(--border); padding-top:14px; display:flex; flex-direction:column; gap:14px;">
              <label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding:6px 0;">
                <span style="font-size:14px; font-weight:500;">草稿 (Draft)</span>
                <input type="checkbox" id="fm-draft" style="width:18px; height:18px; accent-color:var(--primary);">
              </label>
              <div class="form-group">
                <label class="form-label">置顶优先级 (Sticky)</label>
                <input type="number" id="fm-sticky" class="input-field" placeholder="0=不置顶, 越大越前" value="0">
              </div>
            </div>
          </div>
        </aside>
      </div>
      <div class="panel-overlay" id="meta-panel-overlay" onclick="toggleMeta()"></div>
    </div>

    <!-- ============================================================
         View: List
         ============================================================ -->
    <div id="view-list" class="view view-has-panel">
      <div class="view-main">
        <div class="list-toolbar">
          <h2>文章列表</h2>
          <span class="badge" id="post-count">0</span>
          <span class="filter-tag" id="current-filter">
            <span id="filter-text"></span>
            <button onclick="clearFilter()"><i class="fas fa-times"></i></button>
          </span>
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="search-input" oninput="handleSearch()" placeholder="搜索标题...">
          </div>
        </div>
        <div id="list-container" class="list-container"></div>
      </div>
      <aside class="view-panel" id="timeline-panel">
        <div class="panel-header">时间轴筛选</div>
        <div class="panel-body" id="timeline-container"></div>
      </aside>
      <div class="panel-overlay" id="timeline-panel-overlay" onclick="toggleTimeline()"></div>
    </div>

    <!-- ============================================================
         View: Gallery
         ============================================================ -->
    <div id="view-gallery" class="view view-has-panel">
      <div class="view-main">
        <div class="gallery-toolbar">
          <h2>图库管理</h2>
          <span class="badge" id="gallery-count">0</span>
          <button onclick="batchInsert()" id="btn-batch-insert" class="btn btn-success btn-sm" style="display:none;">批量插入 (<span id="batch-count">0</span>)</button>
          <label for="gallery-upload-input" class="btn btn-primary btn-sm" style="cursor:pointer;"><i class="fas fa-cloud-upload-alt"></i> 上传图片</label>
          <input type="file" id="gallery-upload-input" style="display:none;" accept="image/*" multiple onchange="handleGalleryUpload(this)">
        </div>
        <div id="gallery-container" class="gallery-container"></div>
      </div>
      <aside class="view-panel" id="gallery-timeline-panel">
        <div class="panel-header">时间轴</div>
        <div class="panel-body" id="gallery-timeline-container"></div>
      </aside>
      <div class="panel-overlay" id="gallery-panel-overlay" onclick="toggleGalleryTimeline()"></div>
    </div>

    <!-- ============================================================
         View: Friends
         ============================================================ -->
    <div id="view-friends" class="view">
      <div class="friends-inner">
        <div class="friends-placeholder">
          <i class="fas fa-handshake"></i>
          <p style="font-size:18px; font-weight:600; color:#64748b;">友链管理</p>
          <p style="font-size:14px; margin-top:4px;">功能开发中...</p>
        </div>
      </div>
    </div>

    <!-- ============================================================
         View: Settings
         ============================================================ -->
    <div id="view-settings" class="view">
      <div class="settings-inner">
        <h2><i class="fas fa-sliders-h" style="color:var(--primary);"></i> 博客设置</h2>
        <div class="settings-card">
          <div class="settings-section">
            <h3>基本信息</h3>
            <div class="settings-grid">
              <div class="settings-field"><label>博客标题 (Title)</label><input type="text" id="set-title" class="input-field"></div>
              <div class="settings-field"><label>副标题 (Subtitle)</label><input type="text" id="set-subtitle" class="input-field"></div>
            </div>
          </div>
          <div class="settings-section">
            <h3>个人资料</h3>
            <div class="settings-grid">
              <div class="settings-field"><label>昵称 (Name)</label><input type="text" id="set-name" class="input-field"></div>
              <div class="settings-field"><label>个性签名 (Bio)</label><input type="text" id="set-bio" class="input-field"></div>
              <div class="settings-field" style="grid-column:1/-1;">
                <label>头像链接 (Avatar)</label>
                <div class="form-row"><input type="text" id="set-avatar" class="input-field"><button onclick="toggleImageManager('avatar')" class="btn btn-secondary btn-sm">选择</button></div>
              </div>
            </div>
          </div>
          <div class="settings-section">
            <h3>外观设置</h3>
            <div class="settings-field"><label>背景图片链接 (Background Image)</label><div class="form-row"><input type="text" id="set-bg" class="input-field"><button onclick="toggleImageManager('bg')" class="btn btn-secondary btn-sm">选择</button></div></div>
          </div>
          <div class="settings-actions">
            <button onclick="saveSettings()" class="btn btn-primary"><i class="fas fa-save"></i> 保存设置</button>
          </div>
        </div>
      </div>
    </div>

  </div><!-- /#main-content -->
</div><!-- /#app-screen -->

<!-- Image FAB -->
<button onclick="toggleImageManager()" id="image-fab"><i class="fas fa-image"></i></button>

<!-- Image Manager Modal -->
<div id="image-manager-modal">
  <div class="modal-backdrop" onclick="toggleImageManager()"></div>
  <div class="modal-content">
    <div class="modal-header">
      <h3><i class="fas fa-images" style="color:var(--primary); margin-right:8px;"></i>图片管理</h3>
      <button class="close-btn" onclick="toggleImageManager()"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">
      <div class="drop-zone" id="drop-zone" onclick="document.getElementById('img-upload-input').click()">
        <input type="file" id="img-upload-input" style="display:none;" accept="image/*" multiple onchange="handleImageSelect(this)">
        <i class="fas fa-cloud-upload-alt"></i>
        <p>点击或拖拽上传图片</p>
        <p class="hint">支持 JPG, PNG, GIF, WEBP</p>
        <div id="upload-processing" style="display:none;">上传中...</div>
      </div>
      <div class="image-grid" id="image-grid"></div>
      <div class="no-images" id="no-images"><i class="far fa-image"></i><p>暂无图片</p></div>
      <div style="text-align:center; padding:20px; display:none;" id="image-loading"><div class="spinner" style="border-color:rgba(0,0,0,0.2); border-top-color:var(--primary); width:32px; height:32px;"></div></div>
    </div>
    <div class="modal-footer">
      <label><input type="checkbox" id="compress-webp" checked> 压缩为 WebP</label>
      <label>质量: <input type="number" id="compress-quality" value="0.8" min="0.1" max="1.0" step="0.1"></label>
    </div>
  </div>
</div>

<!-- Autosave indicator -->
<div id="autosave-indicator">草稿已自动保存</div>

<!-- ============================================================
     JAVASCRIPT
     ============================================================ -->
<script>
let vditor;
const API_BASE = '/api';
let currentSha = null;
let allPosts = [];
let filteredPosts = [];
let isVditorReady = false;
let currentFilterYm = null;
let autoSaveTimer = null;
let isFullscreen = false;
let currentView = null;

// ==================== Helpers ====================
function showLoading(show) {
  document.getElementById('loading').classList.toggle('active', show);
}

function toast(msg, type) {
  type = type || 'info';
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = msg;
  document.body.appendChild(el);
  setTimeout(function(){ el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; }, 2500);
  setTimeout(function(){ el.remove(); }, 3000);
}

async function fetchAPI(endpoint, options) {
  options = options || {};
  const key = localStorage.getItem('admin_key');
  const headers = { 'Authorization': 'Bearer ' + key, ...(options.headers || {}) };
  try {
    const res = await fetch(API_BASE + endpoint, { ...options, headers: headers });
    if (res.status === 401) {
      alert('登录已过期，请重新登录');
      logout();
      return null;
    }
    return res;
  } catch (err) {
    alert('网络错误: ' + err.message);
    return null;
  }
}

// ==================== Auth ====================
(function() {
  const storedKey = localStorage.getItem('admin_key');
  if (!storedKey) {
    document.getElementById('login-screen').classList.add('active');
  } else {
    document.getElementById('app-screen').classList.add('active');
    handleRoute();
  }
})();

async function login() {
  const user = document.getElementById('username-input').value;
  const pass = document.getElementById('password-input').value;
  if (user !== 'lijiaxu' || !pass) { alert('用户名或密码错误'); return; }
  try {
    const testResponse = await fetch('/api/posts', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + pass }
    });
    if (testResponse.status === 200) {
      localStorage.setItem('admin_key', pass);
      document.getElementById('login-screen').classList.remove('active');
      document.getElementById('app-screen').classList.add('active');
      handleRoute();
      loadPosts();
    } else {
      alert('密码错误，请检查后重试');
    }
  } catch (error) {
    alert('登录失败，请检查网络连接');
  }
}

function logout() {
  if (!confirm('确定要退出登录吗？')) return;
  localStorage.removeItem('admin_key');
  location.href = '/';
}

// ==================== Navigation ====================
window.addEventListener('popstate', handleRoute);

function navigate(path) {
  closeSidebar();
  if (window.location.pathname === path) {
    if (path === '/' || path === '/new' || path === '/create') {
      newPost();
    }
    return;
  }
  history.pushState(null, '', path);
  handleRoute();
}

function handleRoute() {
  const path = window.location.pathname;
  if (currentView === path) return;
  currentView = path;

  // Reset active nav
  document.querySelectorAll('#sidebar nav a').forEach(function(el) {
    el.classList.remove('active');
  });

  // Hide all views
  document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });

  // Hide FAB by default
  document.getElementById('image-fab').classList.remove('visible');

  // Hide panel toggles
  document.getElementById('mobile-panel-btn').classList.add('hidden');
  document.getElementById('editor-back-btn').style.display = 'none';

  // Close all panels on mobile
  document.querySelectorAll('.view-panel').forEach(function(p) { p.classList.remove('open'); });
  document.querySelectorAll('.panel-overlay').forEach(function(o) { o.classList.remove('active'); });

  if (path === '/' || path === '/new' || path === '/create') {
    document.getElementById('nav-new').classList.add('active');
    document.getElementById('view-editor').classList.add('active');
    document.getElementById('image-fab').classList.add('visible');
    if (!document.getElementById('post-filename').value) newPost();
    document.getElementById('editor-back-btn').style.display = 'flex';
    initVditor();
  } else if (path === '/list') {
    document.getElementById('nav-list').classList.add('active');
    document.getElementById('view-list').classList.add('active');
    document.getElementById('mobile-panel-btn').classList.remove('hidden');
    loadPosts();
  } else if (path === '/gallery') {
    document.getElementById('nav-gallery').classList.add('active');
    document.getElementById('view-gallery').classList.add('active');
    document.getElementById('mobile-panel-btn').classList.remove('hidden');
    loadGallery();
  } else if (path === '/friends') {
    document.getElementById('nav-friends').classList.add('active');
    document.getElementById('view-friends').classList.add('active');
  } else if (path === '/settings') {
    document.getElementById('nav-settings').classList.add('active');
    document.getElementById('view-settings').classList.add('active');
    loadSettings();
  } else if (path.startsWith('/edit/')) {
    document.getElementById('nav-list').classList.add('active');
    document.getElementById('view-editor').classList.add('active');
    document.getElementById('image-fab').classList.add('visible');
    document.getElementById('editor-back-btn').style.display = 'flex';
    var filename = decodeURIComponent(path.replace('/edit/', ''));
    if (filename) editPost(filename);
    initVditor();
  }
}

// ==================== Sidebar ====================
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('active');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('active');
}

// ==================== Panels (mobile drawer toggle) ====================
function toggleCurrentPanel() {
  var path = document.getElementById('view-list').classList.contains('active') ? 'list' :
             document.getElementById('view-gallery').classList.contains('active') ? 'gallery' : null;
  if (path === 'list') toggleTimeline();
  else if (path === 'gallery') toggleGalleryTimeline();
}

function togglePanelGeneric(panelId, overlayId) {
  var panel = document.getElementById(panelId);
  var overlay = document.getElementById(overlayId);
  panel.classList.toggle('open');
  overlay.classList.toggle('active');
}

function toggleTimeline() { togglePanelGeneric('timeline-panel', 'timeline-panel-overlay'); }
function toggleGalleryTimeline() { togglePanelGeneric('gallery-timeline-panel', 'gallery-panel-overlay'); }
function toggleMeta() { togglePanelGeneric('meta-panel', 'meta-panel-overlay'); }

// ==================== Fullscreen ====================
function toggleFullscreen() {
  var editor = document.getElementById('view-editor');
  var btn = document.getElementById('btn-fullscreen');
  isFullscreen = !isFullscreen;
  editor.classList.toggle('fullscreen', isFullscreen);
  btn.innerHTML = isFullscreen ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
  btn.title = isFullscreen ? '退出全屏' : '全屏编辑';
}

// ==================== Auto-save ====================
function startAutoSave() {
  if (autoSaveTimer) clearInterval(autoSaveTimer);
  autoSaveTimer = setInterval(function() {
    var filename = document.getElementById('post-filename').value.trim();
    if (!filename || !isVditorReady) return;
    var content = buildFrontmatter() + vditor.getValue();
    localStorage.setItem('draft_' + filename, JSON.stringify({
      filename: filename, content: content, savedAt: new Date().toISOString()
    }));
    showAutoSaveIndicator();
  }, 30000);
}

function showAutoSaveIndicator() {
  var el = document.getElementById('autosave-indicator');
  el.classList.add('show');
  setTimeout(function() { el.classList.remove('show'); }, 2000);
}

function loadDraft(filename) {
  var draft = localStorage.getItem('draft_' + filename);
  if (draft) {
    var data = JSON.parse(draft);
    var timeStr = new Date(data.savedAt).toLocaleString('zh-CN');
    if (confirm('发现未保存草稿 (保存于 ' + timeStr + ')，恢复吗？')) {
      parseFrontmatter(data.content);
      return true;
    }
  }
  return false;
}

function clearDraft(filename) {
  localStorage.removeItem('draft_' + filename);
}

// ==================== Posts (List View) ====================
async function loadPosts() {
  showLoading(true);
  var res = await fetchAPI('/posts');
  showLoading(false);
  if (!res) return;
  var data = await res.json();
  allPosts = data.filter(function(item) { return item.name.endsWith('.md'); });
  allPosts.forEach(function(post) {
    var match = post.name.match(/^(\\d{4}-\\d{2}-\\d{2})/);
    post.dateStr = match ? match[1] : 'Unknown Date';
    post.sortDate = post.date || (post.dateStr !== 'Unknown Date' ? post.dateStr : '0000-00-00');
  });
  allPosts.sort(function(a, b) { return b.sortDate.localeCompare(a.sortDate); });
  filteredPosts = allPosts.slice();
  renderList();
  renderTimeline();
}

function renderList() {
  var container = document.getElementById('list-container');
  document.getElementById('post-count').textContent = filteredPosts.length;
  container.innerHTML = '';
  filteredPosts.forEach(function(item) {
    var displayDate = item.date || item.dateStr || '未识别日期';
    var displayTitle = item.title || item.name;
    var div = document.createElement('div');
    div.className = 'post-card';
    div.onclick = function(e) {
      if (e.target.closest('button')) return;
      navigate('/edit/' + encodeURIComponent(item.name));
    };
    div.innerHTML =
      '<div class="card-icon"><i class="far fa-file-alt"></i></div>' +
      '<div class="card-body">' +
        '<div class="card-title">' + escapeHTML(displayTitle) + '</div>' +
        '<div class="card-meta">' +
          '<span><i class="far fa-calendar" style="margin-right:4px;"></i>' + escapeHTML(displayDate) + '</span>' +
          '<span style="background:#f1f5f9;padding:1px 8px;border-radius:4px;font-size:11px;">' + escapeHTML(item.name) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="card-actions">' +
        '<button class="edit" onclick="event.stopPropagation();navigate(' + quot('/edit/') + '+encodeURIComponent(' + quot(item.name) + '))" title="编辑"><i class="fas fa-edit"></i></button>' +
        '<button class="delete" onclick="event.stopPropagation();deletePost(' + quot(item.name) + ',' + quot(item.sha) + ')" title="删除"><i class="fas fa-trash-alt"></i></button>' +
      '</div>';
    container.appendChild(div);
  });
}

function renderTimeline() {
  var container = document.getElementById('timeline-container');
  container.innerHTML = '';
  var groups = {};
  allPosts.forEach(function(post) {
    var d = post.date || post.dateStr || '其他';
    if (d === 'Unknown Date') d = '其他';
    var ym = d.substring(0, 7);
    groups[ym] = (groups[ym] || 0) + 1;
  });
  // All
  var allDiv = document.createElement('div');
  allDiv.className = 'timeline-item' + (currentFilterYm === null ? ' active' : '');
  allDiv.onclick = function() { filterByDate(null); };
  allDiv.innerHTML = '<span>全部文章</span><span class="count">' + allPosts.length + '</span>';
  container.appendChild(allDiv);
  // By month
  Object.keys(groups).sort().reverse().forEach(function(ym) {
    var div = document.createElement('div');
    div.className = 'timeline-item' + (currentFilterYm === ym ? ' active' : '');
    div.onclick = function() { filterByDate(ym); };
    div.innerHTML = '<span>' + ym + '</span><span class="count">' + groups[ym] + '</span>';
    container.appendChild(div);
  });
}

function filterByDate(ym) {
  currentFilterYm = ym;
  var filterEl = document.getElementById('current-filter');
  var filterText = document.getElementById('filter-text');
  if (ym) {
    filteredPosts = allPosts.filter(function(p) {
      var d = p.date || p.dateStr || '其他';
      return d.startsWith(ym);
    });
    filterEl.classList.add('active');
    filterText.textContent = ym;
  } else {
    filteredPosts = allPosts.slice();
    filterEl.classList.remove('active');
  }
  handleSearch();
  renderTimeline();
  if (window.innerWidth < 768) closeTimelinePanel();
}

function clearFilter() { filterByDate(null); }

function handleSearch() {
  var term = document.getElementById('search-input').value.toLowerCase();
  var base = currentFilterYm
    ? allPosts.filter(function(p) { return (p.date || p.dateStr || '其他').startsWith(currentFilterYm); })
    : allPosts.slice();
  if (term) {
    filteredPosts = base.filter(function(p) {
      return (p.title && p.title.toLowerCase().includes(term)) || p.name.toLowerCase().includes(term);
    });
  } else {
    filteredPosts = base;
  }
  renderList();
}

function closeTimelinePanel() {
  document.getElementById('timeline-panel').classList.remove('open');
  document.getElementById('timeline-panel-overlay').classList.remove('active');
}

// ==================== Editor ====================
function newPost() {
  if (autoSaveTimer) { clearInterval(autoSaveTimer); autoSaveTimer = null; }
  currentSha = null;
  document.getElementById('post-filename').value = '';
  document.getElementById('post-filename').disabled = false;
  var now = new Date();
  var localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  document.getElementById('fm-title').value = '';
  document.getElementById('fm-date').value = localIso;
  document.getElementById('fm-category').value = '';
  document.getElementById('fm-tags').value = '';
  document.getElementById('fm-image').value = '';
  document.getElementById('fm-description').value = '';
  document.getElementById('fm-draft').checked = false;
  document.getElementById('fm-sticky').value = 0;
  if (isVditorReady) vditor.setValue('');
}

async function editPost(name) {
  document.getElementById('post-filename').value = name;
  document.getElementById('post-filename').disabled = true;
  if (loadDraft(name)) { startAutoSave(); return; }
  showLoading(true);
  var res = await fetchAPI('/post/' + encodeURIComponent(name));
  showLoading(false);
  if (!res) return;
  if (!res.ok) { alert('无法获取文章内容'); return; }
  var data = await res.json();
  currentSha = data.sha;
  parseFrontmatter(data.content);
  startAutoSave();
}

async function savePost() {
  var filename = document.getElementById('post-filename').value.trim();
  if (!filename) return alert('请输入文件名');
  var finalFilename = filename.endsWith('.md') ? filename : filename + '.md';
  if (!isVditorReady) { alert('编辑器尚未加载完成'); return; }
  var content = buildFrontmatter() + vditor.getValue();
  showLoading(true);
  var res = await fetchAPI('/post/' + encodeURIComponent(finalFilename), {
    method: 'PUT',
    body: JSON.stringify({ content: content, sha: currentSha })
  });
  showLoading(false);
  if (res && res.ok) {
    var data = await res.json();
    var msg = '保存成功！';
    if (data.indexNow && data.indexNow.status === 'pending') msg += '\\nIndexNow 提交已触发';
    alert(msg);
    if (data.content && data.content.sha) currentSha = data.content.sha;
    clearDraft(finalFilename);
  } else {
    var err = res ? await res.text() : 'Unknown error';
    alert('保存失败: ' + err);
  }
}

async function deletePost(name, sha) {
  if (!confirm('确定要删除 "' + name + '" 吗？此操作不可恢复！')) return;
  showLoading(true);
  var res = await fetchAPI('/post/' + encodeURIComponent(name), {
    method: 'DELETE',
    body: JSON.stringify({ sha: sha })
  });
  showLoading(false);
  if (res && res.ok) {
    loadPosts();
  } else {
    alert('删除失败');
  }
}

// ==================== Vditor ====================
function initVditor() {
  if (vditor) return;
  vditor = new Vditor('vditor', {
    height: '100%',
    mode: 'ir',
    placeholder: '开始撰写您的精彩文章...',
    toolbarConfig: { pin: true },
    cache: { enable: false },
    resize: { enable: false },
    outline: { enable: false },
    toolbar: [
      'emoji', 'headings', 'bold', 'italic', 'strike', 'link', '|',
      'list', 'ordered-list', 'check', 'outdent', 'indent', '|',
      'quote', 'line', 'code', 'inline-code', 'insert-before', 'insert-after', '|',
      'upload', 'table', 'undo', 'redo', 'fullscreen', 'edit-mode'
    ],
    upload: { accept: 'image/*', handler: uploadImage },
    after: function() {
      isVditorReady = true;
      document.getElementById('vditor').addEventListener('paste', handlePaste);
    }
  });
}

async function handlePaste(e) {
  var items = e.clipboardData && e.clipboardData.items;
  if (!items) return;
  for (var i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) {
      e.preventDefault();
      var file = items[i].getAsFile();
      if (!file) continue;
      showLoading(true);
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async function() {
        var base64 = reader.result.split(',')[1];
        var filename = generateImagePath(file.name);
        var res = await fetchAPI('/upload', { method: 'POST', body: JSON.stringify({ filename: filename, content: base64 }) });
        showLoading(false);
        if (res && res.ok) {
          var data = await res.json();
          vditor.insertValue('![' + filename + '](' + data.url + ')');
        } else { alert('图片上传失败'); }
      };
      reader.onerror = function() { showLoading(false); alert('图片读取失败'); };
      break;
    }
  }
}

async function uploadImage(files) {
  var file = files[0];
  if (!file) return;
  showLoading(true);
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async function() {
    var base64 = reader.result.split(',')[1];
    var filename = generateImagePath(file.name);
    var res = await fetchAPI('/upload', { method: 'POST', body: JSON.stringify({ filename: filename, content: base64 }) });
    showLoading(false);
    if (res && res.ok) {
      var data = await res.json();
      vditor.insertValue('![' + file.name + '](' + data.url + ')');
    } else { alert('图片上传失败'); }
  };
}

function generateImagePath(originalName) {
  var now = new Date();
  function pad(n) { return n.toString().padStart(2, '0'); }
  var ts = '' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) +
           pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
  var rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  var ext = originalName.split('.').pop() || 'png';
  return now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() + '/' + ts + '_' + rand + '.' + ext;
}

// ==================== Frontmatter ====================
function parseFrontmatter(text) {
  var fmRegex = /^---\\n([\\s\\S]*?)\\n---\\n/;
  var match = text.match(fmRegex);
  var body = text;
  if (match) {
    var fmText = match[1];
    body = text.replace(fmRegex, '');
    var getField = function(key) {
      var lines = fmText.split('\\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var idx = line.indexOf(':');
        if (idx > 0 && line.substring(0, idx).trim() === key) {
          return line.substring(idx + 1).trim();
        }
      }
      return '';
    };
    document.getElementById('fm-title').value = getField('title').replace(/^['"]|['"]$/g, '');
    var d = getField('published').replace(' ', 'T');
    if (d && d.length === 10) d += 'T00:00:00';
    document.getElementById('fm-date').value = d;
    var tagsVal = getField('tags').trim().replace(/#.*$/, '').trim();
    if (tagsVal.startsWith('[') && tagsVal.endsWith(']')) tagsVal = tagsVal.substring(1, tagsVal.length - 1);
    var tagsList = tagsVal.split(/[,，]/).map(function(t) { return t.trim().replace(/^['"]+|['"]+$/g, ''); }).filter(function(t) { return t; });
    document.getElementById('fm-tags').value = tagsList.join(', ');
    var catVal = getField('category').trim().replace(/#.*$/, '').trim();
    if (catVal.startsWith('[') && catVal.endsWith(']')) catVal = catVal.substring(1, catVal.length - 1);
    document.getElementById('fm-category').value = catVal.replace(/^['"]+|['"]+$/g, '');
    document.getElementById('fm-image').value = getField('image').replace(/^['"]|['"]$/g, '');
    document.getElementById('fm-description').value = getField('description').replace(/^['"]|['"]$/g, '');
    document.getElementById('fm-draft').checked = getField('draft') === 'true';
    var stickyRaw = getField('sticky');
    document.getElementById('fm-sticky').value = stickyRaw === 'true' ? 999 : (parseInt(stickyRaw) || 0);
  }
  function setVal() {
    if (isVditorReady) vditor.setValue(body);
    else setTimeout(setVal, 100);
  }
  setVal();
}

function buildFrontmatter() {
  var title = document.getElementById('fm-title').value;
  var date = document.getElementById('fm-date').value;
  if (date) {
    date = date.replace('T', ' ');
    if (date.split(':').length === 2) date += ':00';
  }
  var tags = document.getElementById('fm-tags').value;
  var category = document.getElementById('fm-category').value;
  var image = document.getElementById('fm-image').value;
  var description = document.getElementById('fm-description').value;
  var draft = document.getElementById('fm-draft').checked;
  var sticky = parseInt(document.getElementById('fm-sticky').value) || 0;
  var fm = '---\\n';
  if (title) fm += 'title: "' + title + '"\\n';
  if (date) fm += 'published: ' + date + '\\n';
  if (image) fm += 'image: "' + image + '"\\n';
  if (description) fm += 'description: "' + description + '"\\n';
  if (tags) {
    var cleanTags = tags.trim();
    if (cleanTags.startsWith('[') && cleanTags.endsWith(']')) cleanTags = cleanTags.substring(1, cleanTags.length - 1);
    var tagList = cleanTags.split(/[,，]/).map(function(t) { return t.trim().replace(/^['"]+|['"]+$/g, ''); }).filter(function(t) { return t; });
    if (tagList.length > 0) fm += 'tags: [' + tagList.map(function(t) { return '"' + t + '"'; }).join(', ') + ']\\n';
  }
  if (category) fm += 'category: "' + category + '"\\n';
  if (draft) fm += 'draft: true\\n';
  if (sticky > 0) fm += 'sticky: ' + sticky + '\\n';
  fm += '---\\n\\n';
  return fm;
}

// ==================== Image Manager ====================
var imagesLoaded = false;
var currentImageMode = 'editor';
var selectedImages = new Set();

function toggleImageManager(mode) {
  if (mode) currentImageMode = mode;
  var modal = document.getElementById('image-manager-modal');
  var isActive = modal.classList.contains('active');
  if (isActive) {
    modal.classList.remove('active');
    if (!mode) currentImageMode = 'editor';
  } else {
    modal.classList.add('active');
    if (!imagesLoaded) loadImages();
    var savedCompress = localStorage.getItem('compress_webp');
    if (savedCompress !== null) document.getElementById('compress-webp').checked = savedCompress === 'true';
    var savedQuality = localStorage.getItem('compress_quality');
    if (savedQuality !== null) document.getElementById('compress-quality').value = savedQuality;
  }
}

function handleImageClick(url, name) {
  if (currentImageMode === 'editor') {
    insertImageToEditor(url, name);
  } else if (currentImageMode === 'cover') {
    document.getElementById('fm-image').value = url;
    toggleImageManager();
  } else if (currentImageMode === 'avatar') {
    document.getElementById('set-avatar').value = url;
    toggleImageManager();
  } else if (currentImageMode === 'bg') {
    document.getElementById('set-bg').value = url;
    toggleImageManager();
  }
}

async function loadImages() {
  var grid = document.getElementById('image-grid');
  var loading = document.getElementById('image-loading');
  var noImages = document.getElementById('no-images');
  loading.style.display = 'block';
  noImages.classList.remove('active');
  grid.innerHTML = '';
  var res = await fetchAPI('/images');
  loading.style.display = 'none';
  if (!res) return;
  var images = await res.json();
  if (images.length === 0) { noImages.classList.add('active'); return; }
  images.sort(function(a, b) { return b.name.localeCompare(a.name); });
  var workerUrl = window.location.origin;
  images.forEach(function(img) {
    var imageUrl = workerUrl + '/img/' + img.path;
    var thumbUrl = 'https://wsrv.nl/?url=' + encodeURIComponent(imageUrl) + '&w=300&h=300&fit=cover&a=top';
    var div = document.createElement('div');
    div.className = 'img-item';
    div.onclick = function(e) {
      if (e.target.closest('input')) return;
      handleImageClick(imageUrl, img.name);
    };
    var isSelected = selectedImages.has(JSON.stringify({name: img.name, url: imageUrl}));
    div.innerHTML =
      '<img src="' + thumbUrl + '" loading="lazy" onerror="this.src=' + quot('https://via.placeholder.com/150?text=Error') + '">' +
      '<div class="img-check"><input type="checkbox" ' + (isSelected ? 'checked' : '') + ' onclick="event.stopPropagation();toggleImageSelection(' + quot(img.name) + ',' + quot(imageUrl) + ',this)"></div>' +
      '<div class="img-label">' + escapeHTML(img.name) + '</div>';
    grid.appendChild(div);
  });
  imagesLoaded = true;
  updateBatchUI();
}

function toggleImageSelection(name, url, cb) {
  var item = JSON.stringify({name: name, url: url});
  if (cb.checked) selectedImages.add(item); else selectedImages.delete(item);
  updateBatchUI();
}

function updateBatchUI() {
  var btn = document.getElementById('btn-batch-insert');
  var count = document.getElementById('batch-count');
  if (selectedImages.size > 0 && currentImageMode === 'editor') {
    btn.style.display = 'inline-flex';
    count.textContent = selectedImages.size;
  } else {
    btn.style.display = 'none';
  }
}

function batchInsert() {
  if (!isVditorReady) return;
  var md = '';
  selectedImages.forEach(function(json) {
    var item = JSON.parse(json);
    md += '![' + item.name + '](' + item.url + ')\\n';
  });
  vditor.insertValue(md);
  selectedImages.clear();
  updateBatchUI();
  document.querySelectorAll('#image-grid input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
  toggleImageManager();
}

function insertImageToEditor(url, name) {
  if (!isVditorReady) return;
  var altText = prompt('请输入图片描述 (Alt Text)', name) || name;
  vditor.insertValue('![' + altText + '](' + url + ')');
  toggleImageManager();
}

function handleImageSelect(input) {
  if (input.files && input.files.length > 0) uploadImages(input.files);
  input.value = '';
}

async function uploadImages(files) {
  var processing = document.getElementById('upload-processing');
  var compressEl = document.getElementById('compress-webp');
  var compress = compressEl.checked;
  var quality = parseFloat(document.getElementById('compress-quality').value) || 0.8;
  localStorage.setItem('compress_webp', compress);
  localStorage.setItem('compress_quality', quality);
  processing.style.display = 'block';
  processing.textContent = '正在上传...';
  var fileArray = Array.from(files);
  var successCount = 0, failCount = 0;
  for (var i = 0; i < fileArray.length; i++) {
    var file = fileArray[i];
    processing.textContent = '正在上传 (' + (i + 1) + '/' + fileArray.length + '): ' + file.name;
    try {
      var fileToUpload = file;
      var filename = file.name;
      if (compress && file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
        processing.textContent = '正在压缩 (' + (i + 1) + '/' + fileArray.length + '): ' + file.name;
        var webpBlob = await compressImageToWebP(file, quality);
        fileToUpload = webpBlob;
        filename = filename.replace(/\\.\\w+$/, '.webp');
      }
      await uploadSingleFile(fileToUpload, filename);
      successCount++;
    } catch (err) {
      console.error(err);
      failCount++;
    }
  }
  processing.style.display = 'none';
  if (successCount > 0) {
    loadImages();
    toast('<i class="fas fa-check-circle"></i> 成功上传 ' + successCount + ' 张' + (failCount > 0 ? '，失败 ' + failCount + ' 张' : ''), 'success');
  } else {
    alert('上传失败');
  }
}

function compressImageToWebP(file, quality) {
  return new Promise(function(resolve, reject) {
    var img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(function(blob) { resolve(blob); }, 'image/webp', quality);
    };
    img.onerror = reject;
  });
}

function uploadSingleFile(file, originalName) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function() {
      var base64 = reader.result.split(',')[1];
      var filename = generateImagePath(originalName);
      var res = await fetchAPI('/upload', { method: 'POST', body: JSON.stringify({ filename: filename, content: base64 }) });
      if (res && res.ok) resolve(await res.json());
      else reject(new Error('Upload failed'));
    };
    reader.onerror = reject;
  });
}

// Drag & drop
(function() {
  var dropZone = document.getElementById('drop-zone');
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(ev) {
    dropZone.addEventListener(ev, function(e) { e.preventDefault(); e.stopPropagation(); });
  });
  ['dragenter', 'dragover'].forEach(function(ev) {
    dropZone.addEventListener(ev, function() { dropZone.classList.add('drag-over'); });
  });
  ['dragleave', 'drop'].forEach(function(ev) {
    dropZone.addEventListener(ev, function() { dropZone.classList.remove('drag-over'); });
  });
  dropZone.addEventListener('drop', function(e) {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) uploadImages(e.dataTransfer.files);
  });
})();

// ==================== Gallery Page ====================
var galleryImages = [];

async function loadGallery() {
  var container = document.getElementById('gallery-container');
  var countEl = document.getElementById('gallery-count');
  container.innerHTML = '<div style="display:flex;justify-content:center;padding:40px;"><div class="spinner" style="border-color:rgba(0,0,0,0.2);border-top-color:var(--primary);width:32px;height:32px;"></div></div>';
  var res = await fetchAPI('/images');
  if (!res) return;
  var images = await res.json();
  galleryImages = images;
  countEl.textContent = images.length;
  images.forEach(function(img) {
    var match = img.name.match(/(20\\d{2})(\\d{2})(\\d{2})/);
    if (match) {
      img.dateObj = new Date(match[1] + '-' + match[2] + '-' + match[3]);
      img.ym = match[1] + '-' + match[2];
    } else {
      img.dateObj = new Date(0);
      img.ym = 'Unknown';
    }
  });
  images.sort(function(a, b) { return b.name.localeCompare(a.name); });
  renderGalleryContent();
  renderGalleryTimeline();
}

function renderGalleryContent() {
  var container = document.getElementById('gallery-container');
  container.innerHTML = '';
  if (galleryImages.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:60px;color:#94a3b8;">暂无图片</div>';
    return;
  }
  var groups = {};
  galleryImages.forEach(function(img) {
    if (!groups[img.ym]) groups[img.ym] = [];
    groups[img.ym].push(img);
  });
  var workerUrl = window.location.origin;
  Object.keys(groups).sort().reverse().forEach(function(ym) {
    var groupDiv = document.createElement('div');
    groupDiv.className = 'gallery-group';
    groupDiv.id = 'gallery-group-' + ym;
    var cards = groups[ym].map(function(img) {
      var imageUrl = workerUrl + '/img/' + img.path;
      var thumbUrl = 'https://wsrv.nl/?url=' + encodeURIComponent(imageUrl) + '&w=400&h=400&fit=cover&a=top';
      return '<div class="gallery-item">' +
        '<img src="' + thumbUrl + '" loading="lazy">' +
        '<div class="item-overlay">' +
          '<button class="link" onclick="event.stopPropagation();copyToClipboard(' + quot(imageUrl) + ')" title="复制链接"><i class="fas fa-link"></i></button>' +
          '<button class="md" onclick="event.stopPropagation();copyToClipboard(' + quot('![img](' + imageUrl + ')') + ')" title="复制Markdown"><i class="fab fa-markdown"></i></button>' +
          '<button class="del" onclick="event.stopPropagation();deleteImage(' + quot(img.name) + ',' + quot(img.sha) + ')" title="删除"><i class="fas fa-trash-alt"></i></button>' +
        '</div>' +
        '<div class="item-name">' + escapeHTML(img.name) + '</div>' +
      '</div>';
    }).join('');
    groupDiv.innerHTML =
      '<h3><i class="far fa-calendar-check" style="color:var(--primary)"></i>' + ym + '<span class="ym-badge">' + groups[ym].length + '</span></h3>' +
      '<div class="gallery-grid">' + cards + '</div>';
    container.appendChild(groupDiv);
  });
}

function renderGalleryTimeline() {
  var container = document.getElementById('gallery-timeline-container');
  container.innerHTML = '';
  var yms = [];
  var seen = {};
  galleryImages.forEach(function(i) { if (!seen[i.ym]) { seen[i.ym] = true; yms.push(i.ym); } });
  yms.sort().reverse();
  yms.forEach(function(ym) {
    var div = document.createElement('div');
    div.className = 'timeline-item';
    div.onclick = function() {
      var el = document.getElementById('gallery-group-' + ym);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.innerWidth < 768) {
        document.getElementById('gallery-timeline-panel').classList.remove('open');
        document.getElementById('gallery-panel-overlay').classList.remove('active');
      }
    };
    div.innerHTML = '<span>' + ym + '</span>';
    container.appendChild(div);
  });
}

async function deleteImage(name, sha) {
  if (!confirm('确定要删除图片 "' + name + '" 吗？此操作不可恢复！')) return;
  showLoading(true);
  var res = await fetchAPI('/img/' + encodeURIComponent(name), { method: 'DELETE', body: JSON.stringify({ sha: sha }) });
  showLoading(false);
  if (res && res.ok) {
    if (document.getElementById('view-gallery').classList.contains('active')) loadGallery();
    if (imagesLoaded) { imagesLoaded = false; }
  } else {
    alert('删除失败');
  }
}

function handleGalleryUpload(input) {
  if (input.files && input.files.length > 0) {
    toggleImageManager();
    uploadImages(input.files);
  }
  input.value = '';
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      toast('已复制到剪贴板', 'success');
    }).catch(function() {
      prompt('复制失败，请手动复制', text);
    });
  } else {
    prompt('请手动复制', text);
  }
}

// ==================== Settings ====================
var configSha = null, layoutSha = null;
var configContent = '', layoutContent = '';

async function loadSettings() {
  showLoading(true);
  var res = await fetchAPI('/settings');
  showLoading(false);
  if (!res || !res.ok) { alert('无法加载设置'); return; }
  var data = await res.json();
  configSha = data.config.sha;
  configContent = data.config.content;
  layoutSha = data.layout.sha;
  layoutContent = data.layout.content;
  function getVal(regex) {
    var m = configContent.match(regex);
    return m ? m[1] : '';
  }
  document.getElementById('set-title').value = getVal(/title:\\s*['"](.*?)['"]/);
  document.getElementById('set-subtitle').value = getVal(/subtitle:\\s*['"](.*?)['"]/);
  document.getElementById('set-name').value = getVal(/name:\\s*['"](.*?)['"]/);
  document.getElementById('set-bio').value = getVal(/bio:\\s*['"](.*?)['"]/);
  document.getElementById('set-avatar').value = getVal(/avatar:\\s*['"](.*?)['"]/);
  var bgMatch = layoutContent.match(/background-image:\\s*url\\(['"]?(.*?)['"]?\\)/);
  if (bgMatch) document.getElementById('set-bg').value = bgMatch[1];
}

async function saveSettings() {
  showLoading(true);
  var newConfig = configContent;
  function replaceVal(regex, val) {
    if (newConfig.match(regex)) {
      newConfig = newConfig.replace(regex, function(m, p1, p2, p3) { return p1 + val + p3; });
    }
  }
  replaceVal(/(title:\\s*['"])(.*?)(['"])/, document.getElementById('set-title').value);
  replaceVal(/(subtitle:\\s*['"])(.*?)(['"])/, document.getElementById('set-subtitle').value);
  replaceVal(/(name:\\s*['"])(.*?)(['"])/, document.getElementById('set-name').value);
  replaceVal(/(bio:\\s*['"])(.*?)(['"])/, document.getElementById('set-bio').value);
  replaceVal(/(avatar:\\s*['"])(.*?)(['"])/, document.getElementById('set-avatar').value);
  var newLayout = layoutContent;
  var bgUrl = document.getElementById('set-bg').value;
  newLayout = newLayout.replace(/(background-image:\\s*url\\(['"]?)(.*?)(['"]?\\))/, '$1' + bgUrl + '$3');
  var res1 = await fetchAPI('/settings', { method: 'PUT', body: JSON.stringify({ file: 'config', content: newConfig, sha: configSha }) });
  if (!res1.ok) { showLoading(false); alert('保存配置失败'); return; }
  var res2 = await fetchAPI('/settings', { method: 'PUT', body: JSON.stringify({ file: 'layout', content: newLayout, sha: layoutSha }) });
  showLoading(false);
  if (res2.ok) {
    alert('设置保存成功！需等待构建生效。');
    loadSettings();
  } else {
    alert('保存背景失败');
  }
}

// ==================== Friends (stub) ====================
function loadFriends() {
  // Placeholder: friends management not yet implemented
}

// ==================== Utility ====================
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function quot(s) { return '"' + String(s).replace(/\\\\/g, '\\\\\\\\').replace(/"/g, '\\\\"').replace(/\\n/g, '\\\\n') + '"'; }
</script>
</body>
</html>`;
