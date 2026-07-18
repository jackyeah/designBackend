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

  /* ---------- Stat filter strip: click a category card to filter the activity list below (e.g. 優惠活動記錄) ----------
     每個分類對應一列 .title-row 或 .slide-row（活動），依 data-type 顯示/隱藏 */
  document.querySelectorAll('.stat-filter-strip[data-filter-target]').forEach(function (strip) {
    var table = document.querySelector(strip.getAttribute('data-filter-target'));
    if (!table) return;
    var rows = table.querySelectorAll('tbody tr.title-row, tbody tr.slide-row');
    strip.querySelectorAll('.stat-filter-item').forEach(function (item) {
      item.addEventListener('click', function () {
        strip.querySelectorAll('.stat-filter-item').forEach(function (i) { i.classList.remove('active'); });
        item.classList.add('active');
        var type = item.getAttribute('data-type');
        rows.forEach(function (row) {
          var match = (type === 'all' || row.getAttribute('data-type') === type);
          row.style.display = match ? '' : 'none';
          var sub = document.getElementById(row.getAttribute('data-target'));
          if (sub) sub.style.display = match ? '' : 'none';
        });
      });
    });
  });

  /* ---------- Nested list: title-row expand/collapse (e.g. 文案管理 主標題/副標題) ---------- */
  document.querySelectorAll('.title-row[data-target]').forEach(function (row) {
    row.addEventListener('click', function (e) {
      if (e.target.closest('.col-actions, .switch, .select-wrap, input, button, a, .daterange-trigger')) return;
      var sub = document.getElementById(row.getAttribute('data-target'));
      if (!sub) return;
      row.classList.toggle('open');
      sub.classList.toggle('open');
    });
  });

  /* ---------- Slide master-detail：清單列點擊 → 整個面板向左滑出帶出明細（含自身分頁），
     取代「向下展開」在明細筆數多、或可能同時展開多組時越展越長的問題（例如 優惠活動記錄）。
     可重複套用：清單列標 data-slide-target，對應 .slide-detail-set[data-detail-set]；
     清單列上的 data-<field> 會同步套用到 .slide-detail-header 內 [data-slide-field="<field>"] 元素 ---------- */
  document.querySelectorAll('.slide-master-detail').forEach(function (wrap) {
    var rows = wrap.querySelectorAll('.slide-panel-list [data-slide-target]');
    var detailSets = wrap.querySelectorAll('.slide-detail-set');
    var header = wrap.querySelector('.slide-detail-header');
    var backBtn = wrap.querySelector('[data-slide-back]');

    rows.forEach(function (row) {
      row.addEventListener('click', function () {
        var target = row.getAttribute('data-slide-target');
        detailSets.forEach(function (set) {
          set.classList.toggle('active', set.getAttribute('data-detail-set') === target);
        });
        if (header) {
          header.querySelectorAll('[data-slide-field]').forEach(function (el) {
            var field = el.getAttribute('data-slide-field');
            var val = row.getAttribute('data-' + field);
            if (val !== null) el.textContent = val;
          });
        }
        wrap.classList.add('detail-active');
      });
    });

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        wrap.classList.remove('detail-active');
      });
    }
  });

  /* ---------- Inline 表格編輯模式：清單頁「編輯」按鈕切換整張表格原地進入可編輯狀態（例如 VIP等級管理）。
     可重複套用：觸發鈕標 data-table-edit-trigger="<table id>"，工具列內對應的取消/保存鈕標
     data-table-edit-cancel="<table id>" / data-table-edit-save="<table id>"。
     表格內每個可編輯儲存格要有一對直接子元素：.cell-view（唯讀）+ .cell-edit（input/select-wrap/guild-perm-edit），
     由 <table> 的 .is-editing class 統一切換顯示（CSS 負責），這裡只負責綁定按鈕行為 + 取消時還原輸入值 + 保存時把
     編輯結果同步寫回 .cell-view，讓退出編輯模式後畫面呈現的是「保存後」的內容 ---------- */
  var STATUS_BADGE_MAP = { '正常': 'badge-success', '停用': 'badge-neutral', '晉級凍結': 'badge-warning', '下架': 'badge-warning' };

  document.querySelectorAll('[data-table-edit-trigger]').forEach(function (trigger) {
    var tableId = trigger.getAttribute('data-table-edit-trigger');
    var table = document.getElementById(tableId);
    var toolbar = trigger.closest('.table-toolbar');
    if (!table || !toolbar) { return; }

    var cancelBtn = toolbar.querySelector('[data-table-edit-cancel="' + tableId + '"]');
    var saveBtn = toolbar.querySelector('[data-table-edit-save="' + tableId + '"]');

    function enterEdit() {
      table.classList.add('is-editing');
      toolbar.classList.add('is-editing');
    }
    function exitEdit() {
      table.classList.remove('is-editing');
      toolbar.classList.remove('is-editing');
    }
    function resetInputs() {
      table.querySelectorAll('input.cell-edit[type="text"]').forEach(function (input) {
        input.value = input.defaultValue;
      });
      table.querySelectorAll('.select-wrap.cell-edit select').forEach(function (select) {
        Array.prototype.forEach.call(select.options, function (opt) {
          opt.selected = opt.defaultSelected;
        });
      });
      table.querySelectorAll('.guild-perm-edit.cell-edit input[type="checkbox"]').forEach(function (cb) {
        cb.checked = cb.defaultChecked;
      });
    }
    function applyChanges() {
      table.querySelectorAll('tbody td').forEach(function (td) {
        var view = td.querySelector(':scope > .cell-view');
        if (!view) return;

        var input = td.querySelector(':scope > input.cell-edit');
        if (input) { view.textContent = input.value; return; }

        var select = td.querySelector(':scope > .select-wrap.cell-edit select');
        if (select) {
          var text = select.options[select.selectedIndex].textContent;
          var badge = view.querySelector('.badge');
          if (badge) {
            badge.textContent = text;
            badge.className = 'badge ' + (STATUS_BADGE_MAP[text] || 'badge-neutral');
          }
          return;
        }

        var guildEdit = td.querySelector(':scope > .guild-perm-edit.cell-edit');
        if (guildEdit) {
          var tags = view.querySelectorAll('.guild-perm-tag');
          var checks = guildEdit.querySelectorAll('input[type="checkbox"]');
          tags.forEach(function (tag, i) {
            if (checks[i]) tag.classList.toggle('is-on', checks[i].checked);
          });
        }
      });
    }

    trigger.addEventListener('click', enterEdit);
    if (cancelBtn) cancelBtn.addEventListener('click', function () { resetInputs(); exitEdit(); });
    if (saveBtn) saveBtn.addEventListener('click', function () { applyChanges(); exitEdit(); });
  });

  /* ---------- Domain list expand/collapse (e.g. 站點設置 啟用網域) ---------- */
  document.querySelectorAll('.domain-list-toggle').forEach(function (btn) {
    var wrap = btn.closest('.domain-list');
    if (!wrap) return;
    var moreCount = btn.getAttribute('data-more-count');
    var label = btn.querySelector('.domain-list-toggle-label');
    btn.addEventListener('click', function () {
      wrap.classList.toggle('expanded');
      if (label) label.textContent = wrap.classList.contains('expanded') ? '收合' : ('顯示全部（還有 ' + moreCount + ' 筆）');
    });
  });

  /* ---------- Section tabs: functional tab switching (e.g. 站點設置 編輯頁籤) ---------- */
  document.querySelectorAll('.section-tabs[data-tabs-group]').forEach(function (tabsEl) {
    var group = tabsEl.getAttribute('data-tabs-group');
    var panels = document.querySelectorAll('.tab-panel[data-tabs-group="' + group + '"]');
    tabsEl.querySelectorAll('.section-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabsEl.querySelectorAll('.section-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var target = tab.getAttribute('data-tab-target');
        panels.forEach(function (p) { p.classList.toggle('active', p.id === target); });
        tabsEl.dispatchEvent(new CustomEvent('tabchange', { detail: { target: target } }));
      });
    });
  });

  /* ---------- Section tabs: animated hover indicator (sliding underline) ---------- */
  document.querySelectorAll('.section-tabs').forEach(function (tabsEl) {
    var tabs = Array.from(tabsEl.querySelectorAll('.section-tab'));
    if (!tabs.length) return;
    var indicator = document.createElement('span');
    indicator.className = 'section-tab-indicator';
    tabsEl.appendChild(indicator);

    function moveTo(tab, isActive) {
      indicator.style.left = tab.offsetLeft + 'px';
      indicator.style.width = tab.offsetWidth + 'px';
      indicator.classList.add('visible');
      indicator.classList.toggle('on-active', !!isActive);
    }
    function resetToActive() {
      var active = tabsEl.querySelector('.section-tab.active');
      if (active) {
        moveTo(active, true);
      } else {
        indicator.classList.remove('visible');
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('mouseenter', function () { moveTo(tab, tab.classList.contains('active')); });
    });
    tabsEl.addEventListener('mouseleave', resetToActive);
    resetToActive();
  });

  /* ---------- Drag-to-reorder table (e.g. 站點設置 大類排序) ---------- */
  document.querySelectorAll('table.drag-reorder').forEach(function (table) {
    var tbody = table.querySelector('tbody');
    if (!tbody) return;
    var rows = Array.from(tbody.querySelectorAll('tr'));
    var orderSlots = rows.map(function (tr) {
      var cell = tr.querySelector('.order-num');
      return cell ? cell.textContent.trim() : '';
    });
    var saveBtnId = table.getAttribute('data-save-btn');
    var saveBtn = saveBtnId ? document.getElementById(saveBtnId) : null;
    var dragEl = null;

    function renumber() {
      Array.from(tbody.querySelectorAll('tr')).forEach(function (row, i) {
        var cell = row.querySelector('.order-num');
        if (cell) cell.textContent = orderSlots[i] || '';
      });
    }

    rows.forEach(function (tr) {
      tr.setAttribute('draggable', 'true');
      tr.addEventListener('dragstart', function () {
        dragEl = tr;
        tr.classList.add('dragging');
      });
      tr.addEventListener('dragend', function () {
        tr.classList.remove('dragging');
        tbody.querySelectorAll('tr.drag-over').forEach(function (r) { r.classList.remove('drag-over'); });
      });
      tr.addEventListener('dragover', function (e) {
        e.preventDefault();
        tr.classList.add('drag-over');
      });
      tr.addEventListener('dragleave', function () {
        tr.classList.remove('drag-over');
      });
      tr.addEventListener('drop', function (e) {
        e.preventDefault();
        tr.classList.remove('drag-over');
        if (!dragEl || dragEl === tr) return;
        var all = Array.from(tbody.children);
        if (all.indexOf(dragEl) < all.indexOf(tr)) {
          tr.after(dragEl);
        } else {
          tr.before(dragEl);
        }
        renumber();
        if (saveBtn) saveBtn.disabled = false;
      });
    });
  });

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
  /* ---------- 維護設定 modal：標題帶入所屬遊戲商／遊戲大類（如「維護設定 - ATG」或「維護設定 - ATG（電子）」） ---------- */
  document.querySelectorAll('[data-modal-target="modalMaintenance"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var titleEl = document.querySelector('#modalMaintenance .modal-header h2');
      if (!titleEl) return;
      var row = btn.closest('tr');
      var inSubtable = btn.closest('table.subtable');
      var suffix = '';
      if (inSubtable) {
        var categoryName = row.querySelector('td:first-child').textContent.trim();
        var parentSubtitleRow = btn.closest('.subtitle-row');
        var platformName = '';
        if (parentSubtitleRow) {
          var platformRow = document.querySelector('.title-row[data-target="' + parentSubtitleRow.id + '"]');
          if (platformRow) platformName = platformRow.querySelector('.title-row-name').textContent.trim();
        }
        suffix = platformName + '（' + categoryName + '）';
      } else {
        var nameEl = row.querySelector('.title-row-name');
        suffix = nameEl ? nameEl.textContent.trim() : '';
      }
      titleEl.textContent = suffix ? ('維護設定 - ' + suffix) : '維護設定';
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

  /* ---------- Permission matrix: per-category select-all (checkbox merged into category title) ---------- */
  document.querySelectorAll('.perm-category').forEach(function (category) {
    var toggle = category.querySelector('.perm-category-toggle');
    if (!toggle) return;
    toggle.addEventListener('change', function () {
      category.querySelectorAll('.perm-table input[type="checkbox"]').forEach(function (cb) {
        cb.checked = toggle.checked;
      });
    });
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

  /* ---------- Toast (transient feedback message) ---------- */
  window.showToast = function (message) {
    var toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(function () { toast.classList.remove('show'); }, 2500);
  };

  /* ---------- Data table row selection: header checkbox <-> row checkboxes + selection hint ---------- */
  document.querySelectorAll('.data-table').forEach(function (table) {
    var headCb = table.querySelector('thead th:first-child input[type="checkbox"]');
    var rowCbs = table.querySelectorAll('tbody td:first-child input[type="checkbox"]');
    if (!headCb || !rowCbs.length) return;

    var hint = document.getElementById('selectionHint');
    function updateHint() {
      if (!hint) return;
      var checked = 0;
      rowCbs.forEach(function (cb) { if (cb.checked) checked++; });
      hint.textContent = checked > 0 ? ('已選擇 ' + checked + ' 筆') : '尚未選取任何項目';
    }

    headCb.addEventListener('change', function () {
      rowCbs.forEach(function (cb) { cb.checked = headCb.checked; });
      updateHint();
    });
    rowCbs.forEach(function (cb) {
      cb.addEventListener('change', function () {
        var allChecked = true;
        rowCbs.forEach(function (c) { if (!c.checked) allChecked = false; });
        headCb.checked = allChecked;
        updateHint();
      });
    });
  });

  /* ---------- 會員詳情：唯讀 / 編輯模式切換 ---------- */
  var detailFieldsWrap = document.getElementById('detailFieldsWrap');
  var editModeBtn = document.getElementById('editModeBtn');
  var cancelEditBtn = document.getElementById('cancelEditBtn');
  var saveEditBtn = document.getElementById('saveEditBtn');
  var viewActions = document.getElementById('viewActions');
  var editActions = document.getElementById('editActions');
  if (detailFieldsWrap && editModeBtn) {
    var enterEditMode = function () {
      detailFieldsWrap.classList.add('editing');
      viewActions.classList.add('hidden');
      editActions.classList.remove('hidden');
    };
    var exitEditMode = function () {
      detailFieldsWrap.classList.remove('editing');
      viewActions.classList.remove('hidden');
      editActions.classList.add('hidden');
    };
    editModeBtn.addEventListener('click', enterEditMode);
    cancelEditBtn.addEventListener('click', exitEditMode);
    saveEditBtn.addEventListener('click', function () {
      exitEditMode();
      showToast('已儲存變更');
    });
  }

  /* ---------- Date-range filter picker：雙月曆 + 時分秒，可重複用於任何「開始~結束」時間搜尋欄位 ---------- */
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function stripTime(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  document.querySelectorAll('.daterange-trigger').forEach(function (trigger) {
    var popover = document.getElementById(trigger.getAttribute('data-daterange-target'));
    if (!popover) return;
    var textEl = trigger.querySelector('.daterange-text');
    var placeholder = textEl.textContent;
    var summaryEl = popover.querySelector('.dr-summary');
    var leftCal = popover.querySelector('.dr-cal[data-cal="left"]');
    var rightCal = popover.querySelector('.dr-cal[data-cal="right"]');

    var today = stripTime(new Date());
    var viewMonth = new Date(today.getFullYear(), today.getMonth(), 1); // month shown by leftCal; rightCal = viewMonth+1
    var selStart = null, selEnd = null; // Date (time-stripped)
    var time = { start: { h: 0, m: 0, s: 0 }, end: { h: 23, m: 59, s: 59 } };

    function renderCal(calEl, monthDate) {
      var titleEl = calEl.querySelector('.dr-cal-title');
      titleEl.textContent = monthDate.getFullYear() + ' 年 ' + (monthDate.getMonth() + 1) + ' 月';
      var daysEl = calEl.querySelector('.dr-days');
      daysEl.innerHTML = '';

      var firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      var gridStart = new Date(firstOfMonth);
      gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay());

      for (var i = 0; i < 42; i++) {
        var d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
        var cell = document.createElement('span');
        cell.className = 'dr-day';
        cell.textContent = d.getDate();
        if (d.getMonth() !== monthDate.getMonth()) cell.classList.add('is-outside');
        if (sameDay(d, today)) cell.classList.add('is-today');
        if (selStart && sameDay(d, selStart)) cell.classList.add('is-range-start');
        if (selEnd && sameDay(d, selEnd)) cell.classList.add('is-range-end');
        if (selStart && selEnd && d > selStart && d < selEnd) cell.classList.add('is-in-range');
        cell.addEventListener('click', (function (day) {
          return function () { pickDay(day); };
        })(d));
        daysEl.appendChild(cell);
      }
    }

    function renderCals() {
      renderCal(leftCal, viewMonth);
      renderCal(rightCal, new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
    }

    function renderSummary() {
      if (!selStart) { summaryEl.textContent = '尚未選擇日期'; return; }
      if (popover.classList.contains('dr-single')) { summaryEl.textContent = fmtDate(selStart); return; }
      var s = fmtDate(selStart);
      var e = selEnd ? fmtDate(selEnd) : '請選擇結束日期';
      summaryEl.textContent = s + '  至  ' + e;
    }

    function fmtDate(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }

    /* 單一日期模式（例如任務設置的「無結束時間」開關開啟時）：每次點擊直接取代選取，不需要選兩次組成區間 */
    function pickDay(d) {
      d = stripTime(d);
      if (popover.classList.contains('dr-single')) {
        selStart = d; selEnd = d;
      } else if (!selStart || (selStart && selEnd)) {
        selStart = d; selEnd = null;
      } else {
        if (d < selStart) { selEnd = selStart; selStart = d; }
        else { selEnd = d; }
      }
      popover.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      renderCals();
      renderSummary();
    }

    /* 月曆導覽：上一年/上個月/下個月/下一年，兩個月曆一起跟著位移 */
    popover.querySelectorAll('.dr-nav').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var nav = btn.getAttribute('data-nav');
        if (nav === 'prev-year') viewMonth.setFullYear(viewMonth.getFullYear() - 1);
        else if (nav === 'prev-month') viewMonth.setMonth(viewMonth.getMonth() - 1);
        else if (nav === 'next-month') viewMonth.setMonth(viewMonth.getMonth() + 1);
        else if (nav === 'next-year') viewMonth.setFullYear(viewMonth.getFullYear() + 1);
        renderCals();
      });
    });

    /* 時分秒 stepper：保留上下箭頭調整，同時開放直接輸入數字 */
    popover.querySelectorAll('.dr-time-block').forEach(function (block) {
      var role = block.getAttribute('data-role'); // start | end
      block.querySelectorAll('.dr-stepper').forEach(function (stepper) {
        var unit = stepper.getAttribute('data-unit'); // h | m | s
        var valEl = stepper.querySelector('.dr-stepper-val');
        var max = unit === 'h' ? 23 : 59;

        stepper.querySelectorAll('.dr-stepper-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var dir = btn.getAttribute('data-dir') === 'up' ? 1 : -1;
            var v = time[role][unit] + dir;
            if (v < 0) v = max; if (v > max) v = 0;
            time[role][unit] = v;
            valEl.value = pad2(v);
          });
        });

        /* 只允許輸入數字，最多兩碼 */
        valEl.addEventListener('input', function () {
          valEl.value = valEl.value.replace(/\D/g, '').slice(0, 2);
        });
        /* 離開欄位或按 Enter 時，將輸入值鉗制在合法範圍並補零 */
        function commitValue() {
          var v = parseInt(valEl.value, 10);
          if (isNaN(v)) v = time[role][unit];
          if (v < 0) v = 0;
          if (v > max) v = max;
          time[role][unit] = v;
          valEl.value = pad2(v);
        }
        valEl.addEventListener('blur', commitValue);
        valEl.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { commitValue(); valEl.blur(); }
        });
        valEl.addEventListener('click', function (e) { e.stopPropagation(); });
      });
    });

    function closePopover() {
      popover.classList.remove('open');
      trigger.classList.remove('active');
    }
    function openPopover() {
      document.querySelectorAll('.daterange-popover.open').forEach(function (p) { if (p !== popover) p.classList.remove('open'); });
      document.querySelectorAll('.daterange-trigger.active').forEach(function (t) { if (t !== trigger) t.classList.remove('active'); });
      renderCals();
      renderSummary();
      popover.classList.remove('align-right');
      popover.classList.add('open');
      trigger.classList.add('active');
      // 若彈窗會超出視窗右側，改為靠右對齊，避免被裁切
      var rect = popover.getBoundingClientRect();
      if (rect.right > window.innerWidth) popover.classList.add('align-right');
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (popover.classList.contains('open')) closePopover(); else openPopover();
    });
    popover.addEventListener('click', function (e) { e.stopPropagation(); });

    /* 快捷區間：今天/最近7天/最近30天/本月/上月 → 同時帶入日期與時間欄位 */
    popover.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        popover.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');

        var t = stripTime(new Date());
        var start = new Date(t), end = new Date(t);
        var preset = chip.getAttribute('data-preset');
        if (preset === '7') { start.setDate(start.getDate() - 6); }
        else if (preset === '30') { start.setDate(start.getDate() - 29); }
        else if (preset === 'month') { start = new Date(t.getFullYear(), t.getMonth(), 1); }
        else if (preset === 'lastmonth') {
          start = new Date(t.getFullYear(), t.getMonth() - 1, 1);
          end = new Date(t.getFullYear(), t.getMonth(), 0);
        }
        selStart = start; selEnd = end;
        time.start = { h: 0, m: 0, s: 0 };
        time.end = { h: 23, m: 59, s: 59 };
        popover.querySelectorAll('.dr-time-block').forEach(function (block) {
          var role = block.getAttribute('data-role');
          block.querySelectorAll('.dr-stepper').forEach(function (stepper) {
            var unit = stepper.getAttribute('data-unit');
            stepper.querySelector('.dr-stepper-val').value = pad2(time[role][unit]);
          });
        });
        viewMonth = new Date(start.getFullYear(), start.getMonth(), 1);
        renderCals();
        renderSummary();
      });
    });

    var applyBtn = popover.querySelector('[data-daterange-apply]');
    if (applyBtn) {
      applyBtn.addEventListener('click', function () {
        if (popover.classList.contains('dr-single')) {
          if (selStart) {
            var singleStr = fmtDate(selStart) + ' ' + pad2(time.start.h) + ':' + pad2(time.start.m) + ':' + pad2(time.start.s);
            textEl.textContent = singleStr;
            textEl.title = singleStr;
            textEl.classList.remove('is-placeholder');
          }
        } else if (selStart && selEnd) {
          var startStr = fmtDate(selStart) + ' ' + pad2(time.start.h) + ':' + pad2(time.start.m) + ':' + pad2(time.start.s);
          var endStr = fmtDate(selEnd) + ' ' + pad2(time.end.h) + ':' + pad2(time.end.m) + ':' + pad2(time.end.s);
          var fullText = startStr + '  ~  ' + endStr;
          textEl.textContent = fullText;
          textEl.title = fullText; // 欄位過窄時可 hover 顯示完整區間
          textEl.classList.remove('is-placeholder');
        }
        closePopover();
      });
    }

    var clearBtn = popover.querySelector('[data-daterange-clear]');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        selStart = null; selEnd = null;
        time.start = { h: 0, m: 0, s: 0 };
        time.end = { h: 23, m: 59, s: 59 };
        popover.querySelectorAll('.dr-time-block').forEach(function (block) {
          var role = block.getAttribute('data-role');
          block.querySelectorAll('.dr-stepper').forEach(function (stepper) {
            var unit = stepper.getAttribute('data-unit');
            stepper.querySelector('.dr-stepper-val').value = pad2(time[role][unit]);
          });
        });
        popover.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
        viewMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        renderCals();
        renderSummary();
        textEl.textContent = placeholder;
        textEl.removeAttribute('title');
        textEl.classList.add('is-placeholder');
      });
    }
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.daterange-popover.open').forEach(function (p) { p.classList.remove('open'); });
    document.querySelectorAll('.daterange-trigger.active').forEach(function (t) { t.classList.remove('active'); });
  });

  /* ---------- 會員清單：批量調整VIP等級 ---------- */
  var bulkVipBtn = document.getElementById('bulkVipBtn');
  if (bulkVipBtn) {
    bulkVipBtn.addEventListener('click', function () {
      var checkedCount = document.querySelectorAll('.data-table tbody td:first-child input[type="checkbox"]:checked').length;
      if (checkedCount === 0) {
        showToast('請至少選擇一位會員');
        return;
      }
      var level = document.getElementById('bulkVipSelect').value;
      showToast('已將 ' + checkedCount + ' 位會員調整為 ' + level);
    });
  }

  /* ---------- Searchable select (combo-select)：輸入文字篩選下拉選項（例如遊戲平台，選項會隨營運時間增加） ---------- */
  document.querySelectorAll('.combo-select').forEach(function (wrap) {
    var input = wrap.querySelector('.combo-select-input');
    var menu = wrap.querySelector('.combo-select-menu');
    var options = Array.from(menu.querySelectorAll('.combo-select-option'));
    var lastValue = input.value;

    function filterOptions(query) {
      var q = query.trim().toLowerCase();
      var anyVisible = false;
      options.forEach(function (opt) {
        var match = !q || opt.textContent.toLowerCase().indexOf(q) !== -1;
        opt.classList.toggle('hidden', !match);
        if (match) anyVisible = true;
      });
      var empty = menu.querySelector('.combo-select-empty');
      if (!anyVisible) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'combo-select-empty';
          empty.textContent = '無符合選項';
          menu.appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
    }

    function openMenu() {
      document.querySelectorAll('.combo-select-menu.open').forEach(function (m) { if (m !== menu) m.classList.remove('open'); });
      filterOptions(input.value === lastValue ? '' : input.value);
      menu.classList.add('open');
    }
    function closeMenu() { menu.classList.remove('open'); }

    input.addEventListener('focus', openMenu);
    input.addEventListener('click', openMenu);
    input.addEventListener('input', function () { filterOptions(input.value); menu.classList.add('open'); });

    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        options.forEach(function (o) { o.classList.remove('is-selected'); });
        opt.classList.add('is-selected');
        input.value = opt.textContent;
        lastValue = opt.textContent;
        closeMenu();
      });
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        input.value = lastValue;
        closeMenu();
        input.blur();
      } else if (e.key === 'Enter') {
        var visible = options.filter(function (o) { return !o.classList.contains('hidden'); });
        if (visible.length === 1) visible[0].click();
        e.preventDefault();
      }
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) {
        var matched = options.some(function (o) { return o.textContent === input.value; });
        if (!matched) input.value = lastValue;
        closeMenu();
      }
    });
  });

  /* ---------- 表格欄位顯示設定（col-toggle）：欄位數量較多的清單頁，讓操作者自選要顯示哪些欄位（類似 Excel 隱藏欄）---------- */
  document.querySelectorAll('[data-col-toggle-target]').forEach(function (wrap) {
    var table = document.getElementById(wrap.getAttribute('data-col-toggle-target'));
    var trigger = wrap.querySelector('.col-toggle-trigger');
    var selectAllBtn = wrap.querySelector('.col-toggle-selectall');
    var checkboxes = wrap.querySelectorAll('.col-toggle-item input[type="checkbox"]');
    if (!table || !trigger) return;
    var headerRow = table.querySelector('thead tr');

    function setColVisible(key, visible) {
      var th = headerRow.querySelector('th[data-col="' + key + '"]');
      if (!th) return;
      var idx = Array.prototype.indexOf.call(headerRow.children, th);
      th.classList.toggle('col-hidden', !visible);
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        var cell = tr.children[idx];
        if (cell) cell.classList.toggle('col-hidden', !visible);
      });
    }

    function updateSelectAllLabel() {
      var allChecked = Array.prototype.every.call(checkboxes, function (cb) { return cb.checked; });
      if (selectAllBtn) selectAllBtn.textContent = allChecked ? '取消全選' : '全選';
    }

    checkboxes.forEach(function (cb) {
      cb.addEventListener('change', function () {
        setColVisible(cb.getAttribute('data-col'), cb.checked);
        updateSelectAllLabel();
      });
    });

    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', function () {
        var willCheckAll = selectAllBtn.textContent === '全選';
        checkboxes.forEach(function (cb) {
          cb.checked = willCheckAll;
          setColVisible(cb.getAttribute('data-col'), willCheckAll);
        });
        updateSelectAllLabel();
      });
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      wrap.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) wrap.classList.remove('open');
    });
  });
});
