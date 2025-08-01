# 前端重構設計文檔

## 概述

本設計文檔定義了 ChatGPT Memory Manager 擴充套件前端重構的完整架構方案，包括代碼品質標準、UI 統一化設計、架構優化方案和自動化流程設計。

## 架構設計

### 整體架構重構

```
src/
├── scripts/
│   └── content.js              # Content Script（已優化）
├── ui/
│   ├── components/             # 組件系統
│   │   ├── ButtonStateManager.js
│   │   ├── ToastManager.js
│   │   ├── ModalManager.js
│   │   ├── index.js           # 組件管理器
│   │   ├── button-states.css
│   │   ├── toast-notifications.css
│   │   └── modal-styles.css
│   ├── popup.html             # 主要 UI（需統一）
│   ├── popup.css              # 主要樣式（需統一）
│   └── popup.js               # 主要邏輯（需修復）
└── utils/
    └── storage-manager.js      # 儲存管理器
```

### 代碼品質標準

#### ESLint 配置優化

```javascript
// eslint.config.js 增強配置
export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        chrome: 'readonly',
        window: 'writable',
        document: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      // 代碼品質規則
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'error',
      'no-var': 'error',

      // 魔術數字規則
      'no-magic-numbers': [
        'warn',
        {
          ignore: [0, 1, -1, 100],
          ignoreArrayIndexes: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],

      // 模組規則
      'no-undef': 'error',
      'no-unused-expressions': 'error',
    },
  },
];
```

#### 常數定義標準

```javascript
// src/utils/constants.js
export const TIMING_CONSTANTS = {
  ANIMATION_FAST: 150,
  ANIMATION_NORMAL: 250,
  ANIMATION_SLOW: 350,
  BUTTON_SUCCESS_DURATION: 2000,
  BUTTON_ERROR_DURATION: 2000,
  TOAST_DEFAULT_DURATION: 3000,
  STATUS_CHECK_INTERVAL: 10000,
};

export const UI_CONSTANTS = {
  POPUP_WIDTH: 380,
  POPUP_MIN_HEIGHT: 500,
  USAGE_WARNING_THRESHOLD: 80,
  USAGE_CRITICAL_THRESHOLD: 100,
};

export const STORAGE_CONSTANTS = {
  MAX_HISTORY_ITEMS: 50,
  STORAGE_QUOTA_MB: 10,
  BYTES_PER_MB: 1024 * 1024,
};
```

## UI 統一化設計

### 設計系統標準化

#### 色彩系統統一

```css
/* 基於 ui-showcase.html 的統一色彩系統 */
:root {
  /* 主要色彩 */
  --primary-color: #667eea;
  --primary-hover: #5a67d8;
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  /* 狀態色彩 */
  --success-color: #10b981;
  --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --warning-color: #f59e0b;
  --warning-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  --error-color: #ef4444;
  --error-gradient: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);

  /* 深色主題背景 */
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-tertiary: #404040;
  --bg-card: #2d2d2d;
  --bg-overlay: rgba(255, 255, 255, 0.05);

  /* 文字色彩 */
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-tertiary: #808080;
  --text-inverse: #1a1a1a;

  /* 邊框色彩 */
  --border-light: #404040;
  --border-medium: #525252;
  --border-dark: #737373;

  /* 間距系統 */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* 圓角系統 */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* 陰影系統 */
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md:
    0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg:
    0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  /* 過渡動畫 */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}
```

#### 組件設計標準

```css
/* 統一按鈕設計 */
.btn-primary {
  background: var(--primary-gradient);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-5);
  font-weight: 500;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 統一卡片設計 */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
```

### 響應式設計標準

```css
/* 響應式斷點 */
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

/* 高對比度支援 */
@media (prefers-contrast: high) {
  :root {
    --border-light: #666666;
    --border-medium: #888888;
    --text-secondary: #cccccc;
  }
}

/* 動畫偏好支援 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 架構優化方案

### 組件系統重構

#### 組件載入機制優化

```javascript
// src/ui/components/index.js 優化版本
class ComponentManager {
  constructor() {
    this.components = new Map();
    this.initialized = false;
    this.loadingPromise = null;
  }

  async init() {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._performInit();
    return this.loadingPromise;
  }

