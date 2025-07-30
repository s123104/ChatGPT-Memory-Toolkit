# UI統一化設計文檔

## 概述

本設計文檔定義了ChatGPT Memory Manager擴充套件的統一UI設計系統，包括深色主題色彩系統、無模態窗的互動架構、以及一致的組件設計規範。

## 架構設計

### 整體架構

```
主介面 (popup.html)
├── 標題區 (Header)
│   ├── 應用圖標和標題
│   └── 連接狀態指示器
├── 狀態卡片區 (Status Card)
│   ├── 記憶狀態顯示
│   └── 使用量和數量資訊
├── 操作區 (Action Section)
│   ├── 匯出按鈕（含進度顯示）
│   ├── 匯出結果區（動態顯示）
│   └── 複製按鈕
├── 快速操作區 (Quick Actions)
│   └── 重新整理、歷史、設定按鈕
├── 可摺疊區塊 (Collapsible Sections)
│   ├── 歷史記錄區
│   └── 設定區
└── 頁腳 (Footer)
    └── 版本和連接狀態
```

### 無模態窗設計原則

1. **即時反饋**: 所有操作都在主介面提供即時視覺反饋
2. **狀態展示**: 使用摺疊區塊和動態內容替代模態窗
3. **流程整合**: 將多步驟操作整合到單一介面流程中
4. **空間利用**: 合理利用垂直空間，避免水平滾動

## 色彩設計系統

### 深色主題色彩變數

```css
:root {
  /* 主要背景色 */
  --bg-primary: #1a1a1a; /* 主背景 */
  --bg-secondary: #2d2d2d; /* 次要背景 */
  --bg-tertiary: #404040; /* 第三層背景 */
  --bg-card: #2d2d2d; /* 卡片背景 */
  --bg-overlay: rgba(255, 255, 255, 0.05); /* 覆蓋層 */

  /* 文字顏色 */
  --text-primary: #ffffff; /* 主要文字 */
  --text-secondary: #b3b3b3; /* 次要文字 */
  --text-tertiary: #808080; /* 第三層文字 */
  --text-inverse: #1a1a1a; /* 反色文字（用於亮色背景） */

  /* 邊框顏色 */
  --border-light: #404040; /* 淺邊框 */
  --border-medium: #525252; /* 中等邊框 */
  --border-dark: #737373; /* 深邊框 */

  /* 狀態顏色 */
  --success-color: #10b981; /* 成功綠 */
  --warning-color: #f59e0b; /* 警告橙 */
  --error-color: #ef4444; /* 錯誤紅 */
  --info-color: #3b82f6; /* 資訊藍 */
  --primary-color: #667eea; /* 主要紫 */
}
```

### 色彩使用規範

1. **背景層級**: 使用三層背景色創造視覺層次
2. **文字對比**: 確保文字與背景對比度 ≥ 4.5:1
3. **狀態指示**: 使用一致的狀態顏色系統
4. **互動反饋**: 懸停和點擊狀態使用透明度變化

## 組件設計

### 按鈕設計系統

#### 主要按鈕 (Primary Button)

```css
.btn-primary {
  background: var(--primary-gradient);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-5);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-normal);
}
```

#### 次要按鈕 (Secondary Button)

```css
.btn-secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-5);
}
```

#### 匯出按鈕特殊設計

- 使用漸層背景和粒子動畫
- 支援載入、成功、錯誤狀態
- 記憶已滿時顯示緊急狀態

