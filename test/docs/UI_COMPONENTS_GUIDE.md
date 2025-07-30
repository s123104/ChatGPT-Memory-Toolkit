# UI統一化組件指南

## 概述

本文檔記錄了ChatGPT Memory Manager擴充套件的統一UI設計系統，包括深色主題色彩系統、組件使用方式、以及實作細節。

## 深色主題色彩系統

### 主要色彩變數

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
  --text-inverse: #1a1a1a; /* 反色文字 */

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

## 主要UI組件

### 1. 匯出按鈕 (Memory Export Button)

現代化設計的主要操作按鈕，具有漸層背景和粒子動畫效果。

#### HTML結構

```html
<button class="memory-export-btn" id="exportBtn">
  <div class="export-btn-background">
    <div class="export-btn-gradient"></div>
    <div class="export-btn-particles">
      <div class="particle"></div>
      <!-- 更多粒子... -->
    </div>
  </div>
  <div class="export-btn-content">
    <div class="export-icon-container">
      <svg class="export-icon"><!-- 圖標 --></svg>
      <div class="export-icon-glow"></div>
    </div>
    <div class="export-text-container">
      <span class="export-main-text">匯出記憶</span>
      <span class="export-sub-text">Export Memory</span>
    </div>
    <div class="export-arrow"><!-- 箭頭圖標 --></div>
  </div>
  <div class="export-btn-ripple"></div>
</button>
```

#### 狀態類別

- `.loading` - 載入狀態
- `.success` - 成功狀態
- `.error` - 錯誤狀態
- `.memory-full-urgent` - 記憶已滿緊急狀態

#### 使用方式

```javascript
// 設定載入狀態
exportBtn.classList.add('loading');
exportBtn.disabled = true;

// 設定成功狀態
exportBtn.classList.add('success');
exportBtn.querySelector('.export-main-text').textContent = '匯出完成';

// 重置狀態
exportBtn.classList.remove('loading', 'success', 'error');
exportBtn.disabled = false;
```

### 2. 複製按鈕 (Copy Button)

簡潔設計的次要操作按鈕。

#### HTML結構

```html
<button class="copy-btn modern" id="copyBtn">
  <div class="copy-btn-content">
    <svg class="copy-icon"><!-- 圖標 --></svg>
    <span class="copy-text">複製內容</span>
  </div>
  <div class="copy-btn-ripple"></div>
</button>
```

#### 狀態類別

- `.success` - 成功狀態
- `.error` - 錯誤狀態

### 3. 狀態卡片 (Status Card)

顯示記憶狀態的主要資訊卡片。

#### HTML結構

```html
<div class="status-card modern success" id="statusCard">
  <div class="card-header">
    <div class="card-icon"><!-- 圖標 --></div>
    <div class="card-title">記憶狀態</div>
  </div>
  <div class="card-content">
    <div class="status-value">記憶正常</div>
    <div class="status-time">剛剛</div>
  </div>
</div>
```

#### 狀態類別

- `.success` - 正常狀態（綠色）
- `.warning` - 警告狀態（橙色）
- `.memory-full` - 記憶已滿狀態（特殊動畫）

### 4. 匯出結果區塊 (Export Result Section)

匯出完成後顯示的結果區塊，取代原有的模態窗。

#### HTML結構

```html
<div
  class="export-result-section"
  id="exportResultSection"
  style="display: none;"
>
  <div class="export-result-header">
    <div class="export-result-icon"><!-- 成功圖標 --></div>
    <div class="export-result-content">
      <div class="export-result-title">匯出完成</div>
      <div class="export-result-stats">共 24 筆記憶</div>
    </div>
    <button class="export-result-close"><!-- 關閉按鈕 --></button>
  </div>

  <div class="export-format-selection">
    <div class="format-option selected" data-format="markdown">
      <div class="format-icon"><!-- Markdown圖標 --></div>
      <div class="format-content">
        <div class="format-name">Markdown</div>
        <div class="format-desc">結構化格式</div>
      </div>
    </div>
    <div class="format-option" data-format="text">
      <div class="format-icon"><!-- 文字圖標 --></div>
      <div class="format-content">
        <div class="format-name">純文字</div>
        <div class="format-desc">簡潔格式</div>
      </div>
    </div>
  </div>

  <div class="export-actions">
    <button class="btn-primary copy-result-btn">複製到剪貼簿</button>
  </div>
</div>
```

#### 顯示/隱藏

```javascript
// 顯示
exportResultSection.style.display = 'block';
setTimeout(() => {
  exportResultSection.classList.add('show');
}, 10);

// 隱藏
exportResultSection.classList.remove('show');
setTimeout(() => {
  exportResultSection.style.display = 'none';
}, 250);
```

### 5. 摺疊式區塊 (Collapsible Sections)

用於歷史記錄和設定的摺疊式區塊。

#### HTML結構

