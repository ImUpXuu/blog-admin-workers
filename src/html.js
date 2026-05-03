
export const ADMIN_HTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>UpXuu Blog Admin</title>
    <link rel="stylesheet" href="https://unpkg.com/vditor/dist/index.css" />
    <script src="https://unpkg.com/vditor/dist/index.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .vditor-reset { font-family: sans-serif; }
        #loading { display: none; }
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border-left-color: #fff;
            animation: spin 0.8s ease-in-out infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        /* Mobile transitions */
        .sidebar-transition { transition: transform 0.3s ease-in-out; }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Mobile toolbar - single row horizontal scroll */
        @media (max-width: 768px) {
            #vditor .vditor-toolbar,
            div.vditor-toolbar,
            .vditor-toolbar {
                position: fixed !important;
                bottom: 0 !important;
                top: auto !important;
                left: 0 !important;
                right: 0 !important;
                width: 100vw !important;
                max-width: 100vw !important;
                border-top: 1px solid #e2e8f0 !important;
                border-bottom: none !important;
                box-shadow: 0 -2px 8px rgba(0,0,0,0.1) !important;
                z-index: 9999 !important;
                background: #ffffff !important;
                padding: 6px 0 !important;
                margin: 0 !important;
                
                /* Single row with horizontal scroll */
                display: flex !important;
                flex-wrap: nowrap !important;
                overflow-x: auto !important;
                overflow-y: hidden !important;
                white-space: nowrap !important;
                -webkit-overflow-scrolling: touch !important;
                max-height: none !important;
            }
            
            /* Hide scrollbar but keep functionality */
            #vditor .vditor-toolbar::-webkit-scrollbar {
                display: none !important;
            }
            
            /* Ensure editor content area doesn't overlap with toolbar */
            #vditor {
                margin-bottom: 55px !important;
                height: calc(100% - 55px) !important;
                padding-bottom: 5px !important;
            }
            
            /* Editor container should also account for bottom toolbar */
            #view-editor .flex.flex-col.bg-white {
                margin-bottom: 0 !important;
            }
            
            /* Toolbar items - compact size */
            .vditor-toolbar__item {
                padding: 4px 6px !important;
                margin: 0 2px !important;
                flex-shrink: 0 !important;
                display: inline-flex !important;
            }
            
            /* Icon sizing */
            .vditor-toolbar__item svg,
            .vditor-toolbar__icon {
                width: 18px !important;
                height: 18px !important;
            }
            
            /* Hide toolbar divider on mobile */
            .vditor-toolbar__divider {
                display: none !important;
            }
            
            /* Fix fullscreen mode */
            #vditor.vditor-fullscreen .vditor-toolbar {
                position: fixed !important;
                bottom: 0 !important;
            }
            
            /* Fix dropdown positioning */
            .vditor-toolbar .vditor-panel {
                position: fixed !important;
                bottom: auto !important;
                top: auto !important;
                max-height: 35vh !important;
                overflow-y: auto !important;
                z-index: 10000 !important;
                transform: translateY(-100%) !important;
                margin-top: -5px !important;
            }
        }
    </style>

</head>
<body class="bg-gray-50 h-screen w-screen overflow-hidden text-gray-800 font-sans">

<!-- Login Screen -->
<div id="login-screen" class="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-500 hidden">
    <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm mx-4 transform transition-all hover:scale-[1.02] duration-300">
        <div class="text-center mb-8">
            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <i class="fas fa-user-shield text-2xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">博客管理后台</h2>
            <p class="text-gray-500 text-sm mt-2">请登录以继续</p>
        </div>
        <div class="space-y-5">
            <div>
                <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">用户名</label>
                <input type="text" id="username-input" class="w-full border-gray-300 bg-gray-50 border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Enter username">
            </div>
            <div>
                <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">密码</label>
                <input type="password" id="password-input" class="w-full border-gray-300 bg-gray-50 border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Enter password">
            </div>
            <button onclick="login()" class="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition duration-200 shadow-lg shadow-blue-500/30">
                登录系统
            </button>
        </div>
    </div>
</div>