  async _performInit() {
    try {
      // 等待所有組件載入
      await this.waitForComponents();

      // 初始化全域實例
      this.initializeGlobalInstances();

      // 設置組件間通信
      this.setupComponentCommunication();

      this.initialized = true;
      this.dispatchEvent('componentsReady');

      return true;
    } catch (error) {
      console.error('[ComponentManager] 初始化失敗:', error);
      throw error;
    }
  }

  async waitForComponents() {
    const REQUIRED_COMPONENTS = [
      'ModalManager',
      'ToastManager',
      'ButtonStateManager',
    ];
    const MAX_WAIT_TIME = 5000;
    const CHECK_INTERVAL = 100;

    return new Promise((resolve, reject) => {
      let waitTime = 0;

      const checkComponents = () => {
        const loadedComponents = REQUIRED_COMPONENTS.filter(
          name => window[name]
        );

        if (loadedComponents.length === REQUIRED_COMPONENTS.length) {
          resolve(loadedComponents);
        } else if (waitTime >= MAX_WAIT_TIME) {
          const missing = REQUIRED_COMPONENTS.filter(name => !window[name]);
          reject(new Error(`組件載入超時，缺少: ${missing.join(', ')}`));
        } else {
          waitTime += CHECK_INTERVAL;
          setTimeout(checkComponents, CHECK_INTERVAL);
        }
      };

      checkComponents();
    });
  }
}
```

#### 錯誤處理機制

```javascript
// src/utils/error-handler.js
export class ErrorHandler {
  static handleComponentError(error, componentName) {
    console.error(`[${componentName}] 組件錯誤:`, error);

    // 發送錯誤報告
    if (window.toastManager) {
      window.toastManager.error(`${componentName} 發生錯誤`);
    }

    // 記錄錯誤到儲存
    this.logError(error, componentName);
  }

  static logError(error, context) {
    const errorLog = {
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      context,
      url: location.href,
      userAgent: navigator.userAgent,
    };

    // 儲存到本地儲存
    const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    logs.push(errorLog);

    // 保持最多 50 條錯誤記錄
    if (logs.length > 50) {
      logs.splice(0, logs.length - 50);
    }

    localStorage.setItem('errorLogs', JSON.stringify(logs));
  }
}
```

### 性能優化設計

#### 懶載入機制

```javascript
// src/utils/lazy-loader.js
export class LazyLoader {
  static async loadComponent(componentName) {
    if (window[componentName]) {
      return window[componentName];
    }

    try {
      // 動態載入組件
      const module = await import(`../ui/components/${componentName}.js`);
      window[componentName] = module.default || module[componentName];
      return window[componentName];
    } catch (error) {
      console.error(`載入組件 ${componentName} 失敗:`, error);
      throw error;
    }
  }

  static async preloadComponents(componentNames) {
    const promises = componentNames.map(name => this.loadComponent(name));
    return Promise.allSettled(promises);
  }
}
```

#### 記憶體管理

```javascript
// src/utils/memory-manager.js
export class MemoryManager {
  constructor() {
    this.observers = new Set();
    this.timers = new Set();
    this.eventListeners = new Map();
  }

  addObserver(observer) {
    this.observers.add(observer);
  }

  addTimer(timer) {
    this.timers.add(timer);
  }

  addEventListener(element, event, handler) {
    const key = `${element}-${event}`;
    if (this.eventListeners.has(key)) {
      element.removeEventListener(event, this.eventListeners.get(key));
    }
    element.addEventListener(event, handler);
    this.eventListeners.set(key, handler);
  }

  cleanup() {
    // 清理觀察器
    this.observers.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    this.observers.clear();

    // 清理計時器
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    // 清理事件監聽器
    this.eventListeners.forEach((handler, key) => {
      const [element, event] = key.split('-');
      if (element && event) {
        element.removeEventListener(event, handler);
      }
    });
    this.eventListeners.clear();
  }
}
```

## 自動化流程設計

### 開發流程自動化

#### Pre-commit Hook 配置

```json
// package.json 增強配置
{
  "scripts": {
    "lint": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "test": "npm run lint && npm run format:check",
    "build": "npm run test && node scripts/build.js",
    "dev": "npm run lint && npm run build",
    "prepare": "husky install"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,html,md}": ["prettier --write"]
  }
}
```

#### 自動版本管理

```javascript
// scripts/auto-version.js
import { execSync } from 'child_process';
import fs from 'fs';

