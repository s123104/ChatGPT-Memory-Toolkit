# ChatGPT Memory Toolkit

> 專業的 ChatGPT 記憶管理 Chrome 擴充套件 - 支援多種匯出格式，具備完整的記憶使用率檢測功能

## ✨ 核心功能

### 🎯 多格式匯出
- **Markdown** - 適合文檔編輯，支援語法高亮
- **JSON** - 結構化資料，便於程式處理
- **CSV** - 試算表格式，支援資料分析
- **HTML** - 網頁格式，美觀的視覺呈現
- **TXT** - 純文字格式，通用性最高

### 🔍 智能檢測
- **精確的記憶使用率檢測** - 支援中英文介面
- **多種偵測模式** - 百分比、分數、描述文字
- **即時狀態監控** - 自動更新記憶狀態
- **記憶已滿通知** - 及時提醒用戶匯出

### 🎨 專業介面
- **現代化設計** - 符合 Material Design 規範
- **格式選擇器** - 直觀的格式選擇介面
- **即時預覽** - 顯示記憶數量和使用率
- **響應式設計** - 支援不同螢幕尺寸
- **深色模式** - 自動適應系統主題

### 🚀 進階功能
- **一鍵複製** - 快速複製到剪貼簿
- **檔案下載** - 自動產生檔名並下載
- **統計追蹤** - 記錄匯出歷史和使用情況
- **快捷鍵支援** - Ctrl+Shift+E 快速匯出  

## 📦 安裝方式

### 開發者模式安裝（推薦）

1. **下載專案**
   ```bash
   git clone https://github.com/your-repo/chatgpt-memory-toolkit.git
   cd chatgpt-memory-toolkit
   ```

2. **載入擴充套件**
   - 開啟 Chrome，前往 `chrome://extensions/`
   - 開啟右上角的「開發人員模式」
   - 點擊「載入未封裝項目」
   - 選擇專案根目錄
   - 擴充套件安裝完成！

