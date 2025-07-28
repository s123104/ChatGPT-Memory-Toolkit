/**
 * ChatGPT Memory Toolkit - Content Script
 * 內容腳本 - 與 ChatGPT 頁面互動
 */

import { APP_CONFIG, CHATGPT_CONFIG } from '../constants/config.js';
import { contentLogger as logger } from '../utils/logger.js';
import { memoryDetector } from '../utils/memoryDetector.js';
import { exportFormatFactory } from '../utils/exportFormats.js';

/**
 * 內容腳本管理器
 */
class ContentScriptManager {
  constructor() {
    this.isInitialized = false;
    this.memoryData = [];
    this.currentUsage = null;
    this.monitoringStopFn = null;
    this.uiElements = new Map();
    this.settings = {};
    
    this.init();
  }

  /**
   * 初始化內容腳本
   */
  async init() {
    try {
      if (this.isInitialized) return;
      
      logger.info('Initializing content script...');
      
      // 檢查頁面是否有效
      if (!memoryDetector.isValidPage()) {
        logger.warn('Invalid page, content script will not initialize');
        return;
      }
      
      // 等待頁面加載完成
      await this.waitForPageReady();
      
      // 載入設定
      await this.loadSettings();
      
      // 設置訊息監聽器
      this.setupMessageListeners();
      
      // 初始化 UI
      await this.initializeUI();
      
      // 開始監控記憶狀態
      this.startMemoryMonitoring();
      
      // 載入記憶資料
      await this.loadMemoryData();
      
      this.isInitialized = true;
      logger.info('Content script initialized successfully');
      
    } catch (error) {
      logger.logError(error, { operation: 'contentScriptInit' });
    }
  }

