# ChatGPT Memory Toolkit - E2E 測試系統

完整的端到端測試系統，用於驗證 ChatGPT Memory Toolkit Chrome 擴充套件的所有功能。

## 📋 目錄

- [概述](#概述)
- [環境設置](#環境設置)
- [測試架構](#測試架構)
- [運行測試](#運行測試)
- [測試套件](#測試套件)
- [調試指南](#調試指南)
- [持續整合](#持續整合)
- [故障排除](#故障排除)

## 🎯 概述

本測試系統提供全面的端到端測試，覆蓋：

- ✅ **擴充套件載入和初始化**
- ✅ **Popup UI 和功能測試**
- ✅ **內容腳本注入和行為**
- ✅ **背景腳本消息處理**
- ✅ **記憶檢測和匯出功能**
- ✅ **UI 互動和響應性**
- ✅ **錯誤處理和恢復**
- ✅ **性能和資源使用**

### 技術棧

- **測試框架**: Jest + Puppeteer
- **瀏覽器自動化**: Puppeteer (Chrome)
- **測試環境**: Node.js + Chrome Extension
- **報告**: HTML + JSON 報告

## 🛠 環境設置

### 先決條件

```bash
# Node.js 18.18.0+
node --version

# Chrome/Chromium (最新版本)
google-chrome --version
```

### 安裝依賴

```bash
# 安裝測試依賴
npm install

# 或者只安裝測試相關依賴
npm install --save-dev jest puppeteer jest-puppeteer jest-environment-puppeteer
```

### 環境變數

```bash
# .env 文件 (可選)
PUPPETEER_HEADLESS=true          # 無頭模式
SLOW_MO=0                        # 操作延遲 (ms)
TEST_TIMEOUT=60000               # 測試超時 (ms)
EXTENSION_PATH=./                # 擴充套件路徑
```

## 🏗 測試架構

```
tests/
├── e2e/
│   ├── setup/
│   │   └── jest-setup.js        # E2E 測試環境設置
│   ├── specs/                   # 測試規格文件
│   │   ├── extension-loading.test.js
│   │   ├── popup-functionality.test.js
│   │   ├── content-script.test.js
│   │   ├── background-script.test.js
│   │   ├── memory-management.test.js
│   │   ├── ui-interaction.test.js
│   │   ├── error-handling.test.js
│   │   └── performance.test.js
│   └── utils/                   # 測試工具函數
├── unit/
│   ├── setup/
│   │   └── jest-setup.js        # 單元測試環境設置
│   └── specs/                   # 單元測試規格
├── fixtures/                    # 測試固定數據
├── reports/                     # 測試報告
└── run-e2e-tests.js            # 測試運行腳本
```

### 核心組件

#### Jest 配置

- **jest.e2e.config.js**: E2E 測試配置
- **jest.config.js**: 單元測試配置

#### 測試工具

```javascript
// 全域測試工具 (TestUtils)
TestUtils.wait(ms)                           // 等待指定時間
TestUtils.waitForElement(page, selector)     // 等待元素出現
TestUtils.loadExtension(browser, path)       // 載入擴充套件
TestUtils.openExtensionPopup(browser, id)    // 開啟擴充套件 popup
TestUtils.takeScreenshot(page, name)         // 截圖調試
```

#### 自定義斷言

```javascript
// E2E 專用斷言
expect(element).toBeVisible()                // 檢查元素可見性
expect(page).toHaveExtensionLoaded(name)     // 檢查擴充套件載入
expect(page).toHaveExtensionRunning(id)      // 檢查擴充套件運行
```

## 🚀 運行測試

### 基本用法

```bash
# 運行所有測試
npm run test:e2e

# 或使用自定義腳本
node tests/run-e2e-tests.js
```

### 測試套件

```bash
# 核心功能測試
npm run test:e2e -- --suite=core

# UI 測試
npm run test:e2e -- --suite=ui

# 功能測試  
npm run test:e2e -- --suite=functionality

# 穩定性測試
npm run test:e2e -- --suite=stability
```

### 調試模式

```bash
# 可見瀏覽器模式
npm run test:e2e:debug

# 或使用腳本
node tests/run-e2e-tests.js --headless=false --slow-mo=500
```

### 監視模式

```bash
# 開發模式 (監視文件變化)
npm run test:e2e:dev
```

## 📊 測試套件詳情

### 1. Extension Loading (`extension-loading.test.js`)

測試擴充套件的基本載入和初始化：

```javascript
describe('Extension Loading and Initialization', () => {
  test('should load extension successfully')           // 擴充套件載入
  test('should have correct extension manifest')       // manifest 驗證
  test('should initialize background script')          // 背景腳本初始化
  test('should inject content script on ChatGPT')      // 內容腳本注入
  test('should load all required components')          // 組件載入
})
```

**涵蓋範圍**:
- ✅ 擴充套件安裝和啟用
- ✅ Service Worker 初始化
- ✅ 內容腳本注入邏輯
- ✅ 組件依賴載入

### 2. Popup Functionality (`popup-functionality.test.js`)

測試 Popup UI 和基本功能：

```javascript
describe('Popup UI and Functionality', () => {
  test('should render popup with correct structure')   // UI 結構
  test('should display correct initial status')        // 初始狀態
  test('should handle export button click')            // 匯出功能
  test('should handle copy button click')              // 複製功能
  test('should handle refresh button click')           // 重新整理功能
})
```

**涵蓋範圍**:
- ✅ UI 元素渲染
- ✅ 按鈕互動
- ✅ 狀態顯示
- ✅ 響應式設計

### 3. Content Script (`content-script.test.js`)

測試內容腳本的注入和行為：

```javascript
describe('Content Script Injection and Behavior', () => {
  test('should inject content script on ChatGPT pages') // 腳本注入
  test('should detect memory full trigger text')        // 記憶檢測
  test('should communicate with background script')     // 腳本通信
  test('should handle DOM utilities')                   // DOM 工具
})
```

**涵蓋範圍**:
- ✅ 頁面注入邏輯
- ✅ 記憶狀態檢測
- ✅ DOM 操作工具
- ✅ 消息通信

### 4. Background Script (`background-script.test.js`)

測試背景腳本的消息處理：

```javascript
describe('Background Script Message Handling', () => {
  test('should handle ping messages')                   // ping 測試
  test('should handle getMemoryStatus messages')        // 狀態獲取
  test('should handle exportMemories messages')         // 匯出處理
  test('should handle unknown message types')           // 錯誤處理
})
```

**涵蓋範圍**:
- ✅ 消息路由
- ✅ API 處理
- ✅ 錯誤處理
- ✅ 服務持續性

### 5. Memory Management (`memory-management.test.js`)

測試核心記憶管理功能：

```javascript
describe('Memory Management Functionality', () => {
  test('should detect memory status on ChatGPT pages') // 狀態檢測
  test('should handle export button click')            // 匯出功能
  test('should manage storage information')             // 儲存管理
  test('should handle export errors gracefully')       // 錯誤處理
})
```

**涵蓋範圍**:
- ✅ 記憶狀態檢測
- ✅ 匯出功能完整流程
- ✅ 儲存空間管理
- ✅ 錯誤恢復機制

### 6. UI Interaction (`ui-interaction.test.js`)

測試全面的 UI 互動：

```javascript
describe('UI Interaction Tests', () => {
  test('should show proper loading states')            // 載入狀態
  test('should display toast notifications')           // 通知系統
  test('should adapt to different popup sizes')        // 響應式設計
  test('should support keyboard navigation')           // 鍵盤導航
})
```

**涵蓋範圍**:
- ✅ 按鈕狀態管理
- ✅ Toast 通知系統
- ✅ 響應式設計
- ✅ 無障礙功能

### 7. Error Handling (`error-handling.test.js`)

測試錯誤情境和恢復機制：

```javascript
describe('Error Handling and Recovery', () => {
  test('should handle offline scenarios gracefully')   // 離線處理
  test('should handle storage quota exceeded')         // 儲存限制
  test('should handle component initialization failures') // 組件錯誤
  test('should recover from temporary failures')       // 恢復機制
})
```

**涵蓋範圍**:
- ✅ 網路錯誤處理
- ✅ 儲存錯誤處理
- ✅ 組件錯誤處理
- ✅ 自動恢復機制

### 8. Performance (`performance.test.js`)

測試性能和資源使用：

```javascript
describe('Performance and Resource Usage', () => {
  test('should load extension quickly')                // 載入性能
  test('should not consume excessive memory')          // 記憶體使用
  test('should handle animations smoothly')            // 動畫性能
  test('should clean up resources properly')           // 資源清理
})
```

**涵蓋範圍**:
- ✅ 載入時間測試
- ✅ 記憶體使用監控
- ✅ CPU 使用分析
- ✅ 資源洩漏檢測

## 🐛 調試指南

### 可見瀏覽器調試

```bash
# 啟用可見瀏覽器模式
PUPPETEER_HEADLESS=false npm run test:e2e

# 或使用腳本
node tests/run-e2e-tests.js --headless=false --slow-mo=1000
```

### 截圖調試

```javascript
// 在測試中添加截圖
await TestUtils.takeScreenshot(page, 'debug-screenshot');
```

### 控制台日誌

```javascript
// 監聽控制台輸出
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
```

### 錯誤診斷

常見問題和解決方案：

#### 1. 擴充套件載入失敗

```bash
# 檢查 manifest.json
cat manifest.json

# 檢查文件權限
ls -la src/
```

#### 2. 測試超時

```bash
# 增加超時時間
node tests/run-e2e-tests.js --timeout=120000
```

#### 3. 頁面載入問題

```javascript
// 等待網路閒置
await page.goto(url, { waitUntil: 'networkidle0' });
```

### 調試工具

```javascript
// 在測試中暫停執行
await page.evaluate(() => debugger);

// 獲取頁面內容用於調試
const content = await page.content();
console.log(content);
```

## 🔄 持續整合

### GitHub Actions 配置

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build extension
      run: npm run build
      
    - name: Run E2E tests
      run: npm run test:e2e
      
    - name: Upload test reports
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: e2e-test-reports
        path: tests/reports/
```

### 測試報告

測試完成後會生成：

- **HTML 報告**: `tests/reports/e2e-test-report.html`
- **JSON 報告**: `tests/reports/e2e-results.json`
- **截圖**: `tests/reports/screenshots/`
- **覆蓋率報告**: `tests/coverage/`

## 📈 性能基準

### 預期性能指標

| 指標 | 目標值 | 描述 |
|------|--------|------|
| 擴充套件載入時間 | < 5s | Service Worker 啟動時間 |
| Popup 初始化時間 | < 8s | UI 完全載入時間 |
| 內容腳本注入時間 | < 20s | 在 ChatGPT 頁面注入時間 |
| 記憶體使用 | < 50MB | 最大 JS 堆疊使用量 |
| 動畫幀率 | > 30 FPS | UI 動畫性能 |

### 性能監控

```javascript
// 自動性能監控
const metrics = await page.metrics();
console.log('性能指標:', metrics);

// 記憶體使用監控
const memoryUsage = await page.evaluate(() => performance.memory);
console.log('記憶體使用:', memoryUsage);
```

## 🛠 故障排除

### 常見問題

#### 1. Chrome 找不到

```bash
# Ubuntu/Debian
sudo apt-get install google-chrome-stable

# macOS
brew install --cask google-chrome

# 手動指定 Chrome 路徑
PUPPETEER_EXECUTABLE_PATH=/path/to/chrome npm run test:e2e
```

#### 2. 權限問題

```bash
# Linux 沙箱問題
npm run test:e2e -- --no-sandbox

# 或在配置中添加
args: ['--no-sandbox', '--disable-setuid-sandbox']
```

#### 3. 擴充套件不載入

```bash
# 檢查 manifest.json 語法
jq . manifest.json

# 檢查必要文件
ls -la src/background.js src/scripts/content.js src/ui/popup.html
```

#### 4. 測試不穩定

```bash
# 禁用並行執行
npm run test:e2e -- --no-parallel

# 增加延遲
npm run test:e2e -- --slow-mo=500
```

### 日誌級別

```bash
# 詳細日誌
DEBUG=puppeteer:* npm run test:e2e

# Jest 詳細輸出
npm run test:e2e -- --verbose
```

## 📚 最佳實踐

### 測試編寫指南

1. **測試隔離**: 每個測試應該獨立運行
2. **清理資源**: 確保測試後清理所有資源
3. **合理等待**: 使用適當的等待策略
4. **錯誤處理**: 處理所有可能的錯誤情況
5. **可讀性**: 使用描述性的測試名稱

### 性能優化

1. **並行執行**: 在可能的情況下並行運行測試
2. **資源共享**: 重用瀏覽器實例
3. **智能等待**: 避免不必要的延遲
4. **選擇性運行**: 只運行必要的測試

### 維護建議

1. **定期更新**: 保持依賴項最新
2. **重構測試**: 消除重複代碼
3. **監控性能**: 追蹤測試執行時間
4. **文檔更新**: 保持文檔同步

---

## 🤝 貢獻

歡迎貢獻測試改進：

1. Fork 專案
2. 創建功能分支
3. 添加或改進測試
4. 提交 Pull Request

## 📝 授權

MIT License - 查看 [LICENSE](../LICENSE) 文件了解詳情。