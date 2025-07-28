/**
 * ChatGPT Memory Toolkit - Professional Popup Script
 * 彈出視窗 JavaScript - 使用專業模組化架構
 */

import { APP_CONFIG } from '../constants/config.js';
import { popupLogger as logger } from '../utils/logger.js';
import { exportFormatFactory } from '../utils/exportFormats.js';

/**
 * 彈出視窗管理器
 */
class PopupManager {
  constructor() {
    this.currentTab = null;
    this.memoryData = [];
    this.selectedFormat = 'markdown';
    this.isLoading = false;
    this.settings = {};
    
    this.initializeElements();
    this.init();
  }

  /**
   * 初始化 DOM 元素
   */
  initializeElements() {
    // Status elements
    this.elements = {
      usageText: document.getElementById('usage-text'),
      countText: document.getElementById('count-text'),
      statusIndicator: document.getElementById('status-indicator'),
      
      // Format selection
      formatGrid: document.getElementById('format-grid'),
      formatBtns: document.querySelectorAll('.format-btn'),
      
      // Action buttons
      copyBtn: document.getElementById('copy-btn'),
      downloadBtn: document.getElementById('download-btn'),
      
      // Footer buttons
      settingsBtn: document.getElementById('settings-btn'),
      helpBtn: document.getElementById('help-btn'),
      refreshBtn: document.getElementById('refresh-btn'),
      
      // Loading overlay
      loadingOverlay: document.getElementById('loading-overlay'),
      loadingText: document.querySelector('.loading-text'),
      
      // Toast container
      toastContainer: document.getElementById('toast-container')
    };
  }

  /**
   * 初始化彈出視窗
   */
  async init() {
    try {
      logger.info('Initializing popup...');
      
      await this.getCurrentTab();
      await this.loadSettings();
      await this.checkPageStatus();
      this.bindEvents();
      
      logger.info('Popup initialized successfully');
    } catch (error) {
      logger.logError(error, { operation: 'popupInit' });
      this.showToast('初始化失敗', 'error');
    }
  }

