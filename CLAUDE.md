# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChatGPT Memory Toolkit has evolved from a browser userscript to a comprehensive Chrome Extension for automating ChatGPT memory management. The extension provides one-click memory export functionality with an intuitive user interface and robust error handling.

## Architecture

### Chrome Extension Components

- **Manifest V3**: Modern Chrome extension configuration with proper permissions
- **Content Script** (`content.js`): Core memory extraction logic injected into ChatGPT pages
- **Background Service Worker** (`background.js`): Handles extension lifecycle, notifications, and communication
- **Popup Interface** (`popup.html/css/js`): User-friendly interface with export controls and statistics
- **Icon System**: Multi-resolution PNG icons (16x16, 32x32, 48x48, 128x128) for various UI contexts

### Core Functionality

- **Memory Detection**: Automatically monitors for "儲存的記憶已滿" (memory full) trigger text
- **One-Click Export**: Simple button click to initiate complete memory extraction
- **UI Automation**: Navigates ChatGPT's settings → Personalization → Memory management
- **Content Extraction**: Multi-strategy scraping with table-based and fallback extraction methods
- **Virtual Scrolling**: Handles infinite scroll lists with intelligent loading detection
- **Progress Tracking**: Real-time progress updates during export process

### Key Technical Patterns

- **Chain-based Waiting**: Each step waits for proper DOM conditions before proceeding
- **MutationObserver**: Used for DOM change detection and monitoring
- **Human-like Interactions**: Simulates natural mouse events with proper event sequences
- **Robust Error Handling**: Multiple fallback strategies and timeout configurations

## Development Commands

### Installation and Testing
```bash
# Load extension in Chrome developer mode
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select the project directory

# Test the extension
# 1. Navigate to chatgpt.com
# 2. Click the extension icon in toolbar
# 3. Use the popup interface to export memories
```

### Project Structure
```
ChatGPT-Memory-Toolkit/
├── manifest.json           # Extension configuration
├── content.js             # Content script for ChatGPT integration
├── background.js          # Service worker for background tasks
├── popup.html/css/js      # Extension popup interface
├── icons/                 # Multi-resolution icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── CLAUDE.md             # This documentation file
```

### Configuration Options

- **Timeouts**: Configurable wait times for UI elements (15-20 seconds for complex operations)
- **Selectors**: Data-testid based element selectors for ChatGPT interface
- **Keywords**: Multi-language support (Traditional Chinese/English) for text detection
- **Scrolling**: Virtual list handling with adaptive step ratios and idle detection
- **Storage**: Chrome extension local storage for settings and export history

### User Interface Features

- **Status Monitoring**: Real-time page status and memory detection
- **One-Click Export**: Large primary button for immediate memory export
- **Progress Tracking**: Visual progress bar with step-by-step status updates
- **Export Statistics**: Historical data showing usage counts and timestamps
- **Settings Panel**: Configurable notifications and automation preferences
- **History Management**: View and manage previous exports with copy functionality

### Technical Integration

- **Host Permissions**: Limited to `chatgpt.com` and `chat.openai.com` domains
- **Content Script Injection**: Automatic injection on target pages with fallback mechanisms
- **Message Passing**: Chrome runtime messaging between popup, content script, and background
- **Storage Management**: Local storage for user preferences and export data
- **Notification System**: Native Chrome notifications for export status updates

## 自動委派 (Automatic Delegation)

Claude Code 會根據以下情境自動挑選並召喚 Sub-Agent：

- **code-quality-reviewer**：在偵測到任何 `git commit`、`git push` 或 Pull Request 時自動現身
- **test-runner**：在 Pre-Push、CI Pipeline 或 Merge Request 階段自動執行測試
- **error-debugger**：當測試失敗、Build Crash 或 uncaught exception 時自動啟動
- **doc-writer**：在功能分支合併至 `main`、公開 API 變動或 release 標籤前自動觸發

### Chrome Extension 特定委派規則

- **content script 修改**：自動觸發 code-quality-reviewer 檢查安全性和效能
- **manifest.json 更新**：自動觸發 doc-writer 更新版本說明和功能描述
- **popup 界面變更**：自動觸發 test-runner 執行 UI 測試和使用者體驗驗證
- **background script 變更**：自動觸發 error-debugger 檢查服務工作者的穩定性