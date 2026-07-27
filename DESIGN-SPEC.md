# 後台管理系統 設計規範文件

給前端實作團隊參考。本文件整理設計 mockup（純靜態 HTML/CSS/JS，位於 `pages/*.html` + `css/*.css` + `js/*.js`）中訂下的所有規則與元件慣例，實作時請直接依此規範對應真實資料/API 串接，版面與互動邏輯以 mockup 為準。

---

## 1. 設計系統 Token

一律使用 `css/tokens.css` 定義的 CSS variable，不要 hardcode 數值。

- **主色**：`--color-primary: #4F46E5`（深紫藍），輔助強調色 `--color-info: #3D82C4`（藍），用於次要強調／交錯配色。
- **語意色**：success / warning / danger / info 四種語意色，各自有 base / hover / light / border 四階，全站 badge、pill、狀態色統一使用同一組色調家族。
- **中性色**：文字 text-primary / text-secondary / text-tertiary 三階灰階；背景 bg-page / bg-card / bg-subtle / bg-hover 四階。
- **字級**：12 / 13 / 14 / 15 / 16 / 18 / 20px（xs / sm / base / md / lg / xl / 2xl）。刻意偏小，避免後台頁面字級過大導致資訊密度不足。
- **間距**：8px 基準尺（4 / 8 / 12 / 16 / 20 / 24 / 32 / 40px）。
- **Sidebar**：深色背景 `#12172B`，展開寬度 240px，收合寬度 72px。

---

## 2. 核心設計原則

1. **操作性優先於視覺花俏**：這是給客服/營運人員用的內部工具，不是消費性產品。「簡潔」不等於「簡陋」——目標是做得好的簡潔，不是隨便少放東西。
2. **資訊密度要高**：避免字級過大、間距過鬆導致一頁資料要滾動很多次。detail/表單頁優先採用較緊湊的排版（例如多欄 grid 呈現唯讀統計欄位）。
3. **不要留下沒必要的空白**：色彩、間距、分節都要有理由，避免把一屏內容硬拆成要滾動好幾屏的稀疏版面。
4. **Modal vs. 整頁導覽要有明確規則**（見第 3 節），同一實體的「新增」與「編輯」必須用同一種模式，不可一個 modal 一個整頁。
5. **分頁元件只在真的需要時顯示**：資料只有一頁時，不顯示 `<< < 1 > >>` 分頁列。
6. **不要因為「外層清單 + 編輯頁」的結構就硬拆成兩頁**：拆開後若兩頁內容都很單薄，應合併成一頁。同理，如果多頁籤合併起來欄位總量不多，也應考慮合併成單頁 + `.section-label` 分節，而非保留稀疏的頁籤。
7. **不要只因為資料存在就顯示**：沒有實際用途的欄位（例如清單頁裡意義不大的網域清單）應該拿掉。
8. **色彩不受舊後台既有配色限制**，可自由選色（僅需與既有 token 家族一致）。

---

## 3. Modal vs. 整頁 規則

| 情境 | 使用 |
|---|---|
| 單一動作、欄位 ≤ 8 個、無子資源/子表格 | **Modal**（例如：重置密碼、序號詳情、維護設定、狀態變更） |
| 欄位 > 8 個，或含有子表格/子資源 | **整頁**（例如：站長遊戲權限、幣商設定編輯含 SID 子表） |

- 同一實體的新增/編輯必須採用同一種模式（都 modal 或都整頁）。
- 欄位數在門檻邊界時，若含有「條件式欄位切換」「批量輸入 + 驗證」等複雜互動，也可判定為整頁（例如 `cash-adjustment-add.html`、`task-settings-add.html`）。
- 需要自身分頁的清單（子資源筆數可能很多）不應該塞進 modal，應獨立成頁（例如 `guild-members.html`）。

---

## 4. 共用元件規範

### 4.1 資料表格 `.data-table`
- `td { border-top: 1px solid var(--color-border); vertical-align: middle }`
- `.col-actions`：操作欄，黏右（`position: sticky; right: 0`）。
- `.col-pinned-left`：需要橫向捲動、但要固定不動的左側欄（例如標題欄），`position: sticky; left: 0`，陰影方向與 `.col-actions` 相反。
- 表格若有彈性寬度內容（例如 `.upload-field`、`.url-input-group`），務必加 `table-layout: fixed` 並讓每欄都有明確寬度（至多留一欄不設寬度吃剩餘空間），否則瀏覽器的自動版面配置會讓寬欄擠壓其他已設定寬度的欄位。
- **`<td>` 絕對不能直接套用 `display: flex`**：會讓該儲存格脫離表格版面計算，導致高度只跟著自身內容走、無法撐滿同列高度。內部子元素改用 `display: inline-flex`。

