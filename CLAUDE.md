# DesignBackend — 後台管理系統重新設計

## 專案概述

這是一個**純靜態 HTML/CSS/vanilla JS** 的後台管理系統設計 mockup，沒有任何 build 工具或框架。目的是取代現有很醜、缺乏設計感的中文遊戲/代理平台後台，做出來給前端團隊看，讓他們照著實作。

沒有真實資料串接 — 所有表格/表單都用寫死的、看起來真實的中文範例資料填滿（不要留空、不要用「暫無資料」佔位，除非該分頁真的還沒提供畫面）。

## 檔案結構

```
login.html                  # 登入頁
pages/*.html                 # 各功能頁面
css/tokens.css               # 設計 token（色彩/間距/字級/圓角/陰影）
css/base.css                 # 基礎樣式
css/layout.css               # App shell 版面（sidebar/topbar/tabsbar）
css/components.css           # 所有共用元件樣式（最常修改的檔案）
css/login.css                # 登入頁專用樣式
js/shell.js                  # NAV 陣列 → 產生 sidebar/topbar/tabsbar/breadcrumb
js/app.js                    # 所有互動邏輯，集中寫在單一 DOMContentLoaded 區塊
.claude/launch.json          # 本地預覽用 dev server 設定（python3 -m http.server 8743）
```

新增頁面時：複製既有頁面結構（`<div class="app-shell">` → sidebar/topbar/tabsbar/main），設定 `window.CURRENT_TAB` 與 `window.PAGE_BREADCRUMB`，並在 `js/shell.js` 的 NAV 陣列裡登記 href。

## 設計系統

- **主色** `--color-primary: #4F46E5`（深紫藍），輔助強調色 `--color-info: #3D82C4`（藍）用於次要強調／交錯配色。
- **語意色**：success/warning/danger/info 都有 base/hover/light/border 四階，共用同一組色調家族，讓所有 badge/pill/狀態色在視覺上一致。
- **中性色**：text-primary/secondary/tertiary 三階灰階；bg-page/bg-card/bg-subtle/bg-hover 四階背景。
- **字級**：12/13/14/15/16/18/20px（xs/sm/base/md/lg/xl/2xl）— 刻意偏小，避免後台頁面字級過大。
- **間距**：8px 基準尺（4/8/12/16/20/24/32/40px）。
- **Sidebar**：深色 `#12172B`，寬 240px（收合 72px）。
- 色彩、間距、圓角、陰影一律用 `css/tokens.css` 的 CSS variable，不要 hardcode 數值。

## 核心設計原則（使用者明確要求）

1. **操作性優先於視覺花俏**：這是給客服/營運人員用的內部後台工具，不是消費性產品。簡潔 ≠ 簡陋 — 目標是「做得好的簡潔」，不是隨便少放東西。
2. **資訊密度要高**：不要因為字級太大、間距太鬆而讓一頁資料要滾動很多次才看得完。detail/表單頁優先考慮較緊湊的排版（例如多欄 grid 呈現唯讀統計欄位）。
3. **不要留下沒必要的空白**：色彩、間距、分節都要有理由，避免把一屏內容硬拆成要滾動好幾屏的稀疏版面。
4. **Modal vs. 整頁導覽要有明確規則**，不能像原本後台一樣新增用整頁、編輯用彈窗這樣不一致：
   - **Modal**：單一動作、欄位 ≤ 8 個、沒有子資源/子表格（例如重置密碼、序號詳情、維護設定）。
   - **整頁**：欄位 > 8 個，或含有子表格/子資源（例如站長遊戲權限、幣商設定編輯含 SID 子表）。
   - 同一實體的「新增」與「編輯」必須用同一種模式（都 modal 或都整頁），不要一個 modal 一個整頁。
5. **分頁元件只在真的需要時顯示**：若資料只有一頁，不要顯示 << < 1 > >> 分頁列。
6. **不要因為「有外層清單 + 編輯頁」這種結構就硬拆成兩頁**：如果拆開後兩頁內容都很單薄，就合併成一頁。
7. **不要只因為資料存在就顯示**：沒有實際用途的欄位（例如清單頁裡意義不大的網域清單）該拿掉。
8. **色彩不受原後台既有配色限制**，使用者給 Claude 完全自由發揮（原後台是綠/橘配色 + 白/淺灰背景、登入頁深紫背景）。

## 共用元件模式（`css/components.css` + `js/app.js`）

