/**
 * ChatGPT Memory Toolkit - Background Service Worker
 * 背景服務工作者 - 處理擴展邏輯和 API
 */

import { APP_CONFIG, STORAGE_KEYS } from '../constants/config.js';
import { backgroundLogger as logger } from '../utils/logger.js';
import { SettingsManager } from '../utils/storage.js';

/**
 * 背景服務管理器
 */
class BackgroundService {
  constructor() {
    this.settingsManager = new SettingsManager();
    this.isInitialized = false;
    this.init();
  }

  /**
   * 初始化背景服務
   */
  async init() {
    try {
      logger.info('Initializing background service...');
      
      // 設置事件監聽器
      this.setupEventListeners();
      
      // 初始化設定
      await this.initializeSettings();
      
      // 設置上下文選單
      await this.setupContextMenus();
      
      this.isInitialized = true;
      logger.info('Background service initialized successfully');
      
    } catch (error) {
      logger.logError(error, { operation: 'backgroundInit' });
    }
  }

  /**
   * 設置事件監聽器
   */
  setupEventListeners() {
    // 擴展安裝/更新事件
    chrome.runtime.onInstalled.addListener(this.handleInstalled.bind(this));
    
    // 來自內容腳本的訊息
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // 鍵盤快捷鍵
    chrome.commands.onCommand.addListener(this.handleCommand.bind(this));
    
    // 標籤頁更新事件
    chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
    
    // 擴展啟動事件
    chrome.runtime.onStartup.addListener(this.handleStartup.bind(this));
    
    logger.debug('Event listeners setup completed');
  }

  /**
   * 處理擴展安裝事件
   * @param {Object} details - 安裝詳情
   */
  async handleInstalled(details) {
    logger.info('Extension installed/updated:', details);
    
    if (details.reason === 'install') {
      // 首次安裝
      await this.handleFirstInstall();
    } else if (details.reason === 'update') {
      // 更新
      await this.handleUpdate(details.previousVersion);
    }
  }

  /**
   * 處理首次安裝
   */
  async handleFirstInstall() {
    try {
      logger.info('Handling first install...');
      
      // 設置默認設定
      await this.settingsManager.resetToDefaults();
      
      // 顯示歡迎通知
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../assets/icons/icon48.png',
        title: APP_CONFIG.name,
        message: '感謝您安裝 ChatGPT Memory Toolkit！\n點擊擴展圖標開始使用。'
      });
      
