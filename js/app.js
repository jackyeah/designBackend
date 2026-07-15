// ==========================================================================
// 共用互動邏輯（純前端展示用，無實際資料串接）
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Sidebar: submenu expand/collapse ---------- */
  document.querySelectorAll('.nav-item.has-submenu').forEach(function (item) {
    item.addEventListener('click', function () {
      item.classList.toggle('expanded');
    });
  });

  /* ---------- Sidebar: collapse to icon-only ---------- */
  var sidebar = document.getElementById('sidebar');
  var sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('collapsed');
    });
  }

  /* ---------- Dropdown panels (notification / user menu) ---------- */
  var dropdownButtons = document.querySelectorAll('[data-dropdown-target]');
  dropdownButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var panel = document.getElementById(btn.getAttribute('data-dropdown-target'));
      var isOpen = panel.classList.contains('open');
      document.querySelectorAll('.dropdown-panel.open').forEach(function (p) { p.classList.remove('open'); });
      if (!isOpen) panel.classList.add('open');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.dropdown-panel.open').forEach(function (p) { p.classList.remove('open'); });
  });
  document.querySelectorAll('.dropdown-panel').forEach(function (panel) {
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
  });

  /* ---------- Modal open/close ---------- */
  document.querySelectorAll('[data-modal-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var modal = document.getElementById(btn.getAttribute('data-modal-target'));
      if (modal) modal.classList.add('open');
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('.modal-overlay').classList.remove('open');
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  /* ---------- Tabs bar: close tab (persists to sessionStorage history) ---------- */
  document.querySelectorAll('.tab-close').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var key = btn.getAttribute('data-tab-key');
      var history = [];
      try { history = JSON.parse(sessionStorage.getItem('tabHistory') || '[]'); } catch (err) { history = []; }

      var closedIndex = -1;
      for (var i = 0; i < history.length; i++) {
        if (history[i].key === key) { closedIndex = i; break; }
      }
      if (closedIndex === -1) return;

      var wasActive = window.CURRENT_TAB && window.CURRENT_TAB.key === key;
      history.splice(closedIndex, 1);
      sessionStorage.setItem('tabHistory', JSON.stringify(history));

      if (wasActive) {
        if (history.length === 0) {
          window.location.href = 'sub-accounts.html';
        } else {
          var next = history[closedIndex] || history[closedIndex - 1];
          window.location.href = next.href;
        }
      } else {
        btn.closest('.tab').remove();
      }
    });
  });

  /* ---------- Segmented switch demo toggle ---------- */
  document.querySelectorAll('.switch').forEach(function (sw) {
    sw.addEventListener('click', function () { sw.classList.toggle('on'); });
  });

  /* ---------- Permission matrix: per-column select-all + page-wide select-all ---------- */
  document.querySelectorAll('.perm-table').forEach(function (table) {
    table.querySelectorAll('thead th').forEach(function (th, idx) {
      var toggle = th.querySelector('.col-toggle');
      if (!toggle) return;
      toggle.addEventListener('change', function () {
        table.querySelectorAll('tbody tr').forEach(function (tr) {
          var cell = tr.children[idx];
          var cb = cell && cell.querySelector('input[type="checkbox"]');
          if (cb) cb.checked = toggle.checked;
        });
      });
    });
  });
  var permSelectAll = document.getElementById('permSelectAll');
  if (permSelectAll) {
    permSelectAll.addEventListener('change', function () {
      document.querySelectorAll('.perm-table input[type="checkbox"]').forEach(function (cb) {
        cb.checked = permSelectAll.checked;
      });
    });
  }

  /* ---------- Copy icon demo ---------- */
  document.querySelectorAll('.cell-copy svg').forEach(function (icon) {
    icon.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  });

});
