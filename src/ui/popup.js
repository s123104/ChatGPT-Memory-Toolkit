// ChatGPT Memory Manager - Popup Script
// 簡潔的彈出視窗邏輯

class PopupManager {
  constructor() {
    this.currentTab = null;
    this.memoryData = [];
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      await this.getCurrentTab();
      this.setupEventListeners();
      await this.updateStatus();
      this.isInitialized = true;
    } catch (error) {
      console.error('[Popup] 初始化失敗:', error);
      this.showError('初始化失敗');
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
    const exportBtn = document.getElementById('exportBtn');
    const copyBtn = document.getElementById('copyBtn');

    exportBtn?.addEventListener('click', () => this.handleExport());
    copyBtn?.addEventListener('click', () => this.handleCopy());
  }

  async updateStatus() {
    const memoryStatusEl = document.getElementById('memoryStatus');
    const usagePercentEl = document.getElementById('usagePercent');
    const memoryCountEl = document.getElementById('memoryCount');

    if (!this.currentTab) {
      this.showError('無法取得當前分頁');
      return;
    }

    // 檢查是否在 ChatGPT 網站
    if (!this.currentTab.url?.includes('chatgpt.com')) {
      memoryStatusEl.textContent = '請前往 ChatGPT 網站';
      memoryStatusEl.style.color = '#f59e0b';
      return;
    }

    // 首先檢查 content script 是否已載入
    try {
      await chrome.tabs.sendMessage(this.currentTab.id, { action: 'ping' });
    } catch (error) {
      if (error.message.includes('Could not establish connection')) {
        this.showConnectionError();
        return;
      }
    }

    try {
      // 嘗試從 content script 取得記憶資料
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'getMemoryData',
      });

      if (response?.success) {
        this.memoryData = response.data || [];
        const usage = response.usage || '--';
        const count = this.memoryData.length;

        memoryStatusEl.textContent = count > 0 ? '已檢測到記憶' : '等待檢測...';
        memoryStatusEl.style.color = count > 0 ? '#10b981' : '#6b7280';
        usagePercentEl.textContent = usage;
        memoryCountEl.textContent = count > 0 ? `${count} 筆` : '--';

        // 如果有資料，啟用複製按鈕
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
          copyBtn.disabled = count === 0;
        }
      } else {
        memoryStatusEl.textContent = '等待檢測...';
        memoryStatusEl.style.color = '#6b7280';
      }
    } catch (error) {
      console.warn('[Popup] 無法取得記憶資料:', error);

      // 檢查是否是連接錯誤
      if (error.message.includes('Could not establish connection')) {
        this.showConnectionError();
      } else {
        memoryStatusEl.textContent = '請前往記憶管理頁面';
        memoryStatusEl.style.color = '#f59e0b';
      }
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
      setTimeout(() => this.resetButton(exportBtn, '匯出 Markdown'), 2000);
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
      setTimeout(() => this.resetButton(copyBtn, '複製到剪貼簿'), 1500);
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
    if (memoryStatusEl) {
      memoryStatusEl.textContent = message;
      memoryStatusEl.style.color = '#ef4444';
    }
  }

  showConnectionError() {
    // 顯示連接錯誤的詳細信息
    const memoryStatusEl = document.getElementById('memoryStatus');
    if (memoryStatusEl) {
      memoryStatusEl.innerHTML =
        '擴充套件未載入<br><small>請重新整理頁面後再試</small>';
      memoryStatusEl.style.color = '#f59e0b';
    }

    // 禁用所有按鈕
    const exportBtn = document.getElementById('exportBtn');
    const copyBtn = document.getElementById('copyBtn');
    if (exportBtn) exportBtn.disabled = true;
    if (copyBtn) copyBtn.disabled = true;
  }
}

// 當 DOM 載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// 監聽來自 content script 的訊息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'memoryStatusUpdate') {
    // 更新記憶狀態顯示
    const memoryStatusEl = document.getElementById('memoryStatus');
    const usagePercentEl = document.getElementById('usagePercent');
    const memoryCountEl = document.getElementById('memoryCount');

    if (memoryStatusEl) {
      memoryStatusEl.textContent = message.status || '檢查中...';
      memoryStatusEl.style.color = message.color || '#6b7280';
    }

    if (usagePercentEl && message.usage) {
      usagePercentEl.textContent = message.usage;
    }

    if (memoryCountEl && message.count !== undefined) {
      memoryCountEl.textContent =
        message.count > 0 ? `${message.count} 筆` : '--';
    }

    sendResponse({ success: true });
  }
});