### 4.2 手風琴展開 `.title-row` / `.subtitle-row`
- `.title-row[data-target]` 點擊切換 `.open`，展開對應 `#id` 的 `.subtitle-row`。
- 左側強調色線：`box-shadow: inset 3px 0 0 var(--row-accent)`，僅在 `.open` 時顯示。
- 相鄰展開項目輪流套用 `.accent-a`（紫）/ `.accent-b`（藍），須同時標在 `.title-row` 與對應 `.subtitle-row` 上，避免連續展開時分不清邊界。
- 適用於子資源內容單薄、筆數少的情境；筆數多、需要自身分頁時改用 4.14 的 `.slide-master-detail`。

### 4.3 頁籤 `.section-tabs` / `.section-tab`
- 功能性切換靠 `data-tabs-group` 屬性對應（`.section-tabs[data-tabs-group]` ↔ `.tab-panel[data-tabs-group]`）。
- 點擊會 dispatch 自訂事件 `tabchange`（`detail.target` 為目標 panel id）。
- 一律 `cursor: pointer`；hover 用 `--color-info`（藍），active 用 `--color-primary`（紫），兩色刻意不同。
- 動態底線指示器跟隨滑鼠移動，顏色隨 hover/active 狀態切換；滑出頁籤列時滑回目前 active 分頁。

### 4.4 日期區間選擇器 `.daterange-trigger` / `.daterange-popover`
- 全站統一元件：雙月曆 + 時分秒 stepper + 快速區間 chip（今天/最近7天/最近30天/本月/上月）。
- 任何互動式日期區間篩選欄位一律要有快速選擇 chip。
- 時間 stepper 外層必須用 `.dr-time-block[data-role="start"|"end"]`（曾誤用不存在的 class 名稱導致互動完全失效，需特別注意）。
- **單一日期模式**：對 `.daterange-popover` 加 `dr-single` class，可即時在「選區間」與「選單一日期」模式間切換（隱藏右側月曆/結束時間欄/快速 chip，只留左側月曆+開始時間）。
- 放進 modal 時：外層容器須用 `.field`（有 `position: relative`）而非 `.form-field`；且該 modal 需加 `.modal-body { overflow: visible; }`，否則 popover 會被裁切。
- 純視覺、僅顯示單一已設定值（無互動日曆）的欄位使用 `.daterange-trigger` 但不綁定對應 popover，此為刻意設計，不需要 chip。

### 4.5 搜尋式下拉 `.combo-select`
- 可輸入文字篩選（type-to-filter），取代選項數量會持續增加的欄位用的原生 `<select>`（例如「遊戲平台」欄位）。
- 結構：`.combo-select[data-combo-select] > input.combo-select-input + .combo-select-menu > .combo-select-option(.is-selected)`，無符合結果時顯示 `.combo-select-empty`。
- 行為：點擊/focus 開啟；輸入即時篩選（大小寫不敏感、子字串比對）；Esc 還原上次有效值；Enter 在僅剩一個選項時自動選取；點外部若文字不完全匹配任一選項則還原。
- 適用情境：選項會隨時間增加的欄位（廠商、服務商清單等）。

### 4.6 已選標籤選單 `.chip-select`
- 外觀模擬 select（含右側下拉箭頭），內含可移除標籤（`.chip-select-tag` + 內嵌 × 按鈕）。
- 用於「顯示目前已選項目、可移除」的欄位。
- **必填的多選 `.chip-select` 篩選欄位，預設要全部勾選好**，避免使用者一進頁面就被迫手動選過一輪。