- **`.data-table`**：標準表格，`td { border-top: 1px solid var(--color-border); vertical-align: middle }`，`.col-actions` 是黏性最右欄。
- **`.title-row` / `.subtitle-row`**（主標題/展開明細）：`.title-row[data-target]` 點擊切換 `.open`，展開對應 `#id` 的 `.subtitle-row`。左側強調色線用 `box-shadow: inset 3px 0 0 var(--row-accent)`，僅在 `.open` 時顯示。
  - **交錯配色**：相鄰展開項目要輪流套用 `.accent-a`（預設，紫）/`.accent-b`（藍），必須同時標在 `.title-row` 與對應的 `.subtitle-row` 上，避免連續展開時分不清彼此邊界。
  - **⚠️ 重要 CSS 陷阱**：`<td>` 絕對不能直接套用 `display: flex`，會讓該儲存格脫離表格版面計算（瀏覽器視為自成一格），導致高度只跟著自身內容走、無法撐滿同列其他儲存格高度，造成左側強調色線斷裂。正確做法：`vertical-align: middle` 對齊儲存格，內部子元素（如 `.row-expand-btn`）用 `display: inline-flex` + `margin-right`。
- **`.section-tabs` / `.section-tab`**：頁籤列，功能性切換靠 `data-tabs-group` 屬性（`.section-tabs[data-tabs-group]` 對應 `.tab-panel[data-tabs-group]`），點擊會 dispatch 自訂事件 `tabchange`（`detail.target` 為目標 panel id）供頁面邏輯掛勾。
  - 一律 `cursor: pointer`。
  - hover 顏色 `--color-info`（藍），active 顏色 `--color-primary`（紫）— 兩者刻意不同色，滑過 active 分頁本身時維持 active 色不變。
  - 動態底線指示器（`.section-tab-indicator`）：滑鼠移到哪個分頁，底線就滑到哪，顏色跟隨 hover/active 狀態（`on-active` class 切換為紫色，否則為藍色 hover 色）；滑出整個頁籤列時滑回目前 active 分頁。這段邏輯在 `js/app.js` 裡是通用綁定，套用到**所有** `.section-tabs`，不限於單一頁面。
- **`.domain-list` / `.domain-list-more` / `.domain-list-toggle`**：長度不定的網域清單，收合成一致列高，點擊展開/收合並切換按鈕文字。
- **`table.drag-reorder`**（配 `data-save-btn="<按鈕id>"`）：拖曳 `.drag-handle` 調整列順序，原生 HTML5 drag events，保留原本的排序數字槽位（例如 1,2,4 不重新編號），放開後啟用對應的保存按鈕。
- **`.template-grid` / `.template-card`**（配 `.count-1` 修飾）：版型選擇卡片；只有一個選項時用 `.count-1` 切成寬版橫式卡片（左圖右資訊），避免只有一筆資料時版面顯得空。
- **`.daterange-trigger` / `.daterange-popover`**：全站統一的日期區間選擇器（雙月曆 + 時分秒 stepper + 快速區間 chip：今天/最近7天/最近30天/本月/上月），原本用於篩選列，也可以直接搬進 modal 內共用同一元件（見 `#modalMaintenance` 臨時維護欄位）。放進 modal 時注意兩點：① 外層容器要用 `.field`（有 `position:relative`）而不是 `.form-field`（沒有），否則 popover 定位錯誤；② `.modal-body` 預設 `overflow-y:auto` 會裁切 popover，要針對該 modal id 加 `#modalXxx .modal-body { overflow: visible; }`。**規則**：任何互動式日期區間選擇器一律要有這排快速選擇 chip，不需要每次都手動確認——`js/app.js` 對 `data-daterange-target` 有對應 `.daterange-popover` 的 trigger 才會綁定互動邏輯（若屬性缺失或找不到對應 popover 會直接 no-op），這正是 add/edit 頁裡「純視覺、顯示單一已設定值」的 `.daterange-trigger`（沒有 popover）跟真正互動式篩選用日期選擇器的區別，前者本來就不需要、也不會有 chip。
- **`.combo-select`**：可輸入文字篩選的搜尋式下拉選單（type-to-filter combobox），取代選項數量會持續增加的欄位用的原生 `<select>`（目前用於全站所有「遊戲平台」欄位）。結構：`.combo-select[data-combo-select] > input.combo-select-input（顯示/輸入用文字框） + .combo-select-menu > .combo-select-option（每個選項，目前選中的加 .is-selected）`，無符合結果時動態插入 `.combo-select-empty`。行為（`js/app.js`）：點擊/focus 開啟選單；輸入文字即時篩選（大小寫不敏感、子字串比對）；點擊選項即選取並關閉；Esc 還原成上次有效值並關閉；Enter 在篩選後僅剩一個選項時自動選取；點擊元件外部若目前文字不完全匹配任一選項則還原成上次有效值。新增「選項會隨時間增加」的欄位（例如未來可能有的遊戲廠商、第三方服務商等清單）優先考慮套用這個元件，而不是原生 `<select>`。
- **`.chip-select`**：外觀模擬 select 的框（含右側下拉箭頭 `::after`），內含可移除的標籤（`.chip-select-tag` + 內嵌 `×` 按鈕），用於「顯示目前已選項目、可移除」的欄位（例如站點設置 > 客服 的狀態欄）。
- **`.url-input-group`**：合併呈現的「通訊協定 select + 網域 input」，兩者邊框相鄰處互相去除、圓角只留外側，視覺上是一個整體控制項（例如站點設置 > 客服 的網址欄）。
- **`.upload-field` / `.upload-thumb`**（含 `.empty`/`.square` 修飾）：圖片上傳 UI，縮圖框 + 「選擇圖片」按鈕（`.btn-secondary.btn-sm` + plus icon）+ 下方 `.text-xs.text-tertiary.mt-2` 提示檔案限制文字，全站共用（優惠文案、客服 QR Code 等）。
- **`.radio-field` / `.radio-group`**：簡單二選一（例如 否/是）用 `<label class="radio-field">` 兩個並排，外層包 `.radio-group`（`display:flex; gap`），不需要额外元件。
- **`.btn:disabled`**：`opacity: .5; cursor: not-allowed; pointer-events: none;`。
- **`.page-size-select`**：尺寸樣式一定要下在**內層 `<select class="select">`**，不要下在外層 `.select-wrap`，否則會雙重 padding 造成文字被裁切（曾經全站 5 個頁面都中這個 bug）。
- **麵包屑（breadcrumb）連結規則**：`js/shell.js` 的 `renderBreadcrumb()` 會自動比對 `window.PAGE_BREADCRUMB` 每一層文字是否對應到 NAV 陣列裡的實際頁面（一級選單無主頁或子選單項目 `href`），只有「中間層」且有對應頁面時才轉成可點擊連結；第一層（通常是無主頁的一級選單分類）與最後一層（當前頁面）一律純文字，不需要、也不應該有連結。全站通用，不用每頁手動處理。
- **多欄位表格若某欄有「彈性內容」（例如 `.upload-field` 這種內容較寬、或 `.url-input-group` 這種需要固定最小寬度的元件）**：瀏覽器的表格自動版面配置只會把 `<th style="width:...">` 當作起始建議值，內容較寬的欄位仍會擠壓其他有指定寬度的欄位（即使那些欄位也寫了 `width`）。這種情況要在 `<table>` 上加 `style="table-layout:fixed;"` 並確保每欄都有明確寬度（至多留一欄不設寬度、讓它吃剩餘空間），寬度才會真正被遵守。

