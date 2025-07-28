/**
 * ChatGPT Memory Toolkit - Options Page
 * 選項頁面 JavaScript
 */

import { APP_CONFIG } from '../constants/config.js';
import { optionsLogger as logger } from '../utils/logger.js';

/**
 * 選項頁面管理器
 */
class OptionsManager {
  constructor() {
    this.settings = {};
    this.init();
  }

  /**
   * 初始化選項頁面
   */
  async init() {
    try {
      logger.info('Initializing options page...');

      await this.loadSettings();
      this.bindEvents();
      this.updateUI();

      logger.info('Options page initialized successfully');
    } catch (error) {
      logger.logError(error, { operation: 'optionsInit' });
      this.showStatus('初始化失敗', 'error');
    }
  }

  /**
   * 載入設定
   */
  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getSettings',
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
   * 綁定事件
   */
  bindEvents() {
    document.getElementById('saveBtn').addEventListener('click', () => {
      this.saveSettings();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      this.resetSettings();
    });
  }

  /**
   * 更新 UI
   */
  updateUI() {
    const defaultFormat = document.getElementById('defaultFormat');
    const autoExport = document.getElementById('autoExport');
    const notificationEnabled = document.getElementById('notificationEnabled');

    if (defaultFormat) {
      defaultFormat.value = this.settings.defaultExportFormat || 'markdown';
    }

    if (autoExport) {
      autoExport.value = this.settings.autoExport ? 'true' : 'false';
    }

    if (notificationEnabled) {
      notificationEnabled.value = this.settings.notificationEnabled
        ? 'true'
        : 'false';
    }
  }

  /**
   * 儲存設定
   */
  async saveSettings() {
    try {
      const newSettings = {
        defaultExportFormat: document.getElementById('defaultFormat').value,
        autoExport: document.getElementById('autoExport').value === 'true',
        notificationEnabled:
          document.getElementById('notificationEnabled').value === 'true',
      };

      const response = await chrome.runtime.sendMessage({
        action: 'updateSettings',
        data: newSettings,
      });

      if (response.success) {
        this.settings = newSettings;
        this.showStatus('設定已儲存', 'success');
        logger.info('Settings saved successfully');
      } else {
        this.showStatus('儲存失敗', 'error');
      }
    } catch (error) {
      logger.logError(error, { operation: 'saveSettings' });
      this.showStatus('儲存失敗', 'error');
    }
  }

  /**
   * 重設設定
   */
  async resetSettings() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'resetSettings',
      });

      if (response.success) {
        this.settings = response.data;
        this.updateUI();
        this.showStatus('設定已重設為預設值', 'success');
        logger.info('Settings reset successfully');
      } else {
        this.showStatus('重設失敗', 'error');
      }
    } catch (error) {
      logger.logError(error, { operation: 'resetSettings' });
      this.showStatus('重設失敗', 'error');
    }
  }

  /**
   * 顯示狀態訊息
   */
  showStatus(message, type = 'info') {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';

    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }
}

// 初始化選項頁面
new OptionsManager();
