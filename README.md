# ChatGPT Memory Manager

> 簡潔高效的 ChatGPT 記憶管理 Chrome 擴充套件 - 自動檢測記憶已滿並匯出 Markdown 格式

## ✨ 核心功能

### 🤖 自動檢測與匯出

- **智能監控** - 自動檢測「儲存的記憶已滿」提示
- **一鍵匯出** - 自動跳轉到記憶管理頁面並匯出
- **Markdown 格式** - 清晰易讀的 Markdown 格式輸出
- **剪貼簿複製** - 自動複製到剪貼簿，方便使用

### 🔍 精確檢測

- **記憶使用率檢測** - 支援中文介面的百分比檢測
- **記憶數量統計** - 準確計算記憶項目數量
- **即時狀態更新** - 動態顯示記憶狀態

### 🎨 簡潔介面

- **現代化設計** - 清爽簡潔的使用者介面
- **狀態顯示** - 即時顯示記憶使用量和數量
- **操作簡單** - 一鍵匯出，一鍵複製

## 📦 安裝方式

### 開發者模式安裝

1. **下載專案**

   ```bash
   git clone https://github.com/your-repo/chatgpt-memory-manager.git
   cd chatgpt-memory-manager
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

## 🚀 使用指南

### 自動模式（推薦）

1. **前往 ChatGPT** - 打開 [chatgpt.com](https://chatgpt.com)
2. **正常使用** - 當記憶接近滿載時會自動檢測
3. **自動匯出** - 出現「儲存的記憶已滿」時自動執行匯出流程
4. **查看結果** - 在瀏覽器控制台查看 Markdown 輸出，並自動複製到剪貼簿

### 手動操作

1. **點擊圖標** - 點擊瀏覽器工具列的腦部圖標
2. **查看狀態** - 檢視記憶使用量和數量
3. **手動匯出** - 點擊「匯出 Markdown」按鈕
4. **複製資料** - 點擊「複製到剪貼簿」按鈕

### 輸出格式

匯出的 Markdown 格式包含：

- 記憶標題和使用量
- 記憶項目總數
- 完整的記憶清單（編號列表）

## 🏗️ 簡潔架構

### 專案結構

```
chatgpt-memory-manager/
├── 📦 manifest.json          # Chrome 擴充套件配置
├── 📄 package.json           # 專案依賴和腳本
├── src/                      # 核心程式碼
│   ├── scripts/              # 擴充套件腳本
│   │   └── content.js        # 內容腳本（主要邏輯）
│   └── ui/                   # 使用者介面
│       ├── popup.html        # 彈出視窗 HTML
│       ├── popup.css         # 彈出視窗樣式
│       └── popup.js          # 彈出視窗邏輯
├── assets/                   # 靜態資源
│   └── icons/               # 圖標檔案
└── chatgpt-memory-manager.js # 原始腳本（參考用）
```

### 技術特色

- **Manifest V3** - 最新 Chrome 擴充套件標準
- **純 JavaScript** - 無額外依賴，輕量化設計
- **自動化流程** - 基於 DOM 操作的智能檢測
- **簡潔架構** - 最小化複雜度，專注核心功能

## 🔧 系統需求

- **Chrome 88+** - 支援 Manifest V3
- **記憶體** - 最低 10MB 可用空間
- **權限** - ChatGPT 網站存取權限

## 🛡️ 隱私與安全

- ✅ **本地處理** - 所有資料處理在本地進行
- ✅ **最小權限** - 僅請求必要的瀏覽器權限
- ✅ **開源透明** - 完整原始碼可供審核
- ✅ **無追蹤** - 不收集使用者數據

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

**🔸 自動匯出未觸發**

```
解決方案：
1. 檢查是否出現「儲存的記憶已滿」文字
2. 手動點擊擴充套件圖標進行匯出
3. 查看瀏覽器控制台的錯誤訊息
```

### 偵錯模式

1. 開啟 `chrome://extensions/`
2. 找到 ChatGPT Memory Manager
3. 點擊「檢查檢視畫面」→「彈出式視窗」
4. 查看 Console 輸出

## 📈 版本資訊

- **v1.0.0** - 簡化重構版本
  - ✨ 基於 chatgpt-memory-manager.js 的自動檢測邏輯
  - 🎯 專注於 Markdown 格式匯出
  - 🚀 簡潔的使用者介面
  - 🔧 最小化權限需求

## 🤝 貢獻指南

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'feat(feature): 新增驚人功能'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 授權條款

MIT License - 詳見 [LICENSE](LICENSE) 檔案

---

**🚀 開始使用：** 下載專案 → 載入到 Chrome → 前往 ChatGPT → 自動檢測匯出！