## 開發/驗證流程

- 本地預覽用 `.claude/launch.json`（`python3 -m http.server 8743`）+ `mcp__Claude_Preview__*` 工具（`preview_start`/`preview_eval`/`preview_screenshot`/`preview_resize`）實際渲染頁面、用 `getBoundingClientRect()`/`getComputedStyle()` 量測，而不是只看程式碼猜測效果 — 這是抓到 `display:flex` on `<td>` 那個 bug的方法。
- HTML 大幅修改後，用 Python regex 統計標籤是否配對（`<div`/`</div>`、`<table`/`</table>`、`<tr`/`</tr>`、`<td`/`</td>`、`<th`/`</th>`），注意要用 `<tag[ >]` 這種 pattern 避免 `<thead` 誤判成 `<th` 的子字串。
- 完成修改後主動用 preview 截圖 + eval 驗證再回報使用者，不要只憑猜測回報「已完成」。

## 使用者協作習慣

- 使用者不是設計師，但有約十年前的前端經驗、信任 Claude 的設計判斷，期待的是「真正做好設計」而非保守微調 — 可以大膽提出設計方向。
- 畫面需求常常是**分批用截圖說明**（一次最多約 5 張），並描述每張截圖的行為細節。收到「還有其他頁籤/畫面我會陸續補」這類訊息時，先完成目前收到的部分，等待後續截圖，不用催促。
- 使用者會直接指出「這裡很醜/很難閱讀」「排版跟原本差不多」這類坦率回饋，代表要提出**真正不同、更好**的排版方案，不是小修小改。
- 對於通用元件（頁籤 hover 效果、pagination 顯示邏輯等），使用者常說「檢查一下全站」— 修 bug 或加效果時預設套用到所有使用該元件的頁面，不要只改當下這一頁。

## 目前進度

