# CLAUDE.md - ChatGPT Memory Toolkit

**專業 Chrome 擴充套件** | Manifest V3 | ES6 模組化架構 | 記憶管理工具

## 專案概覽

這是一個現代化的 Chrome 擴充套件，專為 ChatGPT 記憶管理設計。採用專業級架構標準，具備完整的記憶檢測、多格式匯出和用戶友好介面。

### 核心特色
- ✅ **Manifest V3** - 最新 Chrome 擴充套件標準
- ✅ **ES6 模組化** - 現代 JavaScript 架構設計
- ✅ **多格式匯出** - Markdown, JSON, CSV, HTML, TXT
- ✅ **智能檢測** - 精確記憶使用率偵測（中英文）
- ✅ **專業 UI** - Material Design 風格介面
- ✅ **完整架構** - Service Worker + Content Scripts

## 架構組成

### 📁 專案結構
```
chatgpt-memory-toolkit/
├── manifest.json          # Chrome 擴充套件配置
├── package.json           # 專案依賴和建構腳本
├── src/
│   ├── constants/
│   │   └── config.js      # 應用配置常數
│   ├── scripts/
│   │   ├── background.js  # Service Worker 背景服務
│   │   └── content.js     # Content Script 內容腳本
│   ├── ui/
│   │   ├── popup.html     # 彈出視窗介面
│   │   ├── popup.css      # 彈出視窗樣式
│   │   └── popup.js       # 彈出視窗邏輯
│   └── utils/
│       ├── logger.js      # 日誌管理系統
│       ├── storage.js     # 儲存管理工具
│       ├── memoryDetector.js # 記憶檢測引擎
│       └── exportFormats.js  # 匯出格式處理
├── assets/
│   └── icons/            # 圖標檔案 (16x16, 32x32, 48x48, 128x128)
└── build/
    └── generate-icons.py # 圖標生成工具
```

### 🏗 架構特點

**模組化設計**
- 每個功能獨立模組，高內聚低耦合
- ES6 import/export 語法，現代化模組管理
- 清晰的職責分離和依賴注入

**專業標準**
- Chrome Manifest V3 完全相容
- Service Worker 替代 Background Pages
- 現代 JavaScript (ES2020+) 語法標準

## 技術詳情

### 🔧 核心組件

**Background Service Worker** (`src/scripts/background.js`)
```javascript
class BackgroundService {
  constructor() {
    this.settingsManager = new SettingsManager();
    this.isInitialized = false;
    this.init();
  }
  // 處理擴充套件生命週期、通知、下載等
}
```

**Content Script Manager** (`src/scripts/content.js`)
```javascript
class ContentScriptManager {
  constructor() {
    this.isInitialized = false;
    this.memoryData = [];
    this.currentUsage = null;
    // 處理頁面交互、記憶檢測、UI 注入
  }
}
```

**Popup Manager** (`src/ui/popup.js`)
```javascript
class PopupManager {
  constructor() {
    this.currentTab = null;
    this.memoryData = [];
    this.selectedFormat = 'markdown';
    // 管理彈出視窗 UI 和用戶互動
  }
}
```

### 📋 設定檔案

**應用設定** (`src/constants/config.js`)
- `APP_CONFIG` - 應用基本資訊
- `CHATGPT_CONFIG` - ChatGPT 特定設定（選擇器、關鍵字、超時）
- `UI_CONFIG` - 介面主題和樣式設定
- `STORAGE_KEYS` - 儲存鍵值常數
- `DEFAULT_SETTINGS` - 預設用戶設定
- `EXPORT_FORMATS` - 匯出格式定義
- `MESSAGE_TYPES` - 消息類型常數
- `ERROR_CODES` - 錯誤代碼定義

### 🛠 工具模組

**記憶檢測器** (`src/utils/memoryDetector.js`)
- 多語言支援（中文/英文）
- 多種格式檢測（百分比、分數、文字描述）
- DOM 遍歷和 MutationObserver 監控

**匯出格式處理** (`src/utils/exportFormats.js`)
- 工廠模式設計，支援多種匯出格式
- 結構化資料轉換和格式化
- 檔名生成和 MIME 類型處理

**儲存管理** (`src/utils/storage.js`)
- Chrome Storage API 封裝
- 非同步操作和錯誤處理
- 設定管理和資料持久化

**日誌系統** (`src/utils/logger.js`)
- 結構化日誌記錄
- 多級別日誌（info, warn, error）
- 開發/生產模式自動切換

## 建構與開發

### 📦 依賴管理

**package.json 腳本**
```json
{
  "build": "node build/build.js",
  "dev": "node build/dev.js", 
  "test": "jest",
  "lint": "eslint src/**/*.js",
  "format": "prettier --write src/**/*.{js,html,css}",
  "package": "npm run build && node build/package.js"
}
```

### 🎨 圖標生成

**Python 圖標生成器** (`build/generate-icons.py`)
```python
# 自動生成多尺寸 SVG 和 PNG 圖標
# 支援漸層、陰影和現代設計元素
# 輸出 16x16, 32x32, 48x48, 128x128 尺寸
```