### 4.7 批量輸入標籤 `.tag-input`
- 取代 textarea + 換行分隔的批量輸入模式（例如批量輸入 SID / 公會名稱）。
- `.tag-input[data-tag-input][data-max="200"][data-count-target="<count元素id>"]`：Enter/逗號提交成 chip；貼上自動依換行/逗號/頓號拆成多個 chip；空白時 Backspace 刪除最後一個；失焦時提交剩餘文字。
- 驗證失敗的 chip 加 `.is-invalid`（紅色樣式）。
- 全域輔助函式：`window.tagInputGetValues(container)` 取得目前所有值、`window.tagInputMarkInvalid(container, invalidValues)` 標記驗證失敗、`window.tagInputAddValues(container, values)` 程式化建立 chip（例如「再次派發」帶入既有 SID）。
- 錯誤呈現方式為單純 toast 提示，不做逐字元即時驗證。

### 4.8 上傳欄位 `.upload-field` / `.upload-thumb`
- 縮圖框 + 「選擇圖片」按鈕（`.btn-secondary.btn-sm` + plus icon）+ 下方提示文字（檔案格式/大小/建議尺寸）。
- `.square` 修飾：正方形縮圖；`.empty` 修飾：尚未上傳狀態。

### 4.9 欄位顯示切換 `.col-toggle`
- 用於欄位數量多（例如 > 10 欄）的清單頁，讓操作者自選顯示哪些欄位（概念類似 Excel 隱藏欄）。
- 結構：`.col-toggle[data-col-toggle-target="<table id>"] > button.col-toggle-trigger + .col-toggle-menu > .col-toggle-menu-header(含全選/取消全選) + .col-toggle-list > label.col-toggle-item`（checkbox 的 `data-col` 對應 `<th data-col="...">`）。
- 行為：勾選/取消即時 toggle `.col-hidden` class 在對應 `<th>` 與每列相同索引的 `<td>` 上。
- **規則**：只有實際資料欄位可勾選隱藏；最左勾選框欄與最右操作欄一律排除、恆常顯示。若有其他欄位需要「恆常顯示、不可隱藏」，只需不放對應 checkbox 到 `.col-toggle-list` 即可。

### 4.10 Inline 表格編輯模式
- 觸發：`data-table-edit-trigger="<table id>"`；工具列對應 `data-table-edit-cancel="<table id>"` / `data-table-edit-save="<table id>"`。
- `<table>` 加 `.is-editing` 後，每個可編輯儲存格內 `.cell-view`（唯讀）與 `.cell-edit`（`input`/`select`/checkbox 組）互相切換顯示。
- 取消會用 `defaultValue`/`defaultSelected`/`defaultChecked` 還原；保存會同步寫回 `.cell-view`（含 badge 顏色同步）。
- 圖示類欄位（固定尺寸圖示）不做 view/edit 切換，永遠不可編輯。
- 若儲存格內需要 checkbox 群組橫向並排，需額外補 CSS 讓該 `.cell-edit` 明確 `display: flex`（預設通用規則是 `display: block`，會導致選項疊成一直線）。

### 4.11 一般表單區塊唯讀↔編輯 `.detail-fields-wrap`
- 用於整頁表單（非表格）需要「唯讀檢視 → 點編輯才變成可編輯表單」的情境。
- 固定 id 綁定：`#detailFieldsWrap` / `#editModeBtn` / `#cancelEditBtn` / `#saveEditBtn` / `#viewActions` / `#editActions`（同一頁僅一組，不會跨頁衝突）。
- 每個可編輯欄位同時放 `.detail-value`（唯讀文字）與 `.detail-input`（編輯用 input/select/textarea/radio-group），外層 `.form-field` 加 `.is-editable`。
- **唯讀狀態一律顯示純文字（無邊框無底色）**，不要用 `<input disabled>` 灰底樣式（會讓使用者誤以為是「壞掉的表單」）。只有進入編輯模式才「長出」真正的輸入框。
- 若欄位是 `.radio-group`，需額外補 `.detail-fields-wrap.editing .is-editable .detail-input.radio-group { display: flex; }`（否則被通用 `display: block` 蓋掉、選項疊成一直線）。
- 若整頁涵蓋多個 `.card-section`，編輯按鈕應放在頁面最上方（`.page-header` 右上角）一次性切換全部區塊，而非每個 section 各自獨立按鈕（除非各 section 明確需要獨立儲存，例如 `guild-settings.html` 的「基本設置」與「等級設置」是兩個獨立可編輯區塊）。