已完整建置的頁面（帳號管理 8 個子項全部完成）：
`login.html`、`pages/sub-accounts.html`、`pages/site-owners.html`、`pages/members.html`（含新增的 `.col-toggle` 欄位顯示設定）、`pages/member-detail.html`、`pages/member-registration.html`、`pages/currency-providers.html` + `pages/currency-provider-edit.html`、`pages/role-permissions.html`、`pages/site-owner-sub-accounts.html`、`pages/permission-groups.html` + `pages/permission-group-edit.html`、`pages/promotion-records.html`、`pages/promotion-copy.html` + add/edit、`pages/copywriting.html` + subtitle add/edit、`pages/redeem-codes.html` + add/edit/detail、`pages/site-settings.html` + `pages/site-settings-edit.html`。

`pages/site-settings-edit.html` 7 個頁籤（站台資料/遊戲大類資料/大類排序/外觀設置/客服/溫馨提醒設定/保險箱機制）已全部依截圖建置完成。

其餘側邊欄一級選單（現金系統、公告訊息、短信管理、報表、簽到管理、黑名單管理、操作記錄）大多仍是 `href="#"` 佔位，尚未收到畫面需求。`權限群組 > 新增` 的完整權限矩陣內容已經拿到（13 大類 sub-module + action checkbox），但尚未確認是否要據此把其餘一級選單展開成完整子選單。

`VIP設置`（子選單目前已確認 VIP等級管理、VIP等級明細、層級設置 三項，其餘子項尚未收到畫面需求，故不預先猜測）已完成：`pages/vip-levels.html`（清單頁，單一 站台 篩選 + 狀態/設定卡片——VIP 為累計制，`#modalVipStatus` 內含 啟用/停用 radio + 唯讀 `.date-input` 顯示累計起始時間、文案註明「設定後不可更改」+ 10 級 VIP1–VIP10 資料表，2 列表頭用 `rowspan`/`colspan` 呈現「晉級條件」底下的 總累積儲值值/總累積遊玩點數 兩個子欄位，全部套用標準 `.data-table`（本身已有 `white-space:nowrap`）+ `table-layout:fixed` 明確欄寬 + `.table-scroll` 橫向捲動，解決舊後台表頭文字大量換行的問題；VIP 等級數固定不分頁）。

新增元件：`.guild-perm-tags` / `.guild-perm-tag(.is-on)`（同一儲存格內橫向並排的 2 個短標籤，取代舊後台「創立公會/加入公會」2 個 checkbox + 完整標籤文字直向堆疊的呈現方式，一眼看出兩種布林權限是否開放，不佔垂直空間）、`.vip-tier-badge(.tier-bronze/.tier-silver/.tier-gold/.tier-prestige)`（色彩分組的等級圖示，取代舊後台的等級勳章圖片——沒有真實圖片素材時優先用 CSS 色塊分組表示區間，而非用佔位圖片）。

**狀態卡片的互動改為點擊狀態本身觸發設定**：`vip-levels.html` 頂部狀態卡片原本是「狀態」文字 + 唯讀 `.badge` + 獨立「設定」按鈕，改成比照 `task-settings.html` 狀態 pill 的既有慣例——狀態本身用 `.pill-btn-neutral`（配 `.pill-btn-caret` 下拉箭頭圖示）呈現且可點擊，點擊直接觸發 `data-modal-target="modalVipStatus"` 開啟設定彈窗，不需要額外的「設定」按鈕；卡片右側只留連結整頁的按鈕（文字為「VIP 機制設定」）。表格上方觸發 inline 編輯模式的按鈕文字為「編輯各 VIP 等級數值」（比單純「編輯」更明確指出是在編輯表格內的等級數值，而非整個頁面設定）。全站若有其他「狀態文字 + 獨立設定/編輯按鈕」並存的欄位，可比照這個模式合併，減少同一張卡片裡的重複互動元件。

**`pages/vip-reward-settings.html`（回饋機制設定，從 `vip-levels.html` 狀態卡片的「回饋機制設定」按鈕進入）**：舊後台原本是彈窗 + 6 個頁籤（晉級設定/晉級禮金設定/每月回饋設定/每週回饋設定/發財金設定/補給金設定），共 20 個欄位——欄位數遠超過 modal 的 8 欄門檻，該轉整頁沒有疑義；但如果只是把 6 個頁籤原封不動搬到整頁、一次仍只顯示一個頁籤，並沒有解決「每個頁籤內容量都偏少（2-4 欄）、切換過去還是一大片空白」的根本問題（跟核心原則 6「拆開後兩頁都很單薄就該合併」是同一道理，只是換成頁籤版本）。改為：站台欄位只留一份在最上方（原本 6 個頁籤各自重複一份是多餘的）；「晉級設定」（欄位量最大，含平台/狀態/週期/條件）獨立一個 `.form-grid` 區塊；其餘 5 個同性質的「回饋機制」類設定（晉級禮金/每月回饋/每週回饋/發財金/補給金，多數共用「點數流水倍數」「流水限大類」開頭 2 欄）改用新元件 `.settings-tile-grid` / `.settings-tile`（3 欄 grid 並列小卡片，`align-items:start` 讓內容量少的卡片不被拉伸出多餘空白）一次全部呈現，不用來回切換就能互相比較各回饋類型的倍數設定。原本舊後台「有效投注計算平台」多選欄位另外搭配一個常駐展開的清單框（顯示可加入的平台），與全站既有的 `.chip-select`（已支援「顯示目前已選項目、可移除」）功能重疊，故直接用 `.chip-select` 取代、拿掉多餘的常駐清單框。

