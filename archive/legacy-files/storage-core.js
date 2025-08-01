/**
 * Storage Core - 核心儲存功能模組
 * 提供基礎儲存操作和配置管理
 */

/**
 * 核心儲存管理器
 * 處理基礎的 Chrome Storage API 操作
 */
export class StorageCore {
  constructor() {
    this.STORAGE_KEYS = {
      MEMORY_HISTORY: 'memoryHistory',
      SETTINGS: 'settings',
      LAST_EXPORT: 'lastExport',
      CACHE: 'cache',
    };

    this.DEFAULT_SETTINGS = {
      autoShowModal: true,
      maxHistoryItems: 50,
      autoCleanup: true,
      developerMode: false,
      theme: 'dark',
      language: 'zh-TW',
      notifications: true,
      autoExport: false,
      exportFormat: 'markdown',
    };

    this.cache = new Map();
    this.listeners = new Set();
  }

  /**
   * 獲取儲存資料
   * @param {string} key - 儲存鍵
   * @returns {Promise<any>} 儲存的資料
   */
  async get(key) {
    try {
      // 先檢查快取
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      // 從 Chrome Storage 獲取
      const result = await chrome.storage.local.get(key);
      const data = result[key];

      // 更新快取
      if (data !== undefined) {
        this.cache.set(key, data);
      }

      return data;
    } catch (error) {
      console.error(`[StorageCore] 獲取資料失敗 (${key}):`, error);
      throw error;
    }
  }

  /**
   * 設置儲存資料
   * @param {string} key - 儲存鍵
   * @param {any} value - 要儲存的資料
   * @returns {Promise<void>}
   */
  async set(key, value) {
    try {
      // 建立儲存物件，避免 object injection
      const storageData = {};
      storageData[key] = value;
      await chrome.storage.local.set(storageData);
      this.cache.set(key, value);
      this.notifyListeners(key, value);
    } catch (error) {
      console.error(`[StorageCore] 設置資料失敗 (${key}):`, error);
      throw error;
    }
  }

  /**
   * 獲取設定
   * @returns {Promise<Object>} 設定物件
   */
  async getSettings() {
    const settings = await this.get(this.STORAGE_KEYS.SETTINGS);
    return { ...this.DEFAULT_SETTINGS, ...settings };
  }

  /**
   * 更新設定
   * @param {Object} newSettings - 新設定
   * @returns {Promise<Object>} 更新後的設定
   */
  async updateSettings(newSettings) {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await this.set(this.STORAGE_KEYS.SETTINGS, updatedSettings);
    return updatedSettings;
  }

  /**
   * 獲取儲存使用量
   * @returns {Promise<Object>} 使用量資訊
   */
  async getStorageUsage() {
    try {
      const usage = await chrome.storage.local.getBytesInUse();
      const quota = chrome.storage.local.QUOTA_BYTES;
      const PERCENTAGE_MULTIPLIER = 100;

      return {
        used: usage,
        total: quota,
        percentage: Math.round((usage / quota) * PERCENTAGE_MULTIPLIER),
        available: quota - usage,
      };
    } catch (error) {
      console.error('[StorageCore] 獲取儲存使用量失敗:', error);
      return { used: 0, total: 0, percentage: 0, available: 0 };
    }
  }

  /**
   * 添加變更監聽器
   * @param {Function} listener - 監聽器函數
   */
  addListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * 移除變更監聽器
   * @param {Function} listener - 監聽器函數
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * 通知監聽器
   * @private
   */
  notifyListeners(key, value) {
    this.listeners.forEach(listener => {
      try {
        listener(key, value);
      } catch (error) {
        console.error('[StorageCore] 監聽器執行失敗:', error);
      }
    });
  }

  /**
   * 清除快取
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 銷毀核心
   */
  destroy() {
    this.clearCache();
    this.listeners.clear();
  }
}