### 卡片設計系統

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}
```

### 摺疊區塊設計

```css
.collapsible-section {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.section-header {
  background: var(--bg-secondary);
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
}
```

## 互動設計

### 匯出流程重新設計

#### 流程步驟

1. **初始狀態**: 顯示"匯出記憶"按鈕
2. **點擊觸發**: 按鈕變為載入狀態，開始匯出
3. **進行中**: 按鈕顯示進度動畫和"匯出中..."文字
4. **完成**: 在主介面顯示匯出結果區塊
5. **格式選擇**: 提供Markdown和純文字選項
6. **複製**: 提供複製到剪貼簿功能

#### UI實現

```html
<!-- 匯出結果區（動態顯示） -->
<div
  class="export-result-section"
  id="exportResultSection"
  style="display: none;"
>
  <div class="export-result-header">
    <div class="export-result-icon">✓</div>
    <div class="export-result-title">匯出完成</div>
    <div class="export-result-stats">共 24 筆記憶</div>
  </div>

  <div class="export-format-selection">
    <div class="format-option" data-format="markdown">
      <div class="format-icon">📝</div>
      <div class="format-name">Markdown</div>
    </div>
    <div class="format-option" data-format="text">
      <div class="format-icon">📄</div>
      <div class="format-name">純文字</div>
    </div>
  </div>

  <div class="export-actions">
    <button class="btn-primary copy-result-btn">複製到剪貼簿</button>
    <button class="btn-secondary close-result-btn">關閉</button>
  </div>
</div>
```

### 歷史記錄整合設計

#### 摺疊式歷史區塊

```html
<div class="history-section collapsible-section">
  <div class="section-header" onclick="toggleHistory()">
    <div class="section-title">
      <svg class="section-icon">...</svg>
      <span>歷史記錄</span>
    </div>
    <div class="section-toggle">
      <svg class="toggle-icon">...</svg>
    </div>
  </div>

  <div class="section-content">
    <div class="history-list">
      <!-- 歷史記錄項目 -->
    </div>
  </div>
</div>
```

## 響應式設計

### 斷點設計

- **標準寬度**: 380px（擴充套件popup標準寬度）
- **最小寬度**: 320px（支援小螢幕設備）
- **最大高度**: 600px（避免過長的popup）

### 適應性調整

1. **小螢幕**: 減少間距，調整字體大小
2. **內容過多**: 使用滾動區域，保持固定高度
3. **摺疊狀態**: 合理管理垂直空間

## 動畫設計

### 動畫原則

1. **性能優先**: 使用transform和opacity進行動畫
2. **時間一致**: 統一使用150ms、250ms、350ms的動畫時間
3. **緩動函數**: 使用ease-in-out提供自然的動畫效果
4. **減少動畫**: 支援prefers-reduced-motion設定

### 關鍵動畫

```css
/* 摺疊展開動畫 */
.collapsible-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-normal);
}

.collapsible-content.expanded {
  max-height: 400px;
}

/* 匯出結果顯示動畫 */
.export-result-section {
  opacity: 0;
  transform: translateY(-10px);
  transition: all var(--transition-normal);
}

.export-result-section.show {
  opacity: 1;
  transform: translateY(0);
}
```

## 無障礙設計

### 鍵盤導航

- 所有互動元素支援Tab鍵導航
- 提供清晰的focus指示器
- 支援Enter和Space鍵操作

### 螢幕閱讀器支援

- 使用語義化HTML標籤
- 提供適當的aria-label和aria-describedby
- 確保狀態變化能被螢幕閱讀器識別

### 色彩對比

- 所有文字與背景對比度 ≥ 4.5:1
- 重要資訊不僅依賴顏色傳達
- 提供高對比度模式支援

## 錯誤處理

### 錯誤狀態設計

1. **連接錯誤**: 顯示重新連接按鈕和說明
2. **匯出失敗**: 在按鈕上顯示錯誤狀態和重試選項
3. **複製失敗**: 提供手動複製的備選方案
4. **載入失敗**: 顯示重新載入按鈕

### 錯誤訊息設計

```css
.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error-color);
  color: var(--error-color);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
```

## 測試策略

### 視覺測試

1. **色彩一致性**: 確保所有組件使用統一色彩變數
2. **字體層級**: 檢查文字大小和權重的一致性
3. **間距系統**: 驗證所有間距使用統一的space變數
4. **響應式**: 測試不同螢幕尺寸下的顯示效果

### 功能測試

1. **匯出流程**: 測試完整的匯出和格式選擇流程
2. **歷史記錄**: 測試摺疊展開和記錄管理功能
3. **狀態更新**: 測試所有狀態變化的即時反饋
4. **錯誤處理**: 測試各種錯誤情況的處理

### 無障礙測試

1. **鍵盤導航**: 使用Tab鍵測試所有功能
2. **螢幕閱讀器**: 使用NVDA或JAWS測試
3. **色彩對比**: 使用工具檢查對比度
4. **動畫設定**: 測試reduced-motion設定的效果
