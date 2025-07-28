/**
 * ChatGPT Memory Toolkit Storage Utilities
 * Chrome Extension 儲存管理工具
 */

import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants/config.js';
import { utilsLogger as logger } from './logger.js';

/**
 * Storage Manager 類別
 * 提供統一的儲存操作介面
 */
export class StorageManager {
  constructor() {
    this.storageArea = chrome.storage.local;
  }

  /**
   * 取得儲存的資料
   * @param {string|Array|Object} keys - 要取得的鍵值
   * @returns {Promise<Object>} 儲存的資料
   */
  async get(keys) {
    try {
      logger.debug('Storage get:', keys);
      const result = await this.storageArea.get(keys);
      logger.debug('Storage get result:', result);
      return result;
    } catch (error) {
      logger.logError(error, { operation: 'get', keys });
      throw new Error(`Storage get failed: ${error.message}`);
    }
  }

  /**
   * 設定儲存資料
   * @param {Object} items - 要儲存的資料
   * @returns {Promise<void>}
   */
  async set(items) {
    try {
      logger.debug('Storage set:', items);
      await this.storageArea.set(items);
      logger.debug('Storage set completed');
    } catch (error) {
      logger.logError(error, { operation: 'set', items });
      throw new Error(`Storage set failed: ${error.message}`);
    }
  }

  /**
   * 移除儲存資料
   * @param {string|Array} keys - 要移除的鍵值
   * @returns {Promise<void>}
   */
  async remove(keys) {
    try {
      logger.debug('Storage remove:', keys);
      await this.storageArea.remove(keys);
      logger.debug('Storage remove completed');
    } catch (error) {
      logger.logError(error, { operation: 'remove', keys });
      throw new Error(`Storage remove failed: ${error.message}`);
    }
  }

  /**
   * 清空所有儲存資料
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      logger.debug('Storage clear');
      await this.storageArea.clear();
      logger.debug('Storage clear completed');
    } catch (error) {
      logger.logError(error, { operation: 'clear' });
      throw new Error(`Storage clear failed: ${error.message}`);
    }
  }

  /**
   * 取得儲存使用量資訊
   * @returns {Promise<Object>} 使用量資訊
   */
  async getBytesInUse(keys = null) {
    try {
      const bytes = await this.storageArea.getBytesInUse(keys);
      logger.debug('Storage bytes in use:', bytes);
      return bytes;
    } catch (error) {
      logger.logError(error, { operation: 'getBytesInUse', keys });
      throw new Error(`Get bytes in use failed: ${error.message}`);
    }
  }
}

// 單例實例
export const storage = new StorageManager();

/**
 * 設定管理器
 */
export class SettingsManager {
  constructor() {
    this.storage = storage;
    this.settingsKey = STORAGE_KEYS.settings;
  }