      // 打開選項頁面
      chrome.tabs.create({
        url: chrome.runtime.getURL('src/ui/options.html')
      });
      
    } catch (error) {
      logger.logError(error, { operation: 'firstInstall' });
    }
  }

  /**
   * 處理更新
   * @param {string} previousVersion - 之前的版本號
   */
  async handleUpdate(previousVersion) {
    try {
      logger.info('Handling update from version:', previousVersion);
      
      // 執行版本遷移邏輯
      await this.performMigration(previousVersion);
      
      // 顯示更新通知
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../assets/icons/icon48.png',
        title: `${APP_CONFIG.name} 已更新`,
        message: `已更新至版本 ${APP_CONFIG.version}\n查看新功能和改進。`
      });
      
    } catch (error) {
      logger.logError(error, { operation: 'handleUpdate', previousVersion });
    }
  }

  /**
   * 執行版本遷移
   * @param {string} fromVersion - 來源版本
   */
  async performMigration(fromVersion) {
    // 這裡可以添加版本遷移邏輯
    logger.info(`Migrating from version ${fromVersion} to ${APP_CONFIG.version}`);
    
    // 例如：如果從舊版本升級，可能需要更新存儲結構
    const settings = await this.settingsManager.getSettings();
    if (!settings.version || settings.version !== APP_CONFIG.version) {
      await this.settingsManager.updateSettings({ version: APP_CONFIG.version });
    }
  }

  /**
   * 處理來自內容腳本的訊息
   * @param {Object} request - 請求對象
   * @param {Object} sender - 發送者資訊
   * @param {Function} sendResponse - 回應函數
   */
  async handleMessage(request, sender, sendResponse) {
    try {
      logger.debug('Received message:', request);
      
      const { action, data } = request;
      let response = { success: false };
      
      switch (action) {
        case 'exportMemories':
          response = await this.handleExportMemories(data);
          break;
          
        case 'getSettings':
          response = await this.handleGetSettings();
          break;
          
        case 'updateSettings':
          response = await this.handleUpdateSettings(data);
          break;
          
        case 'showNotification':
          response = await this.handleShowNotification(data);
          break;
          
        case 'downloadFile':
          response = await this.handleDownloadFile(data);
          break;
          
        case 'copyToClipboard':
          response = await this.handleCopyToClipboard(data);
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
    
    return true; // 保持消息通道開放
  }

  /**
   * 處理匯出記憶請求
   * @param {Object} data - 匯出資料
   */
  async handleExportMemories(data) {
    try {
      const { format, content, fileName, mimeType } = data;
      
      // 記錄匯出操作
      logger.info('Exporting memories:', { format, fileName });
      
      // 觸發下載
      const downloadId = await chrome.downloads.download({
        url: `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`,
        filename: fileName,
        saveAs: true
      });
      
      // 更新統計資料
      await this.updateExportStats(format);
      
      return { 
        success: true, 
        downloadId,
        message: `成功匯出 ${format.toUpperCase()} 格式檔案` 
      };
      
    } catch (error) {
      logger.logError(error, { operation: 'exportMemories', data });
      return { success: false, error: error.message };
    }
  }

  /**
   * 處理取得設定請求
   */
  async handleGetSettings() {
    try {
      const settings = await this.settingsManager.getSettings();
      return { success: true, data: settings };
    } catch (error) {
      logger.logError(error, { operation: 'getSettings' });
      return { success: false, error: error.message };
    }
  }

  /**
   * 處理更新設定請求
   * @param {Object} newSettings - 新的設定
   */
  async handleUpdateSettings(newSettings) {
    try {
      await this.settingsManager.updateSettings(newSettings);
      return { success: true, message: '設定已更新' };
    } catch (error) {
      logger.logError(error, { operation: 'updateSettings', newSettings });
      return { success: false, error: error.message };
    }
  }

  /**
   * 處理顯示通知請求
   * @param {Object} notificationData - 通知資料
   */
  async handleShowNotification(notificationData) {
    try {
      const notificationId = await chrome.notifications.create({
        type: 'basic',
        iconUrl: '../assets/icons/icon48.png',
        ...notificationData
      });
      
      return { success: true, notificationId };
    } catch (error) {
      logger.logError(error, { operation: 'showNotification', notificationData });
      return { success: false, error: error.message };
    }
  }

  /**
   * 處理下載檔案請求
   * @param {Object} fileData - 檔案資料
   */
  async handleDownloadFile(fileData) {
    try {
      const { content, fileName, mimeType } = fileData;
      
      const downloadId = await chrome.downloads.download({
        url: `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`,
        filename: fileName,
        saveAs: false
      });
      
      return { success: true, downloadId };
    } catch (error) {
      logger.logError(error, { operation: 'downloadFile', fileData });
      return { success: false, error: error.message };
    }
  }

  /**
   * 處理複製到剪貼簿請求
   * @param {Object} data - 複製資料
   */
  async handleCopyToClipboard(data) {
    try {
      // 透過內容腳本執行複製操作
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => {
          navigator.clipboard.writeText(text).catch(console.error);
        },
        args: [data.text]
      });
      
      return { success: true, message: '已複製到剪貼簿' };
    } catch (error) {
      logger.logError(error, { operation: 'copyToClipboard', data });
      return { success: false, error: error.message };
    }
  }

  /**
   * 處理鍵盤指令
   * @param {string} command - 指令名稱
   */
  async handleCommand(command) {
    try {
      logger.debug('Command received:', command);
      
      switch (command) {
        case 'export-memories':
          await this.triggerQuickExport();
          break;
          
        default:
          logger.warn('Unknown command:', command);
      }
    } catch (error) {
      logger.logError(error, { operation: 'handleCommand', command });
    }
  }

  /**
   * 觸發快速匯出
   */
  async triggerQuickExport() {
    try {
      // 檢查當前標籤頁是否為支援的網站
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!this.isSupportedUrl(tab.url)) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '../assets/icons/icon48.png',
          title: '無法匯出',
          message: '請在 ChatGPT 頁面中使用此功能'
        });
        return;
      }
      
      // 向內容腳本發送匯出指令
      chrome.tabs.sendMessage(tab.id, { action: 'quickExport' });
      
    } catch (error) {
      logger.logError(error, { operation: 'triggerQuickExport' });
    }
  }

  /**
   * 處理標籤頁更新
   * @param {number} tabId - 標籤頁 ID
   * @param {Object} changeInfo - 變更資訊
   * @param {Object} tab - 標籤頁對象
   */
  async handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && this.isSupportedUrl(tab.url)) {
      // 注入內容腳本（如果需要）
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['src/scripts/content.js']
        });
      } catch (error) {
        // 內容腳本可能已經注入，忽略錯誤
        logger.debug('Content script injection skipped:', error.message);
      }
    }
  }

  /**
   * 處理擴展啟動
   */
  async handleStartup() {
    logger.info('Extension startup');
    await this.init();
  }

  /**
   * 初始化設定
   */
  async initializeSettings() {
    try {
      const settings = await this.settingsManager.getSettings();
      
      // 如果沒有設定，使用預設值
      if (!settings || Object.keys(settings).length === 0) {
        await this.settingsManager.resetToDefaults();
        logger.info('Initialized with default settings');
      }
    } catch (error) {
      logger.logError(error, { operation: 'initializeSettings' });
    }
  }

  /**
   * 設置上下文選單
   */
  async setupContextMenus() {
    try {
      // 清除現有選單
      chrome.contextMenus.removeAll();
      
      // 添加主選單
      chrome.contextMenus.create({
        id: 'chatgpt-memory-toolkit',
        title: 'ChatGPT Memory Toolkit',
        contexts: ['page'],
        documentUrlPatterns: [
          'https://chatgpt.com/*',
          'https://chat.openai.com/*'
        ]
      });
      
      // 添加快速匯出選單
      chrome.contextMenus.create({
        id: 'quick-export',
        parentId: 'chatgpt-memory-toolkit',
        title: '快速匯出記憶',
        contexts: ['page']
      });
      
      // 添加選項頁面選單
      chrome.contextMenus.create({
        id: 'open-options',
        parentId: 'chatgpt-memory-toolkit',
        title: '開啟設定',
        contexts: ['page']
      });
      
      // 處理選單點擊
      chrome.contextMenus.onClicked.addListener(this.handleContextMenuClick.bind(this));
      
    } catch (error) {
      logger.logError(error, { operation: 'setupContextMenus' });
    }
  }

  /**
   * 處理上下文選單點擊
   * @param {Object} info - 點擊資訊
   * @param {Object} tab - 標籤頁資訊
   */
  async handleContextMenuClick(info, tab) {
    try {
      switch (info.menuItemId) {
        case 'quick-export':
          chrome.tabs.sendMessage(tab.id, { action: 'quickExport' });
          break;
          
        case 'open-options':
          chrome.tabs.create({
            url: chrome.runtime.getURL('src/ui/options.html')
          });
          break;
      }
    } catch (error) {
      logger.logError(error, { operation: 'handleContextMenuClick', info });
    }
  }

  /**
   * 更新匯出統計
   * @param {string} format - 匯出格式
   */
  async updateExportStats(format) {
    try {
      const stats = await chrome.storage.local.get(STORAGE_KEYS.EXPORT_STATS) || {};
      const exportStats = stats[STORAGE_KEYS.EXPORT_STATS] || {};
      
      exportStats[format] = (exportStats[format] || 0) + 1;
      exportStats.lastExportDate = new Date().toISOString();
      exportStats.totalExports = (exportStats.totalExports || 0) + 1;
      
      await chrome.storage.local.set({
        [STORAGE_KEYS.EXPORT_STATS]: exportStats
      });
      
    } catch (error) {
      logger.logError(error, { operation: 'updateExportStats', format });
    }
  }

  /**
   * 檢查是否為支援的 URL
   * @param {string} url - URL
   * @returns {boolean} 是否支援
   */
  isSupportedUrl(url) {
    if (!url) return false;
    return url.includes('chatgpt.com') || url.includes('chat.openai.com');
  }
}

// 創建背景服務實例
const backgroundService = new BackgroundService();

// 保持服務工作者活躍
chrome.runtime.onSuspend.addListener(() => {
  logger.info('Background service suspending...');
});

// 匯出供測試使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackgroundService;
}