export class AutoVersionManager {
  static async updateVersion(type = 'patch') {
    try {
      // 更新 package.json 版本
      execSync(`npm version ${type} --no-git-tag-version`);

      // 讀取新版本
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      const newVersion = packageJson.version;

      // 更新所有相關文件
      await this.updateAllFiles(newVersion);

      // 執行構建
      execSync('npm run build');

      // Git 提交
      execSync('git add .');
      execSync(`git commit -m "chore: bump version to ${newVersion}"`);
      execSync(`git tag v${newVersion}`);

      console.log(`✅ 版本已更新至 ${newVersion}`);
      return newVersion;
    } catch (error) {
      console.error('版本更新失敗:', error);
      throw error;
    }
  }

  static async updateAllFiles(version) {
    const files = [
      {
        path: './manifest.json',
        update: content => {
          const manifest = JSON.parse(content);
          manifest.version = version;
          return JSON.stringify(manifest, null, 2);
        },
      },
      {
        path: './src/ui/popup.html',
        update: content => {
          return content.replace(
            /<span class="version">v[\d.]+<\/span>/,
            `<span class="version">v${version}</span>`
          );
        },
      },
    ];

    for (const file of files) {
      if (fs.existsSync(file.path)) {
        const content = fs.readFileSync(file.path, 'utf8');
        const updated = file.update(content);
        fs.writeFileSync(file.path, updated);
      }
    }
  }
}
```

### 構建流程優化

```javascript
// scripts/enhanced-build.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export class EnhancedBuilder {
  static async build() {
    console.log('🚀 開始增強構建流程...');

    try {
      // 1. 代碼品質檢查
      console.log('📋 執行代碼品質檢查...');
      execSync('npm run lint', { stdio: 'inherit' });

      // 2. 格式化檢查
      console.log('🎨 執行格式化檢查...');
      execSync('npm run format:check', { stdio: 'inherit' });

      // 3. 清理構建目錄
      console.log('🧹 清理構建目錄...');
      this.cleanBuildDir();

      // 4. 複製文件
      console.log('📁 複製源文件...');
      this.copySourceFiles();

      // 5. 優化文件
      console.log('⚡ 優化文件...');
      await this.optimizeFiles();

      // 6. 驗證構建
      console.log('✅ 驗證構建結果...');
      this.validateBuild();

      console.log('🎉 構建完成！');
    } catch (error) {
      console.error('❌ 構建失敗:', error);
      process.exit(1);
    }
  }

  static cleanBuildDir() {
    if (fs.existsSync('build')) {
      fs.rmSync('build', { recursive: true, force: true });
    }
    fs.mkdirSync('build', { recursive: true });
  }

  static copySourceFiles() {
    const filesToCopy = ['manifest.json', 'src/', 'assets/'];

    filesToCopy.forEach(file => {
      const srcPath = path.resolve(file);
      const destPath = path.resolve('build', file);

      if (fs.existsSync(srcPath)) {
        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
          this.copyDirectory(srcPath, destPath);
        } else {
          this.copyFile(srcPath, destPath);
        }
      }
    });
  }

  static async optimizeFiles() {
    // CSS 優化
    await this.optimizeCSS();

    // JavaScript 優化
    await this.optimizeJS();

    // HTML 優化
    await this.optimizeHTML();
  }

  static validateBuild() {
    const requiredFiles = [
      'build/manifest.json',
      'build/src/ui/popup.html',
      'build/src/ui/popup.css',
      'build/src/ui/popup.js',
    ];

    requiredFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        throw new Error(`必要文件缺失: ${file}`);
      }
    });

    // 驗證 manifest.json
    const manifest = JSON.parse(fs.readFileSync('build/manifest.json', 'utf8'));
    if (!manifest.version || !manifest.name) {
      throw new Error('manifest.json 格式錯誤');
    }
  }
}
```

## 測試策略

### 單元測試框架

```javascript
// tests/components/ButtonStateManager.test.js
import { ButtonStateManager } from '../../src/ui/components/ButtonStateManager.js';