### 4.12 布林欄位呈現：switch vs. 下拉選單
- **單一布林值、獨立佔用一個 grid 欄位**（例如表單中 3 欄並排的其中一欄）：優先用**下拉選單**（選項：否/是），而非 `.switch`。原因：`.switch` 本身僅 36×20px，在較寬欄位中四周留白過多、比例失衡、視覺空洞。
- **switch 作為「主開關」、獨立成一整行、決定下方其餘欄位是否啟用**（不受 grid 欄寬限制）：維持使用 `.switch`，因為此情境沒有留白比例失衡的問題。
- 二選一（例如 否/是）且欄位不受 grid 欄寬限制、需要並排兩個選項文字：用 `.radio-group` + 兩個 `.radio-field`。

### 4.13 狀態切換 Modal
- 狀態變更 modal 一律用「單一 select 呈現全部真實可選狀態」，不要仿照舊系統「排除目前狀態、下拉只剩其餘選項」的做法。
- 系統自動產生、人工不可指定的狀態（例如「下架」為到期自動觸發），不應出現在狀態變更 modal 的可選項目中，但該狀態的列仍可點擊開啟同一 modal 改為其他可人工指定的狀態。

### 4.14 清單↔明細 水平滑動 `.slide-master-detail`
- 用於「清單列有子資源明細、且明細筆數可能很多（含自身分頁）」的頁面，取代手風琴模式（避免手風琴允許同時展開多組、越展越長難以捲動比對的問題）。
- 結構：`.slide-master-detail > .slide-track`（寬 200%，flex）`> .slide-panel.slide-panel-list`（清單）`+ .slide-panel.slide-panel-detail`（明細，含返回按鈕 + 標頭 meta + 多組 `.slide-detail-set[data-detail-set]`，一次僅顯示 `.active` 那組）。
- 點擊清單列 → 對應明細組加 `.active`、`.slide-master-detail` 加 `.detail-active`（觸發 `translateX(-50%)` 滑動）；點返回移除 `.detail-active`。
- 與手風琴模式並存而非取代：子資源內容單薄、筆數少時仍用手風琴即可。

### 4.15 欄位開關導致版面跳動的標準解法
- 不要讓欄位本身消失/出現（會讓 CSS grid 重排、擠壓移動其他兄弟欄位）。
- 改為欄位固定存在，只切換欄位「內部內容/模式」（例如 daterange 的 `dr-single` class、或切換 label 文字）。

### 4.16 其他小型元件
- `.domain-list` / `.domain-list-more` / `.domain-list-toggle`：長度不定清單收合成一致列高。
- `table.drag-reorder`（配 `data-save-btn`）：拖曳排序，保留原排序數字槽位（不重新編號），放開後啟用保存按鈕。
- `.template-grid` / `.template-card`（配 `.count-1`）：只有一個選項時切成寬版橫式卡片，避免版面顯空。
- `.url-input-group`：合併呈現「通訊協定 select + 網域 input」，視覺上為單一整體控制項。
- `.btn:disabled`：`opacity: .5; cursor: not-allowed; pointer-events: none;`。
- `.page-size-select`：尺寸樣式須下在內層 `<select class="select">`，不可下在外層 `.select-wrap`，否則雙重 padding 造成文字被裁切。
- **麵包屑連結規則**：只有「中間層」且有對應頁面時才可點擊；第一層（無主頁的一級分類）與最後一層（當前頁面）一律純文字不可點擊。

---

## 5. 全站規範（Cross-cutting Rules）

### 5.1 刪除確認 Modal 必須列出實際資料
所有「刪除」/「批次刪除」操作，確認 modal **一律要列出欲刪除的具體資料**，不可只顯示空泛的「確認是否刪除資料？」文字提示。

- **單筆刪除**：觸發元素加 `data-modal-target="modalDeleteSingle"` + `data-delete-title="<主要識別欄位>"` + `data-delete-meta="<次要輔助資訊，例如「建立時間：xxx　·　更新人員：xxx」>"`。共用 modal `#modalDeleteSingle`（max-width 420px），內容用 `.delete-preview > .delete-preview-title[data-delete-title-slot] + .delete-preview-meta[data-delete-meta-slot]` 呈現。
- **批次刪除**：觸發元素用 `data-batch-delete-trigger="<modal id>"`（非 `data-modal-target`，需先檢查是否有勾選列）。未勾選時僅跳 toast「請先勾選要刪除的項目」，不開啟 modal。共用 modal `#modalDeleteBatch`（max-width 460px），內容用 `[data-delete-count-slot]` 顯示筆數 + `.delete-preview-list[data-delete-list-slot]`（可捲動）逐筆列出識別欄位。
- 兩個 modal 的確認鈕都同時帶 `data-modal-close` + `data-delete-confirm`。

