// ==========================================================================
// 共用 Shell 產生器：側邊選單 / 頂部列 / 分頁籤列 / 麵包屑
// 各頁面只需在 <aside id="sidebar" data-active="account" data-subactive="sub-accounts">
// 並於載入前設定 window.CURRENT_TAB / window.PAGE_BREADCRUMB
// ==========================================================================
(function () {

  var ICONS = {
    account: '<circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>',
    vip: '<path d="M4 17h16l-1.2-7-4 3-2.8-5-2.8 5-4-3L4 17z"/><path d="M4 20h16"/>',
    guild: '<rect x="4" y="10" width="7" height="10"/><rect x="13" y="4" width="7" height="16"/><path d="M7 13h1M7 16h1M16 8h1M16 11h1M16 14h1"/>',
    cash: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.5v9M14.6 9.8c0-1.1-1.2-1.8-2.6-1.8s-2.6.7-2.6 1.8 1.2 1.5 2.6 1.7 2.6.7 2.6 1.8-1.2 1.8-2.6 1.8-2.6-.7-2.6-1.8"/>',
    megaphone: '<path d="M4 10v4a1 1 0 0 0 1 1h2l3 4V5l-3 4H5a1 1 0 0 0-1 1z"/><path d="M14.5 9a3.6 3.6 0 0 1 0 6M17.5 6.5a7.2 7.2 0 0 1 0 11"/>',
    message: '<path d="M4 6h16v10H9l-3 3v-3H4z"/><path d="M8 10h8M8 13h5"/>',
    chart: '<path d="M12 3.2v8.8h8.8"/><path d="M20.3 13.5A8.5 8.5 0 1 1 12 3.2"/>',
    gift: '<rect x="4" y="9" width="16" height="11"/><path d="M4 9h16M12 9v11"/><path d="M12 9c-1.8-3-6-3.2-6-.7S9.3 9 12 9zM12 9c1.8-3 6-3.2 6-.7S14.7 9 12 9z"/>',
    task: '<rect x="6" y="5" width="12" height="15" rx="1.5"/><rect x="9" y="3.5" width="6" height="3" rx="1"/><path d="M9 13l2 2 4-4"/>',
    checkin: '<rect x="4" y="5.5" width="16" height="14" rx="1.5"/><path d="M4 9.5h16M8 3.5v4M16 3.5v4"/><path d="M9 14l2 2 4-4"/>',
    blacklist: '<circle cx="12" cy="12" r="8.2"/><path d="M6.5 6.5l11 11"/>',
    site: '<rect x="4" y="4.5" width="16" height="15" rx="1.5"/><path d="M4 9h16M9 9v10.5"/>',
    log: '<path d="M6 3.5h9l3 3v14H6z"/><path d="M15 3.5v3h3M9 12h6M9 15.5h6M9 8.5h3"/>'
  };

  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  }

  var NAV = [
    { key: 'account', label: '帳號管理', icon: 'account', submenu: [
      { key: 'role-permissions', label: '新增角色權限(總控)', href: 'role-permissions.html' },
      { key: 'sub-accounts', label: '總控子帳號', href: 'sub-accounts.html' },
      { key: 'site-owners', label: '站長管理', href: 'site-owners.html' },
      { key: 'site-owner-sub-accounts', label: '站長子帳號', href: 'site-owner-sub-accounts.html' },
      { key: 'members', label: '會員管理', href: 'members.html' },
      { key: 'member-registration', label: '會員註冊設定', href: 'member-registration.html' },
      { key: 'permission-groups', label: '權限群組', href: 'permission-groups.html' },
      { key: 'currency-providers', label: '幣商設定', href: 'currency-providers.html' }
    ]},
    { key: 'vip', label: 'VIP設置', icon: 'vip', href: '#' },
    { key: 'guild', label: '公會管理', icon: 'guild', href: '#' },
    { key: 'cash', label: '現金系統', icon: 'cash', href: '#' },
    { key: 'announcement', label: '公告訊息', icon: 'megaphone', href: '#' },
    { key: 'sms', label: '短信管理', icon: 'message', href: '#' },
    { key: 'report', label: '報表', icon: 'chart', href: '#' },
    { key: 'promotion', label: '優惠活動管理', icon: 'gift', href: '#' },
    { key: 'task', label: '任務管理', icon: 'task', href: '#' },
    { key: 'checkin', label: '簽到管理', icon: 'checkin', href: '#' },
    { key: 'blacklist', label: '黑名單管理', icon: 'blacklist', href: '#' },
    { key: 'site', label: '網站管理', icon: 'site', href: '#' },
    { key: 'log', label: '操作記錄', icon: 'log', href: '#' }
  ];

  function renderSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    var activeKey = sidebar.getAttribute('data-active');
    var activeSub = sidebar.getAttribute('data-subactive');

    var html = '';
    html += '<div class="sidebar-brand">';
    html += '  <div class="sidebar-brand-mark"><img src="../images/logo.png" alt="金錢母"></div>';
    html += '  <span class="sidebar-brand-name">金錢母後台</span>';
    html += '</div>';
    html += '<nav class="sidebar-nav">';

    NAV.forEach(function (item) {
      var isActiveGroup = item.key === activeKey;
      html += '<div class="nav-group">';
      if (item.submenu) {
        html += '<button type="button" class="nav-item has-submenu' + (isActiveGroup ? ' expanded active' : '') + '">';
        html += '  <span class="nav-icon">' + icon(item.icon) + '</span>';
        html += '  <span class="nav-label">' + item.label + '</span>';
        html += '  <span class="nav-caret"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span>';
        html += '</button>';
        html += '<ul class="nav-submenu">';
        item.submenu.forEach(function (sub) {
          html += '<li><a class="nav-subitem' + (sub.key === activeSub ? ' active' : '') + '" href="' + sub.href + '">' + sub.label + '</a></li>';
        });
        html += '</ul>';
      } else {
        html += '<a class="nav-item" href="' + item.href + '">';
        html += '  <span class="nav-icon">' + icon(item.icon) + '</span>';
        html += '  <span class="nav-label">' + item.label + '</span>';
        html += '</a>';
      }
      html += '</div>';
    });

    html += '</nav>';
    sidebar.innerHTML = html;

    var footer = document.createElement('div');
    footer.className = 'sidebar-footer';
    footer.innerHTML = '<button type="button" class="sidebar-collapse-toggle" id="sidebarToggle">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 6l-6 6 6 6M19 6l-6 6 6 6"/></svg>' +
      '<span class="sidebar-collapse-label">收合選單</span></button>';
    sidebar.appendChild(footer);
  }

  function renderTopbar() {
    var topbar = document.getElementById('topbar');
    if (!topbar) return;
    var html = '';
    html += '<div class="topbar-spacer"></div>';
    html += '<div class="topbar-actions">';
    html += '  <button type="button" class="icon-btn" title="畫面截圖"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.2"/></svg></button>';

    html += '  <div class="dropdown-anchor">';
    html += '    <button type="button" class="icon-btn" data-dropdown-target="notifPanel" title="通知"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg><span class="icon-badge">1</span></button>';
    html += '    <div class="dropdown-panel" id="notifPanel" style="width:400px;">';
    html += '      <div class="dropdown-header"><h3>通知</h3><div class="dropdown-header-actions"><button type="button">全部已讀</button><button type="button">全部刪除</button></div></div>';
    html += '      <div class="notif-list">';
    html += notifItem('success', '會員資金調整建立完成', '進度 100% ・ 2026-07-14 17:21・金錢母示範站_master_500.00', false);
    html += notifItem('info', '幣商設定已更新', 'YZ 益兆 站台幣商代碼 MOPAY 網域已變更・2026-07-13 09:02', true);
    html += notifItem('warning', '有 3 筆會員警告級別異常', '請至會員管理確認可疑帳號・2026-07-12 22:47', true);
    html += '      </div>';
    html += '      <div class="dropdown-footer">';
    html += pageBtn('«') + pageBtn('‹') + pageBtn('1', true) + pageBtn('›') + pageBtn('»');
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';

    html += '  <div class="dropdown-anchor">';
    html += '    <button type="button" class="avatar-btn" data-dropdown-target="userMenuPanel">M</button>';
    html += '    <div class="dropdown-panel user-menu-panel" id="userMenuPanel">';
    html += '      <a class="user-menu-item" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>帳戶設定</a>';
    html += '      <a class="user-menu-item" href="../pages/log.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h9l3 3v14H6z"/><path d="M15 3.5v3h3M9 12h6M9 15.5h6"/></svg>操作記錄</a>';
    html += '      <div class="user-menu-divider"></div>';
    html += '      <a class="user-menu-item" href="../login.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4H5v16h4"/><path d="M13 8l4 4-4 4M17 12H9"/></svg>登出</a>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';
    topbar.innerHTML = html;
  }

  function pageBtn(label, active) {
    return '<span class="page-btn' + (active ? ' active' : '') + '">' + label + '</span>';
  }

  function notifItem(type, title, meta, read) {
    var iconMap = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4 10-10"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.01"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5L21 19H3z"/><path d="M12 9.5v4.5M12 16.5v.01"/></svg>'
    };
    var colorClass = { success: 'success', info: 'info', warning: 'warning' }[type];
    return '<div class="notif-item' + (read ? ' read' : '') + '">' +
      '<span class="notif-dot"></span>' +
      '<span class="notif-icon" style="background:var(--color-' + colorClass + '-light);color:var(--color-' + colorClass + ')">' + iconMap[type] + '</span>' +
      '<span class="notif-body"><div class="notif-title">' + title + '</div><div class="notif-meta">' + meta + '</div></span>' +
      '<span class="notif-actions"><button type="button">' + (read ? '刪除' : '已讀') + '</button></span>' +
      '</div>';
  }

  var TAB_HISTORY_KEY = 'tabHistory';

  function readTabHistory() {
    try {
      return JSON.parse(sessionStorage.getItem(TAB_HISTORY_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function writeTabHistory(history) {
    sessionStorage.setItem(TAB_HISTORY_KEY, JSON.stringify(history));
  }

  function tabsHtml(history, current) {
    var html = '';
    history.forEach(function (tab) {
      var isActive = !!current && tab.key === current.key;
      html += '<a class="tab' + (isActive ? ' active' : '') + '" href="' + (tab.href || '#') + '" data-tab-key="' + tab.key + '">' +
        '<span class="tab-label">' + tab.label + '</span>' +
        '<button type="button" class="tab-close" data-tab-key="' + tab.key + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '</a>';
    });
    return html;
  }

  function renderTabs() {
    var tabsbar = document.getElementById('tabsbar');
    if (!tabsbar) return;
    var current = window.CURRENT_TAB;
    var history = readTabHistory();

    if (current) {
      var exists = history.some(function (t) { return t.key === current.key; });
      if (!exists) {
        history.push(current);
      }
    }

    // Only ever show as many tabs as fit on one row (no wrap/scroll/truncation) —
    // drop the oldest tabs first when the accumulated history overflows the row.
    tabsbar.innerHTML = tabsHtml(history, current);
    while (history.length > 1 && tabsbar.scrollWidth > tabsbar.clientWidth) {
      history.shift();
      tabsbar.innerHTML = tabsHtml(history, current);
    }

    writeTabHistory(history);
  }

  function renderBreadcrumb() {
    var mount = document.getElementById('breadcrumb-mount');
    if (!mount) return;
    var trail = window.PAGE_BREADCRUMB || [];
    var html = '<div class="breadcrumb">';
    html += '<span class="breadcrumb-home"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/></svg></span>';
    trail.forEach(function (crumb, i) {
      var isLast = i === trail.length - 1;
      html += '<span class="breadcrumb-sep">›</span>';
      html += '<span class="' + (isLast ? 'breadcrumb-current' : '') + '">' + crumb + '</span>';
    });
    html += '</div>';
    mount.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderSidebar();
    renderTopbar();
    renderTabs();
    renderBreadcrumb();
  });
})();
