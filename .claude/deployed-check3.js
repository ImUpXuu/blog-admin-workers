
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
  } else if (path === '/talk') {
    document.getElementById('nav-talk').classList.add('active');
    document.getElementById('view-talk').classList.add('active');
    if (!document.getElementById('talk-title').value) newTalk();
  } else if (path.startsWith('/edittalk/')) {
    document.getElementById('nav-talk').classList.add('active');
    document.getElementById('view-talk').classList.add('active');
    var tfn = decodeURIComponent(path.replace('/edittalk/', ''));
    if (tfn) editTalk(tfn);
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
    var match = post.name.match(/^(\d{4}-\d{2}-\d{2})/);
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
    if (data.indexNow && data.indexNow.status === 'pending') msg += '\nIndexNow 提交已触发';
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
  var fmRegex = /^---\n([\s\S]*?)\n---\n/;
  var match = text.match(fmRegex);
  var body = text;
  if (match) {
    var fmText = match[1];
    body = text.replace(fmRegex, '');
    var getField = function(key) {
      var lines = fmText.split('\n');
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
  var fm = '---\n';
  if (title) fm += 'title: "' + title + '"\n';
  if (date) fm += 'published: ' + date + '\n';
  if (image) fm += 'image: "' + image + '"\n';
  if (description) fm += 'description: "' + description + '"\n';
  if (tags) {
    var cleanTags = tags.trim();
    if (cleanTags.startsWith('[') && cleanTags.endsWith(']')) cleanTags = cleanTags.substring(1, cleanTags.length - 1);
    var tagList = cleanTags.split(/[,，]/).map(function(t) { return t.trim().replace(/^['"]+|['"]+$/g, ''); }).filter(function(t) { return t; });
    if (tagList.length > 0) fm += 'tags: [' + tagList.map(function(t) { return '"' + t + '"'; }).join(', ') + ']\n';
  }
  if (category) fm += 'category: "' + category + '"\n';
  if (draft) fm += 'draft: true\n';
  if (sticky > 0) fm += 'sticky: ' + sticky + '\n';
  fm += '---\n\n';
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
  } else if (currentImageMode === 'talk') {
    var ta = document.getElementById('talk-textarea');
    var start = ta.selectionStart;
    var mdImg = '![' + name + '](' + url + ')';
    ta.value = ta.value.substring(0, start) + mdImg + ta.value.substring(ta.selectionEnd);
    ta.focus();
    ta.setSelectionRange(start + mdImg.length, start + mdImg.length);
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
  if (selectedImages.size > 0 && (currentImageMode === 'editor' || currentImageMode === 'talk')) {
    btn.style.display = 'inline-flex';
    count.textContent = selectedImages.size;
  } else {
    btn.style.display = 'none';
  }
}

function batchInsert() {
  var md = '';
  selectedImages.forEach(function(json) {
    var item = JSON.parse(json);
    md += '![' + item.name + '](' + item.url + ')\n';
  });
  if (currentImageMode === 'talk') {
    var ta = document.getElementById('talk-textarea');
    var start = ta.selectionStart;
    ta.value = ta.value.substring(0, start) + md + ta.value.substring(ta.selectionEnd);
    ta.focus();
    ta.setSelectionRange(start + md.length, start + md.length);
  } else if (isVditorReady) {
    vditor.insertValue(md);
  }
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
    var match = img.name.match(/(20\d{2})(\d{2})(\d{2})/);
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
  document.getElementById('set-title').value = getVal(/title:\s*['"](.*?)['"]/);
  document.getElementById('set-subtitle').value = getVal(/subtitle:\s*['"](.*?)['"]/);
  document.getElementById('set-name').value = getVal(/name:\s*['"](.*?)['"]/);
  document.getElementById('set-bio').value = getVal(/bio:\s*['"](.*?)['"]/);
  document.getElementById('set-avatar').value = getVal(/avatar:\s*['"](.*?)['"]/);
  var bgMatch = layoutContent.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/);
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
  replaceVal(/(title:\s*['"])(.*?)(['"])/, document.getElementById('set-title').value);
  replaceVal(/(subtitle:\s*['"])(.*?)(['"])/, document.getElementById('set-subtitle').value);
  replaceVal(/(name:\s*['"])(.*?)(['"])/, document.getElementById('set-name').value);
  replaceVal(/(bio:\s*['"])(.*?)(['"])/, document.getElementById('set-bio').value);
  replaceVal(/(avatar:\s*['"])(.*?)(['"])/, document.getElementById('set-avatar').value);
  var newLayout = layoutContent;
  var bgUrl = document.getElementById('set-bg').value;
  newLayout = newLayout.replace(/(background-image:\s*url\(['"]?)(.*?)(['"]?\))/, '$1' + bgUrl + '$3');
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

// ==================== Talk (说说) ====================
var currentTalkSha = null;

function newTalk() {
  currentTalkSha = null;
  document.getElementById('talk-title').value = '';
  var now = new Date();
  var localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 19);
  document.getElementById('talk-date').value = localIso;
  document.getElementById('talk-textarea').value = '';
}

function showTalkList() {
  document.getElementById('talk-list-modal').classList.add('active');
  loadTalkList();
}

function hideTalkList() {
  document.getElementById('talk-list-modal').classList.remove('active');
}

async function loadTalkList() {
  var body = document.getElementById('talk-list-body');
  var noEl = document.getElementById('no-talks');
  body.innerHTML = '<div style="text-align:center;padding:20px;"><div class="spinner" style="border-color:rgba(0,0,0,0.2);border-top-color:var(--primary);width:28px;height:28px;margin:0 auto;"></div></div>';
  var res = await fetchAPI('/talks');
  if (!res) return;
  var talks = await res.json();
  talks = talks.filter(function(t) { return t.name.endsWith('.md'); });
  talks.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
  if (talks.length === 0) {
    body.innerHTML = '';
    noEl.classList.add('active');
    return;
  }
  noEl.classList.remove('active');
  body.innerHTML = '';
  talks.forEach(function(t) {
    var displayTitle = t.title || t.name;
    var displayDate = t.date || '';
    var div = document.createElement('div');
    div.className = 'talk-list-item';
    div.onclick = function(e) {
      if (e.target.closest('button')) return;
      hideTalkList();
      navigate('/edittalk/' + encodeURIComponent(t.name));
    };
    div.innerHTML =
      '<div class="talk-item-body">' +
        '<div class="talk-item-title">' + escapeHTML(displayTitle) + '</div>' +
        '<div class="talk-item-date">' + escapeHTML(displayDate) + '</div>' +
      '</div>' +
      '<div class="talk-item-actions">' +
        '<button class="edit" onclick="event.stopPropagation();hideTalkList();navigate(' + quot('/edittalk/') + '+encodeURIComponent(' + quot(t.name) + '))" title="编辑"><i class="fas fa-edit"></i></button>' +
        '<button class="delete" onclick="event.stopPropagation();deleteTalk(' + quot(t.name) + ',' + quot(t.sha) + ')" title="删除"><i class="fas fa-trash-alt"></i></button>' +
      '</div>';
    body.appendChild(div);
  });
}

async function deleteTalk(name, sha) {
  if (!confirm('确定要删除 "' + name + '" 吗？此操作不可恢复！')) return;
  showLoading(true);
  var res = await fetchAPI('/talk/' + encodeURIComponent(name), {
    method: 'DELETE',
    body: JSON.stringify({ sha: sha })
  });
  showLoading(false);
  if (res && res.ok) {
    loadTalkList();
  } else {
    alert('删除失败');
  }
}

async function saveTalk() {
  var title = document.getElementById('talk-title').value.trim();
  if (!title) return alert('请输入标题');
  var date = document.getElementById('talk-date').value;
  if (date) date = date.replace('T', ' ');
  var contentBody = document.getElementById('talk-textarea').value;
  var fm = '---\n';
  fm += 'title: "' + title + '"\n';
  if (date) fm += 'published: ' + date + '\n';
  fm += '---\n\n';
  var content = fm + contentBody;
  var safeTitle = title.replace(/[/\:*?"<>|]/g, '-').replace(/s+/g, '-').substring(0, 30);
  var filename = date ? date.substring(0, 10) + '-' + safeTitle : safeTitle;
  filename += '.md';
  showLoading(true);
  var res = await fetchAPI('/talk/' + encodeURIComponent(filename), {
    method: 'PUT',
    body: JSON.stringify({ content: content, sha: currentTalkSha })
  });
  showLoading(false);
  if (res && res.ok) {
    var data = await res.json();
    if (data.content && data.content.sha) currentTalkSha = data.content.sha;
    alert('发布成功！');
  } else {
    var err = res ? await res.text() : 'Unknown error';
    alert('发布失败: ' + err);
  }
}

async function editTalk(name) {
  document.getElementById('talk-title').value = '';
  document.getElementById('talk-textarea').value = '';
  showLoading(true);
  var res = await fetchAPI('/talk/' + encodeURIComponent(name));
  showLoading(false);
  if (!res || !res.ok) { alert('无法获取说说内容'); return; }
  var data = await res.json();
  currentTalkSha = data.sha;
  var fmRegex = /^---\n([\s\S]*?)\n---\n/;
  var match = data.content.match(fmRegex);
  var body = data.content;
  if (match) {
    body = data.content.replace(fmRegex, '');
    var fmText = match[1];
    function getField(key) {
      var lines = fmText.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var idx = line.indexOf(':');
        if (idx > 0 && line.substring(0, idx).trim() === key) {
          return line.substring(idx + 1).trim();
        }
      }
      return '';
    }
    document.getElementById('talk-title').value = getField('title').replace(/^['"]|['"]$/g, '');
    var d = getField('published').replace(' ', 'T');
    document.getElementById('talk-date').value = d;
  }
  document.getElementById('talk-textarea').value = body;
}

// Minimal Markdown toolbar functions
function talkGetTextarea() { return document.getElementById('talk-textarea'); }

function talkInsertAround(prefix, suffix) {
  var ta = talkGetTextarea();
  var start = ta.selectionStart, end = ta.selectionEnd;
  var text = ta.value;
  var selected = text.substring(start, end);
  var replacement = prefix + selected + (suffix || prefix);
  ta.value = text.substring(0, start) + replacement + text.substring(end);
  ta.focus();
  var newPos = start + replacement.length;
  if (selected) {
    ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
  } else {
    ta.setSelectionRange(newPos, newPos);
  }
}

function talkInsertBold() { talkInsertAround('**', '**'); }
function talkInsertItalic() { talkInsertAround('*', '*'); }
function talkInsertStrike() { talkInsertAround('~~', '~~'); }
function talkInsertCode() { talkInsertAround('`', '`'); }

function talkInsertLink() {
  var ta = talkGetTextarea();
  var url = prompt('请输入链接 URL:', 'https://');
  if (!url) return;
  talkInsertAround('[', '](' + url + ')');
}

function talkInsertImage() {
  var ta = talkGetTextarea();
  var url = prompt('请输入图片 URL:', 'https://');
  if (!url) return;
  talkInsertAround('![', '](' + url + ')');
}

function talkInsertQuote() {
  var ta = talkGetTextarea();
  var start = ta.selectionStart, end = ta.selectionEnd;
  var text = ta.value;
  var selected = text.substring(start, end);
  var lines = (selected || '引用内容').split('\n');
  var quoted = lines.map(function(l) { return '> ' + l; }).join('\n');
  ta.value = text.substring(0, start) + quoted + text.substring(end);
  ta.focus();
  ta.setSelectionRange(start, start + quoted.length);
}

function talkInsertHr() {
  var ta = talkGetTextarea();
  var start = ta.selectionStart;
  ta.value = ta.value.substring(0, start) + '\n---\n' + ta.value.substring(ta.selectionEnd);
  ta.focus();
  ta.setSelectionRange(start + 5, start + 5);
}

// Talk keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if (!document.getElementById('view-talk').classList.contains('active')) return;
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'b' || e.key === 'B') { e.preventDefault(); talkInsertBold(); }
    else if (e.key === 'i' || e.key === 'I') { e.preventDefault(); talkInsertItalic(); }
  }
});

// Talk paste handler - auto-upload pasted images
document.getElementById('talk-textarea').addEventListener('paste', async function(e) {
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
          var ta = talkGetTextarea();
          var start = ta.selectionStart;
          var mdImg = '![' + file.name + '](' + data.url + ')';
          ta.value = ta.value.substring(0, start) + mdImg + ta.value.substring(ta.selectionEnd);
          ta.focus();
          ta.setSelectionRange(start + mdImg.length, start + mdImg.length);
        } else { alert('图片上传失败'); }
      };
      reader.onerror = function() { showLoading(false); alert('图片读取失败'); };
      break;
    }
  }
});

// ==================== Utility ====================
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function quot(s) { return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"'; }