  /**
   * 取得所有設定
   * @returns {Promise<Object>} 設定物件
   */
  async getSettings() {
    try {
      const result = await this.storage.get(this.settingsKey);
      const settings = result[this.settingsKey] || {};
      
      // 合併預設設定
      const mergedSettings = this.mergeWithDefaults(settings);
      logger.debug('Settings loaded:', mergedSettings);
      
      return mergedSettings;
    } catch (error) {
      logger.logError(error, { operation: 'getSettings' });
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * 更新設定
   * @param {Object} updates - 要更新的設定
   * @returns {Promise<Object>} 更新後的設定
   */
  async updateSettings(updates) {
    try {
      logger.debug('Updating settings:', updates);
      
      const currentSettings = await this.getSettings();
      const newSettings = this.deepMerge(currentSettings, updates);
      
      await this.storage.set({
        [this.settingsKey]: newSettings
      });
      
      logger.info('Settings updated successfully');
      return newSettings;
    } catch (error) {
      logger.logError(error, { operation: 'updateSettings', updates });
      throw error;
    }
  }

  /**
   * 重置設定為預設值
   * @returns {Promise<Object>} 重置後的設定
   */
  async resetSettings() {
    try {
      logger.info('Resetting settings to defaults');
      
      await this.storage.set({
        [this.settingsKey]: DEFAULT_SETTINGS
      });
      
      return DEFAULT_SETTINGS;
    } catch (error) {
      logger.logError(error, { operation: 'resetSettings' });
      throw error;
    }
  }

  /**
   * 合併預設設定
   * @param {Object} settings - 現有設定
   * @returns {Object} 合併後的設定
   */
  mergeWithDefaults(settings) {
    return this.deepMerge(DEFAULT_SETTINGS, settings);
  }

  /**
   * 深度合併物件
   * @param {Object} target - 目標物件
   * @param {Object} source - 來源物件
   * @returns {Object} 合併後的物件
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }
}

// 設定管理器實例
export const settingsManager = new SettingsManager();

/**
 * 匯出歷史管理器
 */
export class ExportHistoryManager {
  constructor() {
    this.storage = storage;
    this.historyKey = STORAGE_KEYS.exportHistory;
    this.maxHistoryItems = 100; // 最多保存 100 筆記錄
  }

  /**
   * 添加匯出記錄
   * @param {Object} exportData - 匯出資料
   * @returns {Promise<void>}
   */
  async addExportRecord(exportData) {
    try {
      const history = await this.getExportHistory();
      
      const record = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        itemCount: exportData.items?.length || 0,
        format: exportData.format || 'markdown',
        size: exportData.size || 0,
        usagePercent: exportData.usagePercent,
        success: true,
        ...exportData
      };
      
      history.unshift(record);
      
      // 限制歷史記錄數量
      if (history.length > this.maxHistoryItems) {
        history.splice(this.maxHistoryItems);
      }
      
      await this.storage.set({
        [this.historyKey]: history
      });
      
      logger.info('Export record added:', record.id);
    } catch (error) {
      logger.logError(error, { operation: 'addExportRecord' });
      throw error;
    }
  }

  /**
   * 取得匯出歷史
   * @param {number} limit - 限制數量
   * @returns {Promise<Array>} 歷史記錄陣列
   */
  async getExportHistory(limit = null) {
    try {
      const result = await this.storage.get(this.historyKey);
      let history = result[this.historyKey] || [];
      
      if (limit && limit > 0) {
        history = history.slice(0, limit);
      }
      
      return history;
    } catch (error) {
      logger.logError(error, { operation: 'getExportHistory' });
      return [];
    }
  }

  /**
   * 清除匯出歷史
   * @returns {Promise<void>}
   */
  async clearExportHistory() {
    try {
      await this.storage.remove(this.historyKey);
      logger.info('Export history cleared');
    } catch (error) {
      logger.logError(error, { operation: 'clearExportHistory' });
      throw error;
    }
  }

  /**
   * 取得匯出統計
   * @returns {Promise<Object>} 統計資料
   */
  async getExportStats() {
    try {
      const history = await this.getExportHistory();
      
      const stats = {
        totalExports: history.length,
        successfulExports: history.filter(r => r.success).length,
        failedExports: history.filter(r => !r.success).length,
        totalItemsExported: history.reduce((sum, r) => sum + (r.itemCount || 0), 0),
        lastExportDate: history.length > 0 ? history[0].timestamp : null,
        averageItemsPerExport: history.length > 0 ? 
          Math.round(history.reduce((sum, r) => sum + (r.itemCount || 0), 0) / history.length) : 0,
        formatUsage: this.calculateFormatUsage(history)
      };
      
      return stats;
    } catch (error) {
      logger.logError(error, { operation: 'getExportStats' });
      return {
        totalExports: 0,
        successfulExports: 0,
        failedExports: 0,
        totalItemsExported: 0,
        lastExportDate: null,
        averageItemsPerExport: 0,
        formatUsage: {}
      };
    }
  }

  /**
   * 計算格式使用統計
   * @param {Array} history - 歷史記錄
   * @returns {Object} 格式使用統計
   */
  calculateFormatUsage(history) {
    const formatCount = {};
    
    history.forEach(record => {
      const format = record.format || 'unknown';
      formatCount[format] = (formatCount[format] || 0) + 1;
    });
    
    return formatCount;
  }
}

// 匯出歷史管理器實例
export const exportHistoryManager = new ExportHistoryManager();