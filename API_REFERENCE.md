# API 參考文件 | API Reference

> ChatGPT Memory Toolkit v1.6.2 API 和模組參考  
> API and module reference for ChatGPT Memory Toolkit v1.6.2

---

## 目錄 | Table of Contents

- [核心模組 API](#核心模組-api--core-modules-api)
- [UI 組件 API](#ui-組件-api--ui-components-api)
- [工具模組 API](#工具模組-api--utility-modules-api)
- [事件系統 API](#事件系統-api--event-system-api)
- [Chrome Extension API](#chrome-extension-api)

---

## 核心模組 API | Core Modules API

### 🔧 BackgroundService

**路徑**: `src/background.js`  
**描述**: Service Worker 主要服務，處理擴充套件的背景邏輯

#### 類別定義

```javascript
class BackgroundService {
  constructor()
  
  // 公開方法
  async handleMessage(message, sender, sendResponse)
  async updateMemoryStatus(statusData)
  async processExportRequest(exportData)
  
  // 私有方法
  #setupEventListeners()
  #initializeExtension()
  #validateMessage(message)
}
```

#### 方法詳解

**`handleMessage(message, sender, sendResponse)`**
```javascript
/**
 * 處理來自其他腳本的訊息
 * @param {Object} message - 訊息物件
 * @param {Object} sender - 發送者資訊
 * @param {Function} sendResponse - 回應函數
 * @returns {Promise<any>} 處理結果
 */
async handleMessage(message, sender, sendResponse) {
  const { type, data, id } = message;
  
  switch(type) {
    case 'MEMORY_STATUS_UPDATE':
      return await this.updateMemoryStatus(data);
    case 'EXPORT_REQUEST': 
      return await this.processExportRequest(data);
    case 'GET_CURRENT_STATE':
      return this.getCurrentState();
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}
```

**`updateMemoryStatus(statusData)`**
```javascript
/**
 * 更新記憶狀態
 * @param {Object} statusData - 記憶狀態資料
 * @param {string} statusData.status - 狀態 ('normal'|'warning'|'critical')
 * @param {number} statusData.usage - 使用率 (0.0-1.0)
 * @param {number} statusData.itemCount - 項目數量
 * @returns {Promise<boolean>} 更新是否成功
 */
async updateMemoryStatus(statusData) {
  // 驗證資料格式
  if (!this.validateStatusData(statusData)) {
    throw new Error('Invalid status data format');
  }
  
  // 更新內部狀態
  this.memoryState.set('current', statusData);
  
  // 通知所有監聽者
  await this.notifyStatusUpdate(statusData);
  
  return true;
}
```

#### 事件監聽

```javascript
// 監聽擴充套件生命週期事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    this.handleFirstInstall();
  } else if (details.reason === 'update') {
    this.handleUpdate(details.previousVersion);
  }
});

// 監聽分頁更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('chatgpt.com')) {
    this.handleChatGPTPageLoad(tabId);
  }
});
```

### 📄 ContentScriptManager  

**路徑**: `src/scripts/content.js`  
**描述**: 內容腳本管理器，負責 ChatGPT 頁面的 DOM 監控和互動

#### 類別定義

```javascript
class ContentScriptManager {
  constructor()
  
  // 公開方法
  initialize()
  async checkMemoryStatus()
  async extractMemoryContent()
  destroy()
  
  // 事件處理
  onMemoryStatusChange(callback)
  onPageStructureChange(callback)
}
```

#### 核心方法

**`checkMemoryStatus()`**
```javascript
/**
 * 檢查當前記憶狀態
 * @returns {Promise<Object>} 記憶狀態物件
 */
async checkMemoryStatus() {
  const memoryElements = this.findMemoryElements();
  
  if (!memoryElements.length) {
    return { status: 'unknown', usage: 0, itemCount: 0 };
  }
  
  const usage = this.calculateUsage(memoryElements);
  const itemCount = this.countMemoryItems(memoryElements);
  const status = this.determineStatus(usage);
  
  return {
    status,
    usage,
    itemCount,
    timestamp: Date.now(),
    elements: memoryElements.map(el => ({
      type: this.getElementType(el),
      content: this.extractElementContent(el),
      confidence: this.getConfidence(el)
    }))
  };
}
```

**`extractMemoryContent()`**
```javascript
/**
 * 提取記憶內容
 * @param {Object} options - 提取選項
 * @returns {Promise<Object>} 提取的記憶內容
 */
async extractMemoryContent(options = {}) {
  const {
    format = 'markdown',
    includeMetadata = true,
    categorize = true
  } = options;
  
  const memoryItems = await this.findAllMemoryItems();
  const processedItems = await this.processMemoryItems(memoryItems, {
    format,
    includeMetadata,
    categorize
  });
  
  return {
    items: processedItems,
    metadata: {
      extractedAt: new Date().toISOString(),
      totalItems: processedItems.length,
      format,
      version: '1.6.2'
    }
  };
}
```

---

## UI 組件 API | UI Components API

### 🎨 ButtonStateManager

**路徑**: `src/ui/components/ButtonStateManager.js`  
**描述**: 管理所有按鈕的視覺狀態和動畫效果

#### 類別定義

```javascript
export class ButtonStateManager {
  constructor(options = {})
  
  // 狀態設定方法
  setExportingState(buttonElement, options)
  setLoadingState(buttonElement, options)  
  setSuccessState(buttonElement, options)
  setErrorState(buttonElement, options)
  setMemoryFullState(buttonElement, options)
  
  // 狀態清除
  clearState(buttonElement)
  clearAllStates()
  
  // 事件監聽
  onStateChange(callback)
}
```

#### 狀態方法詳解

**`setExportingState(buttonElement, options)`**
```javascript
/**
 * 設定紫色漸層匯出狀態
 * @param {HTMLElement} buttonElement - 按鈕元素
 * @param {Object} options - 配置選項
 * @param {number} options.duration - 動畫持續時間 (預設: 2000ms)
 * @param {boolean} options.particles - 是否顯示粒子效果 (預設: true)
 * @param {string} options.text - 按鈕文字 (預設: '匯出中...')
 */
setExportingState(buttonElement, options = {}) {
  const {
    duration = 2000,
    particles = true,
    text = '匯出中...'
  } = options;
  
  // 清除之前的狀態
  this.clearState(buttonElement);
  
  // 設定匯出狀態樣式
  buttonElement.classList.add('exporting');
  buttonElement.textContent = text;
  buttonElement.disabled = true;
  
  // 創建粒子效果
  if (particles) {
    this.createParticleEffect(buttonElement);
  }
  
  // 啟動漸層動畫
  this.startGradientAnimation(buttonElement, duration);
  
  // 儲存狀態資訊
  this.currentStates.set(buttonElement, {
    type: 'exporting',
    startTime: Date.now(),
    duration,
    options
  });
}
```

**`createParticleEffect(buttonElement)`**
```javascript
/**
 * 創建粒子動畫效果
 * @param {HTMLElement} buttonElement - 目標按鈕元素
 * @private
 */
createParticleEffect(buttonElement) {
  const particleContainer = document.createElement('div');
  particleContainer.className = 'particle-container';
  
  // 創建 5 個粒子
  for (let i = 0; i < 5; i++) {
    const particle = document.createElement('div');
    particle.className = 'export-particle';
    particle.style.cssText = `
      position: absolute;
      width: ${4 + Math.random() * 4}px;
      height: ${4 + Math.random() * 4}px;
      background: rgba(255, 255, 255, ${0.6 + Math.random() * 0.4});
      border-radius: 50%;
      animation: particleFloat ${1.5 + Math.random()}s ease-in-out infinite;
      animation-delay: ${i * 0.2}s;
      left: ${20 + Math.random() * 60}%;
      top: ${30 + Math.random() * 40}%;
    `;
    
    particleContainer.appendChild(particle);
  }
  
  buttonElement.appendChild(particleContainer);
}
```

### 🔔 ModalManager

**路徑**: `src/ui/components/ModalManager.js`  
**描述**: 統一管理所有模態視窗的生命週期和互動

#### 類別定義

```javascript
export class ModalManager {
  constructor(options = {})
  
  // 模態視窗創建
  createModal(config)
  showModal(modal)
  hideModal(modal)
  
  // 預定義模態視窗
  showMemoryFullModal(memoryData)
  showExportResultModal(exportResult)
  showSettingsModal(currentSettings)
  showConfirmationModal(config)
  
  // 管理方法
  closeAllModals()
  getActiveModals()
  isModalActive(modalId)
}
```

#### 模態視窗方法

**`showMemoryFullModal(memoryData)`**
```javascript
/**
 * 顯示記憶已滿警告模態視窗
 * @param {Object} memoryData - 記憶狀態資料
 * @param {number} memoryData.usage - 使用率 (0.0-1.0)
 * @param {number} memoryData.itemCount - 項目數量
 * @param {Array} memoryData.categories - 記憶分類
 * @returns {Promise<string>} 使用者選擇的動作
 */
async showMemoryFullModal(memoryData) {
  const modal = this.createModal({
    id: 'memory-full-warning',
    title: '⚠️ 記憶容量已滿',
    type: 'warning',
    size: 'medium',
    backdrop: true,
    keyboard: true,
    
    content: `
      <div class="memory-status-details">
        <div class="usage-bar">
          <div class="usage-fill" style="width: ${memoryData.usage * 100}%"></div>
          <span class="usage-text">${Math.round(memoryData.usage * 100)}% 已使用</span>
        </div>
        
        <div class="memory-stats">
          <div class="stat-item">
            <span class="stat-label">記憶項目:</span>
            <span class="stat-value">${memoryData.itemCount}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">分類數量:</span>
            <span class="stat-value">${memoryData.categories?.length || 0}</span>
          </div>
        </div>
        
        <p class="warning-message">
          您的 ChatGPT 記憶即將達到容量上限。建議立即匯出記憶內容以釋放空間。
        </p>
      </div>
    `,
    
    actions: [
      {
        text: '🚀 立即匯出',
        action: 'export',
        style: 'primary',
        autoClose: true
      },
      {
        text: '⏰ 稍後提醒 (24小時)',
        action: 'remind',
        style: 'secondary', 
        autoClose: true
      },
      {
        text: '🚫 不再提醒',
        action: 'dismiss',
        style: 'tertiary',
        autoClose: true
      }
    ]
  });
  
  return this.showModal(modal);
}
```

### 📝 ToastManager

**路徑**: `src/ui/components/ToastManager.js`  
**描述**: 非侵入式通知系統管理器

#### 類別定義

```javascript
export class ToastManager {
  constructor(options = {})
  
  // 通知顯示方法
  showSuccess(message, options)
  showError(message, options)
  showWarning(message, options)
  showInfo(message, options)
  
  // 管理方法
  clear()
  remove(toastId)
  updatePosition()
}
```

#### 通知方法

**`showSuccess(message, options)`**
```javascript
/**
 * 顯示成功通知
 * @param {string} message - 通知訊息
 * @param {Object} options - 配置選項
 * @param {number} options.duration - 顯示時間 (預設: 3000ms)
 * @param {boolean} options.closable - 是否可關閉 (預設: true)
 * @param {string} options.position - 位置 (預設: 'top-right')
 * @returns {string} Toast ID
 */
showSuccess(message, options = {}) {
  return this.createToast({
    type: 'success',
    message,
    icon: '✅',
    className: 'toast-success',
    duration: options.duration || 3000,
    closable: options.closable !== false,
    position: options.position || 'top-right',
    
    // 成功通知的特殊樣式
    style: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: '#ffffff',
      border: '1px solid #047857'
    }
  });
}
```

---

## 工具模組 API | Utility Modules API

### 💾 StorageManager

**路徑**: `src/utils/storage-manager.js`  
**描述**: Chrome Storage API 的高級包裝器，提供快取和事務支援

#### 類別定義

```javascript
export class StorageManager {
  constructor(options = {})
  
  // 基本操作
  async get(key, defaultValue)
  async set(key, value)
  async remove(key)
  async clear()
  
  // 批次操作
  async getBatch(keys)
  async setBatch(data)
  async removeBatch(keys)
  
  // 進階功能
  async getWithExpiry(key, defaultValue)
  async setWithExpiry(key, value, expiryMs)
  async transaction(callback)
  
  // 事件監聽
  onChange(callback)
  onQuotaExceeded(callback)
}
```

#### 核心方法

**`get(key, defaultValue)`**
```javascript
/**
 * 取得儲存的資料
 * @param {string} key - 資料鍵值
 * @param {any} defaultValue - 預設值
 * @returns {Promise<any>} 儲存的資料或預設值
 */
async get(key, defaultValue = null) {
  // 檢查快取
  if (this.cache.has(key)) {
    const cached = this.cache.get(key);
    if (Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }
  }
  
  try {
    const result = await chrome.storage.local.get(key);
    const value = result[key] ?? defaultValue;
    
    // 更新快取
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
    
    return value;
  } catch (error) {
    console.error(`Storage get error for key "${key}":`, error);
    return defaultValue;
  }
}
```

**`transaction(callback)`**
```javascript
/**
 * 執行儲存事務
 * @param {Function} callback - 事務回調函數
 * @returns {Promise<any>} 事務結果
 */
async transaction(callback) {
  const transactionId = `tx_${Date.now()}_${Math.random()}`;
  
  try {
    // 開始事務
    this.activeTransactions.add(transactionId);
    
    // 創建事務上下文
    const context = {
      get: (key, defaultValue) => this.get(key, defaultValue),
      set: (key, value) => this.pendingChanges.set(key, value),
      remove: (key) => this.pendingChanges.set(key, undefined),
      rollback: () => this.pendingChanges.clear()
    };
    
    // 執行事務回調
    const result = await callback(context);
    
    // 提交變更
    await this.commitTransaction(transactionId);
    
    return result;
  } catch (error) {
    // 回滾事務
    await this.rollbackTransaction(transactionId);
    throw error;
  } finally {
    this.activeTransactions.delete(transactionId);
  }
}
```

### 📚 MemoryHistory

**路徑**: `src/utils/memory-history.js`  
**描述**: 記憶匯出歷史的管理和查詢系統

#### 類別定義

```javascript
export class MemoryHistory {
  constructor(storageManager)
  
  // 歷史記錄操作
  async addRecord(exportData)
  async getRecords(filters)
  async getRecord(recordId)
  async removeRecord(recordId)
  async clearHistory()
  
  // 查詢和統計
  async search(query, options)
  async getStatistics(timeRange)
  async getCategories()
  
  // 維護操作
  async cleanup(options)
  async export(format)
}
```

#### 主要方法

**`addRecord(exportData)`**
```javascript
/**
 * 新增匯出記錄
 * @param {Object} exportData - 匯出資料
 * @param {string} exportData.content - 匯出內容
 * @param {string} exportData.format - 格式類型
 * @param {Object} exportData.metadata - 元資料
 * @returns {Promise<string>} 記錄 ID
 */
async addRecord(exportData) {
  const recordId = this.generateRecordId();
  const timestamp = Date.now();
  
  const record = {
    id: recordId,
    timestamp,
    date: new Date(timestamp).toISOString(),
    content: exportData.content,
    format: exportData.format || 'markdown',
    metadata: {
      itemCount: exportData.metadata?.itemCount || 0,
      categories: exportData.metadata?.categories || [],
      wordCount: this.countWords(exportData.content),
      size: new Blob([exportData.content]).size,
      ...exportData.metadata
    },
    tags: this.extractTags(exportData.content),
    checksum: await this.calculateChecksum(exportData.content)
  };
  
  // 儲存記錄
  const records = await this.getRecords();
  records.unshift(record);
  
  // 限制記錄數量
  if (records.length > this.maxRecords) {
    records.splice(this.maxRecords);
  }
  
  await this.storageManager.set('export_history', records);
  
  // 更新統計
  await this.updateStatistics(record);
  
  return recordId;
}
```

---

## 事件系統 API | Event System API

### 📡 EventEmitter

**路徑**: `src/utils/event-emitter.js`  
**描述**: 自訂事件系統，用於組件間通訊

#### 類別定義

```javascript
export class EventEmitter {
  constructor()
  
  // 事件監聽
  on(event, listener, options)
  once(event, listener, options)
  off(event, listener)
  
  // 事件觸發
  emit(event, ...args)
  emitAsync(event, ...args)
  
  // 管理方法
  listenerCount(event)
  eventNames()
  removeAllListeners(event)
}
```

#### 事件類型定義

```javascript
// 記憶相關事件
const MEMORY_EVENTS = {
  STATUS_CHANGED: 'memory:status:changed',
  EXPORT_STARTED: 'memory:export:started', 
  EXPORT_COMPLETED: 'memory:export:completed',
  EXPORT_FAILED: 'memory:export:failed'
};

// UI 相關事件  
const UI_EVENTS = {
  BUTTON_STATE_CHANGED: 'ui:button:state:changed',
  MODAL_OPENED: 'ui:modal:opened',
  MODAL_CLOSED: 'ui:modal:closed',
  TOAST_SHOWN: 'ui:toast:shown'
};

// 系統相關事件
const SYSTEM_EVENTS = {
  EXTENSION_READY: 'system:extension:ready',
  TAB_ACTIVATED: 'system:tab:activated',
  SETTINGS_CHANGED: 'system:settings:changed'
};
```

---

## Chrome Extension API

### 🔌 Chrome API 包裝器

**路徑**: `src/utils/chrome-api.js`  
**描述**: Chrome Extension API 的 Promise 包裝器

#### 類別定義

```javascript
export class ChromeAPI {
  constructor()
  
  // Storage API
  static storage = {
    get: (keys) => Promise,
    set: (items) => Promise,
    remove: (keys) => Promise,
    clear: () => Promise
  }
  
  // Runtime API
  static runtime = {
    sendMessage: (message) => Promise,
    onMessage: EventEmitter,
    getURL: (path) => string,
    getManifest: () => Object
  }
  
  // Tabs API
  static tabs = {
    query: (queryInfo) => Promise<Tab[]>,
    get: (tabId) => Promise<Tab>,
    executeScript: (tabId, details) => Promise
  }
  
  // Scripting API (Manifest V3)
  static scripting = {
    executeScript: (injection) => Promise<InjectionResult[]>,
    insertCSS: (injection) => Promise,
    removeCSS: (injection) => Promise
  }
}
```

#### 使用範例

```javascript
// 發送訊息到背景腳本
const response = await ChromeAPI.runtime.sendMessage({
  type: 'GET_MEMORY_STATUS',
  data: { tabId: currentTabId }
});

// 查詢當前分頁
const [currentTab] = await ChromeAPI.tabs.query({
  active: true,
  currentWindow: true
});

// 執行內容腳本
const results = await ChromeAPI.scripting.executeScript({
  target: { tabId: currentTab.id },
  function: () => document.title
});
```

---

## 📝 類型定義 | Type Definitions

### 🔷 核心資料類型

```typescript
// 記憶狀態類型
interface MemoryStatus {
  status: 'normal' | 'warning' | 'critical' | 'unknown';
  usage: number; // 0.0 - 1.0
  itemCount: number;
  timestamp: number;
  categories?: MemoryCategory[];
}

// 記憶分類類型
interface MemoryCategory {
  name: string;
  count: number;
  percentage: number;
}

// 匯出資料類型
interface ExportData {
  content: string;
  format: 'markdown' | 'text' | 'json';
  metadata: ExportMetadata;
}

// 匯出元資料類型
interface ExportMetadata {
  exportedAt: string;
  itemCount: number;
  categories: MemoryCategory[];
  wordCount: number;
  size: number;
  version: string;
}

// 歷史記錄類型
interface HistoryRecord {
  id: string;
  timestamp: number;
  date: string;
  content: string;
  format: string;
  metadata: ExportMetadata;
  tags: string[];
  checksum: string;
}
```

### 🔷 UI 組件類型

```typescript
// 按鈕狀態類型
type ButtonState = 'idle' | 'loading' | 'exporting' | 'success' | 'error' | 'memory-full';

// 模態視窗配置類型
interface ModalConfig {
  id: string;
  title: string;
  type: 'info' | 'warning' | 'error' | 'success';
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  content: string | HTMLElement;
  actions: ModalAction[];
  backdrop?: boolean;
  keyboard?: boolean;
}

// 模態視窗動作類型
interface ModalAction {
  text: string;
  action: string;
  style: 'primary' | 'secondary' | 'tertiary' | 'danger';
  autoClose?: boolean;
  disabled?: boolean;
}

// Toast 配置類型
interface ToastConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  closable?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  icon?: string;
  className?: string;
}
```

---

## 🚀 使用範例 | Usage Examples

### 📋 基本使用範例

**初始化擴充套件**
```javascript
// background.js
import { BackgroundService } from './background.js';

const backgroundService = new BackgroundService();
await backgroundService.initialize();

// 監聽記憶狀態變化
backgroundService.onMemoryStatusChange((status) => {
  console.log('Memory status changed:', status);
});
```

**UI 組件使用**
```javascript
// popup.js
import { ButtonStateManager, ModalManager, ToastManager } from './ui/components/index.js';

const buttonManager = new ButtonStateManager();
const modalManager = new ModalManager();
const toastManager = new ToastManager();

// 設定匯出按鈕狀態
const exportButton = document.getElementById('export-button');
buttonManager.setExportingState(exportButton, {
  duration: 3000,
  particles: true
});

// 顯示成功通知
toastManager.showSuccess('記憶匯出成功！', {
  duration: 3000,
  position: 'top-right'
});
```

### 📊 進階整合範例

**自訂記憶監控**
```javascript
import { ContentScriptManager } from './scripts/content.js';
import { StorageManager } from './utils/storage-manager.js';
import { MemoryHistory } from './utils/memory-history.js';

class CustomMemoryMonitor {
  constructor() {
    this.contentManager = new ContentScriptManager();
    this.storageManager = new StorageManager();
    this.historyManager = new MemoryHistory(this.storageManager);
  }
  
  async startMonitoring() {
    // 每30秒檢查一次記憶狀態
    setInterval(async () => {
      const status = await this.contentManager.checkMemoryStatus();
      
      if (status.usage > 0.9) {
        await this.handleCriticalMemory(status);
      }
    }, 30000);
  }
  
  async handleCriticalMemory(status) {
    // 自動匯出記憶
    const exportData = await this.contentManager.extractMemoryContent();
    
    // 儲存到歷史記錄
    await this.historyManager.addRecord(exportData);
    
    // 顯示通知
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icons/icon48.png',
      title: 'ChatGPT Memory Toolkit',
      message: `自動匯出完成！已匯出 ${status.itemCount} 項記憶內容。`
    });
  }
}
```

---

## 🔧 開發工具 | Development Tools

### 🛠️ 除錯工具

**控制台除錯方法**
```javascript
// 在瀏覽器控制台中使用
window.ChatGPTMemoryToolkit = {
  // 取得當前記憶狀態
  async getMemoryStatus() {
    return await chrome.runtime.sendMessage({
      type: 'GET_MEMORY_STATUS'
    });
  },
  
  // 強制匯出記憶
  async forceExport() {
    return await chrome.runtime.sendMessage({
      type: 'FORCE_EXPORT'
    });
  },
  
  // 清除所有快取
  async clearCache() {
    return await chrome.storage.local.clear();
  },
  
  // 取得除錯資訊
  async getDebugInfo() {
    return {
      version: chrome.runtime.getManifest().version,
      storage: await chrome.storage.local.get(),
      activeTab: await chrome.tabs.query({ active: true, currentWindow: true })
    };
  }
};
```

### 🧪 測試工具

**單元測試範例**
```javascript
// tests/button-state-manager.test.js
import { ButtonStateManager } from '../src/ui/components/ButtonStateManager.js';

describe('ButtonStateManager', () => {
  let manager;
  let mockButton;
  
  beforeEach(() => {
    manager = new ButtonStateManager();
    mockButton = document.createElement('button');
    document.body.appendChild(mockButton);
  });
  
  test('should set exporting state correctly', () => {
    manager.setExportingState(mockButton);
    
    expect(mockButton.classList.contains('exporting')).toBe(true);
    expect(mockButton.disabled).toBe(true);
    expect(mockButton.textContent).toBe('匯出中...');
  });
  
  test('should create particle effect', () => {
    manager.setExportingState(mockButton, { particles: true });
    
    const particles = mockButton.querySelectorAll('.export-particle');
    expect(particles).toHaveLength(5);
  });
});
```

---

**API 文件版本**: v1.6.2  
**最後更新**: 2025-08-01  
**維護者**: ChatGPT Memory Toolkit Development Team

---

> 📚 **完整 API 參考**  
> 本文件涵蓋了 ChatGPT Memory Toolkit 的所有公開 API 和模組介面。如需更詳細的實作細節，請參考原始碼或聯絡開發團隊。