**Inline 表格編輯模式**（`vip-levels.html` 的「編輯」按鈕）：舊後台點擊「編輯」會把清單原地轉成編輯框，但版型會壞掉（圖示比例跑掉、「創立公會/加入公會」checkbox 擠成一直線）。新版做法：`.table-toolbar` 內 `.toolbar-actions-default`（編輯鈕）/`.toolbar-actions-editing`（取消/保存更改鈕）依 `.table-toolbar.is-editing` 切換；`<table>` 加 `.is-editing` 後，每個可編輯儲存格內 `.cell-view`（唯讀 badge/文字/`.guild-perm-tags`）與 `.cell-edit`（`input`/`.select-wrap > select`/`.guild-perm-edit` 內的 checkbox 組）互相切換顯示。屬性綁定：觸發鈕 `data-table-edit-trigger="<table id>"`，工具列內對應 `data-table-edit-cancel="<table id>"` / `data-table-edit-save="<table id>"`（`js/app.js` 通用綁定，套用到所有符合此結構的表格）。取消會用 `defaultValue`/`defaultSelected`/`defaultChecked` 還原所有輸入值；保存會把編輯結果同步寫回 `.cell-view`（含依 `STATUS_BADGE_MAP` 同步 badge 顏色）。**避開舊後台兩個 bug 的關鍵**：① 圖示欄（`.vip-tier-badge`）完全不做 `.cell-view`/`.cell-edit` 切換，固定不可編輯，保留其原生 40×40 尺寸不受影響；② `.guild-perm-edit` 明確給 `display:flex`（CSS 用 4-class 選擇器 `.data-table.is-editing .guild-perm-edit.cell-edit` 蓋過其餘 `.cell-edit` 通用的 `display:block`），確保 2 個 checkbox 橫向並排、不會因預設 block 排列而疊成一直線。結構性「不適用」的欄位（例如 VIP1 的數值都是 `-`）不套用 `.cell-view`/`.cell-edit`，維持純文字、編輯模式下也不可編輯。

`任務管理`（子選單：任務設置 + 玩家任務記錄）已完成：`pages/task-settings.html`（清單頁，站台/任務類型/任務名稱/VIP等級/狀態/任務期間篩選、`table.drag-reorder` 前台排序、3 狀態 pill 按鈕 啟用/停用/下架 皆點擊開啟 `#modalTaskStatus` 更改狀態——**注意**：狀態變更 modal 一律用「單一 select 呈現全部 N 個真實選項」，不要照抄舊後台那種「排除目前狀態、下拉只剩一個選項可選」的爛 UX）+ `pages/task-settings-add.html` / `pages/task-settings-edit.html`（新增/編輯共用單頁版面，不分頁籤，`.section-label` 分節「基本設定」「獎勵/任務條件」——原始截圖是 2 個頁籤，但兩頁籤內容都偏少、版面空白過多，依核心原則 6 合併成單頁）+ `pages/task-records.html`（清單頁，依舊後台截圖重新設計版面，不照抄原本樣式；套用 `.col-toggle` 欄位設定，共 12 個資料欄位可自選顯示/隱藏；「獎勵派發時間 > 詳情」開啟 `#modalRewardDetail`，用 `.detail-grid` 摘要（任務名稱/次數規則/領取次數/獎勵總計）+ `.subtable` 派發明細取代舊後台空洞排版；「操作 > 強制完成」開啟 `#modalForceComplete` 標準確認 modal）。

**⚠️ 狀態變更 modal 的選項不等於狀態 pill 的種類**：`#modalTaskStatus` 的 select 只列「啟用」「停用」兩個可手動選擇的目的狀態，不含「下架」——下架是系統依時間到期等條件自動產生的狀態，不是人工可以指定切換過去的目的地。已下架的列仍保留點擊 pill 開啟同一個 modal 的能力（可手動改回啟用/停用），但 modal 本身的下拉選項要拿掉「下架」這個選項。日後若有其他「系統自動產生、人工不可指定」的狀態類型，比照辦理。

