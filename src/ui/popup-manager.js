/**
 * Modern ChatGPT Memory Manager - Popup Manager
 * 彈出視窗核心管理器
 */

/**
 * 現代化彈出視窗管理器
 */
class ModernPopupManager {
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

    // 設定按鈕
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
      });
    }

    // 快捷鍵監聽
    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'e':
            e.preventDefault();
            this.handleExport();
            break;
          case 'c':
            if (this.currentExportData) {
              e.preventDefault();
              this.handleCopy();
            }
            break;
          case 'r':
            e.preventDefault();
            this.handleRefresh();
            break;
        }
      }
    });

    // 主題切換按鈕
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }

    // 監聽來自 content script 的訊息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'memoryStatusUpdate') {
        this.updateMemoryStatus(message);
      }
    });
  }

  /**
   * 初始化按鈕管理器
   */
  initializeButtonManagers() {
    const buttonIds = ['exportBtn', 'copyBtn', 'refreshBtn'];

    buttonIds.forEach(id => {
      const element = document.getElementById(id);
      if (element && window.ButtonStateManager) {
        const manager = new window.ButtonStateManager(element);
        this.buttonManagers.set(id, manager);
      }
    });
  }

  /**
   * 更新狀態
   */
  async updateStatus() {
    try {
      if (!this.currentTab) {
        await this.getCurrentTab();
      }

      // 檢查是否在 ChatGPT 頁面
      const isChatGPTPage = this.currentTab?.url?.includes('chatgpt.com');

      // 更新頁面狀態顯示
      const pageStatus = document.getElementById('pageStatus');
      if (pageStatus) {
        pageStatus.textContent = isChatGPTPage
          ? 'ChatGPT 頁面'
          : '非 ChatGPT 頁面';
        pageStatus.className = `status ${isChatGPTPage ? 'connected' : 'disconnected'}`;
      }

      // 更新按鈕狀態
      const exportBtn = document.getElementById('exportBtn');
      if (exportBtn) {
        exportBtn.disabled = !isChatGPTPage;
      }

      // 獲取記憶狀態 - 透過 background script
      if (isChatGPTPage) {
        try {
          const response = await chrome.runtime.sendMessage({
            action: 'getMemoryStatus',
          });

          if (response && response.success && response.status) {
            this.updateMemoryStatus(response);
          } else if (response && !response.success) {
            console.warn('[PopupManager] 獲取記憶狀態失敗:', response.error);
          }
        } catch (error) {
          console.warn('[PopupManager] 無法獲取記憶狀態:', error);
        }
      }

      this.lastStatusCheck = Date.now();
    } catch (error) {
      console.error('[PopupManager] 更新狀態失敗:', error);
    }
  }

  /**
   * 更新記憶狀態顯示
   */
  updateMemoryStatus(statusData) {
    const memoryStatus = document.getElementById('memoryStatus');
    const statusIcon = document.getElementById('statusIcon');

    if (memoryStatus && statusIcon) {
      memoryStatus.textContent = statusData.status || '檢查中...';
      statusIcon.style.color = statusData.color || '#6b7280';

      // 更新狀態指示器
      const statusIndicator = document.querySelector('.status-indicator');
      if (statusIndicator) {
        statusIndicator.className = `status-indicator ${statusData.isFull ? 'warning' : 'success'}`;
      }
    }
  }

  /**
   * 開始狀態監控
   */
  startStatusMonitoring() {
    // 清除現有的監控
    this.stopStatusMonitoring();

    // 設置定期更新
    this.statusCheckInterval = setInterval(async () => {
      await this.updateStatus();
    }, 10000); // 每 10 秒檢查一次
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
   * 更新連線狀態
   */
  updateConnectionStatus(connected) {
    const connectionStatus = document.getElementById('connectionStatus');
    if (connectionStatus) {
      connectionStatus.textContent = connected ? '已連線' : '連線失敗';
      connectionStatus.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
    }
  }

  /**
   * 更新儲存資訊
   */
  async updateStorageInfo() {
    try {
      if (!this.storageManager) {
        return;
      }

      const usage = await this.storageManager.getStorageUsage();
      const storageText = document.getElementById('storageInfo');

      if (!storageText) {
        return;
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
   * 切換主題
   */
  async toggleTheme() {
    try {
      const currentTheme =
        document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      document.documentElement.setAttribute('data-theme', newTheme);

      // 儲存主題設定
      if (this.storageManager) {
        await this.storageManager.saveSettings({ theme: newTheme });
      }

      console.log('[PopupManager] 主題已切換至:', newTheme);
    } catch (error) {
      console.error('[PopupManager] 切換主題失敗:', error);
    }
  }

  /**
   * 顯示錯誤訊息
   */
  showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';

      // 3 秒後自動隱藏
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 3000);
    }
  }

  /**
   * 顯示成功訊息
   */
  showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    if (successElement) {
      successElement.textContent = message;
      successElement.style.display = 'block';

      // 3 秒後自動隱藏
      setTimeout(() => {
        successElement.style.display = 'none';
      }, 3000);
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

    // 清除資料
    this.currentTab = null;
    this.memoryData = [];
    this.isInitialized = false;
    this.storageManager = null;
    this.settings = {};
    this.currentExportData = null;

    console.log('[PopupManager] 管理器已銷毀');
  }

  // 這些方法將在 popup.js 中通過 PopupActions 實現
  // 這裡提供預設實現以避免錯誤
  async handleExport() {
    console.warn(
      '[PopupManager] handleExport 方法需要在 popup-actions.js 中實現'
    );
  }

  async handleCopy() {
    console.warn(
      '[PopupManager] handleCopy 方法需要在 popup-actions.js 中實現'
    );
  }

  async handleRefresh() {
    console.warn(
      '[PopupManager] handleRefresh 方法需要在 popup-actions.js 中實現'
    );
  }
}

// 導出到全域變數
if (typeof window !== 'undefined') {
  window.ModernPopupManager = ModernPopupManager;
}
