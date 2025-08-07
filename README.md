# ChatGPT Memory Toolkit

<div align="center">

![ChatGPT Memory Toolkit](assets/icons/icon128.png)

**Professional Chrome Extension for ChatGPT Memory Management**

[![Version](https://img.shields.io/badge/version-1.6.0-blue?style=flat-square)](https://github.com/your-username/chatgpt-memory-toolkit)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-red?style=flat-square&logo=google-chrome)](https://chrome.google.com/webstore)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

[English](#english) | [繁體中文](#繁體中文)

</div>

---

## English

### 🚀 Features

- 🧠 **Smart Memory Detection** - Automatically detects when ChatGPT memory is full
- 📤 **One-Click Export** - Export memory content in multiple formats (Markdown/Text)
- 📋 **Clipboard Integration** - Automatically copy exported content to clipboard
- 📚 **History Management** - Complete export history tracking and management
- ⚙️ **Customizable Settings** - Personalized reminder and management options
- 🎨 **Modern UI** - Intuitive and user-friendly interface with dark mode support
- 🔔 **Smart Alerts** - Non-intrusive modal notifications when memory is full
- 📊 **Storage Monitoring** - Real-time Chrome storage usage tracking

### 🛠️ Installation

#### From Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore)
2. Search for "ChatGPT Memory Toolkit"
3. Click "Add to Chrome"

#### Manual Installation (Development)

1. Clone this repository

   ```bash
   git clone https://github.com/your-username/chatgpt-memory-toolkit.git
   cd chatgpt-memory-toolkit
   ```

2. Install dependencies and build

   ```bash
   npm install
   npm run build
   ```

3. Load extension in Chrome
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

### 🎯 Usage

1. **Automatic Detection**: Extension automatically monitors ChatGPT memory status
2. **Manual Export**: Click extension icon and select "Export Memory"
3. **View History**: Access export history in the popup window
4. **Customize Settings**: Configure auto-alerts and history management preferences

### 🔧 Development

#### Prerequisites

- Node.js 16+
- Chrome 88+

#### Commands

```bash
npm run dev      # Development mode (lint + build)
npm run lint     # Code linting with ESLint
npm run format   # Code formatting with Prettier
npm run build    # Build extension for production
```

#### Project Structure

```
src/
├── scripts/
│   └── content.js          # Content script - main logic
├── ui/
│   ├── popup.html          # Extension popup interface
│   ├── popup.css           # Popup styles and animations
│   └── popup.js            # Popup logic and interactions
└── utils/
    └── storage-manager.js  # Chrome storage management
```

### 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🐛 Bug Reports & Feature Requests

- [Report Issues](https://github.com/your-username/chatgpt-memory-toolkit/issues)
- [Request Features](https://github.com/your-username/chatgpt-memory-toolkit/issues)

---

## 繁體中文

### 🚀 功能特色

- 🧠 **智能記憶檢測** - 自動偵測 ChatGPT 記憶已滿狀態
- 📤 **一鍵匯出** - 支援多種格式匯出記憶內容 (Markdown/純文字)
- 📋 **剪貼簿整合** - 自動複製匯出內容到剪貼簿
- 📚 **歷史記錄管理** - 完整的匯出歷史追蹤和管理
- ⚙️ **個人化設定** - 可自訂的提醒和管理選項
- 🎨 **現代化介面** - 直觀易用的使用者介面，支援深色模式
- 🔔 **智能提醒** - 記憶已滿時的非侵入式模態通知
- 📊 **儲存監控** - 即時 Chrome 儲存使用量追蹤

### 🛠️ 安裝方式

#### 從 Chrome Web Store 安裝（推薦）

1. 前往 [Chrome Web Store](https://chrome.google.com/webstore)
2. 搜尋「ChatGPT Memory Toolkit」
3. 點擊「加到 Chrome」

#### 手動安裝（開發版本）

1. 複製此專案

   ```bash
   git clone https://github.com/your-username/chatgpt-memory-toolkit.git
   cd chatgpt-memory-toolkit
   ```

2. 安裝依賴並建置

   ```bash
   npm install
   npm run build
   ```

3. 載入擴充套件到 Chrome
   - 開啟 `chrome://extensions/`
   - 開啟「開發人員模式」
   - 點擊「載入未封裝項目」並選擇專案目錄

### 🎯 使用方法

1. **自動檢測**：擴充套件自動監控 ChatGPT 記憶狀態
2. **手動匯出**：點擊擴充套件圖示並選擇「匯出記憶」
3. **查看歷史**：在彈出視窗中存取匯出歷史記錄
4. **自訂設定**：配置自動提醒和歷史記錄管理偏好

### 🔧 開發

#### 前置需求

- Node.js 16+
- Chrome 88+

#### 開發指令

```bash
npm run dev      # 開發模式（檢查 + 建置）
npm run lint     # 使用 ESLint 進行程式碼檢查
npm run format   # 使用 Prettier 進行程式碼格式化
npm run build    # 建置生產版本
```

#### 專案結構

```
src/
├── scripts/
│   └── content.js          # 內容腳本 - 主要邏輯
├── ui/
│   ├── popup.html          # 擴充套件彈出介面
│   ├── popup.css           # 彈出視窗樣式和動畫
│   └── popup.js            # 彈出視窗邏輯和互動
└── utils/
    └── storage-manager.js  # Chrome 儲存管理
```

### 🤝 貢獻

歡迎貢獻！請隨時提交 Pull Request。

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

請閱讀 [CONTRIBUTING.md](CONTRIBUTING.md) 了解我們的行為準則和提交 Pull Request 的流程細節。

### 📄 授權

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案。

### 🐛 錯誤回報與功能請求

- [回報問題](https://github.com/your-username/chatgpt-memory-toolkit/issues)
- [請求功能](https://github.com/your-username/chatgpt-memory-toolkit/issues)

---

<div align="center">

**Made with ❤️ for the ChatGPT community**

[Documentation](https://github.com/your-username/chatgpt-memory-toolkit/wiki) · [Changelog](CHANGELOG.md) · [Privacy Policy](#privacy-policy)

</div>

## Privacy Policy

This extension respects your privacy:

- **No Data Collection**: We don't collect, store, or transmit any personal data
- **Local Storage Only**: All data is stored locally in your browser
- **No External Servers**: The extension works entirely offline
- **Open Source**: Full source code is available for audit

## Technical Details

- **Manifest Version**: 3 (Latest Chrome Extension standard)
- **Permissions**: Only requests minimal necessary permissions
- **Content Security Policy**: Strict CSP for enhanced security
- **Browser Compatibility**: Chrome 88+, Edge 88+

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of all changes.
