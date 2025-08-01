/**
 * UI Components Index - 統一組件導入
 * 現代化組件管理系統
 */

// 組件將通過script標籤載入

/**
 * 組件管理器
 * 統一管理所有UI組件的生命週期
 */
class ComponentManager {
  constructor() {
    this.components = new Map();
    this.initialized = false;
    this.init();
  }

  /**
   * 初始化組件管理器
   */
  async init() {
    try {
      console.log('[ComponentManager] 開始初始化組件...');

      // 等待所有組件載入
      await this.waitForComponents();

      // 初始化全域組件實例
      this.initializeGlobalInstances();

      // 設置組件間通信
      this.setupComponentCommunication();

      this.initialized = true;
      console.log('[ComponentManager] 組件初始化完成');

      // 觸發初始化完成事件
      this.dispatchEvent('componentsReady');
    } catch (error) {
      console.error('[ComponentManager] 組件初始化失敗:', error);
    }
  }

  /**
   * 等待組件載入
   */
  async waitForComponents() {
    // 嘗試獲取常數，如果失敗則使用預設值
    const COMPONENT_LOAD_TIMEOUT =
      typeof window !== 'undefined' && window.TIMING_CONSTANTS
        ? window.TIMING_CONSTANTS.COMPONENT_LOAD_TIMEOUT
        : 5000;
    const COMPONENT_CHECK_INTERVAL =
      typeof window !== 'undefined' && window.TIMING_CONSTANTS
        ? window.TIMING_CONSTANTS.COMPONENT_CHECK_INTERVAL
        : 100;

    let waitTime = 0;

    return new Promise((resolve, reject) => {
      const checkComponents = () => {
        const requiredComponents = [
          'ModalManager',
          'ToastManager',
          'ButtonStateManager',
        ];
        const loadedComponents = requiredComponents.filter(
          name => window[name]
        );

        if (loadedComponents.length === requiredComponents.length) {
          console.log('[ComponentManager] 所有組件已載入:', loadedComponents);
          resolve();
        } else if (waitTime >= COMPONENT_LOAD_TIMEOUT) {
          reject(
            new Error(
              `組件載入超時，缺少: ${requiredComponents.filter(name => !window[name]).join(', ')}`
            )
          );
        } else {
          waitTime += COMPONENT_CHECK_INTERVAL;
          setTimeout(checkComponents, COMPONENT_CHECK_INTERVAL);
        }
      };

      checkComponents();
    });
  }

  /**
   * 初始化全域組件實例
   */
  initializeGlobalInstances() {
    // 確保全域實例存在
    if (!window.modalManager && window.ModalManager) {
      window.modalManager = new window.ModalManager();
      this.components.set('modal', window.modalManager);
    }

    if (!window.toastManager && window.ToastManager) {
      window.toastManager = new window.ToastManager();
      this.components.set('toast', window.toastManager);
    }

    console.log('[ComponentManager] 全域實例已初始化');
  }

  /**
   * 設置組件間通信
   */
  setupComponentCommunication() {
    // 設置組件間的事件通信
    document.addEventListener('buttonStateChange', event => {
      const { state, _data } = event.detail;

      // 根據按鈕狀態顯示相應的通知
      if (state === 'success' && window.toastManager) {
        // 可以在這裡添加自動通知邏輯
      } else if (state === 'error' && window.toastManager) {
        // 可以在這裡添加錯誤通知邏輯
      }
    });

    // 設置模態窗和Toast的協調
    if (window.modalManager && window.toastManager) {
      // 當模態窗顯示時，可能需要調整Toast位置
      document.addEventListener('modalShow', () => {
        // 調整Toast的z-index或位置
      });
    }

    console.log('[ComponentManager] 組件間通信已設置');
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
   * 檢查組件是否已初始化
   * @returns {boolean} 是否已初始化
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * 等待組件管理器初始化完成
   * @returns {Promise} 初始化完成的Promise
   */
  waitForInitialization() {
    if (this.initialized) {
      return Promise.resolve();
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
   * @param {string} eventName - 事件名稱
   * @param {Object} detail - 事件詳情
   */
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  /**
   * 創建按鈕狀態管理器
   * @param {HTMLElement} button - 按鈕元素
   * @returns {ButtonStateManager|null} 按鈕狀態管理器實例
   */
  createButtonManager(button) {
    if (!button || !window.ButtonStateManager) {
      console.warn('[ComponentManager] 無法創建按鈕管理器');
      return null;
    }

    try {
      return new window.ButtonStateManager(button);
    } catch (error) {
      console.error('[ComponentManager] 創建按鈕管理器失敗:', error);
      return null;
    }
  }

  /**
   * 顯示Toast通知
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
  showModal(_config) {
    if (window.modalManager) {
      return window.modalManager.show(_config);
    } else {
      console.warn('[ComponentManager] ModalManager 未初始化');
      return null;
    }
  }

  /**
   * 銷毀組件管理器
   */
  destroy() {
    // 銷毀所有組件實例
    this.components.forEach((component, _name) => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });

    this.components.clear();
    this.initialized = false;

    console.log('[ComponentManager] 組件管理器已銷毀');
  }
}

// 創建全域組件管理器實例
const componentManager = new ComponentManager();

// 導出到全域變數
if (typeof window !== 'undefined') {
  window.ComponentManager = ComponentManager;
  window.componentManager = componentManager;
}

// 為了向後兼容，在組件載入完成後設置全域變數
componentManager.waitForInitialization().then(() => {
  console.log('[ComponentManager] 所有組件已準備就緒');
});
