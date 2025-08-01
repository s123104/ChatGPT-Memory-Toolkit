/**
 * Modern ChatGPT Memory Manager - Popup Script
 * 現代化 app 風格的彈出視窗邏輯
 * 基於最佳實踐重構
 */

// 常數將通過全域變數載入

// 組件將通過 components/index.js 載入

/**
 * 現代化彈出視窗管理器實現
 */
class PopupManagerImpl {
  constructor() {
    this.currentTab = null;
    this.memoryData = [];
    this.isInitialized = false;
    this.statusCheckInterval = null;
    this.lastStatusCheck = null;
    this.storageManager = null;
    this.settings = {};
    this.buttonManagers = new Map();
    this.currentExportData = null;

    // 綁定方法到實例
    this.init = this.init.bind(this);
    this.handleExport = this.handleExport.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  /**
   * 初始化管理器
   */
  async init() {
    try {
      console.log('[PopupManager] 開始初始化...');

      // 初始化儲存管理器
      this.storageManager = new StorageManager();
      this.settings = await this.storageManager.initializeSettings();

      // 獲取當前分頁
      await this.getCurrentTab();

      // 設置事件監聽器
      this.setupEventListeners();

      // 初始化按鈕管理器
      this.initializeButtonManagers();

      // 更新狀態
      await this.updateStatus();
      await this.updateStorageInfo();

      // 開始狀態監控
      this.startStatusMonitoring();

      this.isInitialized = true;
      this.updateConnectionStatus(true);

      console.log('[PopupManager] 初始化完成');
    } catch (error) {
      console.error('[PopupManager] 初始化失敗:', error);
      this.showError('初始化失敗');
      this.updateConnectionStatus(false);
    }
  }

  /**
   * 獲取當前分頁
   */
  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      this.currentTab = tab;
      return tab;
    } catch (error) {
      console.error('[PopupManager] 獲取分頁失敗:', error);
      throw error;
    }
  }

  /**
   * 設置事件監聽器
   */
  setupEventListeners() {
    // 主要按鈕
    const buttons = {
      exportBtn: this.handleExport,
      copyBtn: this.handleCopy,
      refreshBtn: this.handleRefresh,
    };

    Object.entries(buttons).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('click', handler);
      }
    });
  }

  /**
   * 初始化按鈕管理器
   */
  initializeButtonManagers() {
    const buttonSelectors = ['#exportBtn', '#copyBtn'];

    buttonSelectors.forEach(selector => {
      const button = document.querySelector(selector);
      if (button) {
        try {
          // 確保 ButtonStateManager 已載入
          if (typeof window.ButtonStateManager === 'undefined') {
            console.warn(
              `[PopupManager] ButtonStateManager 未載入，跳過 ${selector}`
            );
            return;
          }

          const manager = new window.ButtonStateManager(button);
          this.buttonManagers.set(selector, manager);
        } catch (error) {
          console.warn(
            `[PopupManager] 無法初始化按鈕管理器 ${selector}:`,
            error
          );
        }
      }
    });
  }

  /**
   * 更新狀態
   */
  async updateStatus() {
    const elements = {
      memoryStatus: document.getElementById('memoryStatus'),
      usagePercent: document.getElementById('usagePercent'),
      memoryCount: document.getElementById('memoryCount'),
      lastCheck: document.getElementById('lastCheck'),
      statusCard: document.getElementById('statusCard'),
      statusDot: document.getElementById('statusDot'),
    };

    if (!this.currentTab) {
      this.showError('無法取得當前分頁');
      return;
    }

    // 檢查是否在 ChatGPT 網站
    if (!this.currentTab.url?.includes('chatgpt.com')) {
      this.showNotOnChatGPT();
      return;
    }

    try {
      // 透過 background script 獲取記憶狀態
      const response = await chrome.runtime.sendMessage({
        action: 'getMemoryStatus',
      });

      this.updateConnectionStatus(true);

      if (response?.success) {
        this.memoryData = response.data || [];
        const usage = response.usage || '--';
        const count = this.memoryData.length;
        const isFull = response.isFull;

        // 更新狀態顯示
        this.updateStatusDisplay(elements, { isFull, usage, count });

        // 更新按鈕狀態
        this.updateButtonStates({ isFull, count, response });
      } else {
        this.setDefaultStatus(elements);
      }
    } catch (error) {
      console.warn('[PopupManager] 無法取得記憶資料:', error);
      this.handleConnectionError(error, elements);
    }
  }

  /**
   * 更新狀態顯示
   */
  updateStatusDisplay(elements, { isFull, usage, count }) {
    const {
      memoryStatus,
      statusCard,
      statusDot,
      usagePercent,
      memoryCount,
      lastCheck,
    } = elements;

    if (isFull) {
      memoryStatus.innerHTML = `
        <div class="memory-status-full">
          <span class="status-text">記憶已滿</span>
          <span class="status-action">點擊匯出</span>
        </div>
      `;
      statusCard.className = 'status-card modern warning memory-full';
      statusDot.className = 'status-dot warning pulse';
    } else {
      memoryStatus.textContent = '記憶正常';
      statusCard.className = 'status-card modern success';
      statusDot.className = 'status-dot';
    }

    // 更新使用量顯示和顏色
    this.updateUsageDisplay(usagePercent, usage);
    memoryCount.textContent = count > 0 ? `${count} 筆` : '--';

    // 更新最後檢查時間
    this.lastStatusCheck = new Date();
    lastCheck.textContent = this.formatTime(this.lastStatusCheck);
  }

  /**
   * 更新按鈕狀態
   */
  updateButtonStates({ isFull, count, response }) {
    // 啟用/禁用複製按鈕
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
      copyBtn.disabled = count === 0 && !response.markdown;
    }

    // 更新匯出按鈕狀態
    const exportBtnManager = this.buttonManagers.get('#exportBtn');
    if (exportBtnManager) {
      if (isFull) {
        exportBtnManager.setMemoryFullUrgent(
          '立即匯出',
          'Memory Full - Export Now'
        );
      } else {
        exportBtnManager.reset('匯出記憶', 'Export Memory');
      }
    }
  }

  /**
   * 處理匯出 - 將委託給 PopupActions
   */
  async handleExport() {
    if (window.PopupActions && window.PopupActions.handleExport) {
      return window.PopupActions.handleExport(this);
    }
    console.warn('[PopupManager] PopupActions.handleExport 未載入');
  }

  /**
   * 處理複製 - 將委託給 PopupActions
   */
  async handleCopy() {
    if (window.PopupActions && window.PopupActions.handleCopy) {
      return window.PopupActions.handleCopy(this);
    }
    console.warn('[PopupManager] PopupActions.handleCopy 未載入');
  }

  /**
   * 處理重新整理 - 將委託給 PopupActions
   */
  async handleRefresh() {
    if (window.PopupActions && window.PopupActions.handleRefresh) {
      return window.PopupActions.handleRefresh(this);
    }
    console.warn('[PopupManager] PopupActions.handleRefresh 未載入');
  }

  /**
   * 開始狀態監控
   */
  startStatusMonitoring() {
    // 定期檢查狀態
    const checkInterval =
      (window.TIMING_CONSTANTS &&
        window.TIMING_CONSTANTS.STATUS_CHECK_INTERVAL) ||
      10000;
    this.statusCheckInterval = setInterval(() => {
      this.updateStatus();
    }, checkInterval);
  }

  /**
   * 停止狀態監控
   */
  stopStatusMonitoring() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  /**
   * 更新連接狀態
   */
  updateConnectionStatus(connected) {
    const connectionStatus = document.getElementById('connectionStatus');
    if (connectionStatus) {
      connectionStatus.textContent = connected ? '已連接' : '未連接';
      connectionStatus.className = connected
        ? 'status-text'
        : 'status-text disconnected';
    }
  }

  /**
   * 格式化時間
   */
  formatTime(date) {
    const now = new Date();
    const diff = now - date;

    const ONE_MINUTE =
      (window.TIMING_CONSTANTS && window.TIMING_CONSTANTS.ONE_MINUTE) || 60000;
    const ONE_HOUR =
      (window.TIMING_CONSTANTS && window.TIMING_CONSTANTS.ONE_HOUR) || 3600000;

    if (diff < ONE_MINUTE) {
      return '剛剛';
    } else if (diff < ONE_HOUR) {
      const minutes = Math.floor(diff / ONE_MINUTE);
      return `${minutes} 分鐘前`;
    } else {
      return date.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  /**
   * 更新使用量顯示
   */
  updateUsageDisplay(element, usage) {
    if (!element) {
      return;
    }

    element.textContent = usage;

    // 解析百分比並設置顏色
    if (usage && usage !== '--') {
      const percentage = parseInt(usage.replace('%', ''));
      if (!isNaN(percentage)) {
        element.classList.remove(
          'usage-normal',
          'usage-warning',
          'usage-critical'
        );

        const criticalThreshold =
          (window.UI_CONSTANTS &&
            window.UI_CONSTANTS.USAGE_CRITICAL_THRESHOLD) ||
          100;
        const warningThreshold =
          (window.UI_CONSTANTS &&
            window.UI_CONSTANTS.USAGE_WARNING_THRESHOLD) ||
          80;

        if (percentage >= criticalThreshold) {
          element.classList.add('usage-critical');
        } else if (percentage >= warningThreshold) {
          element.classList.add('usage-warning');
        } else {
          element.classList.add('usage-normal');
        }
      }
    }
  }

  /**
   * 顯示錯誤
   */
  showError(message) {
    const elements = {
      memoryStatus: document.getElementById('memoryStatus'),
      statusCard: document.getElementById('statusCard'),
      statusDot: document.getElementById('statusDot'),
    };

    if (elements.memoryStatus) {
      elements.memoryStatus.textContent = message;
      elements.statusCard.className = 'status-card modern warning';
      elements.statusDot.className = 'status-dot error';
    }

    if (window.toastManager) {
      window.toastManager.error(message);
    }
  }

  /**
   * 處理連接錯誤
   */
  handleConnectionError(error, elements) {
    if (error.message.includes('Could not establish connection')) {
      this.showConnectionError();
    } else {
      elements.memoryStatus.textContent = '請前往記憶管理頁面';
      elements.statusCard.className = 'status-card modern warning';
      elements.statusDot.className = 'status-dot warning';
    }
    this.updateConnectionStatus(false);
  }

  /**
   * 顯示連接錯誤
   */
  showConnectionError() {
    const elements = {
      memoryStatus: document.getElementById('memoryStatus'),
      statusCard: document.getElementById('statusCard'),
      statusDot: document.getElementById('statusDot'),
    };

    if (elements.memoryStatus) {
      elements.memoryStatus.textContent = '擴充套件未載入';
      elements.statusCard.className = 'status-card modern warning';
      elements.statusDot.className = 'status-dot error';
    }

    // 禁用所有按鈕
    ['#exportBtn', '#copyBtn'].forEach(selector => {
      const manager = this.buttonManagers.get(selector);
      if (manager) {
        manager.button.disabled = true;
      }
    });
  }

  /**
   * 設置預設狀態
   */
  setDefaultStatus(elements) {
    elements.memoryStatus.textContent = '等待檢測...';
    elements.statusCard.className = 'status-card modern';
    elements.statusDot.className = 'status-dot';
  }

  /**
   * 顯示不在 ChatGPT 網站的狀態
   */
  showNotOnChatGPT() {
    const elements = {
      memoryStatus: document.getElementById('memoryStatus'),
      statusCard: document.getElementById('statusCard'),
      statusDot: document.getElementById('statusDot'),
      actionSection: document.querySelector('.action-section'),
    };

    if (elements.memoryStatus) {
      elements.memoryStatus.textContent = '請前往 ChatGPT 網站';
      elements.statusCard.className = 'status-card modern warning';
      elements.statusDot.className = 'status-dot warning';
    }

    this.updateConnectionStatus(false);
  }

  /**
   * 更新儲存資訊
   */
  async updateStorageInfo() {
    if (!this.storageManager) {
      return;
    }

    try {
      const usage = await this.storageManager.getStorageUsage();
      const storageBar = document.getElementById('storageBar');
      const storageText = document.getElementById('storageText');

      if (storageBar) {
        storageBar.style.width = `${usage.percentage}%`;
      }

      if (storageText) {
        const bytesPerMB =
          (window.STORAGE_CONSTANTS && window.STORAGE_CONSTANTS.BYTES_PER_MB) ||
          1024 * 1024;
        const usedMB = (usage.used / bytesPerMB).toFixed(1);
        const totalMB = (usage.total / bytesPerMB).toFixed(0);
        storageText.textContent = `${usedMB} / ${totalMB} MB`;
      }
    } catch (error) {
      console.error('[PopupManager] 更新儲存資訊失敗:', error);
    }
  }

  /**
   * 銷毀管理器
   */
  destroy() {
    // 停止狀態監控
    this.stopStatusMonitoring();

    // 銷毀按鈕管理器
    this.buttonManagers.forEach(manager => {
      if (manager && typeof manager.destroy === 'function') {
        manager.destroy();
      }
    });
    this.buttonManagers.clear();

    // 清理引用
    this.currentTab = null;
    this.memoryData = [];
    this.storageManager = null;
    this.settings = {};
    this.currentExportData = null;
  }
}

// 擴展 ModernPopupManager 類別
if (typeof window !== 'undefined' && window.ModernPopupManager) {
  // 將實現方法添加到原型
  Object.assign(
    window.ModernPopupManager.prototype,
    PopupManagerImpl.prototype
  );
}

// 初始化管理器
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 等待組件系統初始化完成
    if (window.componentManager) {
      await window.componentManager.waitForInitialization();
    }

    // 創建並初始化彈出視窗管理器
    const popupManager = new window.ModernPopupManager();

    // 添加動作處理方法
    if (window.PopupActions) {
      popupManager.handleExport = () =>
        window.PopupActions.handleExport(popupManager);
      popupManager.handleCopy = () =>
        window.PopupActions.handleCopy(popupManager);
      popupManager.handleRefresh = () =>
        window.PopupActions.handleRefresh(popupManager);
    }

    await popupManager.init();

    // 將管理器實例設為全域變數以便調試
    window.popupManager = popupManager;

    console.log('[PopupManager] 啟動成功');
  } catch (error) {
    console.error('[PopupManager] 啟動失敗:', error);

    // 顯示錯誤訊息給用戶
    const errorElement = document.createElement('div');
    errorElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
    `;
    errorElement.textContent = '初始化失敗，請重新載入擴充套件';
    document.body.appendChild(errorElement);
  }
});