3. **驗證安裝**
   - 檢查工具列是否出現腦部圖標
   - 前往 [ChatGPT](https://chatgpt.com) 測試功能

### 打包安裝

```bash
# 在擴充套件管理頁面
1. 點擊「打包擴充套件」
2. 選擇專案根目錄
3. 安裝生成的 .crx 文件
```

## 🚀 使用指南

### 基本操作
1. **前往 ChatGPT** - 打開 [chatgpt.com](https://chatgpt.com) 或 [chat.openai.com](https://chat.openai.com)
2. **進入記憶管理** - 導航至 ChatGPT 的記憶管理頁面
3. **開啟擴充套件** - 點擊瀏覽器工具列的腦部圖標
4. **選擇格式** - 在彈出視窗中選擇所需的匯出格式
5. **執行匯出** - 點擊「複製到剪貼簿」或「下載檔案」

### 快捷鍵
- `Ctrl+Shift+E` (Windows/Linux) 或 `Cmd+Shift+E` (Mac) - 快速匯出

### 格式說明
| 格式 | 用途 | 特色 |
|------|------|------|
| Markdown | 文檔編輯 | 支援語法高亮，適合技術文檔 |
| JSON | 程式處理 | 結構化資料，包含完整 metadata |
| CSV | 資料分析 | 試算表格式，支援 Excel/Sheets |
| HTML | 網頁展示 | 精美排版，支援列印和分享 |
| TXT | 通用格式 | 純文字，相容性最佳 |

## 🏗️ 專業架構

### 專案結構
```
chatgpt-memory-toolkit/
├── 📦 manifest.json          # Chrome 擴充套件配置
├── 📄 package.json           # 專案依賴和腳本
├── src/                      # 核心程式碼
│   ├── constants/            # 配置常數
│   │   └── config.js         # 應用配置
│   ├── scripts/              # 擴充套件腳本
│   │   ├── background.js     # 背景服務工作者
│   │   └── content.js        # 內容腳本
│   ├── ui/                   # 使用者介面
│   │   ├── popup.html        # 彈出視窗 HTML
│   │   ├── popup.css         # 彈出視窗樣式
│   │   └── popup.js          # 彈出視窗邏輯
│   └── utils/                # 工具模組
│       ├── logger.js         # 日誌系統
│       ├── storage.js        # 儲存管理
│       ├── memoryDetector.js # 記憶檢測
│       └── exportFormats.js  # 匯出格式
├── assets/                   # 靜態資源
│   └── icons/               # 圖標檔案
└── build/                   # 建構工具
    └── generate-icons.py    # 圖標生成腳本
```

### 技術特色
- **Manifest V3** - 最新 Chrome 擴充套件標準
- **ES6 模組** - 現代 JavaScript 模組化架構
- **Service Worker** - 高效能背景處理
- **模組化設計** - 高度可維護和可擴充
- **TypeScript 準備** - 支援未來 TypeScript 遷移

## 🚧 擴充功能指南

### 添加新的匯出格式

1. **建立格式處理器**
   ```javascript
   // src/utils/exportFormats.js
   class YourFormatExporter extends BaseExporter {
     constructor() {
       super('yourformat');
     }
     
     format(data) {
       // 實作您的格式邏輯
       return formattedContent;
     }
   }
   ```

2. **註冊格式**
   ```javascript
   // src/constants/config.js
   export const EXPORT_FORMATS = {
     yourformat: {
       name: 'Your Format',
       extension: 'ext',
       mimeType: 'application/your-format'
     }
   };
   ```

3. **更新 UI**
   ```html
   <!-- src/ui/popup.html -->
   <button class="format-btn" data-format="yourformat">
     <div class="format-icon">EXT</div>
     <span>Your Format</span>
   </button>
   ```

### 添加新功能模組

1. **建立工具模組**
   ```javascript
   // src/utils/yourFeature.js
   export class YourFeature {
     constructor() {
       // 初始化
     }
     
     async execute() {
       // 功能邏輯
     }
   }
   ```

2. **整合到主系統**
   ```javascript
   // src/scripts/content.js
   import { YourFeature } from '../utils/yourFeature.js';
   
   // 在適當位置使用
   const feature = new YourFeature();
   await feature.execute();
   ```

### 自訂 UI 元件

參考現有的 `popup.css` 和 CSS 變數系統：

```css
:root {
  --your-color: #your-hex;
}

.your-component {
  background: var(--your-color);
  /* 使用現有的設計系統 */
}
```

## 🔧 系統需求

- **Chrome 88+** - 支援 Manifest V3
- **記憶體** - 最低 50MB 可用空間
- **權限** - ChatGPT 網站存取權限
- **API** - 剪貼簿和下載 API 支援

## 🛡️ 隱私與安全

- ✅ **本地處理** - 所有資料處理在本地進行
- ✅ **最小權限** - 僅請求必要的瀏覽器權限
- ✅ **開源透明** - 完整原始碼可供審核
- ✅ **無追蹤** - 不收集使用者數據
- ✅ **安全儲存** - 使用 Chrome 安全儲存 API

## ❓ 疑難排解

### 常見問題

**🔸 擴充套件圖標呈現灰色**
```
解決方案：
1. 確認在 ChatGPT 網站 (chatgpt.com)
2. 重新整理頁面
3. 檢查開發者控制台是否有錯誤
```

**🔸 無法檢測到記憶**
```
解決方案：
1. 前往 ChatGPT 的記憶管理頁面
2. 確保記憶功能已啟用
3. 嘗試重新載入擴充套件
```

**🔸 匯出過程中斷**
```
解決方案：
1. 檢查網路連線
2. 重新點擊匯出按鈕
3. 檢查 Chrome 下載設定
```

### 偵錯模式

1. 開啟 `chrome://extensions/`
2. 找到 ChatGPT Memory Toolkit
3. 點擊「檢查檢視畫面」→「彈出式視窗」
4. 查看 Console 輸出

## 📈 版本資訊

- **v1.0.0** - 初始專業版本
  - ✨ 多格式匯出支援
  - 🔍 強化記憶檢測
  - 🎨 全新專業 UI
  - 🏗️ 模組化架構重構

## 🤝 貢獻指南

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 授權條款

MIT License - 詳見 [LICENSE](LICENSE) 檔案

---

**🚀 開始使用：** 下載專案 → 載入到 Chrome → 前往 ChatGPT → 點擊腦部圖標！