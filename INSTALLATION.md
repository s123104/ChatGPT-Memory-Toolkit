# 安裝指南 | Installation Guide

> ChatGPT Memory Toolkit v1.6.2 完整安裝說明  
> Complete installation instructions for ChatGPT Memory Toolkit v1.6.2

---

## 目錄 | Table of Contents

- [中文安裝指南](#中文安裝指南)
  - [系統需求](#系統需求)
  - [安裝方法](#安裝方法)
  - [驗證安裝](#驗證安裝)
  - [故障排除](#故障排除)
- [English Installation Guide](#english-installation-guide)
  - [System Requirements](#system-requirements)
  - [Installation Methods](#installation-methods)
  - [Installation Verification](#installation-verification)
  - [Troubleshooting](#troubleshooting)

---

## 中文安裝指南

### 系統需求

#### 最低系統需求
- **Chrome 瀏覽器**: 88+ 版本（支援 Manifest V3）
- **作業系統**: Windows 10+, macOS 10.14+, Linux Ubuntu 18.04+
- **記憶體**: 最少 4GB RAM
- **儲存空間**: 50MB 可用空間
- **網路連線**: 需要連接至 `https://chatgpt.com`

#### 開發者額外需求
- **Node.js**: 18.18.0+ 版本（需要 ES Module 支援）
- **npm**: 最新版本 (或 yarn)
- **Git**: 版本控制系統（選用）

### 安裝方法

#### 方法一：Chrome Web Store 安裝（即將推出）

```
⚠️ 注意：Chrome Web Store 版本準備中
```

1. **前往 Chrome Web Store**
   - 開啟 [Chrome Web Store](https://chrome.google.com/webstore)
   - 搜尋「ChatGPT Memory Toolkit」

2. **安裝擴充套件**
   - 點擊「加到 Chrome」按鈕
   - 在彈出視窗中確認「新增擴充功能」

3. **授權許可**
   - 擴充套件會要求以下權限：
     - `activeTab`: 存取目前活躍分頁
     - `scripting`: 執行內容腳本
     - `storage`: 儲存用戶設定和歷史記錄
     - `tabs`: 管理分頁狀態

#### 方法二：開發者手動安裝（推薦給進階使用者）

##### 步驟 1：取得原始碼

**選項 A: Git Clone**
```bash
git clone https://github.com/your-username/chatgpt-memory-toolkit.git
cd chatgpt-memory-toolkit
```

**選項 B: 下載 ZIP**
```bash
# 下載並解壓縮原始碼
# 從 GitHub Releases 頁面下載最新版本
unzip chatgpt-memory-toolkit-v1.6.2.zip
cd chatgpt-memory-toolkit-v1.6.2
```

##### 步驟 2：安裝依賴套件

```bash
# 檢查 Node.js 版本
node --version  # 應該 >= 18.18.0

# 安裝專案依賴
npm install

# 驗證安裝
npm ls
```

##### 步驟 3：建置擴充套件

```bash
# 開發建置（推薦）
npm run dev

# 或生產建置
npm run build

# 驗證建置結果
ls -la src/
```

##### 步驟 4：載入到 Chrome

1. **開啟擴充功能管理頁面**
   ```
   chrome://extensions/
   ```

2. **啟用開發人員模式**
   - 點擊右上角的「開發人員模式」開關
   - 確保已啟用（顯示藍色）

3. **載入擴充套件**
   - 點擊「載入未封裝項目」按鈕
   - 選擇專案根目錄（包含 `manifest.json` 的資料夾）
   - **重要**: 選擇專案根目錄，不是 `build` 或 `dist` 資料夾

4. **確認載入成功**
   - 擴充套件應顯示在列表中
   - 狀態應為「已啟用」
   - 圖示應出現在 Chrome 工具列

### 驗證安裝

#### 基本功能測試

1. **檢查擴充套件圖示**
   ```
   ✅ Chrome 工具列顯示腦部圖示
   ✅ 點擊圖示開啟彈出視窗
   ✅ 彈出視窗顯示完整 UI
   ```

2. **測試 ChatGPT 整合**
   ```bash
   # 前往 ChatGPT
   https://chatgpt.com
   
   # 檢查項目
   ✅ 擴充套件圖示保持可見
   ✅ 彈出視窗顯示記憶狀態
   ✅ 按鈕互動正常運作
   ```

3. **測試核心功能**
   ```
   ✅ 記憶狀態檢測運作
   ✅ 匯出按鈕顯示紫色漸層
   ✅ 模態視窗正常顯示
   ✅ 設定選項可正常存取
   ```

#### 進階功能驗證

```bash
# 執行自動化測試
npm run test:all

# 檢查效能
npm run test:e2e

# 驗證程式碼品質
npm run lint
```

### 故障排除

#### 常見問題與解決方案

**問題 1: 擴充套件無法載入**
```
錯誤訊息：「載入擴充功能時發生錯誤」
解決方案：
1. 確認選擇正確的資料夾（包含 manifest.json）
2. 檢查 Chrome 版本 >= 88
3. 重新執行 npm run dev
4. 重新載入擴充套件
```

**問題 2: Node.js 版本不相容**
```
錯誤訊息：「Unsupported Node.js version」
解決方案：
1. 更新 Node.js 至 18.18.0+
2. 使用 nvm 管理 Node.js 版本
   nvm install 18.18.0
   nvm use 18.18.0
3. 重新安裝依賴
   rm -rf node_modules
   npm install
```

**問題 3: 權限被拒絕**
```
錯誤訊息：「Permission denied」
解決方案：
1. 檢查 Chrome 權限設定
2. 確認 https://chatgpt.com 為允許的網站
3. 重新載入擴充套件
4. 重新啟動 Chrome
```

**問題 4: 匯出功能無法運作**
```
症狀：點擊匯出按鈕無反應
解決方案：
1. 檢查 Chrome 儲存權限
2. 檢查彈出視窗阻擋設定
3. 檢查瀏覽器控制台錯誤訊息
4. 重新載入 ChatGPT 頁面
```

**問題 5: UI 顯示異常**
```
症狀：按鈕動畫不正常或樣式錯誤
解決方案：
1. 清除瀏覽器快取
2. 重新載入擴充套件
3. 檢查其他擴充套件衝突
4. 嘗試無痕模式測試
```

#### 取得協助

如果上述解決方案無法解決問題，請：

1. **檢查系統資訊**
   ```bash
   # 收集偵錯資訊
   node --version
   npm --version
   chrome --version
   
   # 檢查擴充套件日誌
   # 在 chrome://extensions/ 中點擊「錯誤」
   ```

2. **提交問題報告**
   - 前往 [GitHub Issues](https://github.com/your-username/chatgpt-memory-toolkit/issues)
   - 提供詳細的錯誤資訊和系統資訊
   - 附上螢幕截圖或錯誤日誌

---

## English Installation Guide

### System Requirements

#### Minimum Requirements
- **Chrome Browser**: Version 88+ (Manifest V3 support required)
- **Operating System**: Windows 10+, macOS 10.14+, Linux Ubuntu 18.04+
- **Memory**: Minimum 4GB RAM
- **Storage**: 50MB available space
- **Network**: Access to `https://chatgpt.com`

#### Developer Additional Requirements
- **Node.js**: Version 18.18.0+ (ES Module support required)
- **npm**: Latest version (or yarn)
- **Git**: Version control system (optional)

### Installation Methods

#### Method 1: Chrome Web Store (Coming Soon)

```
⚠️ Note: Chrome Web Store version is in preparation
```

1. **Visit Chrome Web Store**
   - Go to [Chrome Web Store](https://chrome.google.com/webstore)
   - Search for "ChatGPT Memory Toolkit"

2. **Install Extension**
   - Click "Add to Chrome" button
   - Confirm "Add extension" in the popup

3. **Grant Permissions**
   - The extension will request these permissions:
     - `activeTab`: Access current active tab
     - `scripting`: Execute content scripts
     - `storage`: Store user settings and history
     - `tabs`: Manage tab state

#### Method 2: Manual Developer Installation (Recommended for Advanced Users)

##### Step 1: Get Source Code

**Option A: Git Clone**
```bash
git clone https://github.com/your-username/chatgpt-memory-toolkit.git
cd chatgpt-memory-toolkit
```

**Option B: Download ZIP**
```bash
# Download and extract source code
# Download latest version from GitHub Releases
unzip chatgpt-memory-toolkit-v1.6.2.zip
cd chatgpt-memory-toolkit-v1.6.2
```

##### Step 2: Install Dependencies

```bash
# Check Node.js version
node --version  # Should be >= 18.18.0

# Install project dependencies
npm install

# Verify installation
npm ls
```

##### Step 3: Build Extension

```bash
# Development build (recommended)
npm run dev

# Or production build
npm run build

# Verify build results
ls -la src/
```

##### Step 4: Load into Chrome

1. **Open Extensions Management Page**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**
   - Click the "Developer mode" toggle in the top right
   - Ensure it's enabled (shows blue)

3. **Load Extension**
   - Click "Load unpacked" button
   - Select the project root directory (containing `manifest.json`)
   - **Important**: Select project root, not `build` or `dist` folder

4. **Confirm Successful Loading**
   - Extension should appear in the list
   - Status should be "Enabled"
   - Icon should appear in Chrome toolbar

### Installation Verification

#### Basic Functionality Test

1. **Check Extension Icon**
   ```
   ✅ Brain icon visible in Chrome toolbar
   ✅ Clicking icon opens popup window
   ✅ Popup displays complete UI
   ```

2. **Test ChatGPT Integration**
   ```bash
   # Navigate to ChatGPT
   https://chatgpt.com
   
   # Check items
   ✅ Extension icon remains visible
   ✅ Popup shows memory status
   ✅ Button interactions work normally
   ```

3. **Test Core Features**
   ```
   ✅ Memory status detection works
   ✅ Export button shows purple gradient
   ✅ Modal windows display properly
   ✅ Settings options accessible
   ```

#### Advanced Feature Verification

```bash
# Run automated tests
npm run test:all

# Check performance
npm run test:e2e

# Verify code quality
npm run lint
```

### Troubleshooting

#### Common Issues and Solutions

**Issue 1: Extension Failed to Load**
```
Error: "Error loading extension"
Solutions:
1. Confirm correct folder selected (containing manifest.json)
2. Check Chrome version >= 88
3. Re-run npm run dev
4. Reload extension
```

**Issue 2: Node.js Version Incompatible**
```
Error: "Unsupported Node.js version"
Solutions:
1. Update Node.js to 18.18.0+
2. Use nvm to manage Node.js versions
   nvm install 18.18.0
   nvm use 18.18.0
3. Reinstall dependencies
   rm -rf node_modules
   npm install
```

**Issue 3: Permission Denied**
```
Error: "Permission denied"
Solutions:
1. Check Chrome permission settings
2. Confirm https://chatgpt.com is allowed
3. Reload extension
4. Restart Chrome
```

**Issue 4: Export Function Not Working**
```
Symptoms: No response when clicking export button
Solutions:
1. Check Chrome storage permissions
2. Check popup blocker settings
3. Check browser console for error messages
4. Reload ChatGPT page
```

**Issue 5: UI Display Issues**
```
Symptoms: Button animations not working or style errors
Solutions:
1. Clear browser cache
2. Reload extension
3. Check for conflicts with other extensions
4. Try incognito mode testing
```

#### Getting Help

If the above solutions don't resolve the issue, please:

1. **Collect System Information**
   ```bash
   # Gather debugging information
   node --version
   npm --version
   chrome --version
   
   # Check extension logs
   # Click "Errors" in chrome://extensions/
   ```

2. **Submit Issue Report**
   - Go to [GitHub Issues](https://github.com/your-username/chatgpt-memory-toolkit/issues)
   - Provide detailed error information and system info
   - Include screenshots or error logs

---

## 安裝後下一步 | Next Steps After Installation

### 中文
1. **閱讀使用指南**: 參考 [USER_GUIDE.md](USER_GUIDE.md) 了解完整功能
2. **自訂設定**: 根據個人需求調整擴充套件設定
3. **測試功能**: 在 ChatGPT 中測試各項功能
4. **提供回饋**: 協助我們改進產品

### English
1. **Read User Guide**: Check [USER_GUIDE.md](USER_GUIDE.md) for complete features
2. **Customize Settings**: Adjust extension settings to your needs
3. **Test Features**: Try out all features in ChatGPT
4. **Provide Feedback**: Help us improve the product

---

**安裝支援 | Installation Support**: [GitHub Issues](https://github.com/your-username/chatgpt-memory-toolkit/issues)  
**文件版本 | Document Version**: v1.6.2  
**最後更新 | Last Updated**: 2025-08-01