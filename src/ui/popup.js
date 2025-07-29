// Modern ChatGPT Memory Manager - Popup Script
// 現代化 app 風格的彈出視窗邏輯

class ModernPopupManager {
  constructor() {
    this.currentTab = null;
    this.memoryData = [];
    this.isInitialized = false;
    this.statusCheckInterval = null;
    this.lastStatusCheck = null;
    this.init();
  }

  async init() {
    try {
      await this.getCurrentTab();
      this.setupEventListeners();
      await this.updateStatus();
      this.startStatusMonitoring();
      this.isInitialized = true;
      this.updateConnectionStatus(true);
    } catch (error) {
      console.error('[Popup] 初始化失敗:', error);
      this.showError('初始化失敗');
      this.updateConnectionStatus(false);
    }
  }

  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    this.currentTab = tab;
    return tab;
  }

  setupEventListeners() {
    // 主要按鈕
    const exportBtn = document.getElementById('exportBtn');
    const copyBtn = document.getElementById('copyBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    exportBtn?.addEventListener('click', () => this.handleExport());
    copyBtn?.addEventListener('click', () => this.handleCopy());
    refreshBtn?.addEventListener('click', () => this.handleRefresh());
    settingsBtn?.addEventListener('click', () => this.handleSettings());

    // 添加按鈕點擊效果
    this.addRippleEffect();
  }

  addRippleEffect() {
    const buttons = document.querySelectorAll('.action-btn.modern');
    buttons.forEach(button => {
      button.addEventListener('click', e => {
        const ripple = button.querySelector('.btn-ripple');
        if (ripple) {
          ripple.style.animation = 'none';
          ripple.offsetHeight; // 觸發重排
          ripple.style.animation = null;
        }
      });
    });
  }

  async updateStatus() {
    const memoryStatusEl = document.getElementById('memoryStatus');
    const usagePercentEl = document.getElementById('usagePercent');
    const memoryCountEl = document.getElementById('memoryCount');
    const lastCheckEl = document.getElementById('lastCheck');
    const statusCard = document.getElementById('statusCard');
    const statusDot = document.getElementById('statusDot');

    if (!this.currentTab) {
      this.showError('無法取得當前分頁');
      return;
    }

    // 檢查是否在 ChatGPT 網站
    if (!this.currentTab.url?.includes('chatgpt.com')) {
      memoryStatusEl.textContent = '請前往 ChatGPT 網站';
      statusCard.className = 'status-card modern warning';
      statusDot.className = 'status-dot warning';
      this.updateConnectionStatus(false);
      return;
    }

    try {
      // 首先檢查 content script 是否已載入
      await chrome.tabs.sendMessage(this.currentTab.id, { action: 'ping' });
      this.updateConnectionStatus(true);

      // 獲取記憶狀態
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'getMemoryStatus',
      });

      if (response?.success) {
        this.memoryData = response.data || [];
        const usage = response.usage || '--';
        const count = this.memoryData.length;
        const isFull = response.isFull || false;

        // 更新狀態顯示
        memoryStatusEl.textContent = isFull ? '記憶已滿' : '記憶正常';

        // 更新狀態卡片樣式
        if (isFull) {
          statusCard.className = 'status-card modern warning';
          statusDot.className = 'status-dot warning';
        } else {
          statusCard.className = 'status-card modern success';
          statusDot.className = 'status-dot';
        }

        usagePercentEl.textContent = usage;
        memoryCountEl.textContent = count > 0 ? `${count} 筆` : '--';

        // 更新最後檢查時間
        this.lastStatusCheck = new Date();
        lastCheckEl.textContent = this.formatTime(this.lastStatusCheck);

        // 如果有資料，啟用複製按鈕
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
          copyBtn.disabled = count === 0 && !response.markdown;
        }
      } else {
        memoryStatusEl.textContent = '等待檢測...';
        statusCard.className = 'status-card modern';
        statusDot.className = 'status-dot';
      }
    } catch (error) {
      console.warn('[Popup] 無法取得記憶資料:', error);

      // 檢查是否是連接錯誤
      if (error.message.includes('Could not establish connection')) {
        this.showConnectionError();
      } else {
        memoryStatusEl.textContent = '請前往記憶管理頁面';
        statusCard.className = 'status-card modern warning';
        statusDot.className = 'status-dot warning';
      }
      this.updateConnectionStatus(false);
    }
  }

  startStatusMonitoring() {
    // 每 10 秒檢查一次狀態
    this.statusCheckInterval = setInterval(() => {
      this.updateStatus();
    }, 10000);
  }

  stopStatusMonitoring() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  async handleExport() {
    const exportBtn = document.getElementById('exportBtn');
    if (!exportBtn || exportBtn.disabled) return;

    if (!this.currentTab?.url?.includes('chatgpt.com')) {
      this.showError('請前往 ChatGPT 網站');
      return;
    }

    try {
      this.setButtonLoading(exportBtn, true);

      // 發送匯出請求到 content script
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'exportMemories',
      });

      if (response?.success) {
        this.setButtonSuccess(exportBtn, '匯出成功');
        await this.updateStatus(); // 更新狀態

        // 如果有 markdown 資料，啟用複製按鈕
        if (response.markdown) {
          window.__lastMarkdown = response.markdown;
          const copyBtn = document.getElementById('copyBtn');
          if (copyBtn) copyBtn.disabled = false;
        }
      } else {
        throw new Error(response?.error || '匯出失敗');
      }
    } catch (error) {
      console.error('[Popup] 匯出失敗:', error);

      // 檢查是否是連接錯誤
      if (error.message.includes('Could not establish connection')) {
        this.setButtonError(exportBtn, '請重新整理頁面');
      } else {
        this.setButtonError(exportBtn, '匯出失敗');
      }
    } finally {
      setTimeout(() => this.resetButton(exportBtn, '匯出記憶'), 2000);
    }
  }

  async handleCopy() {
    const copyBtn = document.getElementById('copyBtn');
    if (!copyBtn || copyBtn.disabled) return;

    try {
      let markdown = window.__lastMarkdown;

      // 如果沒有快取的 markdown，嘗試從 content script 取得
      if (!markdown) {
        const response = await chrome.tabs.sendMessage(this.currentTab.id, {
          action: 'getMarkdown',
        });
        markdown = response?.markdown;
      }

      if (!markdown) {
        throw new Error('沒有可複製的資料');
      }

      await navigator.clipboard.writeText(markdown);
      this.setButtonSuccess(copyBtn, '已複製');
    } catch (error) {
      console.error('[Popup] 複製失敗:', error);

      // 檢查是否是連接錯誤
      if (error.message.includes('Could not establish connection')) {
        this.setButtonError(copyBtn, '請重新整理頁面');
      } else {
        this.setButtonError(copyBtn, '複製失敗');
      }
    } finally {
      setTimeout(() => this.resetButton(copyBtn, '複製內容'), 1500);
    }
  }

  async handleRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (!refreshBtn) return;

    // 添加旋轉動畫
    refreshBtn.style.transform = 'rotate(360deg)';
    refreshBtn.style.transition = 'transform 0.5s ease-in-out';

    setTimeout(() => {
      refreshBtn.style.transform = '';
      refreshBtn.style.transition = '';
    }, 500);

    await this.updateStatus();
  }

  handleSettings() {
    if (this.currentTab?.url?.includes('chatgpt.com')) {
      // 在當前分頁中開啟設定頁面
      chrome.tabs.update(this.currentTab.id, {
        url: 'https://chatgpt.com/#settings/Personalization',
      });
      window.close();
    } else {
      // 開啟新分頁
      chrome.tabs.create({
        url: 'https://chatgpt.com/#settings/Personalization',
      });
    }
  }

  setButtonLoading(button, loading = true) {
    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
    } else {
      button.disabled = false;
      button.classList.remove('loading');
    }
  }

  setButtonSuccess(button, text) {
    button.disabled = false;
    button.classList.remove('loading', 'error');
    button.classList.add('success');
    const textEl = button.querySelector('.btn-text');
    if (textEl) textEl.textContent = text;
  }

  setButtonError(button, text) {
    button.disabled = false;
    button.classList.remove('loading', 'success');
    button.classList.add('error');
    const textEl = button.querySelector('.btn-text');
    if (textEl) textEl.textContent = text;
  }

  resetButton(button, originalText) {
    button.disabled = false;
    button.classList.remove('loading', 'success', 'error');
    const textEl = button.querySelector('.btn-text');
    if (textEl) textEl.textContent = originalText;
  }

  showError(message) {
    const memoryStatusEl = document.getElementById('memoryStatus');
    const statusCard = document.getElementById('statusCard');
    const statusDot = document.getElementById('statusDot');

    if (memoryStatusEl) {
      memoryStatusEl.textContent = message;
      statusCard.className = 'status-card modern warning';
      statusDot.className = 'status-dot error';
    }
  }

  showConnectionError() {
    const memoryStatusEl = document.getElementById('memoryStatus');
    const statusCard = document.getElementById('statusCard');
    const statusDot = document.getElementById('statusDot');

    if (memoryStatusEl) {
      memoryStatusEl.textContent = '擴充套件未載入';
      statusCard.className = 'status-card modern warning';
      statusDot.className = 'status-dot error';
    }

    // 禁用所有按鈕
    const exportBtn = document.getElementById('exportBtn');
    const copyBtn = document.getElementById('copyBtn');
    if (exportBtn) exportBtn.disabled = true;
    if (copyBtn) copyBtn.disabled = true;
  }

  updateConnectionStatus(connected) {
    const connectionStatus = document.getElementById('connectionStatus');
    if (connectionStatus) {
      connectionStatus.textContent = connected ? '已連接' : '未連接';
      connectionStatus.className = connected
        ? 'status-text'
        : 'status-text disconnected';
    }
  }

  formatTime(date) {
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      // 小於 1 分鐘
      return '剛剛';
    } else if (diff < 3600000) {
      // 小於 1 小時
      const minutes = Math.floor(diff / 60000);
      return `${minutes} 分鐘前`;
    } else {
      return date.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  // 清理資源
  destroy() {
    this.stopStatusMonitoring();
  }
}

// 當 DOM 載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
  window.popupManager = new ModernPopupManager();
});

// 當視窗關閉時清理資源
window.addEventListener('beforeunload', () => {
  if (window.popupManager) {
    window.popupManager.destroy();
  }
});

// 監聽來自 content script 的訊息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'memoryStatusUpdate') {
    // 更新記憶狀態顯示
    const memoryStatusEl = document.getElementById('memoryStatus');
    const statusCard = document.getElementById('statusCard');
    const statusDot = document.getElementById('statusDot');

    if (memoryStatusEl) {
      memoryStatusEl.textContent = message.status || '檢查中...';

      if (message.isFull) {
        statusCard.className = 'status-card modern warning';
        statusDot.className = 'status-dot warning';
      } else {
        statusCard.className = 'status-card modern success';
        statusDot.className = 'status-dot';
      }
    }

    sendResponse({ success: true });
  }
});