### 🔄 開發流程

**安裝開發環境**
```bash
# 1. 複製專案
git clone <repository-url>
cd chatgpt-memory-toolkit

# 2. 安裝依賴（如需開發工具）
npm install

# 3. 生成圖標
python build/generate-icons.py

# 4. 載入到 Chrome
# chrome://extensions/ -> 開發者模式 -> 載入未封裝項目
```

## 擴充指南

### ➕ 添加新匯出格式

1. **擴展格式定義**
```javascript
// src/constants/config.js
export const EXPORT_FORMATS = {
  xml: {
    extension: 'xml',
    mimeType: 'application/xml',
    name: 'XML',
    description: 'XML 格式，適合結構化資料'
  }
};
```

2. **實作格式處理器**
```javascript
// src/utils/exportFormats.js
class XMLExporter extends BaseExporter {
  constructor() {
    super('xml');
  }
  
  format(data) {
    // XML 格式轉換邏輯
    return this.generateXML(data);
  }
}
```

3. **更新 UI 選擇器**
```html
<!-- src/ui/popup.html -->
<button class="format-btn" data-format="xml">
  <div class="format-icon">XML</div>
  <span>XML Format</span>
</button>
```

### 🔧 添加新功能模組

1. **建立工具模組**
```javascript
// src/utils/newFeature.js
export class NewFeature {
  constructor(options = {}) {
    this.options = options;
    this.logger = new Logger('NewFeature');
  }
  
  async execute() {
    this.logger.info('Executing new feature...');
    // 功能實作
  }
}
```

2. **整合到主系統**
```javascript
// src/scripts/content.js 或 background.js
import { NewFeature } from '../utils/newFeature.js';

// 在適當位置使用
const feature = new NewFeature();
await feature.execute();
```

### 🎨 自訂 UI 樣式

**使用 CSS 變數系統**
```css
/* src/ui/popup.css */
:root {
  --custom-color: #your-color;
  --custom-spacing: 8px;
}

.custom-component {
  background: var(--custom-color);
  padding: var(--custom-spacing);
  /* 遵循現有設計系統 */
}
```

## 最佳實踐

### 🔒 安全標準
- ✅ 最小權限原則（Manifest 權限）
- ✅ 本地資料處理（無外部傳輸）
- ✅ 內容安全政策 (CSP) 遵循
- ✅ 用戶資料隱私保護

### ⚡ 效能優化
- ✅ 非同步操作避免阻塞
- ✅ DOM 操作最佳化
- ✅ 記憶體使用監控
- ✅ 快取機制實作

### 🧪 測試策略
- ✅ 單元測試覆蓋核心邏輯
- ✅ 整合測試驗證組件互動
- ✅ 端到端測試確保用戶流程
- ✅ 跨瀏覽器相容性測試

## 疑難排解

### 🚨 常見問題

**擴充套件無法載入**
```bash
# 檢查 manifest.json 語法
# 確認檔案路徑正確
# 查看 Chrome 開發者工具錯誤訊息
```

**記憶檢測失敗**
```bash
# 確認在 ChatGPT 官方網站
# 檢查 Content Script 是否正確注入
# 驗證 DOM 選擇器是否需要更新
```

**匯出功能異常**
```bash
# 檢查 Chrome Downloads API 權限
# 確認剪貼簿 API 可用性
# 查看背景腳本錯誤日誌
```

### 🔍 除錯工具

**開發者控制台**
```bash
# 彈出視窗除錯：chrome://extensions/ -> 檢查檢視畫面 -> popup.html
# 背景腳本除錯：chrome://extensions/ -> 檢查檢視畫面 -> Service Worker
# 內容腳本除錯：F12 -> Console (在 ChatGPT 頁面)
```

## 自動委派 (Automatic Delegation)

Claude Code 會根據以下情境自動挑選並召喚 Sub-Agent：

### 🔧 開發階段委派
- **code-quality-reviewer**：在偵測到任何 `git commit`、`git push` 或 Pull Request 時自動現身
- **test-runner**：在 Pre-Push、CI Pipeline 或 Merge Request 階段自動執行測試
- **error-debugger**：當測試失敗、Build Crash 或 uncaught exception 時自動啟動
- **doc-writer**：在功能分支合併至 `main`、公開 API 變動或 release 標籤前自動觸發

### 🌐 Chrome Extension 特定委派規則
- **content script 修改**：自動觸發 code-quality-reviewer 檢查安全性和效能
- **manifest.json 更新**：自動觸發 doc-writer 更新版本說明和功能描述
- **popup 界面變更**：自動觸發 test-runner 執行 UI 測試和使用者體驗驗證
- **background script 變更**：自動觸發 error-debugger 檢查服務工作者的穩定性

## 授權與貢獻

- **授權**: MIT License
- **貢獻**: 歡迎 Pull Request 和 Issue 報告
- **規範**: 遵循 ESLint 和 Prettier 代碼風格

---

**專案狀態**: 生產就緒 | **版本**: v1.0.0 | **維護**: 積極維護中