新增元件：`.pill-btn-warning`（第 3 種狀態「下架」，沿用 `--color-warning` 家族，結構同 `.pill-btn-success`/`.pill-btn-danger`）、`.date-input`（單一日期時間顯示用的視覺元件，區別於既有的日期區間選擇器 `.daterange-trigger`，目前僅視覺、未接互動日曆）、`.section-label`（非互動的純分節標題，用於取代頁籤的合併單頁場景）。

`pages/vip-level-detail.html`（VIP設置 > VIP等級明細，側邊欄子選單，會員 VIP 等級異動的稽核清單）：篩選列站台/SID（`.field-row`+`.btn-icon-add`）/更新時間（必填，`.daterange-trigger`/`.daterange-popover`）/VIP等級/晉級方式共用既有元件。**必填的多選 `.chip-select` 篩選欄位，預設要把全部選項都預先勾選好**（本頁「晉級方式」三個值 系統晉級/手動晉級/手動降級 一進頁面就全部以 `.chip-select-tag` 呈現），讓使用者一進頁面就能直接按搜尋，而不是像舊後台那樣因為必填欄位空白而卡住、逼使用者先手動選過一輪——`.chip-select` 本身沒有 JS 互動綁定（純視覺呈現目前已選項目），所以「預設全選」只需要把三個 `.chip-select-tag` 直接寫進初始 HTML，不需要額外邏輯。任何其他「必填的多選類篩選欄位」都比照此例，預設全選而非留空。清單表格把舊後台「VIP等級」「原本等級」兩個獨立欄位合併成單一「等級異動」欄，用新元件 `.level-change`/`.level-change-arrow`（`.is-up` 綠色/`.is-down` 紅色方向箭頭）呈現，一眼看出晉級或降級，不用左右比對兩欄數字；晉級方式欄位依語意套用 badge 顏色（系統晉級=info、手動晉級=success、手動降級=danger）。「詳情」開啟的 `#modalVipLevelDetail` 改用 `.detail-grid`（等級異動同樣用 `.level-change` 呈現、晉級方式/更新時間/更新人員）取代舊後台醜陋的交錯底色表格，且標題比照 `task-records.html` 的 `#modalRewardDetail` 慣例，加上會員 SID 作為次要 meta 文字（例如「VIP等級變更詳情　會員：252169937」），比單純「詳情」更明確。

`pages/vip-tier-settings.html`（VIP設置 > 層級設置，側邊欄子選單，站台/VIP等級篩選 + 清單表格：等級名稱/會員人數/更新人員/更新時間/操作，10 級固定不分頁）+ `pages/vip-tier-members.html`（點擊「會員人數」數字進入的子頁面，SID 篩選＋等級 select 切換查看對象＋`.data-table`（SID/登入次數/創建時間/操作）＋`.pagination`，「編輯」開啟 `#modalEditMemberLevel` 手動調整該會員層級）+ `pages/vip-tier-deposit-settings.html`（點擊「出入款設定」進入的整頁，`.section-tabs` 三方/贈送+禮金 兩頁籤，各自欄位量足夠（5～9 欄）不需要合併）。**綁定等級支付從舊後台「假設多間供應商並列」的表格/清單框排版改為 Modal**：欄位只有「會員等級（唯讀）+ 支付供應商」2 個，遠低於 modal 的 8 欄門檻，且無子表，不該做成整頁；目前僅接入 MyCard 一家，新元件 `.provider-list`/`.provider-row`（logo 縮圖 + 名稱 + 右側 `.switch` 開關）用「一列一個供應商」取代舊後台的多欄並列版面，之後供應商增加時只需要疊加更多 `.provider-row`，不需要為了「目前只有一項」預先假設多欄排版（也不會像舊後台那樣只有一項卻套用多欄 grid 導致版面空洞）。三個頁面站台/VIP等級的篩選只在 `vip-tier-settings.html` 清單頁做一次，子頁面（出入款設定、會員列表、綁定等級支付 modal）皆不重複顯示站台選擇，只在標題旁用唯讀文字標示目前設定對象（例如「出入款設定　VIP1」）。

**⚠️ 新 CSS 陷阱（switch 連動欄位顯示/隱藏的 race condition）**：`js/app.js` 的通用 `.switch` 點擊監聽（負責切換 `.on` class）是包在 `DOMContentLoaded` 內才註冊，會晚於頁面 inline script 對同一元素註冊的監聽。若頁面自訂監聽在 callback 內用 `switchEl.classList.contains('on')` 判斷「目前狀態」來決定連動欄位顯示與否，讀到的其實是「切換前」的舊值，導致欄位可見度永遠慢一拍（`task-settings-add.html`/`-edit.html` 的「無結束時間」開關曾中這個 bug，已修正）。正確寫法：用 `var willBeOn = !switchEl.classList.contains('on');` 算出「即將變成的狀態」再套用到連動欄位，不要依賴讀取當下 class。

