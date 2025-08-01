/**
 * UI Components Index - 統一組件導入
 * 重構版本，使用模組載入器管理依賴關係
 */

import { ModuleLoader } from '../../utils/module-loader.js';

/**
 * 組件配置定義
 */
const COMPONENT_CONFIG = [
  {
    name: 'constants',
    loader: () => import('../../utils/constants.js'),
    deps: [],
  },
  {
    name: 'storage-core',
    loader: () => import('../../utils/storage-core.js'),
    deps: ['constants'],
  },
  {
    name: 'memory-history',
    loader: () => import('../../utils/memory-history.js'),
    deps: ['storage-core'],
  },
  {
    name: 'storage-manager',
    loader: () => import('../../utils/storage-manager-new.js'),
    deps: ['storage-core', 'memory-history'],
  },
  {
    name: 'toast-styles',
    loader: () => import('./toast-styles.js'),
    deps: [],
  },
  {
    name: 'toast-manager',
    loader: () => import('./ToastManager-new.js'),
    deps: ['toast-styles'],
  },
  {
    name: 'button-state-manager',
    loader: '../src/ui/components/ButtonStateManager.js',
    deps: ['constants'],
  },
  {
    name: 'modal-manager',
    loader: '../src/ui/components/ModalManager.js',
    deps: ['constants'],
  },
];

/**
 * 組件管理器
 * 使用模組載入器管理組件生命週期
 */
export class ComponentManager {
  constructor() {
    this.moduleLoader = new ModuleLoader();
    this.components = new Map();
    this.initialized = false;
    this.initPromise = null;
  }

