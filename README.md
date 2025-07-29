# ChatGPT Memory Toolkit

<div align="center">

![ChatGPT Memory Toolkit](assets/icons/icon128.png)

**Professional ChatGPT Memory Management Chrome Extension**

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue?style=flat-square&logo=google-chrome)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.1.0-green?style=flat-square)](https://github.com/your-username/chatgpt-memory-toolkit)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

[English](#english) | [繁體中文](#繁體中文)

</div>

---

## English

### 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Load extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select the build folder
```

### ✨ Features

- 🧠 **Smart Memory Detection** - Automatically detects when ChatGPT memory is full
- 📤 **One-Click Export** - Export memory content in Markdown format
- 📋 **Clipboard Integration** - Automatically copy exported content to clipboard
- 📚 **History Management** - Complete export history tracking and management
- ⚙️ **Customizable Settings** - Personalized reminder and management options
- 🎨 **Modern UI** - Intuitive and user-friendly interface
- 🔔 **Auto Alerts** - Smart modal notifications when memory is full
- 📊 **Storage Monitoring** - Real-time Chrome storage usage tracking

### 🛠️ Development

#### Prerequisites

- Node.js 16+
- Chrome 88+

#### Commands

```bash
npm run dev      # Development mode (lint + build)
npm run lint     # Code linting
npm run format   # Code formatting
npm run build    # Build extension
```

#### Project Structure

```
src/
├── scripts/
│   └── content.js          # Content script - main logic
├── ui/
│   ├── popup.html          # Popup HTML
│   ├── popup.css           # Popup styles
│   └── popup.js            # Popup logic
└── utils/
    └── storage-manager.js  # Storage management
```

### 📦 Installation

#### From Chrome Web Store (Recommended)

1. Visit [Chrome Web Store](https://chrome.google.com/webstore)
2. Search for "ChatGPT Memory Toolkit"
3. Click "Add to Chrome"

#### Manual Installation

1. Download or clone this repository
2. Run `npm install && npm run build`
3. Open `chrome://extensions/` in Chrome
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `build` folder

### 🎯 Usage

1. **Automatic Detection**: Extension automatically detects when ChatGPT memory is full
2. **Manual Export**: Click extension icon and select "Export Memory"
3. **View History**: Access export history in the popup window
4. **Settings**: Customize auto-alerts and history management

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 繁體中文

### 🚀 快速開始

```bash
# 安裝依賴
npm install

# 建置擴充套件
npm run build

# 載入擴充套件到 Chrome
# 1. 前往 chrome://extensions/
# 2. 開啟「開發人員模式」
# 3. 點擊「載入未封裝項目」並選擇 build 資料夾
```

### ✨ 功能特色

- 🧠 **智能記憶檢測** - 自動偵測 ChatGPT 記憶已滿狀態
- 📤 **一鍵匯出** - 快速匯出 Markdown 格式記憶內容
- 📋 **剪貼簿整合** - 自動複製匯出內容到剪貼簿
- 📚 **歷史記錄管理** - 完整的匯出歷史追蹤和管理
- ⚙️ **個人化設定** - 可自訂的提醒和管理選項
- 🎨 **現代化介面** - 直觀易用的使用者介面
- 🔔 **自動提醒** - 記憶已滿時的智能模態通知
- 📊 **儲存監控** - 即時 Chrome 儲存使用量追蹤

### 🛠️ 開發

#### 前置需求

- Node.js 16+
- Chrome 88+

#### 開發指令

```bash
npm run dev      # 開發模式（檢查 + 建置）
npm run lint     # 程式碼檢查
npm run format   # 程式碼格式化
npm run build    # 建置擴充套件
```

#### 專案結構

```
src/
├── scripts/
│   └── content.js          # 內容腳本 - 主要邏輯
├── ui/
│   ├── popup.html          # 彈出視窗 HTML
│   ├── popup.css           # 彈出視窗樣式
│   └── popup.js            # 彈出視窗邏輯
└── utils/
    └── storage-manager.js  # 儲存管理
```

### 📦 安裝方式

#### 從 Chrome Web Store 安裝（推薦）

1. 前往 [Chrome Web Store](https://chrome.google.com/webstore)
2. 搜尋「ChatGPT Memory Toolkit」
3. 點擊「加到 Chrome」

#### 手動安裝

1. 下載或複製此專案
2. 執行 `npm install && npm run build`
3. 在 Chrome 中開啟 `chrome://extensions/`
4. 開啟「開發人員模式」
5. 點擊「載入未封裝項目」並選擇 `build` 資料夾

### 🎯 使用方法

1. **自動檢測**：擴充套件自動偵測 ChatGPT 記憶已滿
2. **手動匯出**：點擊擴充套件圖示並選擇「匯出記憶」
3. **查看歷史**：在彈出視窗中存取匯出歷史記錄
4. **設定**：自訂自動提醒和歷史記錄管理

### 🤝 貢獻

歡迎貢獻！請隨時提交 Pull Request。

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 📄 授權

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案。

---

<div align="center">

**Made with ❤️ for the ChatGPT community**

[Report Bug](https://github.com/your-username/chatgpt-memory-toolkit/issues) · [Request Feature](https://github.com/your-username/chatgpt-memory-toolkit/issues) · [Documentation](https://github.com/your-username/chatgpt-memory-toolkit/wiki)

</div>