  /**
   * 等待頁面準備就緒
   */
  async waitForPageReady() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });
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
        logger.debug('Settings loaded:', this.settings);
      }
    } catch (error) {
      logger.logError(error, { operation: 'loadSettings' });
    }
  }

  /**
   * 設置訊息監聽器
   */
  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // 保持消息通道開放
    });
  }

  /**
   * 處理來自背景腳本的訊息
   */
  async handleMessage(request, sender, sendResponse) {
    try {
      const { action, data } = request;
      let response = { success: false };
      
      switch (action) {
        case 'quickExport':
          response = await this.handleQuickExport();
          break;
          
        case 'showExportDialog':
          response = await this.showExportDialog();
          break;
          
        case 'refreshMemoryData':
          response = await this.loadMemoryData();
          break;
          
        case 'getMemoryData':
          response = { success: true, data: this.memoryData };
          break;
          
        default:
          logger.warn('Unknown action:', action);
          response = { success: false, error: 'Unknown action' };
      }
      
      sendResponse(response);
      
    } catch (error) {
      logger.logError(error, { operation: 'handleMessage', request });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * 處理快速匯出
   */
  async handleQuickExport() {
    try {
      // 更新記憶資料
      await this.loadMemoryData();
      
      // 檢查是否有資料
      if (this.memoryData.length === 0) {
        await this.showNotification({
          title: '無法匯出',
          message: '未找到記憶資料，請確保您在記憶管理頁面。'
        });
        return { success: false, error: 'No memory data found' };
      }
      
      // 使用預設格式匯出
      const defaultFormat = this.settings.defaultExportFormat || 'markdown';
      return await this.exportMemories(defaultFormat);
      
    } catch (error) {
      logger.logError(error, { operation: 'quickExport' });
      return { success: false, error: error.message };
    }
  }

  /**
   * 初始化 UI
   */
  async initializeUI() {
    try {
      // 檢查是否需要添加 UI 元素
      if (this.settings.showFloatingButton !== false) {
        this.createFloatingButton();
      }
      
      // 添加樣式
      this.injectStyles();
      
    } catch (error) {
      logger.logError(error, { operation: 'initializeUI' });
    }
  }

  /**
   * 創建浮動按鈕
   */
  createFloatingButton() {
    // 檢查是否已存在
    if (this.uiElements.has('floatingButton')) return;
    
    const button = document.createElement('div');
    button.id = 'chatgpt-memory-toolkit-button';
    button.innerHTML = `
      <div class="cmt-button-icon">
        <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
          <circle cx="64" cy="64" r="58" fill="#10a37f" opacity="0.95"/>
          <g transform="translate(64, 45)" fill="white" opacity="0.9">
            <path d="M -20 -8 C -24 -15, -20 -20, -15 -22 C -10 -24, -5 -20, -2 -15 C 2 -20, 5 -15, 2 -8 C -2 -2, -8 0, -15 -2 C -18 2, -20 -8 Z"/>
            <path d="M 20 -8 C 24 -15, 20 -20, 15 -22 C 10 -24, 5 -20, 2 -15 C -2 -20, -5 -15, -2 -8 C 2 -2, 8 0, 15 -2 C 18 2, 20 -8 Z"/>
          </g>
          <path d="M 64 85 L 64 95 M 56 93 L 64 101 L 72 93" stroke="white" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <div class="cmt-button-text">匯出記憶</div>
    `;
    
    button.addEventListener('click', () => this.showExportDialog());
    
    document.body.appendChild(button);
    this.uiElements.set('floatingButton', button);
    
    logger.debug('Floating button created');
  }

  /**
   * 注入樣式
   */
  injectStyles() {
    if (document.getElementById('chatgpt-memory-toolkit-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'chatgpt-memory-toolkit-styles';
    styles.textContent = `
      #chatgpt-memory-toolkit-button {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: linear-gradient(135deg, #10a37f, #0d9668);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }
      
      #chatgpt-memory-toolkit-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(16, 163, 127, 0.4);
        background: linear-gradient(135deg, #0d9668, #059669);
      }
      
      #chatgpt-memory-toolkit-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(16, 163, 127, 0.3);
      }
      
      .cmt-button-icon svg {
        width: 20px;
        height: 20px;
      }
      
      .cmt-export-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10001;
        background: white;
        border-radius: 16px;
        padding: 24px;
        min-width: 400px;
        max-width: 500px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }
      
      .cmt-export-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
      }
      
      .cmt-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .cmt-dialog-title {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .cmt-close-button {
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        transition: all 0.2s ease;
      }
      
      .cmt-close-button:hover {
        color: #374151;
        background: #f3f4f6;
      }
      
      .cmt-format-selector {
        margin-bottom: 20px;
      }
      
      .cmt-format-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 8px;
      }
      
      .cmt-format-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 8px;
      }
      
      .cmt-format-option {
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        background: white;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
      }
      
      .cmt-format-option:hover {
        border-color: #10a37f;
        background: #f0fdf4;
      }
      
      .cmt-format-option.selected {
        border-color: #10a37f;
        background: #10a37f;
        color: white;
      }
      
      .cmt-memory-info {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
      }
      
      .cmt-memory-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;
        font-size: 14px;
      }
      
      .cmt-stat-item {
        text-align: center;
      }
      
      .cmt-stat-value {
        font-size: 18px;
        font-weight: 600;
        color: #10a37f;
        display: block;
      }
      
      .cmt-stat-label {
        color: #6b7280;
        font-size: 12px;
      }
      
      .cmt-action-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
      
      .cmt-button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .cmt-button-secondary {
        background: #f3f4f6;
        color: #374151;
      }
      
      .cmt-button-secondary:hover {
        background: #e5e7eb;
      }
      
      .cmt-button-primary {
        background: #10a37f;
        color: white;
      }
      
      .cmt-button-primary:hover {
        background: #0d9668;
      }
      
      .cmt-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .cmt-loading {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: cmt-spin 1s linear infinite;
      }
      
      @keyframes cmt-spin {
        to { transform: rotate(360deg); }
      }
    `;
    
    document.head.appendChild(styles);
  }

  /**
   * 顯示匯出對話框
   */
  async showExportDialog() {
    try {
      // 更新記憶資料
      await this.loadMemoryData();
      
      // 移除現有對話框
      this.removeExportDialog();
      
      // 創建對話框
      const overlay = document.createElement('div');
      overlay.className = 'cmt-export-dialog-overlay';
      overlay.addEventListener('click', () => this.removeExportDialog());
      
      const dialog = document.createElement('div');
      dialog.className = 'cmt-export-dialog';
      dialog.addEventListener('click', (e) => e.stopPropagation());
      
      const formats = exportFormatFactory.getSupportedFormats();
      const defaultFormat = this.settings.defaultExportFormat || 'markdown';
      
      dialog.innerHTML = `
        <div class="cmt-dialog-header">
          <div class="cmt-dialog-title">
            <svg width="24" height="24" viewBox="0 0 128 128" fill="none">
              <circle cx="64" cy="64" r="58" fill="#10a37f" opacity="0.95"/>
              <path d="M 64 85 L 64 95 M 56 93 L 64 101 L 72 93" stroke="white" stroke-width="2" fill="none"/>
            </svg>
            匯出 ChatGPT 記憶
          </div>
          <button class="cmt-close-button" onclick="this.closest('.cmt-export-dialog-overlay').remove()">×</button>
        </div>
        
        <div class="cmt-memory-info">
          <div class="cmt-memory-stats">
            <div class="cmt-stat-item">
              <span class="cmt-stat-value">${this.memoryData.length}</span>
              <span class="cmt-stat-label">記憶總數</span>
            </div>
            <div class="cmt-stat-item">
              <span class="cmt-stat-value">${this.currentUsage || 'N/A'}</span>
              <span class="cmt-stat-label">使用率</span>
            </div>
            <div class="cmt-stat-item">
              <span class="cmt-stat-value">${this.calculateTotalChars()}</span>
              <span class="cmt-stat-label">總字符數</span>
            </div>
          </div>
        </div>
        
        <div class="cmt-format-selector">
          <label class="cmt-format-label">選擇匯出格式：</label>
          <div class="cmt-format-options">
            ${formats.map(format => `
              <div class="cmt-format-option ${format.key === defaultFormat ? 'selected' : ''}" 
                   data-format="${format.key}">
                ${format.name}
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="cmt-action-buttons">
          <button class="cmt-button cmt-button-secondary" onclick="this.closest('.cmt-export-dialog-overlay').remove()">
            取消
          </button>
          <button class="cmt-button cmt-button-primary" id="cmt-copy-button">
            複製到剪貼簿
          </button>
          <button class="cmt-button cmt-button-primary" id="cmt-download-button">
            下載檔案
          </button>
        </div>
      `;
      
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      
      // 設置格式選擇器事件
      const formatOptions = dialog.querySelectorAll('.cmt-format-option');
      formatOptions.forEach(option => {
        option.addEventListener('click', () => {
          formatOptions.forEach(opt => opt.classList.remove('selected'));
          option.classList.add('selected');
        });
      });
      
      // 設置按鈕事件
      dialog.querySelector('#cmt-copy-button').addEventListener('click', () => {
        this.copyToClipboard(dialog);
      });
      
      dialog.querySelector('#cmt-download-button').addEventListener('click', () => {
        this.downloadMemories(dialog);
      });
      
      this.uiElements.set('exportDialog', overlay);
      
    } catch (error) {
      logger.logError(error, { operation: 'showExportDialog' });
    }
  }

  /**
   * 移除匯出對話框
   */
  removeExportDialog() {
    const dialog = this.uiElements.get('exportDialog');
    if (dialog) {
      dialog.remove();
      this.uiElements.delete('exportDialog');
    }
  }

  /**
   * 複製到剪貼簿
   */
  async copyToClipboard(dialog) {
    try {
      const selectedFormat = dialog.querySelector('.cmt-format-option.selected').dataset.format;
      const button = dialog.querySelector('#cmt-copy-button');
      
      // 顯示載入狀態
      button.disabled = true;
      button.innerHTML = '<span class="cmt-loading"></span> 複製中...';
      
      const exportResult = await this.exportMemories(selectedFormat, false);
      
      if (exportResult.success) {
        await navigator.clipboard.writeText(exportResult.content);
        
        button.innerHTML = '✓ 已複製';
        setTimeout(() => {
          this.removeExportDialog();
        }, 1000);
      } else {
        throw new Error(exportResult.error);
      }
      
    } catch (error) {
      logger.logError(error, { operation: 'copyToClipboard' });
      
      const button = dialog.querySelector('#cmt-copy-button');
      button.innerHTML = '複製失敗';
      button.disabled = false;
      
      setTimeout(() => {
        button.innerHTML = '複製到剪貼簿';
      }, 2000);
    }
  }

  /**
   * 下載檔案
   */
  async downloadMemories(dialog) {
    try {
      const selectedFormat = dialog.querySelector('.cmt-format-option.selected').dataset.format;
      const button = dialog.querySelector('#cmt-download-button');
      
      // 顯示載入狀態
      button.disabled = true;
      button.innerHTML = '<span class="cmt-loading"></span> 下載中...';
      
      const exportResult = await this.exportMemories(selectedFormat, true);
      
      if (exportResult.success) {
        button.innerHTML = '✓ 下載完成';
        setTimeout(() => {
          this.removeExportDialog();
        }, 1000);
      } else {
        throw new Error(exportResult.error);
      }
      
    } catch (error) {
      logger.logError(error, { operation: 'downloadMemories' });
      
      const button = dialog.querySelector('#cmt-download-button');
      button.innerHTML = '下載失敗';
      button.disabled = false;
      
      setTimeout(() => {
        button.innerHTML = '下載檔案';
      }, 2000);
    }
  }

  /**
   * 開始記憶監控
   */
  startMemoryMonitoring() {
    if (this.monitoringStopFn) {
      this.monitoringStopFn();
    }
    
    this.monitoringStopFn = memoryDetector.startMonitoring((state) => {
      this.currentUsage = state.usagePercentage;
      logger.debug('Memory state updated:', state);
      
      // 更新 UI 狀態
      this.updateUIState(state);
    });
  }

  /**
   * 更新 UI 狀態
   */
  updateUIState(memoryState) {
    const button = this.uiElements.get('floatingButton');
    if (button && memoryState.usagePercentage) {
      const percentage = parseInt(memoryState.usagePercentage);
      if (percentage >= 90) {
        button.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      } else if (percentage >= 70) {
        button.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
      } else {
        button.style.background = 'linear-gradient(135deg, #10a37f, #0d9668)';
      }
    }
  }

  /**
   * 載入記憶資料
   */
  async loadMemoryData() {
    try {
      logger.time('Load memory data');
      
      const memoryItems = [];
      const selectors = CHATGPT_CONFIG.selectors.memoryItems;
      
      // 嘗試不同的選擇器
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        logger.debug(`Found ${elements.length} elements with selector: ${selector}`);
        
        if (elements.length > 0) {
          elements.forEach((element, index) => {
            const text = this.extractMemoryText(element);
            if (text && text.trim().length > 0) {
              memoryItems.push(text.trim());
            }
          });
          break; // 找到資料就停止
        }
      }
      
      this.memoryData = [...new Set(memoryItems)]; // 去重
      
      logger.timeEnd('Load memory data');
      logger.info(`Loaded ${this.memoryData.length} memory items`);
      
      return { success: true, count: this.memoryData.length };
      
    } catch (error) {
      logger.logError(error, { operation: 'loadMemoryData' });
      return { success: false, error: error.message };
    }
  }

  /**
   * 提取記憶文字
   */
  extractMemoryText(element) {
    // 移除腳本和樣式標籤
    const clone = element.cloneNode(true);
    const scriptsAndStyles = clone.querySelectorAll('script, style');
    scriptsAndStyles.forEach(el => el.remove());
    
    // 提取純文字
    let text = clone.innerText || clone.textContent || '';
    
    // 清理文字
    text = text
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\n{3,}/g, '\n\n');
    
    return text;
  }

  /**
   * 匯出記憶
   */
  async exportMemories(format, download = false) {
    try {
      // 準備匯出資料
      const exportData = {
        title: '儲存的記憶',
        items: this.memoryData,
        usagePercentage: this.currentUsage,
        timestamp: new Date().toLocaleString('zh-TW'),
        totalCount: this.memoryData.length,
        url: window.location.href
      };
      
      // 使用匯出格式工廠
      const result = exportFormatFactory.export(format, exportData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      if (download) {
        // 發送到背景腳本處理下載
        const response = await chrome.runtime.sendMessage({
          action: 'exportMemories',
          data: {
            format,
            content: result.content,
            fileName: result.fileName,
            mimeType: result.mimeType
          }
        });
        
        if (!response.success) {
          throw new Error(response.error);
        }
        
        await this.showNotification({
          title: '匯出成功',
          message: `已成功匯出 ${format.toUpperCase()} 格式檔案`
        });
      }
      
      return {
        success: true,
        content: result.content,
        fileName: result.fileName,
        format
      };
      
    } catch (error) {
      logger.logError(error, { operation: 'exportMemories', format });
      
      await this.showNotification({
        title: '匯出失敗',
        message: error.message
      });
      
      return { success: false, error: error.message };
    }
  }

  /**
   * 顯示通知
   */
  async showNotification(data) {
    try {
      await chrome.runtime.sendMessage({
        action: 'showNotification',
        data
      });
    } catch (error) {
      logger.logError(error, { operation: 'showNotification', data });
    }
  }

  /**
   * 計算總字符數
   */
  calculateTotalChars() {
    return this.memoryData.reduce((total, item) => total + item.length, 0);
  }

  /**
   * 清理資源
   */
  cleanup() {
    // 停止監控
    if (this.monitoringStopFn) {
      this.monitoringStopFn();
      this.monitoringStopFn = null;
    }
    
    // 移除 UI 元素
    this.uiElements.forEach((element) => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.uiElements.clear();
    
    logger.info('Content script cleaned up');
  }
}

// 創建內容腳本管理器實例
let contentManager = null;

// 頁面載入時初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    contentManager = new ContentScriptManager();
  });
} else {
  contentManager = new ContentScriptManager();
}

// 頁面卸載時清理
window.addEventListener('beforeunload', () => {
  if (contentManager) {
    contentManager.cleanup();
  }
});

// 匯出供測試使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentScriptManager;
}