describe('ButtonStateManager', () => {
  let button;
  let manager;

  beforeEach(() => {
    button = document.createElement('button');
    button.innerHTML = '<span class="btn-text">測試按鈕</span>';
    document.body.appendChild(button);
    manager = new ButtonStateManager(button);
  });

  afterEach(() => {
    manager.destroy();
    document.body.removeChild(button);
  });

  test('應該正確初始化', () => {
    expect(manager.button).toBe(button);
    expect(manager.currentState).toBe('normal');
    expect(manager.isAnimating).toBe(false);
  });

  test('應該正確設置載入狀態', () => {
    manager.setLoading('載入中...', 'Loading...');

    expect(manager.currentState).toBe('loading');
    expect(manager.isAnimating).toBe(true);
    expect(button.disabled).toBe(true);
    expect(button.classList.contains('loading')).toBe(true);
  });

  test('應該正確設置成功狀態', done => {
    manager.setSuccess('成功', 'Success', 1000);

    expect(manager.currentState).toBe('success');
    expect(button.classList.contains('success')).toBe(true);

    setTimeout(() => {
      expect(manager.currentState).toBe('normal');
      done();
    }, 1100);
  });
});
```

### 整合測試

```javascript
// tests/integration/popup.test.js
import { ModernPopupManager } from '../../src/ui/popup.js';

describe('Popup Integration', () => {
  let popupManager;

  beforeEach(async () => {
    // 模擬 Chrome API
    global.chrome = {
      tabs: {
        query: jest
          .fn()
          .mockResolvedValue([{ id: 1, url: 'https://chatgpt.com' }]),
        sendMessage: jest.fn().mockResolvedValue({ success: true }),
      },
      runtime: {
        sendMessage: jest.fn(),
      },
    };

    // 載入 HTML
    document.body.innerHTML = await fs.readFile('src/ui/popup.html', 'utf8');

    popupManager = new ModernPopupManager();
    await popupManager.init();
  });

  afterEach(() => {
    popupManager.destroy();
  });

  test('應該正確初始化所有組件', () => {
    expect(popupManager.isInitialized).toBe(true);
    expect(popupManager.buttonManagers.size).toBeGreaterThan(0);
  });

  test('應該正確處理匯出功能', async () => {
    const exportBtn = document.getElementById('exportBtn');
    expect(exportBtn).toBeTruthy();

    await popupManager.handleExport();

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, {
      action: 'exportMemories',
    });
  });
});
```

## 無障礙設計

### ARIA 標籤標準

```html
<!-- 無障礙增強的按鈕設計 -->
<button
  class="memory-export-btn"
  id="exportBtn"
  aria-label="匯出記憶內容"
  aria-describedby="export-description"
  role="button"
  tabindex="0"
>
  <div class="export-btn-content">
    <span class="export-main-text">匯出記憶</span>
    <span class="export-sub-text" id="export-description">Export Memory</span>
  </div>
</button>

<!-- 狀態卡片的無障礙設計 -->
<div
  class="status-card modern"
  id="statusCard"
  role="status"
  aria-live="polite"
  aria-label="記憶狀態資訊"
>
  <div class="card-content">
    <div class="status-value" id="memoryStatus" aria-label="當前記憶狀態">
      記憶正常
    </div>
    <div class="status-time" id="lastCheck" aria-label="最後檢查時間">剛剛</div>
  </div>
</div>
```

### 鍵盤導航支援

```javascript
// src/utils/keyboard-navigation.js
export class KeyboardNavigation {
  constructor() {
    this.focusableElements = [];
    this.currentIndex = -1;
    this.init();
  }

  init() {
    this.updateFocusableElements();
    this.bindEvents();
  }

