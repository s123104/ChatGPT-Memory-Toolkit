/**
 * Storage Manager - 現代化歷史記憶和設定管理
 * 重構版本，使用模組化架構
 */

import { StorageCore } from './storage-core.js';
import { MemoryHistory } from './memory-history.js';

/**
 * 統一儲存管理器
 * 協調核心儲存和記憶歷史管理
 */
export class StorageManager {
  constructor() {
    this.core = new StorageCore();
    this.memoryHistory = new MemoryHistory(this.core);
    this.isInitialized = false;
    this.init();
  }

  /**
   * 初始化管理器
   * @private
   */
  async init() {
    try {
      this.setupStorageListener();
      this.isInitialized = true;
      console.log('[StorageManager] 初始化完成');
    } catch (error) {
      console.error('[StorageManager] 初始化失敗:', error);
    }
  }

  /**
   * 設置儲存監聽器
   * @private
   */
  setupStorageListener() {
    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local') {
          this.handleStorageChange(changes);
        }
      });
    }
  }

  /**
   * 處理儲存變化
   * @private
   */
  handleStorageChange(changes) {
    Object.keys(changes).forEach(key => {
      const { newValue } = changes[key];
      this.core.cache.set(key, newValue);
      this.core.notifyListeners(key, newValue);
    });
  }

  // 委派給核心儲存的方法
  async getSettings() {
    return this.core.getSettings();
  }

  async updateSettings(newSettings) {
    return this.core.updateSettings(newSettings);
  }

  async getStorageUsage() {
    return this.core.getStorageUsage();
  }

  addListener(listener) {
    this.core.addListener(listener);
  }

  removeListener(listener) {
    this.core.removeListener(listener);
  }

  // 委派給記憶歷史的方法
  async getMemoryHistory() {
    return this.memoryHistory.getHistory();
  }

  async saveMemoryHistory(memories, metadata) {
    return this.memoryHistory.saveMemories(memories, metadata);
  }

  async deleteHistoryItem(id) {
    return this.memoryHistory.deleteHistoryItem(id);
  }

  async clearAllHistory() {
    return this.memoryHistory.clearAllHistory();
  }

  async exportMemoryHistory(format, historyId) {
    return this.memoryHistory.exportHistory(format, historyId);
  }

  async cleanupOldData(daysOld) {
    return this.memoryHistory.cleanupOldData(daysOld);
  }

  async getStatistics() {
    const memoryStats = await this.memoryHistory.getStatistics();
    const usage = await this.core.getStorageUsage();
    const settings = await this.core.getSettings();

    return {
      ...memoryStats,
      storage: usage,
      settings,
    };
  }

  /**
   * 等待初始化完成
   * @returns {Promise<void>}
   */
  async waitForInit() {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    const POLLING_INTERVAL = 10;
    return new Promise(resolve => {
      const checkInit = () => {
        if (this.isInitialized) {
          resolve();
        } else {
          setTimeout(checkInit, POLLING_INTERVAL);
        }
      };
      checkInit();
    });
  }

  /**
   * 清除快取
   */
  clearCache() {
    this.core.clearCache();
  }

  /**
   * 銷毀管理器
   */
  destroy() {
    this.core.destroy();
    console.log('[StorageManager] 管理器已銷毀');
  }
}

// 建立全域實例（向後兼容）
if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}