  /**
   * 初始化組件管理器
   */
  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performInit();
    return this.initPromise;
  }

  /**
   * 執行初始化
   * @private
   */
  async performInit() {
    try {
      console.log('[ComponentManager] 開始初始化組件...');

      // 載入所有組件模組
      await this.moduleLoader.loadModules(COMPONENT_CONFIG);

      // 等待全域組件可用
      await this.waitForGlobalComponents();

      // 初始化組件實例
      this.initializeComponents();

      // 設置組件間通信
      this.setupComponentCommunication();

      this.initialized = true;
      console.log('[ComponentManager] 組件初始化完成');

      // 觸發初始化完成事件
      this.dispatchEvent('componentsReady');
    } catch (error) {
      console.error('[ComponentManager] 組件初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 等待全域組件可用
   * @private
   */
  async waitForGlobalComponents() {
    const requiredGlobals = [
      'TIMING_CONSTANTS',
      'UI_CONSTANTS',
      'ButtonStateManager',
      'ModalManager',
    ];

    const TIMEOUT = 10000;
    const CHECK_INTERVAL = 100;
    let waitTime = 0;

    return new Promise((resolve, reject) => {
      const checkGlobals = () => {
        const missing = requiredGlobals.filter(
          name => typeof window[name] === 'undefined'
        );

        if (missing.length === 0) {
          console.log('[ComponentManager] 所有全域組件已可用');
          resolve();
        } else if (waitTime >= TIMEOUT) {
          reject(new Error(`全域組件載入超時，缺少: ${missing.join(', ')}`));
        } else {
          waitTime += CHECK_INTERVAL;
          setTimeout(checkGlobals, CHECK_INTERVAL);
        }
      };
      checkGlobals();
    });
  }

  /**
   * 初始化組件實例
   * @private
   */
  initializeComponents() {
    try {
      // 初始化 Toast 管理器
      if (window.ToastManager && !window.toastManager) {
        window.toastManager = new window.ToastManager();
        this.components.set('toast', window.toastManager);
        console.log('[ComponentManager] Toast 管理器已初始化');
      }

      // 初始化模態管理器
      if (window.ModalManager && !window.modalManager) {
        window.modalManager = new window.ModalManager();
        this.components.set('modal', window.modalManager);
        console.log('[ComponentManager] 模態管理器已初始化');
      }

      // 初始化儲存管理器
      if (window.StorageManager && !window.storageManager) {
        window.storageManager = new window.StorageManager();
        this.components.set('storage', window.storageManager);
        console.log('[ComponentManager] 儲存管理器已初始化');
      }

      console.log('[ComponentManager] 組件實例初始化完成');
    } catch (error) {
      console.error('[ComponentManager] 組件實例初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 設置組件間通信
   * @private
   */
  setupComponentCommunication() {
    // 按鈕狀態變更事件
    document.addEventListener('buttonStateChange', event => {
      const { state, data } = event.detail;
      console.log(`[ComponentManager] 按鈕狀態變更: ${state}`, data);

      // 根據狀態顯示通知
      if (state === 'success' && window.toastManager) {
        // 可選：自動顯示成功通知
      } else if (state === 'error' && window.toastManager) {
        // 可選：自動顯示錯誤通知
      }
    });

    // Toast 事件監聽
    document.addEventListener('toasttoastShow', event => {
      console.log('[ComponentManager] Toast 顯示:', event.detail);
    });

    document.addEventListener('toasttoastHide', event => {
      console.log('[ComponentManager] Toast 隱藏:', event.detail);
    });

    // 模態窗事件監聽（如果支援）
    if (window.modalManager) {
      document.addEventListener('modalShow', event => {
        console.log('[ComponentManager] 模態窗顯示:', event.detail);
      });

      document.addEventListener('modalHide', event => {
        console.log('[ComponentManager] 模態窗隱藏:', event.detail);
      });
    }

    console.log('[ComponentManager] 組件間通信已設置');
  }

  /**
   * 創建按鈕狀態管理器
   * @param {HTMLElement} button - 按鈕元素
   * @returns {ButtonStateManager|null} 按鈕狀態管理器實例
   */
  createButtonManager(button) {
    if (!button) {
      console.warn('[ComponentManager] 無效的按鈕元素');
      return null;
    }

    if (!window.ButtonStateManager) {
      console.warn('[ComponentManager] ButtonStateManager 尚未載入');
      return null;
    }

    try {
      const manager = new window.ButtonStateManager(button);
      console.log('[ComponentManager] 按鈕管理器已創建');
      return manager;
    } catch (error) {
      console.error('[ComponentManager] 創建按鈕管理器失敗:', error);
      return null;
    }
  }

  /**
   * 顯示 Toast 通知
   * @param {string} message - 訊息
   * @param {string} type - 類型
   * @param {Object} options - 選項
   */
  showToast(message, type = 'info', options = {}) {
    if (window.toastManager) {
      return window.toastManager.show(message, type, options);
    } else {
      console.warn('[ComponentManager] ToastManager 未初始化');
      return null;
    }
  }

  /**
   * 顯示模態窗
   * @param {Object} config - 模態窗配置
   */
  showModal(config) {
    if (window.modalManager) {
      return window.modalManager.show(config);
    } else {
      console.warn('[ComponentManager] ModalManager 未初始化');
      return null;
    }
  }

  /**
   * 獲取組件實例
   * @param {string} name - 組件名稱
   * @returns {Object|null} 組件實例
   */
  getComponent(name) {
    return this.components.get(name) || null;
  }

  /**
   * 檢查是否已初始化
   * @returns {boolean} 是否已初始化
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * 等待初始化完成
   * @returns {Promise} 初始化完成的 Promise
   */
  async waitForInitialization() {
    if (this.initialized) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    return new Promise(resolve => {
      const handler = () => {
        document.removeEventListener('componentsReady', handler);
        resolve();
      };
      document.addEventListener('componentsReady', handler);
    });
  }

  /**
   * 觸發自定義事件
   * @private
   */
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  /**
   * 獲取載入狀態
   * @returns {Object} 載入狀態資訊
   */
  getLoadStatus() {
    return {
      initialized: this.initialized,
      loadedModules: this.moduleLoader.getLoadedModules(),
      componentCount: this.components.size,
      availableGlobals: [
        'TIMING_CONSTANTS',
        'UI_CONSTANTS',
        'ButtonStateManager',
        'ModalManager',
        'ToastManager',
        'StorageManager',
      ].filter(name => typeof window[name] !== 'undefined'),
    };
  }

  /**
   * 銷毀組件管理器
   */
  destroy() {
    // 銷毀組件實例
    this.components.forEach((component, name) => {
      if (component && typeof component.destroy === 'function') {
        try {
          component.destroy();
          console.log(`[ComponentManager] 組件 ${name} 已銷毀`);
        } catch (error) {
          console.error(`[ComponentManager] 銷毀組件 ${name} 失敗:`, error);
        }
      }
    });

    this.components.clear();
    this.moduleLoader.clear();
    this.initialized = false;
    this.initPromise = null;

    console.log('[ComponentManager] 組件管理器已銷毀');
  }
}

// 創建全域組件管理器實例
const componentManager = new ComponentManager();

// 導出到全域變數
if (typeof window !== 'undefined') {
  window.ComponentManager = ComponentManager;
  window.componentManager = componentManager;

  // 自動初始化（如果在瀏覽器環境中）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      componentManager.init().catch(error => {
        console.error('[ComponentManager] 自動初始化失敗:', error);
      });
    });
  } else {
    componentManager.init().catch(error => {
      console.error('[ComponentManager] 自動初始化失敗:', error);
    });
  }
}

export { componentManager };
