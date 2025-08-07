# ChatGPT Memory Toolkit - 模態視窗重構設計文檔

## 專案概述

本文檔定義 ChatGPT Memory Toolkit v1.2.0+ 的模態視窗重構需求，旨在簡化用戶體驗、整合現有 popup 界面，並實現自動化的匯出流程。

## 目前問題分析

### 現有模態視窗問題

1. **架構問題**
   - 硬編碼的 HTML/CSS 在 JavaScript 中 (>500行)
   - 樣式與 `src/ui/popup.css` 不一致
   - 重複的 UI 組件和邏輯
   - 維護困難且容易出錯

2. **用戶體驗問題**
   - 需要用戶手動點擊多個按鈕
   - 彈出模態視窗中斷用戶工作流程
   - "稍後提醒" 功能混亂不直觀

3. **技術債務**
   - 模態視窗代碼與核心匯出邏輯混合
   - 事件處理散亂在多個地方
   - CSS 樣式重複且不符合設計系統

## 新設計理念

### 核心原則

1. **自動化優先**: 減少用戶手動操作，自動執行匯出流程
2. **統一設計**: 與現有 popup.css 設計系統完全一致
3. **簡化流程**: 直接整合到擴充套件 popup 中
4. **漸進增強**: 保持向後相容性

### 設計目標

- 移除所有內嵌模態視窗
- 自動觸發 popup 並執行匯出
- 實現 24 小時智能提醒延遲
- 統一視覺設計語言

## 新架構設計

### 1. 自動 Popup 機制

**觸發條件**:

- 檢測到記憶已滿狀態
- 用戶未在 24 小時內禁用提醒

**執行流程**:

```
記憶已滿檢測 → 檢查提醒設定 → 自動開啟 popup → 自動執行匯出 → 顯示結果
```

**技術實現**:

- 使用 `chrome.action.openPopup()` API 自動開啟 popup
- 通過 message passing 通知 popup 自動執行匯出
- 在 popup 中顯示匯出進度和結果

### 2. Popup 界面整合

**整合方式**:

- 擴展現有 `src/ui/popup.html` 界面
- 添加自動匯出狀態顯示區域
- 重用現有的按鈕樣式和佈局

**新增 UI 組件**:

- 自動匯出進度指示器
- 匯出狀態通知橫幅
- 24小時延遲設定選項

### 3. 24小時提醒延遲機制

**設定介面**:

- 在 popup 中添加 "24小時後再提醒" 選項
- 顯示倒數計時器
- 允許用戶取消延遲設定

**技術實現**:

```javascript
// 設定延遲提醒
const reminderTime = new Date();
reminderTime.setHours(reminderTime.getHours() + 24);
await chrome.storage.local.set({
  memoryFullReminderDisabled: reminderTime.toISOString(),
});
```

## 界面設計規範

### 設計系統依據

- 基於 `src/ui/popup.css` 現有樣式
- 使用相同的顏色變數和間距系統
- 保持一致的按鈕樣式和互動效果

### 顏色系統

```css
/* 基於 popup.css 的顏色系統 */
:root {
  --primary-color: #3b82f6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --background-primary: #ffffff;
  --background-secondary: #f8fafc;
  --border-color: #e2e8f0;
}
```

### 組件規格

**自動匯出狀態橫幅**:

```css
.auto-export-banner {
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--warning-color);
  color: white;
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
```

**延遲提醒設定**:

```css
.delay-reminder-section {
  padding: 12px;
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 16px;
}
```

## 實現計劃

### Phase 1: 清理舊代碼 ✅

- 移除 `showAutoExportModal()` 函數
- 移除 `showExportResultModal()` 函數
- 清理相關樣式和事件處理代碼

### Phase 2: 實現自動 Popup 機制

**檔案修改**:

- `src/scripts/content.js`: 修改觸發邏輯
- `src/scripts/background.js`: 添加 popup 開啟邏輯
- `src/ui/popup.js`: 接收自動匯出訊息

**實現步驟**:

1. 在 background script 中實現自動開啟 popup
2. 修改 content script 的提醒邏輯
3. 在 popup 中接收自動執行訊號

### Phase 3: 擴展 Popup 界面

**新增功能**:

- 自動匯出進度顯示
- 匯出結果通知
- 24小時延遲設定選項

**檔案修改**:

- `src/ui/popup.html`: 添加新的 UI 元素
- `src/ui/popup.css`: 擴展樣式定義
- `src/ui/popup.js`: 實現新功能邏輯

### Phase 4: 測試與優化

- 功能測試
- 用戶體驗測試
- 性能優化
- 版本發布準備

## 技術實現細節

### 1. Message Passing 架構

```javascript
// content.js -> background.js
chrome.runtime.sendMessage({
  action: 'triggerAutoExport',
  timestamp: Date.now(),
});

// background.js -> popup.js
chrome.runtime.sendMessage(popupTabId, {
  action: 'executeAutoExport',
  reason: 'memoryFull',
});
```

### 2. 狀態管理

```javascript
// 記憶已滿狀態
const memoryFullState = {
  detected: boolean,
  timestamp: number,
  reminderDisabled: string | null,
  autoExportInProgress: boolean,
};
```

### 3. 錯誤處理策略

- Popup 開啟失敗 → 降級到瀏覽器通知
- 自動匯出失敗 → 顯示錯誤訊息和手動重試選項
- 網路錯誤 → 提供離線模式支援

## 預期效果

### 用戶體驗改善

1. **自動化**: 無需手動操作，一鍵完成匯出
2. **一致性**: 統一的視覺設計和互動模式
3. **智能化**: 24小時智能提醒避免重複打擾

### 技術效益

1. **可維護性**: 代碼結構清晰，易於維護
2. **一致性**: 設計系統統一，減少重複代碼
3. **穩定性**: 錯誤處理完善，用戶體驗穩定

### 性能提升

1. **代碼量**: 減少 >500 行硬編碼樣式
2. **載入速度**: 移除重複的 CSS 樣式
3. **記憶體使用**: 優化 DOM 操作和事件監聽

## 風險評估

### 潛在風險

1. **API 相容性**: Chrome extension API 變更風險
2. **用戶適應**: 界面變更可能需要用戶適應期
3. **回歸風險**: 功能重構可能引入新的 bug

### 風險緩解

1. **向後相容**: 保持核心匯出功能不變
2. **漸進發布**: 分階段發布和測試
3. **回滾機制**: 保留回滾到前版本的能力

## 成功指標

### 技術指標

- [ ] 代碼行數減少 >30%
- [ ] CSS 重複率降低 >50%
- [ ] 用戶操作步驟減少 >60%

### 用戶體驗指標

- [ ] 自動匯出成功率 >95%
- [ ] 用戶投訴減少 >40%
- [ ] 界面一致性評分 >90%

## 結論

此重構方案將大幅簡化 ChatGPT Memory Toolkit 的用戶體驗，同時提升代碼質量和維護性。通過自動化流程和統一設計系統，我們期望為用戶提供更流暢、更直觀的記憶管理體驗。

---

**版本**: v1.0  
**更新日期**: 2025-01-15  
**負責人**: Claude Code Assistant
