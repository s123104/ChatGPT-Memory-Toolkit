# CLAUDE.md - ChatGPT Memory Toolkit

**專業 Chrome 擴充套件** | Manifest V3 | ES6 模組化架構 | 記憶管理工具

## 專案概覽

這是一個現代化的 Chrome 擴充套件，專為 ChatGPT 記憶管理設計。採用專業級架構標準，具備完整的記憶檢測、歷史記錄管理、多格式匯出和用戶友好介面。

### 核心特色
- ✅ **Manifest V3** - 最新 Chrome 擴充套件標準
- ✅ **ES6 模組化** - 現代 JavaScript 架構設計
- ✅ **版本管理系統** - 中央版本控制和自動更新機制
- ✅ **歷史記錄管理** - 完整的匯出歷史追蹤和檢索
- ✅ **智能檢測** - 精確記憶使用率偵測（中英文）
- ✅ **自動提醒** - 記憶已滿時的智能模態窗提醒
- ✅ **儲存監控** - Chrome Storage API 使用量即時監控
- ✅ **專業 UI** - Material Design 風格現代化介面

## 架構組成

### 📁 專案結構
```
chatgpt-memory-toolkit/
├── manifest.json          # Chrome 擴充套件配置
├── package.json           # 專案依賴和建構腳本
├── src/
│   ├── scripts/
│   │   └── content.js     # Content Script 內容腳本
│   ├── ui/
│   │   ├── popup.html     # 彈出視窗介面
│   │   ├── popup.css      # 彈出視窗樣式
│   │   └── popup.js       # 彈出視窗邏輯
│   └── utils/
│       └── storage-manager.js # 儲存管理和版本控制
├── assets/
│   └── icons/            # 圖標檔案 (16x16, 32x32, 48x48, 128x128)
└── scripts/
    └── update-version.js # 版本更新自動化腳本
```

### 🏗 架構特點

**模組化設計**
- 每個功能獨立模組，高內聚低耦合
- ES6 class 語法，現代化物件導向設計
- 清晰的職責分離和依賴注入

**專業標準**
- Chrome Manifest V3 完全相容
- 現代 JavaScript (ES2020+) 語法標準
- 中央版本管理系統，確保一致性

## Development Commands

### Version Management
```bash
# 更新修訂版本 (1.1.0 → 1.1.1)
npm run version:patch

# 更新次版本 (1.1.0 → 1.2.0)
npm run version:minor

# 更新主版本 (1.1.0 → 2.0.0)
npm run version:major

# 手動更新版本號
npm run version:update
```

### Testing and Quality
```bash
# Run linting
npm run lint

# Format code
npm run format
```

### Extension Development
```bash
# Load extension for development:
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select project root directory
```

## 技術詳情

### 🔧 核心組件

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
class ModernPopupManager {
  constructor() {
    this.currentTab = null;
    this.memoryData = [];
    this.storageManager = null;
    this.settings = {};
    // 管理彈出視窗 UI 和用戶互動
  }
}
```

**Storage Manager** (`src/utils/storage-manager.js`)
```javascript
class StorageManager {
  constructor() {
    this.STORAGE_KEYS = {
      MEMORY_HISTORY: 'memoryHistory',
      SETTINGS: 'settings',
      LAST_EXPORT: 'lastExport'
    };
    // 處理歷史記錄、設定管理、版本控制
  }
}
```

### 📋 版本管理系統

**中央版本控制** (`scripts/update-version.js`)
- 統一版本號管理，同步更新 `package.json` 和 `manifest.json`
- 自動化版本遞增腳本，支援語義化版本控制
- 版本更新日誌和變更追蹤

**版本同步機制**
```javascript
// 確保所有檔案版本一致性
const updateVersion = (newVersion) => {
  updatePackageJson(newVersion);
  updateManifest(newVersion);
  generateChangeLog(newVersion);
};
```

### 🛠 工具模組

**歷史記錄管理**
- 完整的匯出歷史追蹤和檢索功能
- 智能存儲優化，支援最大 50 筆歷史記錄
- 自動清理機制，防止存儲空間溢出
- 匯出時間戳記和檔案大小統計

**應用設定系統**
- 用戶偏好設定持久化儲存
- 自動提醒模態窗開關控制
- 歷史記錄數量限制調整
- 自動清理策略配置

**儲存監控**
- Chrome Storage API 使用量即時監控
- 存儲空間配額警告和優化建議
- 資料備份和恢復機制
- 存儲效能分析和最佳化

### 資料流架構

1. **檢測階段**: Content Script 監控 DOM 變化，檢測「儲存的記憶已滿」觸發文字
2. **導航階段**: 自動導航至 ChatGPT 設定/個人化頁面
3. **收集階段**: 使用智能滾動演算法抓取記憶資料
4. **匯出階段**: 轉換為 Markdown 格式並複製到剪貼簿
5. **儲存階段**: 將匯出記錄存儲至歷史記錄系統
6. **UI 通訊**: Popup 透過訊息傳遞查詢 Content Script 狀態

### 關鍵技術模式

**DOM 操作策略**
- 使用 `MutationObserver` 進行即時 DOM 監控
- 實作 `isVisible()` 輔助函式進行可見性檢查
- `harvestAllMemories()` 中的複雜滾動演算法處理動態載入

**訊息傳遞協定**
```javascript
// Popup → Content Script
{ 
  action: 'getMemoryStatus' | 'exportMemories' | 'getMarkdown' | 'getHistory'
}