<!-- Main App -->
<div id="app-screen" class="hidden flex h-full relative">
    
    <!-- Mobile Header -->
    <div class="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-30 flex items-center justify-between px-4 shadow-sm">
        <button onclick="toggleSidebar()" class="text-gray-600 focus:outline-none p-2 rounded hover:bg-gray-100">
            <i class="fas fa-bars text-xl"></i>
        </button>
        <span class="font-bold text-lg text-gray-800">UpXuu Admin</span>
        <button onclick="toggleTimeline()" id="mobile-timeline-btn" class="text-gray-600 focus:outline-none p-2 rounded hover:bg-gray-100 hidden">
            <i class="fas fa-clock text-xl"></i>
        </button>
        <button onclick="toggleGalleryTimeline()" id="mobile-gallery-timeline-btn" class="text-gray-600 focus:outline-none p-2 rounded hover:bg-gray-100 hidden">
            <i class="fas fa-history text-xl"></i>
        </button>
        <button onclick="toggleMeta()" id="mobile-meta-btn" class="text-gray-600 focus:outline-none p-2 rounded hover:bg-gray-100 hidden">
            <i class="fas fa-cog text-xl"></i>
        </button>
    </div>

    <!-- Sidebar Overlay -->
    <div id="sidebar-overlay" onclick="toggleSidebar()" class="fixed inset-0 bg-black/50 z-30 hidden md:hidden glass transition-opacity"></div>

    <!-- Sidebar -->
    <aside id="main-sidebar" class="fixed md:static inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shadow-xl z-40 transform -translate-x-full md:translate-x-0 sidebar-transition">
        <div class="p-6 border-b border-slate-800 flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-feather-alt text-white text-sm"></i>
            </div>
            <h1 class="text-xl font-bold tracking-wide">UpXuu</h1>
        </div>
        
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-4 mt-2">菜单</div>
            <a href="javascript:void(0)" onclick="navigate('/')" id="nav-new" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all group">
                <i class="fas fa-pen-nib w-5 text-center text-slate-400 group-hover:text-blue-400 transition-colors"></i>
                <span class="font-medium">写文章</span>
            </a>
            <a href="javascript:void(0)" onclick="navigate('/list')" id="nav-list" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all group">
                <i class="fas fa-list w-5 text-center text-slate-400 group-hover:text-blue-400 transition-colors"></i>
                <span class="font-medium">文章管理</span>
            </a>
            <a href="javascript:void(0)" onclick="navigate('/gallery')" id="nav-gallery" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all group">
                <i class="fas fa-images w-5 text-center text-slate-400 group-hover:text-blue-400 transition-colors"></i>
                <span class="font-medium">图库管理</span>
            </a>
            <a href="javascript:void(0)" onclick="navigate('/settings')" id="nav-settings" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all group">
                <i class="fas fa-cog w-5 text-center text-slate-400 group-hover:text-blue-400 transition-colors"></i>
                <span class="font-medium">博客设置</span>
            </a>
        </nav>

        <div class="p-4 border-t border-slate-800">
            <button onclick="logout()" class="flex items-center space-x-3 px-4 py-3 rounded-lg w-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors group">
                <i class="fas fa-sign-out-alt w-5 text-center"></i>
                <span class="font-medium">退出登录</span>
            </button>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative pt-16 md:pt-0 w-full">
        
        <!-- Loading Overlay -->
        <div id="loading" class="absolute inset-0 bg-black/30 z-[60] flex flex-col items-center justify-center backdrop-blur-[2px]">
            <div class="spinner"></div>
            <p class="mt-4 text-white font-medium text-shadow">处理中...</p>
        </div>

        <!-- Post List View -->
        <div id="view-list" class="hidden flex-1 flex overflow-hidden">
            <!-- List Container -->
            <div class="flex-1 flex flex-col overflow-hidden bg-gray-50">
                <div class="p-4 md:p-6 border-b bg-white shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center z-10">
                    <div class="flex items-center gap-2 w-full md:w-auto">
                        <h2 class="text-xl font-bold text-gray-800">文章列表</h2>
                        <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full" id="post-count">0</span>
                        <span id="current-filter" class="hidden ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border flex items-center gap-1">
                            <span id="filter-text"></span>
                            <button onclick="clearFilter()" class="hover:text-red-500"><i class="fas fa-times"></i></button>
                        </span>
                    </div>
                    <div class="relative w-full md:w-64">
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="text" id="search-input" oninput="handleSearch()" placeholder="搜索标题..." class="w-full border-gray-200 border bg-gray-50 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                    </div>
                </div>
                
                <div id="list-container" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 pb-20 md:pb-6">
                    <!-- Items injected here -->
                </div>
            </div>

            <!-- Timeline Sidebar (Right) -->
            <div id="timeline-sidebar" class="fixed inset-y-0 right-0 w-64 bg-white shadow-2xl transform translate-x-full md:translate-x-0 md:static md:w-72 md:shadow-none border-l z-30 sidebar-transition flex flex-col">
                <div class="p-5 border-b bg-gray-50 flex justify-between items-center md:hidden">
                    <h3 class="font-bold text-gray-700">时间轴筛选</h3>
                    <button onclick="toggleTimeline()" class="text-gray-500"><i class="fas fa-times"></i></button>
                </div>
                <div class="p-5 border-b bg-gray-50 hidden md:block">
                    <h3 class="font-bold text-gray-700 flex items-center gap-2"><i class="far fa-calendar-alt"></i> 时间轴</h3>
                </div>
                <div id="timeline-container" class="flex-1 overflow-y-auto p-4 space-y-1">
                    <!-- Timeline injected here -->
                </div>
            </div>
            
            <!-- Timeline Overlay for Mobile -->
            <div id="timeline-overlay" onclick="toggleTimeline()" class="fixed inset-0 bg-black/50 z-20 hidden md:hidden"></div>
        </div>

        <!-- Gallery View -->
        <div id="view-gallery" class="hidden flex-1 flex overflow-hidden">
            <!-- Gallery List Container -->
            <div class="flex-1 flex flex-col overflow-hidden bg-gray-50">
                <div class="p-4 md:p-6 border-b bg-white shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center z-10">
                    <div class="flex items-center gap-2 w-full md:w-auto">
                        <h2 class="text-xl font-bold text-gray-800">图库管理</h2>
                        <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full" id="gallery-count">0</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="batchInsert()" id="btn-batch-insert" class="hidden bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-green-500/30 transition-all items-center gap-2 text-sm font-medium">
                            <i class="fas fa-plus-circle"></i> 批量插入 (<span id="batch-count">0</span>)
                        </button>
                        <label for="gallery-upload-input" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-blue-500/30 transition-all cursor-pointer flex items-center gap-2 text-sm font-medium">
                            <i class="fas fa-cloud-upload-alt"></i> 上传图片
                        </label>
                        <input type="file" id="gallery-upload-input" class="hidden" accept="image/*" multiple onchange="handleGalleryUpload(this)">
                    </div>
                </div>
                
                <div id="gallery-container" class="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 space-y-8 scroll-smooth">
                    <!-- Gallery Groups injected here -->
                </div>
            </div>

            <!-- Gallery Timeline Sidebar (Right) -->
            <div id="gallery-sidebar" class="fixed inset-y-0 right-0 w-64 bg-white shadow-2xl transform translate-x-full md:translate-x-0 md:static md:w-72 md:shadow-none border-l z-30 sidebar-transition flex flex-col">
                 <div class="p-5 border-b bg-gray-50 flex justify-between items-center md:hidden">
                    <h3 class="font-bold text-gray-700">时间轴</h3>
                    <button onclick="toggleGalleryTimeline()" class="text-gray-500"><i class="fas fa-times"></i></button>
                </div>
                <div class="p-5 border-b bg-gray-50 hidden md:block">
                    <h3 class="font-bold text-gray-700 flex items-center gap-2"><i class="far fa-calendar-alt"></i> 时间轴</h3>
                </div>
                <div id="gallery-timeline-container" class="flex-1 overflow-y-auto p-4 space-y-1">
                    <!-- Gallery Timeline injected here -->
                </div>
            </div>
            
            <!-- Gallery Timeline Overlay for Mobile -->
            <div id="gallery-timeline-overlay" onclick="toggleGalleryTimeline()" class="fixed inset-0 bg-black/50 z-20 hidden md:hidden"></div>
        </div>

        <!-- Settings View -->
        <div id="view-settings" class="hidden flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto">
             <div class="p-6 md:p-10 max-w-4xl mx-auto w-full">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <i class="fas fa-sliders-h text-blue-600"></i> 博客设置
                </h2>
                
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
                    
                    <!-- Basic Info -->
                    <div>
                        <h3 class="text-lg font-bold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">基本信息</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-600">博客标题 (Title)</label>
                                <input type="text" id="set-title" class="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-600">副标题 (Subtitle)</label>
                                <input type="text" id="set-subtitle" class="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- Profile -->
                    <div>
                        <h3 class="text-lg font-bold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">个人资料</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-600">昵称 (Name)</label>
                                <input type="text" id="set-name" class="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-600">个性签名 (Bio)</label>
                                <input type="text" id="set-bio" class="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div class="space-y-2 md:col-span-2">
                                <label class="text-sm font-bold text-gray-600">头像链接 (Avatar)</label>
                                <div class="flex gap-2">
                                    <input type="text" id="set-avatar" class="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    <button onclick="toggleImageManager('avatar')" class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 rounded-lg font-medium transition-colors">
                                        <i class="far fa-image"></i> 选择
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Appearance -->
                    <div>
                        <h3 class="text-lg font-bold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">外观设置</h3>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-600">背景图片链接 (Background Image)</label>
                            <div class="flex gap-2">
                                <input type="text" id="set-bg" class="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                <button onclick="toggleImageManager('bg')" class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 rounded-lg font-medium transition-colors">
                                    <i class="far fa-image"></i> 选择
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="pt-6 border-t flex justify-end">
                        <button onclick="saveSettings()" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform active:scale-95 flex items-center gap-2">
                            <i class="fas fa-save"></i> 保存设置
                        </button>
                    </div>
                </div>
             </div>
        </div>

        <!-- Editor View -->
        <div id="view-editor" class="hidden flex-1 flex flex-col h-full">
            <!-- Toolbar -->
            <div class="bg-white border-b px-3 md:px-6 py-2 md:py-3 flex items-center justify-between shadow-sm z-20 gap-2">
                <div class="flex items-center gap-2 flex-1 overflow-hidden min-w-0">
                    <button onclick="navigate('/list')" class="md:hidden text-gray-500 hover:text-gray-800 shrink-0"><i class="fas fa-arrow-left"></i></button>
                    <input type="text" id="post-filename" class="text-base md:text-xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 px-1 py-1 transition-colors w-full outline-none placeholder-gray-300 truncate" placeholder="文件名...">
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button onclick="toggleMeta()" class="md:hidden p-2 text-gray-600 bg-gray-100 rounded-lg shrink-0">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button onclick="toggleFullscreen()" id="btn-fullscreen" class="p-2 text-gray-600 bg-gray-100 rounded-lg shrink-0" title="全屏编辑">
                        <i class="fas fa-expand"></i>
                    </button>
                    <button onclick="savePost()" class="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-1.5 md:py-2 rounded-lg shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 font-medium flex items-center gap-2 whitespace-nowrap text-sm md:text-base shrink-0">
                        <i class="fas fa-paper-plane"></i> <span class="hidden md:inline">保存发布</span><span class="md:hidden">发布</span>
                    </button>
                </div>
            </div>

            <div class="flex flex-1 overflow-hidden relative">
                <!-- Editor Area -->
                <div class="flex-1 flex flex-col bg-white h-full relative z-0">
                    <div id="vditor" class="flex-1"></div>
                </div>

                <!-- Meta Sidebar (Right) -->
                <div id="meta-sidebar" class="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform translate-x-full md:translate-x-0 md:static md:w-80 md:border-l z-30 sidebar-transition flex flex-col h-full">
                    <div class="p-4 border-b flex justify-between items-center md:hidden bg-gray-50">
                        <h3 class="font-bold text-gray-700">文章设置</h3>
                        <button onclick="toggleMeta()" class="text-gray-500"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto p-5 space-y-6">
                        <div class="space-y-1">
                            <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider">文章标题</label>
                            <input type="text" id="fm-title" class="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter title">
                        </div>

                        <div class="space-y-1">
                            <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider">发布时间</label>
                            <input type="datetime-local" id="fm-date" step="1" class="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>

                        <div class="space-y-1">
                            <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider">分类</label>
                            <div class="relative">
                                <i class="fas fa-folder absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                                <input type="text" id="fm-category" class="w-full bg-gray-50 border border-gray-200 pl-9 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="例如: 生活">
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider">标签</label>
                            <div class="relative">
                                <i class="fas fa-tags absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                                <input type="text" id="fm-tags" class="w-full bg-gray-50 border border-gray-200 pl-9 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="逗号分隔">
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider">描述 (Description)</label>
                            <textarea id="fm-description" class="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows="3" placeholder="文章简短描述，用于SEO"></textarea>
                        </div>

                        <div class="space-y-1">
                            <label class="block text-gray-700 text-xs font-bold uppercase tracking-wider">文章头图 (Cover)</label>
                            <div class="flex gap-2">
                                <input type="text" id="fm-image" class="flex-1 bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="图片URL">
                                <button onclick="toggleImageManager('cover')" class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap">
                                    选择
                                </button>
                            </div>
                        </div>

                        <div class="pt-4 border-t border-gray-100 space-y-4">
                             <label class="flex items-center justify-between cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">草稿 (Draft)</span>
                                <input type="checkbox" id="fm-draft" class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                            </label>
                            
                            <div class="space-y-1 px-2">
                                <label class="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <i class="fas fa-thumbtack text-yellow-500"></i> 置顶优先级 (Sticky)
                                </label>
                                <input type="number" id="fm-sticky" class="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none transition-all" placeholder="0=不置顶, 越大越前">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Meta Overlay for Mobile -->
                <div id="meta-overlay" onclick="toggleMeta()" class="fixed inset-0 bg-black/50 z-20 hidden md:hidden"></div>
            </div>
        </div>

        <!-- Image Manager Modal -->
        <div id="image-manager-modal" class="fixed inset-0 z-[70] hidden">
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="toggleImageManager()"></div>
            <div class="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white md:rounded-2xl rounded-t-2xl shadow-2xl w-full md:w-[800px] md:h-[600px] h-[80vh] flex flex-col transition-transform duration-300 transform translate-y-full md:translate-y-0" id="image-modal-content">
                <div class="p-4 border-b flex justify-between items-center bg-gray-50 md:rounded-t-2xl">
                    <h3 class="font-bold text-gray-800 text-lg"><i class="fas fa-images text-blue-500 mr-2"></i>图片管理</h3>
                    <button onclick="toggleImageManager()" class="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="p-4 border-b bg-white">
                    <div id="drop-zone" class="border-2 border-dashed border-blue-200 rounded-xl p-6 hidden md:flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition-colors group relative overflow-hidden" onclick="document.getElementById('img-upload-input').click()">
                        <input type="file" id="img-upload-input" class="hidden" accept="image/*" multiple onchange="handleImageSelect(this)">
                        <div id="upload-prompt" class="flex flex-col items-center">
                            <i class="fas fa-cloud-upload-alt text-4xl text-blue-300 group-hover:text-blue-500 mb-2 transition-colors"></i>
                            <p class="text-gray-600 font-medium">点击或拖拽上传图片</p>
                            <p class="text-xs text-gray-400 mt-1">支持 JPG, PNG, GIF, WEBP</p>
                        </div>
                        <div id="upload-processing" class="hidden flex-col items-center absolute inset-0 bg-white/90 justify-center">
                             <div class="spinner border-blue-500 w-8 h-8 border-2"></div>
                             <p class="text-sm text-blue-600 mt-2 font-medium" id="upload-status-text">上传中...</p>
                        </div>
                    </div>
                    
                    <div class="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
                        <label class="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" id="compress-webp" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" checked>
                            <span>压缩为 WebP (Worker)</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer select-none" title="压缩质量 0.1 - 1.0">
                            <span>质量:</span>
                            <input type="number" id="compress-quality" class="w-16 border rounded px-1 py-0.5 text-center" value="0.8" min="0.1" max="1.0" step="0.1">
                        </label>
                    </div>

                    <!-- Mobile Upload Button -->
                    <div class="md:hidden mt-4">
                        <label for="img-upload-input-mobile" class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform">
                            <i class="fas fa-cloud-upload-alt"></i> 选择图片上传
                        </label>
                        <input type="file" id="img-upload-input-mobile" class="hidden" accept="image/*" multiple onchange="handleImageSelect(this)">
                         <div id="mobile-upload-processing" class="hidden mt-2 text-center text-sm text-blue-600 font-medium">
                            <i class="fas fa-spinner fa-spin mr-1"></i> <span id="mobile-upload-status">上传中...</span>
                        </div>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <div id="image-grid" class="grid grid-cols-3 md:grid-cols-4 gap-4">
                        <!-- Images injected here -->
                    </div>
                    <div id="image-loading" class="flex justify-center py-8 hidden">
                        <div class="spinner border-gray-400 w-8 h-8 border-2"></div>
                    </div>
                    <div id="no-images" class="hidden flex-col items-center justify-center py-10 text-gray-400">
                        <i class="far fa-image text-4xl mb-3"></i>
                        <p>暂无图片</p>
                    </div>
                </div>
            </div>
        </div>

    </main>