**`.daterange-popover.dr-single`（單一日期模式）**：共用日期區間元件的新變體，讓同一個 `.daterange-popover` 執行時在「選區間」與「選單一日期」兩種模式間切換，不需要另建元件。用法：對 `.daterange-popover` 加/移除 `dr-single` class（例如依「無結束時間」開關即時切換）。加上此 class 後會隱藏 `.dr-presets`（快速選擇 chip）、右側月曆（`.dr-cal[data-cal="right"]`）、結束時間欄（`.dr-time-group[data-role="end"]`），只留左側單一月曆 + 開始時間 stepper。`js/app.js` 內 `pickDay`/`renderSummary`/套用按鈕的邏輯都是即時檢查 `popover.classList.contains('dr-single')`（不是設定時快取），所以外部開關可以隨時切換模式而不用重新綁定事件。實例：`task-settings-add.html`/`-edit.html` 的「起訖時間」欄位。

**欄位「開/關某個子欄位」導致版面跳動的標準解法**：不要讓欄位本身消失/出現（會讓 CSS grid 重排、擠壓/移動其他兄弟欄位）。改成欄位固定存在，只切換欄位「內部內容/模式」（例如上面的 `dr-single`、或切換 label 文字）。`task-settings-add.html`/`-edit.html` 的「起訖時間 ↔ 開始時間」欄位是這個模式的範例：「無結束時間」開關切換時只換 label 文字 + 加/移除 popover 的 `dr-single` class，欄位本身的 `.form-field` 永遠存在、永遠佔same的版位，所以下方 次數規則/次數上限、SID白/黑名單、標題圖片/內文圖片 這些成對欄位都不會被推移。日後若有其他「開關決定某欄位是否需要」的表單，優先考慮這個模式，而不是條件式顯示/隱藏整個欄位。

**⚠️ `.dr-time-block` 才是正確的 class 名稱**：時間 stepper 的外層 wrapper 必須用 `.dr-time-block[data-role="start"|"end"]`（`js/app.js` 用 `popover.querySelectorAll('.dr-time-block')` 綁定 stepper 互動與快速區間連動）。`task-settings.html`（任務期間篩選）與 `redeem-codes.html`（日期篩選）曾誤用不存在的 `.dr-time-inputs`（零 CSS 規則、`js/app.js` 也查不到），導致 stepper 完全無法互動、點快速區間 chip 也不會更新顯示的時間，已修正為 `.dr-time-block` + 補上 `data-role`。新增/檢查任何 daterange 篩選器時，確認時間欄位用的是 `.dr-time-block` 而非其他名稱。

**`.col-toggle`（表格欄位顯示設定）**：新元件，用於欄位數量較多的清單頁（例如 `members.html` 16 個資料欄位），讓操作者自選要顯示哪些欄位、暫時隱藏其餘欄位，概念類似 Excel 隱藏欄。放在 `.table-toolbar` 內（緊接在匯出按鈕之前），結構：`.col-toggle[data-col-toggle-target="<table id>"] > button.col-toggle-trigger（開關選單）+ .col-toggle-menu > .col-toggle-menu-header（標題 + .col-toggle-selectall 全選/取消全選按鈕）+ .col-toggle-list > label.col-toggle-item（每欄一個 checkbox，checkbox 的 data-col 對應 `<table>` 對應 `<th data-col="...">` 的值）`。行為（`js/app.js`）：勾選/取消對應欄位即時 toggle `.col-hidden` class 在該欄的 `<th>` 與 tbody 內每一列相同索引的 `<td>` 上（用 `th.data-col` 找到欄位在 header row 的索引位置，不需要每個 `<td>` 都標記 `data-col`，減少標記量）；全選按鈕文字依目前是否全部勾選動態顯示「全選」/「取消全選」；點擊元件外部關閉選單。**規則**：只有實際的資料欄位可勾選隱藏，最左的勾選框欄與最右的「操作」欄一律排除在外（永遠顯示）。新增其他欄位數量多（例如 > 10 欄）的清單頁時，優先考慮套用這個元件。**`members.html` 的 SID、帳號 兩欄依使用者要求恆常顯示**：只從 `.col-toggle-list` 移除對應的 `label.col-toggle-item`（`<th data-col="sid">`/`<th data-col="account">` 本身不動），沒有 checkbox 控制的欄位就沒有對應的 `.col-hidden` 切換路徑，等同永遠顯示。日後若有其他欄位要設為「不可隱藏」，比照此法，不需要額外寫例外邏輯。