// Content Script → Popup  
{ 
  success: boolean, 
  data: array, 
  usage: string, 
  markdown: string,
  history: array,
  storageInfo: object
}
```

**記憶檢測邏輯**
- 多語言支援（中文/英文關鍵字）
- 使用正規表達式從 DOM 文字中提取百分比
- 針對不同 ChatGPT UI 佈局的回退收集方法
- 智能使用量計算和狀態追蹤

**儲存管理模式**
- Chrome Storage API 封裝和錯誤處理
- 非同步操作和 Promise 鏈管理
- 版本相容性檢查和遷移策略
- 資料完整性驗證和修復機制

## 重要實作詳情

### 新功能說明

**歷史記錄管理**
- **功能**: 追蹤所有記憶匯出活動，包括時間戳、資料大小和匯出內容預覽
- **儲存**: 使用 Chrome Storage Local API，支援最大 50 筆記錄
- **介面**: Popup 中的專用歷史記錄按鈕，提供視覺化記錄瀏覽

**自動提醒模態窗**
- **觸發**: 當記憶使用量達到 100% 時，自動顯示優雅的模態窗提醒
- **控制**: 用戶可透過設定頁面開啟/關閉自動提醒功能
- **設計**: Material Design 風格，非侵入式用戶體驗

**儲存使用量監控**
- **即時監控**: 動態顯示 Chrome Storage 使用量和配額狀況
- **警告機制**: 當儲存空間超過 80% 時提供清理建議
- **優化建議**: 智能分析儲存模式，提供最佳化建議

### Content Script 配置

`CONFIG` 物件包含關鍵選擇器和超時設定，當 ChatGPT 介面變更時可能需要更新：

```javascript
const CONFIG = {
  triggerText: '儲存的記憶已滿',  // 記憶已滿觸發文字
  targetURL: 'https://chatgpt.com/#settings/Personalization',
  personalizationTabSel: '[data-testid="personalization-tab"][role="tab"]',
  memoryKeywords: ['管理記憶', 'Manage memory', 'Memory', '記憶'],
  modalTitleKeywords: ['儲存的記憶', 'Saved memories', 'Memories'],
  // 各種 DOM 操作的超時值
}
```

### 記憶收集演算法

`harvestAllMemories()` 函式實作複雜的滾動策略：
- 使用 `scrollTop` 操作結合 `WheelEvent` 和 `KeyboardEvent` 模擬
- 實作閒置檢測機制 `idleRoundsToStop` 防止無限迴圈
- 使用 `Set` 收集唯一記憶項目避免重複
- 當表格結構不存在時回退至替代 DOM 解析

### 擴充套件權限設定

當前權限設定遵循最小權限原則：
- `activeTab`: 僅存取當前分頁
- `scripting`: 內容腳本注入所需
- `storage`: 歷史記錄和設定儲存
- `host_permissions`: 限制於 `https://chatgpt.com/*`

### 建構與開發

**版本管理腳本** (`scripts/update-version.js`)
```bash
# 自動同步 package.json 和 manifest.json 版本號
# 生成版本更新日誌
# 驗證版本號格式和一致性
```

**開發工作流程**
```bash
# 1. 複製專案
git clone <repository-url>
cd chatgpt-memory-toolkit

# 2. 安裝依賴（開發工具）
npm install

# 3. 版本管理
npm run version:patch  # 修訂版本

# 4. 載入到 Chrome
# chrome://extensions/ → 開發者模式 → 載入未封裝項目
```

## 除錯指南

### Content Script 連接問題

如果彈出視窗顯示「未連接」：
1. 檢查 Content Script 是否載入：開啟 ChatGPT 頁面 → F12 → Console → 尋找 "[Memory Manager]" 日誌
2. 重新載入 ChatGPT 頁面以重新初始化 Content Script
3. 檢查 manifest.json 是否符合 ChatGPT 當前網域

### 記憶檢測失敗

如果記憶檢測功能無法運作：
1. 驗證觸發文字是否符合當前 ChatGPT 介面語言
2. 如果 ChatGPT 更改按鈕文字，請更新 `CONFIG.memoryKeywords`
3. 在瀏覽器開發者工具中檢查 DOM 選擇器：`document.querySelector('[data-testid="personalization-tab"]')`

### 匯出流程除錯

匯出工作流程涉及多個可能失敗的非同步步驟：
1. **導航**: 檢查是否能正確導航至設定頁面
2. **分頁檢測**: 驗證個人化分頁選擇器是否正確
3. **模態窗開啟**: 確保「管理」按鈕點擊能開啟記憶模態窗
4. **資料收集**: 檢查表格/行選擇器是否符合當前 DOM 結構

### 歷史記錄問題

如果歷史記錄功能異常：
1. **儲存空間**: 檢查 Chrome Storage 配額是否足夠
2. **資料格式**: 驗證儲存的歷史記錄格式是否正確
3. **權限**: 確認擴充套件擁有 `storage` 權限
4. **清理機制**: 檢查自動清理是否正常運作

### 版本同步問題

如果版本號不一致：
```bash
# 手動執行版本同步
npm run version:update

# 檢查版本一致性
node -e "
const pkg = require('./package.json');
const manifest = require('./manifest.json');
console.log('Package:', pkg.version);
console.log('Manifest:', manifest.version);
console.log('Match:', pkg.version === manifest.version);
"
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

## 授權與貢獻

- **授權**: MIT License
- **貢獻**: 歡迎 Pull Request 和 Issue 報告
- **規範**: 遵循 ESLint 和 Prettier 代碼風格

---

**專案狀態**: 生產就緒 | **版本**: v1.1.0 | **維護**: 積極維護中