  updateFocusableElements() {
    this.focusableElements = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => this.isVisible(el));
  }

  bindEvents() {
    document.addEventListener('keydown', e => {
      switch (e.key) {
        case 'Tab':
          this.handleTab(e);
          break;
        case 'Enter':
        case ' ':
          this.handleActivation(e);
          break;
        case 'Escape':
          this.handleEscape(e);
          break;
      }
    });
  }

  handleTab(e) {
    this.updateFocusableElements();

    if (this.focusableElements.length === 0) return;

    const activeElement = document.activeElement;
    const currentIndex = this.focusableElements.indexOf(activeElement);

    if (e.shiftKey) {
      // Shift+Tab - 向前導航
      const nextIndex =
        currentIndex <= 0
          ? this.focusableElements.length - 1
          : currentIndex - 1;
      this.focusableElements[nextIndex].focus();
    } else {
      // Tab - 向後導航
      const nextIndex =
        currentIndex >= this.focusableElements.length - 1
          ? 0
          : currentIndex + 1;
      this.focusableElements[nextIndex].focus();
    }

    e.preventDefault();
  }

  handleActivation(e) {
    const activeElement = document.activeElement;
    if (
      activeElement &&
      (activeElement.tagName === 'BUTTON' || activeElement.role === 'button')
    ) {
      activeElement.click();
      e.preventDefault();
    }
  }

  handleEscape(e) {
    // 關閉模態窗或返回上一級
    const modal = document.querySelector('[aria-modal="true"]');
    if (modal) {
      const closeBtn = modal.querySelector(
        '[aria-label*="關閉"], [aria-label*="close"]'
      );
      if (closeBtn) {
        closeBtn.click();
      }
    }
  }

  isVisible(element) {
    const style = getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }
}
```

## 文檔標準

### JSDoc 註釋標準

```javascript
/**
 * 現代化彈出視窗管理器
 * 負責管理擴充套件的主要 UI 邏輯和狀態
 *
 * @class ModernPopupManager
 * @example
 * const manager = new ModernPopupManager();
 * await manager.init();
 */
class ModernPopupManager {
  /**
   * 初始化管理器
   *
   * @async
   * @method init
   * @returns {Promise<void>} 初始化完成的 Promise
   * @throws {Error} 當初始化失敗時拋出錯誤
   *
   * @example
   * try {
   *   await manager.init();
   *   console.log('初始化成功');
   * } catch (error) {
   *   console.error('初始化失敗:', error);
   * }
   */
  async init() {
    // 實現...
  }

  /**
   * 處理記憶匯出
   *
   * @async
   * @method handleExport
   * @returns {Promise<boolean>} 匯出是否成功
   * @fires ModernPopupManager#exportStart
   * @fires ModernPopupManager#exportComplete
   * @fires ModernPopupManager#exportError
   *
   * @example
   * const success = await manager.handleExport();
   * if (success) {
   *   console.log('匯出成功');
   * }
   */
  async handleExport() {
    // 實現...
  }
}
```

### README 文檔標準

````markdown
# ChatGPT Memory Manager - 開發文檔

## 架構概述

本專案採用現代化的前端架構，包含以下主要組件：

- **UI 組件系統**: 可重用的 UI 組件庫
- **狀態管理**: 統一的狀態管理機制
- **事件系統**: 組件間通信機制
- **儲存管理**: 本地儲存和同步機制

## 開發環境設置

### 必要條件

- Node.js >= 18.18.0
- npm >= 9.0.0
- Chrome 瀏覽器（用於測試）

### 安裝步驟

1. 克隆專案

```bash
git clone <repository-url>
cd chatgpt-memory-manager
```
````

2. 安裝依賴

```bash
npm install
```

3. 開發模式構建

```bash
npm run dev
```

4. 載入擴充套件

- 開啟 Chrome 並前往 `chrome://extensions/`
- 啟用「開發者模式」
- 點擊「載入未封裝項目」
- 選擇 `build` 資料夾

## 開發流程

### 代碼規範

- 使用 ESLint 進行代碼檢查
- 使用 Prettier 進行代碼格式化
- 遵循 JSDoc 註釋標準
- 使用語義化版本控制

### 提交流程

1. 開發功能
2. 執行測試：`npm test`
3. 提交代碼：`git commit -m "feat: 新功能描述"`
4. 推送代碼：`git push`

### 發布流程

1. 更新版本：`npm run version:patch`
2. 構建專案：`npm run build`
3. 測試功能：手動測試所有功能
4. 發布版本：`npm run release:patch`

## 故障排除

### 常見問題

**Q: 組件載入失敗**
A: 檢查 `src/ui/components/index.js` 中的組件註冊是否正確

**Q: 樣式不一致**
A: 確保使用統一的 CSS 變數，參考 `src/ui/popup.css`

**Q: 構建失敗**
A: 執行 `npm run lint` 檢查代碼品質問題

### 調試技巧

1. 開啟 Chrome 開發者工具
2. 前往 Console 標籤查看錯誤訊息
3. 使用 `console.log` 進行調試
4. 檢查 Network 標籤確認請求狀態

```

這個設計文檔提供了完整的重構架構方案，包括代碼品質標準、UI 統一化設計、性能優化、自動化流程和測試策略。接下來我將創建具體的實施任務清單。
```