**`.slide-master-detail`（清單↔明細 水平滑動版面）**：新元件，用於「清單列有子資源明細、且明細筆數可能很多（含自身分頁）」的頁面，取代點擊「向下展開」（`.title-row`/`.subtitle-row`）的手風琴模式。根本問題：`.title-row` 的手風琴允許同時展開多組、不會自動收合其他項目，明細筆數一多、展開項目一多，頁面就會越展越長、難以捲動比對（例如 `promotion-records.html` 優惠活動 > 參與會員清單，企劃反饋 real Vue.js 資料渲染下更明顯）。結構：`.slide-master-detail > .slide-track（寬 200%，flex）> .slide-panel.slide-panel-list（左半，清單表格，列標 `data-slide-target` + `data-<field>` 供帶入明細標頭）+ .slide-panel.slide-panel-detail（右半，含 `.slide-detail-header`──`data-slide-back` 返回按鈕 + `.slide-detail-titlewrap` + `.slide-detail-meta`（`[data-slide-field="<field>"]` 對應清單列的 `data-<field>`）+ 多組 `.slide-detail-set[data-detail-set="<target>"]`（含自身分頁），一次只顯示 `.active` 的那組）`。行為（`js/app.js` 通用綁定，套用到所有 `.slide-master-detail`）：點擊清單列 → 對應 `.slide-detail-set` 加 `.active`、標頭欄位同步、`.slide-master-detail` 加 `.detail-active`（觸發 `.slide-track` `translateX(-50%)` 滑動）；點擊返回按鈕移除 `.detail-active` 滑回清單；可在明細面板內直接點另一列清單而不必先返回。**規則**：這是與既有手風琴並存的新模式，不是取代——子資源內容單薄、筆數少時仍用 `.title-row`/`.subtitle-row` 手風琴即可，只有明細筆數多/需要自身分頁時才用這個。`.stat-filter-strip` 分類篩選 chip 邏輯已同步支援 `.slide-row`（與 `.title-row` 並列查詢），新頁面若同時用篩選 chip + `.slide-master-detail` 不需要額外處理。

`公會管理`（子選單目前已確認 公會設置 一項，公會列表/公會金流尚未收到畫面需求，故不預先猜測）已完成：`pages/guild-settings.html`（單一 站台 篩選 + 兩個各自獨立可編輯的區塊——「基本設置」8 個欄位、「等級設置」等級子表格）。**唯讀/編輯切換直接沿用既有的兩套既有機制，沒有新建元件**：① 「基本設置」區塊沿用 `member-detail.html` 的 `.detail-fields-wrap`/`.is-editable`/`.detail-value`/`.detail-input` 唯讀↔編輯機制（`js/app.js` 用固定 id `detailFieldsWrap`/`editModeBtn`/`cancelEditBtn`/`saveEditBtn`/`viewActions`/`editActions` 綁定，同一頁只會有一組這樣的區塊，id 不會跨頁衝突）——關鍵發現：這組 CSS 選擇器（`.detail-fields-wrap.editing .is-editable .detail-value/.detail-input`）本來就沒有綁定在 `.detail-grid`/`.detail-item` 上，可以直接套用在 `.form-field` 結構（label 在上、輸入框在下、下方還有 hint 文字）而不需要新寫 CSS，唯一需要額外補的是幫「金幣退水是否進保險箱」這種 `.radio-group` 欄位加一條 `.detail-fields-wrap.editing .is-editable .detail-input.radio-group { display: flex; }`（比照既有 `.phone-input-group` 的例外寫法，否則會被通用的 `display:block` 蓋掉、兩個 radio 選項疊成一直線）。② 「等級設置」子表格沿用 `vip-levels.html` 的 `data-table-edit-trigger`/`.cell-view`/`.cell-edit` inline 表格編輯模式，「新增等級」按鈕比照 `copywriting.html` 新增主標題按鈕用 `.btn-accent`（暖色，區別於「保存更改」的主色與「取消」的次要色）；基準等級（等級零）沒有刪除操作、其餘等級有 `刪除` 連結。**設計理由（使用者原話：「彈窗要注意畫面，不要太空、太醜」的同一套審美延伸到一般頁面）**：舊後台唯讀狀態把 `<input disabled>` 弄成灰底輸入框、看起來像「壞掉的表單」；新版唯讀狀態直接顯示純文字（無邊框無底色），只有進入編輯模式才「長出」真正的輸入框，讓使用者一眼分辨目前是「資料展示」還是「可編輯表單」。日後若有其他「一般表單區塊（非表格）需要唯讀↔編輯」的頁面，優先比照這個做法（重用 `.detail-fields-wrap` 機制），不需要另外發明機制。