```html
<div class="history-section" id="historySection" style="display: none">
  <div class="section-header">
    <div class="section-title">
      <svg class="section-icon"><!-- 圖標 --></svg>
      <span>歷史記憶</span>
    </div>
    <div class="section-actions">
      <button class="section-btn"><!-- 操作按鈕 --></button>
    </div>
  </div>
  <div class="section-content">
    <!-- 內容區域 -->
  </div>
</div>
```

#### 切換邏輯

```javascript
// 開啟
historySection.style.display = 'block';
setTimeout(() => {
  historySection.classList.add('show');
}, 10);

// 關閉
historySection.classList.remove('show');
setTimeout(() => {
  historySection.style.display = 'none';
}, 250);
```

### 6. Toast 通知 (Toast Notifications)

取代模態窗的輕量級通知系統。

#### 類型

- `toast-success` - 成功通知（綠色）
- `toast-error` - 錯誤通知（紅色）
- `toast-info` - 資訊通知（藍色）

#### 使用方式

```javascript
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close">×</button>
    </div>
  `;

  document.body.appendChild(toast);

  // 顯示動畫
  setTimeout(() => toast.classList.add('show'), 10);

  // 自動消失
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
```

## 動畫系統

### 動畫時間變數

```css
:root {
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}
```

### 關鍵動畫

#### 1. 摺疊展開動畫

```css
.collapsible-content {
  opacity: 0;
  transform: translateY(-10px);
  transition: all var(--transition-normal);
}

.collapsible-content.show {
  opacity: 1;
  transform: translateY(0);
}
```

#### 2. 按鈕點擊漣漪效果

```css
.btn-ripple::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    width: 300px;
    height: 300px;
  }
}
```

#### 3. 粒子動畫

```css
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particleFloat 4s ease-in-out infinite;
}

@keyframes particleFloat {
  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-10px) scale(1.2);
    opacity: 1;
  }
}
```

## 響應式設計

### 斷點

- **標準寬度**: 380px（擴充套件popup標準寬度）
- **最小寬度**: 320px（支援小螢幕設備）
- **最大高度**: 600px（避免過長的popup）

### 響應式調整

```css
@media (max-width: 380px) {
  body {
    width: 320px;
  }

  .app-header,
  .app-main,
  .app-footer {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
```

## 無障礙設計

### ARIA標籤

```html
<!-- 區域標籤 -->
<div role="region" aria-labelledby="sectionTitle">
  <!-- 按鈕標籤 -->
  <button aria-label="關閉匯出結果">
    <!-- 狀態更新 -->
    <div aria-live="polite">
      <!-- 單選組 -->
      <div role="radiogroup" aria-labelledby="groupLabel">
        <div role="radio" aria-checked="true"></div>
      </div>
    </div>
  </button>
</div>
```

### 鍵盤導航

- 所有互動元素支援Tab鍵導航
- 提供清晰的focus指示器
- 支援Enter和Space鍵操作
- 方向鍵導航支援

### 螢幕閱讀器支援

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## 最佳實踐

### 1. 色彩使用

- 始終使用CSS變數而非硬編碼顏色
- 確保足夠的對比度
- 狀態顏色保持一致

### 2. 動畫效果

- 使用transform和opacity進行動畫
- 支援prefers-reduced-motion設定
- 保持動畫時間一致

### 3. 組件結構

- 保持HTML語義化
- 使用適當的ARIA標籤
- 確保鍵盤可訪問性

### 4. 狀態管理

- 使用類別而非內聯樣式
- 提供清晰的視覺反饋
- 處理所有錯誤狀態

## 測試指南

### 視覺測試

1. 檢查所有組件使用統一色彩變數
2. 驗證文字大小和權重一致性
3. 確認間距使用統一的space變數
4. 測試不同螢幕尺寸下的顯示效果

### 功能測試

1. 測試完整的匯出和格式選擇流程
2. 驗證摺疊展開和記錄管理功能
3. 測試所有狀態變化的即時反饋
4. 檢查各種錯誤情況的處理

### 無障礙測試

1. 使用Tab鍵測試所有功能
2. 使用螢幕閱讀器測試
3. 檢查色彩對比度
4. 測試reduced-motion設定效果

## 文件結構

```
src/ui/
├── popup.html          # 主要HTML結構
├── popup.css           # 統一樣式系統
└── popup.js            # 互動邏輯

測試文件/
├── ui-showcase.html    # 完整UI展示頁面
├── test-dark-ui.html   # 深色主題測試
├── test-modern-ui.html # 現代化UI測試
└── test-button-design.html # 按鈕設計測試
```

## 更新日誌

### v1.5.2 - UI統一化

- 移除所有模態窗，改為即時更新介面
- 統一深色主題色彩系統
- 重新設計匯出流程為無模態窗體驗
- 實作摺疊式歷史記錄和設定區塊
- 添加Toast通知系統
- 改善無障礙功能和鍵盤導航
- 優化動畫效果和響應式設計

這個統一化的UI系統提供了一致、現代、無障礙的用戶體驗，同時保持了所有原有功能的完整性。
