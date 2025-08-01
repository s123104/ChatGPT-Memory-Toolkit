/**
 * Modern ChatGPT Memory Manager - Popup Script
 * 現代化 app 風格的彈出視窗邏輯
 * 模組化重構版本
 */

// 動態載入並整合所有模組
import { ModernPopupManager } from './popup-manager.js';
import {
  handleExport,
  handleCopy,
  handleRefresh,
  handleSettings,
  getSystemInfo,
} from './popup-actions.js';

/**
 * 擴展 PopupManager 以整合動作處理器
 */
class IntegratedPopupManager extends ModernPopupManager {
  /**
   * 覆寫處理匯出方法
   */
  async handleExport() {
    return await handleExport(this);
  }

  /**
   * 覆寫處理複製方法
   */
  async handleCopy() {
    return await handleCopy(this);
  }

  /**
   * 覆寫處理重新整理方法
   */
  async handleRefresh() {
    return await handleRefresh(this);
  }

  /**
   * 處理設定
   */
  async handleSettings() {
    return await handleSettings(this);
  }

  /**
   * 獲取系統資訊
   */
  async getSystemInfo() {
    return await getSystemInfo(this);
  }
}

// 全域變數
let popupManager = null;

/**
 * 初始化應用程式
 */
async function initializeApp() {
  try {
    console.log('[Popup] 開始初始化應用程式...');

    // 等待必要組件載入
    await waitForDependencies();

    // 初始化管理器
    popupManager = new IntegratedPopupManager();
    await popupManager.init();

    // 設置全域錯誤處理
    setupGlobalErrorHandling();

    // 設置視窗關閉事件
    setupWindowEvents();

    console.log('[Popup] 應用程式初始化完成');
  } catch (error) {
    console.error('[Popup] 應用程式初始化失敗:', error);
    showFallbackError('初始化失敗，請重新載入');
  }
}

/**
 * 等待必要的依賴載入
 */
async function waitForDependencies() {
  const maxWait = 5000; // 最多等待 5 秒
  const checkInterval = 100; // 每 100ms 檢查一次
  const startTime = Date.now();

  const requiredDependencies = [
    'StorageManager',
    'ButtonStateManager',
    'ModalManager',
    'ToastManager',
  ];

  while (Date.now() - startTime < maxWait) {
    const allLoaded = requiredDependencies.every(dep => window[dep]);

    if (allLoaded) {
      console.log('[Popup] 所有依賴已載入');
      return;
    }

    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }

  console.warn('[Popup] 部分依賴載入逾時，繼續初始化');
}

/**
 * 設置全域錯誤處理
 */
function setupGlobalErrorHandling() {
  window.addEventListener('error', event => {
    console.error('[Popup] 全域錯誤:', event.error);

    if (popupManager) {
      popupManager.showError('發生未預期的錯誤');
    }
  });

  window.addEventListener('unhandledrejection', event => {
    console.error('[Popup] 未處理的 Promise 拒絕:', event.reason);

    if (popupManager) {
      popupManager.showError('操作失敗');
    }
  });
}

/**
 * 設置視窗事件
 */
function setupWindowEvents() {
  // 視窗關閉時清理資源
  window.addEventListener('beforeunload', () => {
    if (popupManager) {
      popupManager.destroy();
    }
  });

  // 視窗獲得焦點時重新整理狀態
  window.addEventListener('focus', async () => {
    if (popupManager && popupManager.isInitialized) {
      try {
        await popupManager.updateStatus();
      } catch (error) {
        console.warn('[Popup] 重新整理狀態失敗:', error);
      }
    }
  });
}

/**
 * 顯示降級錯誤訊息
 */
function showFallbackError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.id = 'fallbackError';
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    right: 20px;
    background: #fee2e2;
    color: #dc2626;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #fecaca;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  `;
  errorDiv.textContent = message;

  document.body.appendChild(errorDiv);

  // 5 秒後自動移除
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 5000);
}

/**
 * 檢查瀏覽器相容性
 */
function checkBrowserCompatibility() {
  const requiredFeatures = [
    'chrome.tabs',
    'chrome.storage',
    'chrome.runtime',
    'navigator.clipboard',
  ];

  const missingFeatures = requiredFeatures.filter(feature => {
    const parts = feature.split('.');
    let obj = window;
    for (const part of parts) {
      obj = obj?.[part];
      if (!obj) return true;
    }
    return false;
  });

  if (missingFeatures.length > 0) {
    console.error('[Popup] 缺少必要功能:', missingFeatures);
    showFallbackError('瀏覽器不相容，請使用 Chrome 瀏覽器');
    return false;
  }

  return true;
}

/**
 * 應用程式入口點
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] DOM 已載入');

  // 檢查瀏覽器相容性
  if (!checkBrowserCompatibility()) {
    return;
  }

  // 設置載入指示器
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'block';
  }

  try {
    // 初始化應用程式
    await initializeApp();

    // 隱藏載入指示器
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

    // 顯示主要內容
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.style.display = 'block';
    }
  } catch (error) {
    console.error('[Popup] 初始化失敗:', error);

    // 隱藏載入指示器
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

    showFallbackError('載入失敗，請重試');
  }
});

// 匯出管理器實例供調試使用
window.popupManager = popupManager;

console.log('[Popup] 腳本已載入');