</div>

<!-- Image FAB -->
<button onclick="toggleImageManager()" id="image-fab" class="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/40 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center hidden">
    <i class="fas fa-image text-xl"></i>
</button>

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

    // --- UI Helpers ---
    function toggleSidebar() {
        const sb = document.getElementById('main-sidebar');
        const ov = document.getElementById('sidebar-overlay');
        const isClosed = sb.classList.contains('-translate-x-full');
        
        if (isClosed) {
            sb.classList.remove('-translate-x-full');
            ov.classList.remove('hidden');
        } else {
            sb.classList.add('-translate-x-full');
            ov.classList.add('hidden');
        }
    }

    function toggleTimeline() {
        const sb = document.getElementById('timeline-sidebar');
        const ov = document.getElementById('timeline-overlay');
        const isClosed = sb.classList.contains('translate-x-full');
        
        if (isClosed) {
            sb.classList.remove('translate-x-full');
            ov.classList.remove('hidden');
        } else {
            sb.classList.add('translate-x-full');
            ov.classList.add('hidden');
        }
    }

    function toggleGalleryTimeline() {
        const sb = document.getElementById('gallery-sidebar');
        const ov = document.getElementById('gallery-timeline-overlay');
        const isClosed = sb.classList.contains('translate-x-full');
        
        if (isClosed) {
            sb.classList.remove('translate-x-full');
            ov.classList.remove('hidden');
        } else {
            sb.classList.add('translate-x-full');
            ov.classList.add('hidden');
        }
    }

    function toggleMeta() {
        const sb = document.getElementById('meta-sidebar');
        const ov = document.getElementById('meta-overlay');
        const isClosed = sb.classList.contains('translate-x-full');

        if (isClosed) {
            sb.classList.remove('translate-x-full');
            ov.classList.remove('hidden');
        } else {
            sb.classList.add('translate-x-full');
            ov.classList.add('hidden');
        }
    }

    function toggleFullscreen() {
        const editor = document.getElementById('view-editor');
        const btn = document.getElementById('btn-fullscreen');
        const metaSidebar = document.getElementById('meta-sidebar');
        const sidebar = document.getElementById('main-sidebar');
        const mobileHeader = document.querySelector('.md\\:hidden.fixed.top-0');

        if (!isFullscreen) {
            editor.classList.add('fixed', 'inset-0', 'z-[200]', 'bg-white');
            sidebar?.classList.add('hidden');
            metaSidebar?.classList.add('hidden');
            if (mobileHeader) mobileHeader.classList.add('hidden');
            btn.innerHTML = '<i class="fas fa-compress"></i>';
            btn.title = '退出全屏';
            isFullscreen = true;
        } else {
            editor.classList.remove('fixed', 'inset-0', 'z-[200]', 'bg-white');
            sidebar?.classList.remove('hidden');
            metaSidebar?.classList.remove('hidden');
            if (mobileHeader) mobileHeader.classList.remove('hidden');
            btn.innerHTML = '<i class="fas fa-expand"></i>';
            btn.title = '全屏编辑';
            isFullscreen = false;
        }
    }

    function startAutoSave() {
        if (autoSaveTimer) clearInterval(autoSaveTimer);
        autoSaveTimer = setInterval(() => {
            const filename = document.getElementById('post-filename').value.trim();
            if (!filename || !isVditorReady) return;

            const content = buildFrontmatter() + vditor.getValue();
            const draftData = {
                filename: filename,
                content: content,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('draft_' + filename, JSON.stringify(draftData));
            showAutoSaveIndicator();
        }, 30000);
    }

    function showAutoSaveIndicator() {
        let indicator = document.getElementById('autosave-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'autosave-indicator';
            indicator.className = 'fixed bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 transition-opacity z-[100]';
            indicator.textContent = '草稿已自动保存';
            document.body.appendChild(indicator);
        }
        indicator.style.opacity = '1';
        setTimeout(() => indicator.style.opacity = '0', 2000);
    }

    function loadDraft(filename) {
        const draft = localStorage.getItem('draft_' + filename);
        if (draft) {
            const data = JSON.parse(draft);
            const savedAt = new Date(data.savedAt);
            const timeStr = savedAt.toLocaleString('zh-CN');
            if (confirm('Found unsaved draft (saved at ' + timeStr + '), restore?')) {
                parseFrontmatter(data.content);
                return true;
            }
        }
        return false;
    }

    function clearDraft(filename) {
        localStorage.removeItem('draft_' + filename);
    }

    // --- Auth Logic ---
    let currentView = null;  // 跟踪当前视图
    
    const storedKey = localStorage.getItem('admin_key');
    if (!storedKey) {
        document.getElementById('login-screen').classList.remove('hidden');
    } else {
        document.getElementById('app-screen').classList.remove('hidden');
        handleRoute();
    }

    async function login() {
        const user = document.getElementById('username-input').value;
        const pass = document.getElementById('password-input').value;
        
        if (user === 'lijiaxu' && pass) {
            // 测试密码是否正确：尝试调用一个简单的API
            try {
                const testResponse = await fetch('/api/posts', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + pass
                    }
                });
                
                if (testResponse.status === 200) {
                    // 密码正确
                    localStorage.setItem('admin_key', pass);
                    document.getElementById('login-screen').classList.add('hidden');
                    document.getElementById('app-screen').classList.remove('hidden');
                    handleRoute();
                } else {
                    alert('密码错误，请检查后重试');
                }
            } catch (error) {
                alert('登录失败，请检查网络连接');
            }
        } else {
            alert('用户名或密码错误');
        }
    }

    function logout() {
        if(confirm('确定要退出登录吗？')) {
            localStorage.removeItem('admin_key');
            location.href = '/';
        }
    }

    // --- Routing ---
    window.addEventListener('popstate', handleRoute);

    function navigate(path) {
        // Close mobile sidebar if open
        const sb = document.getElementById('main-sidebar');
        if (!sb.classList.contains('-translate-x-full') && window.innerWidth < 768) {
            toggleSidebar();
        }
        
        // 如果路径相同，不重复导航
        if (window.location.pathname === path) {
            // 如果已经在编辑器界面但文件名不为空，点击"写文章"应该清空
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
        
        // 如果视图没有变化，不重新加载
        if (currentView === path) return;
        currentView = path;
        
        // Update Sidebar Active State
        document.querySelectorAll('aside nav a').forEach(el => {
            el.classList.remove('bg-slate-800', 'text-white');
            el.querySelector('i').classList.remove('text-blue-400');
        });
        
        if (path === '/' || path === '/new' || path === '/create') {
            const el = document.getElementById('nav-new');
            el.classList.add('bg-slate-800', 'text-white');
            el.querySelector('i').classList.add('text-blue-400');
            showEditorView();
            // 只有当文件名输入框为空时才调用 newPost()，避免清空正在编辑的内容
            if (!document.getElementById('post-filename').value) {
                newPost();
            }
        } else if (path === '/list') {
            const el = document.getElementById('nav-list');
            el.classList.add('bg-slate-800', 'text-white');
            el.querySelector('i').classList.add('text-blue-400');
            showListView();
        } else if (path === '/gallery') {
            const el = document.getElementById('nav-gallery');
            el.classList.add('bg-slate-800', 'text-white');
            el.querySelector('i').classList.add('text-blue-400');
            showGalleryView();
        } else if (path === '/settings') {
            const el = document.getElementById('nav-settings');
            el.classList.add('bg-slate-800', 'text-white');
            el.querySelector('i').classList.add('text-blue-400');
            showSettingsView();
        } else if (path.startsWith('/edit/')) {
            const el = document.getElementById('nav-list');
            el.classList.add('bg-slate-800', 'text-white');
            el.querySelector('i').classList.add('text-blue-400');
            showEditorView();
            const filename = decodeURIComponent(path.replace('/edit/', ''));
            if (filename) editPost(filename);
        }
    }

    function showListView() {
        document.getElementById('view-list').classList.remove('hidden');
        document.getElementById('view-editor').classList.add('hidden');
        document.getElementById('view-gallery').classList.add('hidden');
        document.getElementById('view-settings').classList.add('hidden');
        // Show/Hide mobile header buttons
        document.getElementById('mobile-timeline-btn').classList.remove('hidden');
        document.getElementById('mobile-gallery-timeline-btn').classList.add('hidden');
        document.getElementById('mobile-meta-btn').classList.add('hidden');
        document.getElementById('image-fab').classList.add('hidden'); // Hide FAB
        
        if (allPosts.length === 0) loadPosts();
    }

    function showEditorView() {
        document.getElementById('view-list').classList.add('hidden');
        document.getElementById('view-editor').classList.remove('hidden');
        document.getElementById('view-gallery').classList.add('hidden');
        document.getElementById('view-settings').classList.add('hidden');
        // Show/Hide mobile header buttons
        document.getElementById('mobile-timeline-btn').classList.add('hidden');
        document.getElementById('mobile-gallery-timeline-btn').classList.add('hidden');
        document.getElementById('mobile-meta-btn').classList.remove('hidden');
        document.getElementById('image-fab').classList.remove('hidden'); // Show FAB
        
        initVditor();
    }

    function showGalleryView() {
        document.getElementById('view-list').classList.add('hidden');
        document.getElementById('view-editor').classList.add('hidden');
        document.getElementById('view-gallery').classList.remove('hidden');
        document.getElementById('view-settings').classList.add('hidden');
        
        document.getElementById('mobile-timeline-btn').classList.add('hidden');
        document.getElementById('mobile-gallery-timeline-btn').classList.remove('hidden');
        document.getElementById('mobile-meta-btn').classList.add('hidden');
        document.getElementById('image-fab').classList.add('hidden');
        
        loadGallery();
    }

    function showSettingsView() {
        document.getElementById('view-list').classList.add('hidden');
        document.getElementById('view-editor').classList.add('hidden');
        document.getElementById('view-gallery').classList.add('hidden');
        document.getElementById('view-settings').classList.remove('hidden');
        
        document.getElementById('mobile-timeline-btn').classList.add('hidden');
        document.getElementById('mobile-gallery-timeline-btn').classList.add('hidden');
        document.getElementById('mobile-meta-btn').classList.add('hidden');
        document.getElementById('image-fab').classList.add('hidden');
        
        loadSettings();
    }

    // --- Settings Logic ---
    let configSha = null;
    let layoutSha = null;
    let configContent = '';
    let layoutContent = '';

    async function loadSettings() {
        showLoading(true);
        const res = await fetchAPI('/settings');
        showLoading(false);
        
        if (!res || !res.ok) {
            alert('无法加载设置');
            return;
        }
        
        const data = await res.json();
        configSha = data.config.sha;
        configContent = data.config.content;
        layoutSha = data.layout.sha;
        layoutContent = data.layout.content;
        
        // Parse Config
        const getVal = (regex) => {
            const m = configContent.match(regex);
            return m ? m[1] : '';
        };
        
        document.getElementById('set-title').value = getVal(/title:\s*['"](.*?)['"]/);
        document.getElementById('set-subtitle').value = getVal(/subtitle:\s*['"](.*?)['"]/);
        document.getElementById('set-name').value = getVal(/name:\s*['"](.*?)['"]/);
        document.getElementById('set-bio').value = getVal(/bio:\s*['"](.*?)['"]/);
        document.getElementById('set-avatar').value = getVal(/avatar:\s*['"](.*?)['"]/);
        
        // Parse Layout for BG
        const bgMatch = layoutContent.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/);
        if (bgMatch) {
            document.getElementById('set-bg').value = bgMatch[1];
        }
    }

    async function saveSettings() {
        showLoading(true);
        
        // Update Config
        let newConfig = configContent;
        const replaceVal = (regex, val) => {
            if (newConfig.match(regex)) {
                newConfig = newConfig.replace(regex, (match, p1, p2, p3) => p1 + val + p3);
            }
        };
        
        replaceVal(/(title:\s*['"])(.*?)(['"])/, document.getElementById('set-title').value);
        replaceVal(/(subtitle:\s*['"])(.*?)(['"])/, document.getElementById('set-subtitle').value);
        replaceVal(/(name:\s*['"])(.*?)(['"])/, document.getElementById('set-name').value);
        replaceVal(/(bio:\s*['"])(.*?)(['"])/, document.getElementById('set-bio').value);
        replaceVal(/(avatar:\s*['"])(.*?)(['"])/, document.getElementById('set-avatar').value);
        
        // Update Layout
        let newLayout = layoutContent;
        const bgUrl = document.getElementById('set-bg').value;
        newLayout = newLayout.replace(/(background-image:\s*url\(['"]?)(.*?)(['"]?\))/, \`$1\${bgUrl}$3\`);
        
        // Save Config
        const res1 = await fetchAPI('/settings', {
            method: 'PUT',
            body: JSON.stringify({ file: 'config', content: newConfig, sha: configSha })
        });
        
        if (!res1.ok) {
            showLoading(false);
            alert('保存配置失败');
            return;
        }
        
        // Save Layout
        const res2 = await fetchAPI('/settings', {
            method: 'PUT',
            body: JSON.stringify({ file: 'layout', content: newLayout, sha: layoutSha })
        });
        
        showLoading(false);
        if (res2.ok) {
            alert('设置保存成功！需等待构建生效。');
            loadSettings(); // Reload shas
        } else {
            alert('保存背景失败');
        }
    }

    // --- Data & UI Logic ---

    function showLoading(show) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
    }

    async function fetchAPI(endpoint, options = {}) {
        const key = localStorage.getItem('admin_key');
        const headers = {
            'Authorization': 'Bearer ' + key,
            ...options.headers
        };
        try {
            const res = await fetch(API_BASE + endpoint, { ...options, headers });
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

    async function loadPosts() {
        showLoading(true);
        const res = await fetchAPI('/posts');
        showLoading(false);
        if (!res) return;
        const data = await res.json();
        
        allPosts = data.filter(item => item.name.endsWith('.md'));
        
        allPosts.forEach(post => {
            const match = post.name.match(/^(\\d{4}-\\d{2}-\\d{2})/);
            if (match) {
                post.dateStr = match[1]; // Fallback if frontmatter date is missing
            } else {
                post.dateStr = 'Unknown Date';
            }
            // Normalize date for sorting
            // If post.date (from frontmatter) exists, use it.
            // Ensure format is sortable string YYYY-MM-DD
            if (post.date) {
                // Assuming post.date is ISO or standard string
                post.sortDate = post.date;
            } else if (post.dateStr !== 'Unknown Date') {
                post.sortDate = post.dateStr;
            } else {
                post.sortDate = '0000-00-00';
            }
        });

        // Sort by date desc
        allPosts.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
        
        filteredPosts = [...allPosts];
        renderList();
        renderTimeline();
    }

    function renderList() {
        const container = document.getElementById('list-container');
        document.getElementById('post-count').textContent = filteredPosts.length;
        container.innerHTML = '';
        
        filteredPosts.forEach(item => {
            const displayDate = item.date || item.dateStr || '未识别日期';
            const displayTitle = item.title || item.name;
            const isSticky = false; // We could parse this if returned from backend list API
            
            const div = document.createElement('div');
            div.className = 'bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center group cursor-pointer hover:border-blue-200 fade-in';
            div.onclick = (e) => {
                if(e.target.closest('button')) return;
                navigate('/edit/' + encodeURIComponent(item.name));
            };
            
            div.innerHTML = \`
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-sm shrink-0">
                        <i class="far fa-file-alt"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800 text-base md:text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">\${displayTitle}</h3>
                        <div class="flex items-center gap-3 text-xs text-gray-400">
                            <span class="flex items-center gap-1"><i class="far fa-calendar"></i> \${displayDate}</span>
                            <span class="hidden md:flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-500">\${item.name}</span>
                            \${isSticky ? '<span class="text-yellow-500 flex items-center gap-1"><i class="fas fa-thumbtack"></i> 置顶</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button onclick="navigate('/edit/' + encodeURIComponent('\${item.name}')); event.stopPropagation()" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deletePost('\${item.name}', '\${item.sha}'); event.stopPropagation()" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="删除">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            \`;
            container.appendChild(div);
        });
    }

    function renderTimeline() {
        const container = document.getElementById('timeline-container');
        container.innerHTML = '';
        
        const groups = {};
        allPosts.forEach(post => {
            let d = post.date || post.dateStr;
            if (!d || d === 'Unknown Date') d = '其他';
            const ym = d.substring(0, 7); // YYYY-MM or '其他'
            if (!groups[ym]) groups[ym] = 0;
            groups[ym]++;
        });

        const activeClass = "bg-blue-50 text-blue-600 font-semibold border-r-2 border-blue-500";
        const normalClass = "text-gray-600 hover:bg-gray-50 hover:text-blue-500";

        // Add "All" option
        const allDiv = document.createElement('div');
        allDiv.className = \`flex items-center justify-between px-4 py-2 cursor-pointer transition-colors \${currentFilterYm === null ? activeClass : normalClass}\`;
        allDiv.onclick = () => filterByDate(null);
        allDiv.innerHTML = \`<span class="text-sm">全部文章</span><span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">\${allPosts.length}</span>\`;
        container.appendChild(allDiv);

        Object.keys(groups).sort().reverse().forEach(ym => {
            const count = groups[ym];
            const isActive = currentFilterYm === ym;
            const div = document.createElement('div');
            div.className = \`flex items-center justify-between px-4 py-2 cursor-pointer transition-colors \${isActive ? activeClass : normalClass}\`;
            div.onclick = () => filterByDate(ym);
            div.innerHTML = \`<span class="text-sm">\${ym}</span><span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">\${count}</span>\`;
            container.appendChild(div);
        });
    }

    function filterByDate(ym) {
        currentFilterYm = ym;
        const filterEl = document.getElementById('current-filter');
        const filterText = document.getElementById('filter-text');
        
        if (ym) {
            filteredPosts = allPosts.filter(p => {
                const d = p.date || p.dateStr || '其他';
                return d.startsWith(ym);
            });
            filterEl.classList.remove('hidden');
            filterText.textContent = ym;
        } else {
            filteredPosts = [...allPosts];
            filterEl.classList.add('hidden');
        }
        
        // Also re-apply search if any
        handleSearch(); // logic merge inside
        
        // Update timeline UI active state
        renderTimeline();
        
        // Close mobile timeline drawer
        const sb = document.getElementById('timeline-sidebar');
        if (!sb.classList.contains('translate-x-full')) {
            toggleTimeline();
        }
    }
    
    function clearFilter() {
        filterByDate(null);
    }

    function handleSearch() {
        const term = document.getElementById('search-input').value.toLowerCase();
        let base = currentFilterYm 
            ? allPosts.filter(p => (p.date || p.dateStr || '其他').startsWith(currentFilterYm))
            : [...allPosts];
            
        if (term) {
            filteredPosts = base.filter(p => 
                (p.title && p.title.toLowerCase().includes(term)) || 
                p.name.toLowerCase().includes(term)
            );
        } else {
            filteredPosts = base;
        }
        renderList();
    }

    // Editor Logic
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
            upload: {
                accept: 'image/*',
                handler: uploadImage
            },
            after: () => {
                isVditorReady = true;
                document.getElementById('vditor').addEventListener('paste', handlePaste);
            }
        });
    }

    async function handlePaste(e) {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (!file) continue;

                showLoading(true);
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    const base64 = reader.result.split(',')[1];
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = now.getMonth() + 1;
                    const day = now.getDate();
                    const pad = n => n.toString().padStart(2, '0');
                    const timestamp = year +
                                      pad(month) +
                                      pad(day) +
                                      pad(now.getHours()) +
                                      pad(now.getMinutes()) +
                                      pad(now.getSeconds());
                    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                    // Build path: year/month/day/filename.png
                    const filename = year + '/' + month + '/' + day + '/' + timestamp + '_' + random + '.png';

                    const res = await fetchAPI('/upload', {
                        method: 'POST',
                        body: JSON.stringify({
                            filename: filename,
                            content: base64
                        })
                    });

                    showLoading(false);
                    if (res && res.ok) {
                        const data = await res.json();
                        vditor.insertValue('![' + filename + '](' + data.url + ')');
                    } else {
                        alert('图片上传失败');
                    }
                };
                reader.onerror = () => {
                    showLoading(false);
                    alert('图片读取失败');
                };
                break;
            }
        }
    }

    function newPost() {
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
            autoSaveTimer = null;
        }

        currentSha = null;
        document.getElementById('post-filename').value = '';
        document.getElementById('post-filename').disabled = false;

        const now = new Date();
        const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

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

        if (loadDraft(name)) {
            startAutoSave();
            return;
        }

        showLoading(true);
        const res = await fetchAPI('/post/' + encodeURIComponent(name));
        showLoading(false);

        if (!res) return;
        if (!res.ok) {
            alert('无法获取文章内容');
            return;
        }

        const data = await res.json();
        currentSha = data.sha;
        parseFrontmatter(data.content);
        startAutoSave();
    }

    async function savePost() {
        const filename = document.getElementById('post-filename').value.trim();
        if (!filename) return alert('请输入文件名');
        
        const finalFilename = filename.endsWith('.md') ? filename : filename + '.md';
        
        if (!isVditorReady) {
            alert('编辑器尚未加载完成');
            return;
        }

        const content = buildFrontmatter() + vditor.getValue();
        
        showLoading(true);
        const res = await fetchAPI('/post/' + encodeURIComponent(finalFilename), {
            method: 'PUT',
            body: JSON.stringify({
                content: content,
                sha: currentSha
            })
        });
        showLoading(false);

        if (res && res.ok) {
            const data = await res.json();
            
            // Check for IndexNow status
            let msg = '保存成功！';
            if (data.indexNow) {
                if (data.indexNow.status === 'pending') {
                    msg += '\\nIndexNow 提交已触发 (后台处理中)';
                }
            }
            alert(msg);
            
            if (data.content && data.content.sha) {
                currentSha = data.content.sha;
            }

            clearDraft(finalFilename);
        } else {
            const err = await res.text();
            alert('保存失败: ' + err);
        }
    }

    async function deletePost(name, sha) {
        if (!confirm(\`确定要删除 "\${name}" 吗？此操作不可恢复！\`)) return;
        
        showLoading(true);
        const res = await fetchAPI('/post/' + encodeURIComponent(name), {
            method: 'DELETE',
            body: JSON.stringify({ sha })
        });
        showLoading(false);

        if (res && res.ok) {
            loadPosts();
        } else {
            alert('删除失败');
        }
    }

    async function uploadImage(files) {
        const file = files[0];
        if (!file) return;

        showLoading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
             const base64 = reader.result.split(',')[1];

             // Generate filename: year/month/day/timestamp_random.ext
             const now = new Date();
             const year = now.getFullYear();
             const month = now.getMonth() + 1;
             const day = now.getDate();
             const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
             const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
             const ext = file.name.split('.').pop() || 'png';
             const filename = year + '/' + month + '/' + day + '/' + timestamp + '_' + random + '.' + ext;

             const res = await fetchAPI('/upload', {
                 method: 'POST',
                 body: JSON.stringify({
                     filename: filename,
                     content: base64
                 })
             });

             showLoading(false);
             if(res && res.ok) {
                 const data = await res.json();
                 vditor.insertValue(\`![\${file.name}](\${data.url})\`);
             } else {
                 alert('图片上传失败');
             }
        };
    }

    // --- Image Manager Logic ---
    let imagesLoaded = false;
    let currentImageMode = 'editor'; // editor, cover, avatar, bg

    function toggleImageManager(mode = null) {
        const modal = document.getElementById('image-manager-modal');
        const content = document.getElementById('image-modal-content');
        const isHidden = modal.classList.contains('hidden');
        
        if (mode) currentImageMode = mode;
        
        if (isHidden) {
            modal.classList.remove('hidden');
            // Small delay to allow display:block to apply before transition
            setTimeout(() => {
                content.classList.remove('translate-y-full');
            }, 10);
            if (!imagesLoaded) loadImages();
            
            // Load compress preferences
            const savedCompress = localStorage.getItem('compress_webp');
            if (savedCompress !== null) {
                document.getElementById('compress-webp').checked = savedCompress === 'true';
            }
            const savedQuality = localStorage.getItem('compress_quality');
            if (savedQuality !== null) {
                document.getElementById('compress-quality').value = savedQuality;
            }
        } else {
            content.classList.add('translate-y-full');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
            if (!mode) currentImageMode = 'editor';
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

    let selectedImages = new Set();

    async function loadImages() {
        const grid = document.getElementById('image-grid');
        const loading = document.getElementById('image-loading');
        const noImages = document.getElementById('no-images');
        
        loading.classList.remove('hidden');
        noImages.classList.add('hidden');
        grid.innerHTML = '';
        
        const res = await fetchAPI('/images');
        loading.classList.add('hidden');
        
        if (!res) return;
        const images = await res.json();
        
        if (images.length === 0) {
            noImages.classList.remove('hidden');
            noImages.style.display = 'flex';
            return;
        }
        
        images.sort((a, b) => b.name.localeCompare(a.name)); // Newest first
        
        // Base worker URL for proxy
        const workerUrl = window.location.origin;

        images.forEach(img => {
            const imageUrl = \`\${workerUrl}/img/\${img.path}\`;
            // Use wsrv.nl for thumbnail
            const thumbUrl = \`https://wsrv.nl/?url=\${encodeURIComponent(imageUrl)}&w=300&h=300&fit=cover&a=top\`;
            
            const div = document.createElement('div');
            div.className = 'aspect-square rounded-lg border bg-white shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer overflow-hidden relative group transition-all';
            div.onclick = (e) => {
                if(e.target.closest('input')) return;
                handleImageClick(imageUrl, img.name);
            };
            
            const isSelected = selectedImages.has(JSON.stringify({name: img.name, url: imageUrl}));
            
            div.innerHTML = \`
                <img src="\${thumbUrl}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" onerror="this.src='https://via.placeholder.com/150?text=Error'">
                <div class="absolute top-2 right-2 z-10">
                    <input type="checkbox" class="w-5 h-5 accent-blue-600 shadow-sm cursor-pointer transform scale-125" 
                        onchange="toggleImageSelection('\${img.name}', '\${imageUrl}', this)"
                        \${isSelected ? 'checked' : ''}>
                </div>
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                    <span class="bg-white/90 text-blue-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">选择</span>
                </div>
                <div class="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1 truncate text-center backdrop-blur-[2px]">
                    \${img.name}
                </div>
            \`;
            grid.appendChild(div);
        });
        
        imagesLoaded = true;
        updateBatchUI();
    }

    function toggleImageSelection(name, url, checkbox) {
        const item = JSON.stringify({name, url});
        if (checkbox.checked) {
            selectedImages.add(item);
        } else {
            selectedImages.delete(item);
        }
        updateBatchUI();
    }

    function updateBatchUI() {
        const btn = document.getElementById('btn-batch-insert');
        const count = document.getElementById('batch-count');
        if (selectedImages.size > 0 && currentImageMode === 'editor') {
            btn.classList.remove('hidden');
            btn.classList.add('flex');
            count.textContent = selectedImages.size;
        } else {
            btn.classList.add('hidden');
            btn.classList.remove('flex');
        }
    }

    function batchInsert() {
        if (!isVditorReady) return;
        
        let markdown = '';
        selectedImages.forEach(json => {
            const item = JSON.parse(json);
            markdown += \`![\${item.name}](\${item.url})\n\`;
        });
        
        vditor.insertValue(markdown);
        
        // Clear selection
        selectedImages.clear();
        updateBatchUI();
        // Uncheck all boxes
        document.querySelectorAll('#image-grid input[type="checkbox"]').forEach(cb => cb.checked = false);
        
        toggleImageManager();
    }

    function insertImageToEditor(url, name) {
        if (!isVditorReady) return;
        
        const altText = prompt("请输入图片描述 (Alt Text)", name) || name;
        const markdown = \`![\${altText}](\${url})\`;
        vditor.insertValue(markdown);
        
        toggleImageManager();
    }

    function handleImageSelect(input) {
        if (input.files && input.files.length > 0) {
            uploadImages(input.files);
        }
        input.value = ''; // Reset
    }

    async function uploadImages(files) {
        const processing = document.getElementById('upload-processing');
        const prompt = document.getElementById('upload-prompt');
        const statusText = document.getElementById('upload-status-text');
        
        const mobileProcessing = document.getElementById('mobile-upload-processing');
        const mobileStatus = document.getElementById('mobile-upload-status');
        
        processing.style.display = 'flex';
        prompt.classList.add('opacity-0');
        mobileProcessing.classList.remove('hidden');
        
        const compressEl = document.getElementById('compress-webp');
        const compress = compressEl.checked;
        const quality = parseFloat(document.getElementById('compress-quality').value) || 0.8;

        // Save preferences
        localStorage.setItem('compress_webp', compress);
        localStorage.setItem('compress_quality', quality);
        
        let successCount = 0;
        let failCount = 0;
        
        // Convert FileList to Array to avoid issues if the list changes (though it shouldn't)
        const fileArray = Array.from(files);
        
        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            const msg = \`正在上传 (\${i + 1}/\${fileArray.length}): \${file.name}\`;
            statusText.textContent = msg;
            mobileStatus.textContent = msg;
            
            try {
                let fileToUpload = file;
                let filename = file.name;
                
                // Compress logic
                if (compress && file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
                     statusText.textContent = \`正在压缩 (\${i + 1}/\${fileArray.length}): \${file.name}\`;
                     const webpBlob = await compressImageToWebP(file, quality);
                     fileToUpload = webpBlob;
                     filename = filename.replace(/\.\w+$/, '.webp');
                }
                
                await uploadSingleFile(fileToUpload, filename);
                successCount++;
            } catch (err) {
                console.error(err);
                failCount++;
            }
        }
        
        processing.style.display = 'none';
        prompt.classList.remove('opacity-0');
        mobileProcessing.classList.add('hidden');
        
        if (successCount > 0) {
             loadImages();
             const toast = document.createElement('div');
             toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-[200] fade-in font-bold flex items-center gap-2';
             toast.innerHTML = \`<i class="fas fa-check-circle"></i> 成功上传 \${successCount} 张\${failCount > 0 ? \`，失败 \${failCount} 张\` : ''}\`;
             document.body.appendChild(toast);
             setTimeout(() => toast.remove(), 3000);
        } else {
             alert('上传失败');
        }
    }

    function compressImageToWebP(file, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/webp', quality);
            };
            img.onerror = reject;
        });
    }

    async function uploadSingleFile(file, originalName) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                 const base64 = reader.result.split(',')[1];

                 // Generate timestamp filename with year/month/day path
                 const now = new Date();
                 const year = now.getFullYear();
                 const month = now.getMonth() + 1;
                 const day = now.getDate();
                 const pad = n => n.toString().padStart(2, '0');
                 const timestamp = year +
                                   pad(month) +
                                   pad(day) +
                                   pad(now.getHours()) +
                                   pad(now.getMinutes()) +
                                   pad(now.getSeconds());

                 // Add random suffix to avoid collision in batch
                 const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

                 const ext = originalName.split('.').pop();
                 // Build path: year/month/day/filename.ext
                 const filename = year + '/' + month + '/' + day + '/' + timestamp + '_' + random + '.' + ext;

                 const res = await fetchAPI('/upload', {
                     method: 'POST',
                     body: JSON.stringify({
                         filename: filename,
                         content: base64
                     })
                 });

                 if(res && res.ok) {
                     resolve(await res.json());
                 } else {
                     reject(new Error('Upload failed'));
                 }
            };
            reader.onerror = reject;
        });
    }

    // Drag & Drop
    const dropZone = document.getElementById('drop-zone');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('bg-blue-50', 'border-blue-400'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('bg-blue-50', 'border-blue-400'), false);
    });

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            uploadImages(files);
        }
    }

    // --- Gallery Page Logic ---
    let galleryImages = [];

    async function loadGallery() {
        const container = document.getElementById('gallery-container');
        const countEl = document.getElementById('gallery-count');
        
        container.innerHTML = '<div class="flex justify-center py-10"><div class="spinner border-blue-500 w-8 h-8 border-2"></div></div>';
        
        const res = await fetchAPI('/images');
        if (!res) return;
        
        const images = await res.json();
        galleryImages = images;
        countEl.textContent = images.length;
        
        // Parse dates from filenames (YYYYMMDDHHmmss or similar)
        images.forEach(img => {
            // Match any 8 digits starting with 20
            const match = img.name.match(/(20\d{2})(\d{2})(\d{2})/);
            if (match) {
                img.dateObj = new Date(\`\${match[1]}-\${match[2]}-\${match[3]}\`);
                img.ym = \`\${match[1]}-\${match[2]}\`;
            } else {
                img.dateObj = new Date(0);
                img.ym = 'Unknown';
            }
        });
        
        // Sort Newest First
        images.sort((a, b) => b.name.localeCompare(a.name));
        
        renderGalleryContent();
        renderGalleryTimeline();
    }

    function renderGalleryContent() {
        const container = document.getElementById('gallery-container');
        container.innerHTML = '';
        
        if (galleryImages.length === 0) {
            container.innerHTML = '<div class="text-center py-20 text-gray-400">暂无图片</div>';
            return;
        }
        
        const groups = {};
        galleryImages.forEach(img => {
            if (!groups[img.ym]) groups[img.ym] = [];
            groups[img.ym].push(img);
        });
        
        const workerUrl = window.location.origin;
        
        Object.keys(groups).sort().reverse().forEach(ym => {
            const groupDiv = document.createElement('div');
            groupDiv.id = \`gallery-group-\${ym}\`;
            groupDiv.className = 'mb-8';
            
            groupDiv.innerHTML = \`
                <h3 class="font-bold text-gray-700 text-lg mb-4 flex items-center gap-2 sticky top-0 bg-gray-50/95 py-2 z-10 backdrop-blur-sm">
                    <i class="far fa-calendar-check text-blue-500"></i> \${ym}
                    <span class="text-xs font-normal text-gray-400 bg-white px-2 py-0.5 rounded-full border">\${groups[ym].length}</span>
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    \${groups[ym].map(img => {
                        const imageUrl = \`\${workerUrl}/img/\${img.path}\`;
                        const thumbUrl = \`https://wsrv.nl/?url=\${encodeURIComponent(imageUrl)}&w=400&h=400&fit=cover&a=top\`;
                        return \`
                            <div class="aspect-square rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all overflow-hidden relative group">
                                <img src="\${thumbUrl}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy">
                                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                                    <button onclick="copyToClipboard('\${imageUrl}')" class="w-8 h-8 bg-white/90 text-blue-500 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white shadow-sm transition-colors" title="复制链接">
                                        <i class="fas fa-link text-xs"></i>
                                    </button>
                                    <button onclick="copyToClipboard('![img](\${imageUrl})')" class="w-8 h-8 bg-white/90 text-green-500 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white shadow-sm transition-colors" title="复制Markdown">
                                        <i class="fab fa-markdown text-xs"></i>
                                    </button>
                                    <button onclick="deleteImage('\${img.name}', '\${img.sha}')" class="w-8 h-8 bg-white/90 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white shadow-sm transition-colors" title="删除">
                                        <i class="fas fa-trash-alt text-xs"></i>
                                    </button>
                                </div>
                                <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-6 text-white text-xs truncate">
                                    \${img.name}
                                </div>
                            </div>
                        \`;
                    }).join('')}
                </div>
            \`;
            container.appendChild(groupDiv);
        });
    }

    function renderGalleryTimeline() {
        const container = document.getElementById('gallery-timeline-container');
        container.innerHTML = '';
        
        const yms = [...new Set(galleryImages.map(i => i.ym))].sort().reverse();
        
        yms.forEach(ym => {
            const div = document.createElement('div');
            div.className = "flex items-center justify-between px-4 py-2 cursor-pointer transition-colors text-gray-600 hover:bg-gray-50 hover:text-blue-500";
            div.onclick = () => {
                const el = document.getElementById(\`gallery-group-\${ym}\`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                     const sb = document.getElementById('gallery-sidebar');
                     if (!sb.classList.contains('translate-x-full')) toggleGalleryTimeline();
                }
            };
            div.innerHTML = \`
                <img src="\${thumbUrl}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" onerror="this.src='https://via.placeholder.com/150?text=Error'">
                <div class="absolute top-2 right-2 z-10">
                    <input type="checkbox" class="w-5 h-5 accent-blue-600 shadow-sm cursor-pointer transform scale-125" 
                        onchange="toggleImageSelection('\${img.name}', '\${imageUrl}', this)"
                        \${isSelected ? 'checked' : ''}>
                </div>
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                    <span class="bg-white/90 text-blue-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">选择</span>
                </div>
                <div class="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1 truncate text-center backdrop-blur-[2px]">
                    \${img.name}
                </div>
            \`;
            container.appendChild(div);
        });
    }

    async function deleteImage(name, sha) {
        if (!confirm(\`确定要删除图片 "\${name}" 吗？此操作不可恢复！\`)) return;

        showLoading(true);
        const res = await fetchAPI('/img/' + encodeURIComponent(name), {
            method: 'DELETE',
            body: JSON.stringify({ sha })
        });
        showLoading(false);

        if (res && res.ok) {
            // Refresh Gallery
            if (!document.getElementById('view-gallery').classList.contains('hidden')) {
                loadGallery();
            }
            // Also refresh Modal list if loaded
            if (imagesLoaded) {
                imagesLoaded = false; // Force reload next time
            }
        } else {
            alert('删除失败');
        }
    }

    function handleGalleryUpload(input) {
        if (input.files && input.files.length > 0) {
            // Re-use the batch upload function but maybe with different success callback?
            // Actually uploadImages already calls loadImages(), which is what we want for gallery.
            // But uploadImages assumes the modal UI exists (upload-processing etc).
            // For the gallery view, we might not have the modal open.
            // Let's open the image manager modal temporarily to show progress or just reuse the logic.
            // The simplest way is to just call uploadImages, but ensure the progress UI is visible.
            // uploadImages uses elements inside #image-manager-modal.
            
            // So let's open the modal first in a special "uploading" state?
            // Or just ensure the progress overlay works. 
            // The progress overlay is inside #drop-zone inside the modal.
            
            // Let's just switch to the modal view to show progress.
            toggleImageManager();
            uploadImages(input.files);
        }
        input.value = '';
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                // Show a toast or simple alert
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm z-[200] fade-in';
                toast.textContent = '已复制到剪贴板';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
            }).catch(err => {
                prompt('复制失败，请手动复制', text);
            });
        } else {
            prompt('请手动复制', text);
        }
    }

    // --- Frontmatter Helpers ---

    function parseFrontmatter(text) {
        const fmRegex = /^---\\n([\\s\\S]*?)\\n---\\n/;
        const match = text.match(fmRegex);
        let body = text;
        
        if (match) {
            const fmText = match[1];
            body = text.replace(fmRegex, '');
            
            const getField = (key) => {
                const regex = new RegExp(\`^\\s*\${key}:\\s*(.*)$\`, 'm');
                const m = fmText.match(regex);
                return m ? m[1].trim() : '';
            };
            
            document.getElementById('fm-title').value = getField('title').replace(/^['"]|['"]$/g, '');
            let d = getField('published').replace(' ', 'T');
            if (d && d.length === 10) d += 'T00:00:00';
            document.getElementById('fm-date').value = d;
            // Robust tags parsing
            let tagsVal = getField('tags').trim();
            // Remove inline comments
            tagsVal = tagsVal.replace(/#.*$/, '').trim();
            if (tagsVal.startsWith('[') && tagsVal.endsWith(']')) {
                tagsVal = tagsVal.substring(1, tagsVal.length - 1);
            }
            const tagsList = tagsVal.split(/[,，]/).map(t => t.trim().replace(/^['"]+|['"]+$/g, '')).filter(t => t);
            document.getElementById('fm-tags').value = tagsList.join(', ');

            // Robust category parsing
            let catVal = getField('category').trim();
            catVal = catVal.replace(/#.*$/, '').trim();
            if (catVal.startsWith('[') && catVal.endsWith(']')) {
                catVal = catVal.substring(1, catVal.length - 1);
            }
            document.getElementById('fm-category').value = catVal.replace(/^['"]+|['"]+$/g, '');

            document.getElementById('fm-image').value = getField('image').replace(/^['"]|['"]$/g, '');
            document.getElementById('fm-description').value = getField('description').replace(/^['"]|['"]$/g, '');
            document.getElementById('fm-draft').checked = getField('draft') === 'true';
            
            const stickyRaw = getField('sticky');
            if (stickyRaw === 'true') document.getElementById('fm-sticky').value = 999;
            else document.getElementById('fm-sticky').value = parseInt(stickyRaw) || 0;
        }
        
        const setVal = () => {
            if (isVditorReady) vditor.setValue(body);
            else setTimeout(setVal, 100);
        };
        setVal();
    }

    function buildFrontmatter() {
        const title = document.getElementById('fm-title').value;
        let date = document.getElementById('fm-date').value;
        // Fix date format: ensure YYYY-MM-DD HH:mm:ss
        if (date) {
            date = date.replace('T', ' ');
            if (date.split(':').length === 2) {
                date += ':00';
            }
        }
        const tags = document.getElementById('fm-tags').value;
        const category = document.getElementById('fm-category').value;
        const image = document.getElementById('fm-image').value;
        const description = document.getElementById('fm-description').value;
        const draft = document.getElementById('fm-draft').checked;
        const sticky = parseInt(document.getElementById('fm-sticky').value) || 0;
        
        let fm = '---\\n';
        if (title) fm += \`title: "\${title}"\\n\`;
        if (date) fm += \`published: \${date}\\n\`;
        if (image) fm += \`image: "\${image}"\n\`;
        if (description) fm += \`description: "\${description}"\n\`;

        if (tags) {
            let cleanTags = tags.trim();
            // Remove outer brackets if user typed them manually
            if (cleanTags.startsWith('[') && cleanTags.endsWith(']')) {
                cleanTags = cleanTags.substring(1, cleanTags.length - 1);
            }
            const tagList = cleanTags.split(/[,，]/).map(t => t.trim().replace(/^['"]+|['"]+$/g, '')).filter(t => t);
            
            if (tagList.length > 0) {
                fm += \`tags: [\${tagList.map(t => '"' + t + '"').join(', ')}]\\n\`;
            }
        }
        
        if (category) fm += \`category: "\${category}"\\n\`;
        if (draft) fm += \`draft: true\\n\`;
        if (sticky > 0) fm += \`sticky: \${sticky}\\n\`; 
        
        fm += '---\\n\\n';
        return fm;
    }

</script>
</body>
</html>
`;
