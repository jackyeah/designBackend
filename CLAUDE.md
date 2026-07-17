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
- **`.daterange-trigger` / `.daterange-popover`**：全站統一的日期區間選擇器（雙月曆 + 時分秒 stepper + 快速區間 chip：今天/最近7天/最近30天/本月/上月），原本用於篩選列，也可以直接搬進 modal 內共用同一元件（見 `#modalMaintenance` 臨時維護欄位）。放進 modal 時注意兩點：① 外層容器要用 `.field`（有 `position:relative`）而不是 `.form-field`（沒有），否則 popover 定位錯誤；② `.modal-body` 預設 `overflow-y:auto` 會裁切 popover，要針對該 modal id 加 `#modalXxx .modal-body { overflow: visible; }`。
- **`.chip-select`**：外觀模擬 select 的框（含右側下拉箭頭 `::after`），內含可移除的標籤（`.chip-select-tag` + 內嵌 `×` 按鈕），用於「顯示目前已選項目、可移除」的欄位（例如站點設置 > 客服 的狀態欄）。
- **`.url-input-group`**：合併呈現的「通訊協定 select + 網域 input」，兩者邊框相鄰處互相去除、圓角只留外側，視覺上是一個整體控制項（例如站點設置 > 客服 的網址欄）。
- **`.upload-field` / `.upload-thumb`**（含 `.empty`/`.square` 修飾）：圖片上傳 UI，縮圖框 + 「選擇圖片」按鈕（`.btn-secondary.btn-sm` + plus icon）+ 下方 `.text-xs.text-tertiary.mt-2` 提示檔案限制文字，全站共用（優惠文案、客服 QR Code 等）。
- **`.radio-field` / `.radio-group`**：簡單二選一（例如 否/是）用 `<label class="radio-field">` 兩個並排，外層包 `.radio-group`（`display:flex; gap`），不需要额外元件。
- **`.btn:disabled`**：`opacity: .5; cursor: not-allowed; pointer-events: none;`。
- **`.page-size-select`**：尺寸樣式一定要下在**內層 `<select class="select">`**，不要下在外層 `.select-wrap`，否則會雙重 padding 造成文字被裁切（曾經全站 5 個頁面都中這個 bug）。
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
`login.html`、`pages/sub-accounts.html`、`pages/site-owners.html`、`pages/members.html`、`pages/member-detail.html`、`pages/member-registration.html`、`pages/currency-providers.html` + `pages/currency-provider-edit.html`、`pages/role-permissions.html`、`pages/site-owner-sub-accounts.html`、`pages/permission-groups.html` + `pages/permission-group-edit.html`、`pages/promotion-records.html`、`pages/promotion-copy.html` + add/edit、`pages/copywriting.html` + subtitle add/edit、`pages/redeem-codes.html` + add/edit/detail、`pages/site-settings.html` + `pages/site-settings-edit.html`。

`pages/site-settings-edit.html` 7 個頁籤（站台資料/遊戲大類資料/大類排序/外觀設置/客服/溫馨提醒設定/保險箱機制）已全部依截圖建置完成。

其餘 12 個側邊欄一級選單（VIP設置、公會管理、現金系統、公告訊息、短信管理、報表、優惠活動管理、任務管理、簽到管理、黑名單管理、操作記錄）大多仍是 `href="#"` 佔位，尚未收到畫面需求。`權限群組 > 新增` 的完整權限矩陣內容已經拿到（13 大類 sub-module + action checkbox），但尚未確認是否要據此把其餘 12 個一級選單展開成完整子選單。