### 5.2 分頁只在需要時顯示
資料量不超過一頁時，完全不渲染分頁元件，不要顯示只有「1」可點的分頁列。

### 5.3 必填多選篩選欄位預設全選
`.chip-select` 型的必填多選篩選欄位，進頁面時應預先勾選所有選項，讓使用者可以直接查詢，不需要先手動選過一輪。

### 5.4 大量資料的明細查詢需搭配篩選，而非只靠分頁
當某筆資料的子明細可能達到數千筆以上（例如全體會員的已讀狀態），純換頁會導致要翻幾百頁才找得到特定對象。應在資料表上方加上關鍵欄位篩選（例如 SID 搜尋 + 狀態下拉），保留分頁機制供一般瀏覽使用。

### 5.5 沒有明確畫面依據的內容要標註待確認
沒有明確截圖佐證的下拉選單選項/欄位值等內容，若做了合理延伸猜測，應標註為「暫定、待確認」，不可直接當作定案內容呈現，需與需求方確認後才能定案。

### 5.6 側邊欄選單只在畫面已建置後才登記
`js/shell.js` 的 NAV 陣列中，子選單項目只在對應頁面畫面已經確認/建置完成後才加入；即使舊系統截圖裡有更多子選單項目，只要尚未提供對應畫面需求，就不預先猜測加入。

---

## 6. 開發/驗證流程建議

- 建議使用瀏覽器實際渲染 + `getBoundingClientRect()` / `getComputedStyle()` 量測版面問題（例如儲存格高度、sticky 定位是否正確），不要只憑閱讀程式碼猜測效果。
- 大幅修改 HTML 結構後，建議做標籤配對檢查（`<div>`/`</div>`、`<table>`/`</table>`、`<tr>`/`</tr>`、`<td>`/`</td>`、`<th>`/`</th>` 數量是否一致）。
- 每個功能完成後應實際操作互動流程驗證（開啟 modal、切換編輯模式、送出表單等），確認行為符合預期再視為完成。

---

## 7. 目前已建置頁面（供對照舊系統時查找對應 mockup）

**帳號管理**：`login.html`、`sub-accounts.html`、`site-owners.html`、`site-owner-game-permissions.html`、`members.html`、`member-detail.html`、`member-registration.html`、`currency-providers.html` + `currency-provider-edit.html`、`role-permissions.html`、`site-owner-sub-accounts.html`、`permission-groups.html` + `permission-group-edit.html`。

**優惠活動管理**：`promotion-records.html`、`promotion-copy.html` + add/edit、`copywriting.html` + subtitle add/edit、`redeem-codes.html` + add/edit/detail。

**網站管理**：`site-settings.html` + `site-settings-edit.html`（7 頁籤：站台資料/遊戲大類資料/大類排序/外觀設置/客服/溫馨提醒設定/保險箱機制）。

**VIP設置**：`vip-levels.html`、`vip-reward-settings.html`、`vip-level-detail.html`、`vip-tier-settings.html` + `vip-tier-members.html` + `vip-tier-deposit-settings.html`。

**任務管理**：`task-settings.html` + `task-settings-add.html` / `task-settings-edit.html`、`task-records.html`。

**公會管理**：`guild-settings.html`、`guild-list.html` + `guild-members.html`。

**現金系統**：`cash-adjustment.html` + `cash-adjustment-add.html` + `cash-adjustment-audit.html`。

**公告訊息**：`announcement-management.html` + `announcement-add.html` / `announcement-edit.html`、`mail-management.html` + `mail-read-status.html`、`new-member-announcement.html`。

**尚未建置（側邊欄仍為 `href="#"` 佔位，未收到畫面需求）**：現金系統其餘 7 項子選單（網銀入款/資金明細表/會員金流/支付設定/贈禮記錄/流水查詢/點數比值/儲值設定）、短信管理、報表、簽到管理、黑名單管理、操作記錄。