  /**
   * 取得當前標籤頁
   */
  async getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tabs[0];
  }

  /**
   * 載入設定
   */
  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getSettings'
      });
      
      if (response.success) {
        this.settings = response.data;
        this.selectedFormat = this.settings.defaultExportFormat || 'markdown';
        this.updateFormatSelection();
      }
    } catch (error) {
      logger.logError(error, { operation: 'loadSettings' });
    }
  }

  /**
   * 檢查頁面狀態
   */
  async checkPageStatus() {
    try {
      this.setLoading(true, '檢測記憶狀態...');
      
      // 檢查是否為支援的頁面
      if (!this.currentTab || !this.isSupportedUrl(this.currentTab.url)) {
        this.updateStatus('請前往 ChatGPT 頁面使用', 0);
        this.setButtonsEnabled(false);
        return;
      }
      
      // 向內容腳本請求記憶資料
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'getMemoryData'
      });
      
      if (response && response.success) {
        this.memoryData = response.data || [];
        
        // 檢測記憶使用率
        const usageResponse = await chrome.tabs.sendMessage(this.currentTab.id, {
          action: 'detectMemoryUsage'
        });
        
        const usage = usageResponse?.success ? usageResponse.usage : null;
        this.updateStatus(usage, this.memoryData.length);
        this.setButtonsEnabled(this.memoryData.length > 0);
      } else {
        this.updateStatus('未檢測到記憶資料', 0);
        this.setButtonsEnabled(false);
      }
    } catch (error) {
      logger.logError(error, { operation: 'checkPageStatus' });
      this.updateStatus('檢測失敗，請重新整理頁面', 0);
      this.setButtonsEnabled(false);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 更新狀態顯示
   */
  updateStatus(usage, count) {
    const usageText = usage || '未檢測到';
    const countText = `${count} 筆記憶`;
    
    this.elements.usageText.textContent = usageText;
    this.elements.countText.textContent = countText;
    
    // 更新狀態指示器顏色
    const indicator = this.elements.statusIndicator;
    indicator.innerHTML = ''; // 清除載入指示器
    
    if (count > 0) {
      const dot = document.createElement('div');
      dot.className = 'status-dot';
      dot.style.width = '12px';
      dot.style.height = '12px';
      dot.style.borderRadius = '50%';
      
      if (usage && usage.includes('%')) {
        const percentage = parseInt(usage);
        if (percentage >= 90) {
          dot.style.background = 'var(--error-color)';
        } else if (percentage >= 70) {
          dot.style.background = 'var(--warning-color)';
        } else {
          dot.style.background = 'var(--success-color)';
        }
      } else {
        dot.style.background = 'var(--success-color)';
      }
      
      indicator.appendChild(dot);
    }
  }

  /**
   * 設定按鈕啟用狀態
   */
  setButtonsEnabled(enabled) {
    this.elements.copyBtn.disabled = !enabled;
    this.elements.downloadBtn.disabled = !enabled;
  }

  /**
   * 更新格式選擇
   */
  updateFormatSelection() {
    this.elements.formatBtns.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.format === this.selectedFormat);
    });
  }

  /**
   * 綁定事件監聽器
   */
  bindEvents() {
    // 格式選擇
    this.elements.formatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedFormat = btn.dataset.format;
        this.updateFormatSelection();
      });
    });
    
    // 操作按鈕
    this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard());
    this.elements.downloadBtn.addEventListener('click', () => this.downloadFile());
    
    // 底部按鈕
    this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
    this.elements.helpBtn.addEventListener('click', () => this.openHelp());
    this.elements.refreshBtn.addEventListener('click', () => this.refresh());
  }

  /**
   * 複製到剪貼簿
   */
  async copyToClipboard() {
    try {
      this.setLoading(true, '準備匯出資料...');
      
      const exportData = this.prepareExportData();
      const result = exportFormatFactory.export(this.selectedFormat, exportData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      await navigator.clipboard.writeText(result.content);
      
      this.showToast(`已複製 ${result.format.toUpperCase()} 格式到剪貼簿`, 'success');
      
      // 記錄統計
      this.recordExport(this.selectedFormat, 'clipboard');
      
    } catch (error) {
      logger.logError(error, { operation: 'copyToClipboard' });
      this.showToast('複製失敗：' + error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 下載檔案
   */
  async downloadFile() {
    try {
      this.setLoading(true, '準備下載檔案...');
      
      const exportData = this.prepareExportData();
      const result = exportFormatFactory.export(this.selectedFormat, exportData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // 通過背景腳本處理下載
      const response = await chrome.runtime.sendMessage({
        action: 'downloadFile',
        data: {
          content: result.content,
          fileName: result.fileName,
          mimeType: result.mimeType
        }
      });
      
      if (response.success) {
        this.showToast(`已開始下載 ${result.fileName}`, 'success');
        this.recordExport(this.selectedFormat, 'download');
      } else {
        throw new Error(response.error);
      }
      
    } catch (error) {
      logger.logError(error, { operation: 'downloadFile' });
      this.showToast('下載失敗：' + error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 準備匯出資料
   */
  prepareExportData() {
    return {
      title: '儲存的記憶',
      items: this.memoryData,
      usagePercentage: this.elements.usageText.textContent,
      timestamp: new Date().toLocaleString('zh-TW'),
      totalCount: this.memoryData.length,
      url: this.currentTab.url
    };
  }

  /**
   * 記錄匯出統計
   */
  async recordExport(format, method) {
    try {
      await chrome.runtime.sendMessage({
        action: 'recordExport',
        data: {
          format,
          method,
          count: this.memoryData.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.logError(error, { operation: 'recordExport' });
    }
  }

  /**
   * 開啟設定頁面
   */
  openSettings() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/ui/options.html')
    });
    window.close();
  }

  /**
   * 開啟說明頁面
   */
  openHelp() {
    chrome.tabs.create({
      url: 'https://github.com/chatgpt-memory-toolkit/extension#readme'
    });
    window.close();
  }

  /**
   * 重新整理
   */
  async refresh() {
    await this.checkPageStatus();
    this.showToast('狀態已更新', 'success');
  }

  /**
   * 設定載入狀態
   */
  setLoading(loading, text = '處理中...') {
    this.isLoading = loading;
    
    if (loading) {
      this.elements.loadingOverlay.style.display = 'flex';
      this.elements.loadingText.textContent = text;
      this.elements.statusIndicator.innerHTML = '<div class="loading-spinner"></div>';
    } else {
      this.elements.loadingOverlay.style.display = 'none';
    }
  }

  /**
   * 顯示 Toast 通知
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
      </div>
      <div class="toast-message">${message}</div>
    `;
    
    this.elements.toastContainer.appendChild(toast);
    
    // 自動移除
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * 檢查是否為支援的 URL
   */
  isSupportedUrl(url) {
    if (!url) return false;
    return url.includes('chatgpt.com') || url.includes('chat.openai.com');
  }
}

// 當 DOM 載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
  try {
    new PopupManager();
  } catch (error) {
    console.error('Failed to initialize popup:', error);
  }
});