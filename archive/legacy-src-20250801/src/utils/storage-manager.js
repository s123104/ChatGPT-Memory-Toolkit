/**
 * Storage Manager - 現代化歷史記憶和設定管理
 * 使用 Chrome Storage API 的最佳實踐
 */
class StorageManager {
  constructor() {
    this.STORAGE_KEYS = {
      MEMORY_HISTORY: 'memoryHistory',
      SETTINGS: 'settings',
      LAST_EXPORT: 'lastExport',
      CACHE: 'cache',
    };

    this.DEFAULT_SETTINGS = {
      autoShowModal: true, // 記憶已滿時是否自動顯示模態窗
      maxHistoryItems: 50, // 最大歷史記錄數量
      autoCleanup: true, // 是否自動清理舊記錄
      developerMode: false, // 開發者模式
      theme: 'dark', // 主題設定
      language: 'zh-TW', // 語言設定
      notifications: true, // 是否顯示通知
      autoExport: false, // 是否自動匯出
      exportFormat: 'markdown', // 預設匯出格式
    };

    this.cache = new Map();
    this.listeners = new Set();
    this.init();
  }

  /**
   * 初始化管理器
   * @private
   */
  init() {
    this.setupStorageListener();
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
   * 處理儲存變更
   * @private
   */
  handleStorageChange(changes) {
    // 清除相關快取
    Object.keys(changes).forEach(key => {
      this.cache.delete(key);
    });

    // 通知監聽器
    this.listeners.forEach(listener => {
      try {
        listener(changes);
      } catch (error) {
        console.error('[StorageManager] 監聽器錯誤:', error);
      }
    });
  }

  /**
   * 初始化設定
   * @returns {Promise<Object>} 設定物件
   */
  async initializeSettings() {
    try {
      // 檢查快取
      const cacheKey = this.STORAGE_KEYS.SETTINGS;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const result = await chrome.storage.local.get(cacheKey);
      let settings;

      if (!result[cacheKey]) {
        settings = { ...this.DEFAULT_SETTINGS };
        await this.saveSettings(settings);
      } else {
        settings = {
          ...this.DEFAULT_SETTINGS,
          ...result[cacheKey],
        };
      }

      // 快取結果
      this.cache.set(cacheKey, settings);
      return settings;
    } catch (error) {
      console.error('[StorageManager] 初始化設定失敗:', error);
      return { ...this.DEFAULT_SETTINGS };
    }
  }

  /**
   * 儲存設定
   * @param {Object} settings - 設定物件
   * @returns {Promise<boolean>} 是否成功
   */
  async saveSettings(settings) {
    try {
      // 驗證設定
      const validatedSettings = this.validateSettings(settings);

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.SETTINGS]: validatedSettings,
      });

      // 更新快取
      this.cache.set(this.STORAGE_KEYS.SETTINGS, validatedSettings);

      console.log('[StorageManager] 設定已儲存:', validatedSettings);
      return true;
    } catch (error) {
      console.error('[StorageManager] 儲存設定失敗:', error);
      return false;
    }
  }

  /**
   * 取得設定
   * @returns {Promise<Object>} 設定物件
   */
  async getSettings() {
    try {
      // 檢查快取
      const cacheKey = this.STORAGE_KEYS.SETTINGS;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const result = await chrome.storage.local.get(cacheKey);
      const settings = {
        ...this.DEFAULT_SETTINGS,
        ...result[cacheKey],
      };

      // 快取結果
      this.cache.set(cacheKey, settings);
      return settings;
    } catch (error) {
      console.error('[StorageManager] 取得設定失敗:', error);
      return { ...this.DEFAULT_SETTINGS };
    }
  }

  /**
   * 驗證設定
   * @private
   */
  validateSettings(settings) {
    const validated = { ...this.DEFAULT_SETTINGS };

    // 驗證每個設定項目
    Object.keys(this.DEFAULT_SETTINGS).forEach(key => {
      if (settings.hasOwnProperty(key)) {
        const value = settings[key];
        const defaultValue = this.DEFAULT_SETTINGS[key];

        // 類型檢查
        if (typeof value === typeof defaultValue) {
          // 特殊驗證
          switch (key) {
            case 'maxHistoryItems':
              validated[key] = Math.max(
                1,
                Math.min(1000, parseInt(value) || 50)
              );
              break;
            case 'theme':
              validated[key] = ['light', 'dark', 'auto'].includes(value)
                ? value
                : 'dark';
              break;
            case 'language':
              validated[key] = ['zh-TW', 'zh-CN', 'en-US'].includes(value)
                ? value
                : 'zh-TW';
              break;
            case 'exportFormat':
              validated[key] = ['markdown', 'text', 'json'].includes(value)
                ? value
                : 'markdown';
              break;
            default:
              validated[key] = value;
          }
        }
      }
    });

    return validated;
  }

  /**
   * 儲存記憶歷史
   * @param {Object} memoryData - 記憶資料
   * @returns {Promise<Object|null>} 歷史項目
   */
  async saveMemoryHistory(memoryData) {
    try {
      const timestamp = new Date().toISOString();
      const now = new Date();

      const historyItem = {
        id: this.generateId(),
        timestamp,
        date: now.toLocaleDateString('zh-TW'),
        time: now.toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        content: memoryData.markdown || '',
        usage: memoryData.usage || '--',
        count: memoryData.count || 0,
        hash: this.generateContentHash(memoryData.markdown || ''),
        size: this.calculateSize(memoryData.markdown || ''),
        format: memoryData.format || 'markdown',
      };

      // 取得現有歷史記錄
      const existingHistory = await this.getMemoryHistory();

      // 檢查是否有相同內容的記錄
      const existingIndex = existingHistory.findIndex(
        item => item.hash === historyItem.hash
      );

      let updatedHistory;
      if (existingIndex !== -1) {
        // 如果內容相同，更新時間戳記並移到最前面
        console.log('[StorageManager] 發現相同內容，更新現有記錄');
        const updatedItem = {
          ...existingHistory[existingIndex],
          timestamp,
          date: historyItem.date,
          time: historyItem.time,
          usage: historyItem.usage, // 更新使用量
          count: historyItem.count, // 更新數量
        };

        // 移除舊記錄並將更新的記錄放到最前面
        updatedHistory = [
          updatedItem,
          ...existingHistory.slice(0, existingIndex),
          ...existingHistory.slice(existingIndex + 1),
        ];
      } else {
        // 新增記錄
        console.log('[StorageManager] 新增歷史記錄');
        updatedHistory = [historyItem, ...existingHistory];
      }

      // 限制歷史記錄數量
      const settings = await this.getSettings();
      if (updatedHistory.length > settings.maxHistoryItems) {
        const removedItems = updatedHistory.slice(settings.maxHistoryItems);
        updatedHistory = updatedHistory.slice(0, settings.maxHistoryItems);

        console.log(`[StorageManager] 移除 ${removedItems.length} 筆舊記錄`);
      }

      // 按日期排序（最新的在前）
      updatedHistory.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      // 儲存到 Chrome Storage
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.MEMORY_HISTORY]: updatedHistory,
      });

      // 更新快取
      this.cache.set(this.STORAGE_KEYS.MEMORY_HISTORY, updatedHistory);

      console.log(
        `[StorageManager] 歷史記錄已儲存，共 ${updatedHistory.length} 筆`
      );
      return existingIndex !== -1 ? updatedHistory[0] : historyItem;
    } catch (error) {
      console.error('[StorageManager] 儲存記憶歷史失敗:', error);
      return null;
    }
  }

  /**
   * 取得記憶歷史
   * @returns {Promise<Array>} 歷史記錄陣列
   */
  async getMemoryHistory() {
    try {
      // 檢查快取
      const cacheKey = this.STORAGE_KEYS.MEMORY_HISTORY;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const result = await chrome.storage.local.get(cacheKey);
      const history = result[cacheKey] || [];

      // 按日期排序（最新的在前）
      const sortedHistory = history.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      // 快取結果
      this.cache.set(cacheKey, sortedHistory);
      return sortedHistory;
    } catch (error) {
      console.error('[StorageManager] 取得記憶歷史失敗:', error);
      return [];
    }
  }

  /**
   * 刪除歷史記錄
   * @param {string} id - 記錄 ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteHistoryItem(id) {
    try {
      const history = await this.getMemoryHistory();
      const updatedHistory = history.filter(item => item.id !== id);

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.MEMORY_HISTORY]: updatedHistory,
      });

      // 更新快取
      this.cache.set(this.STORAGE_KEYS.MEMORY_HISTORY, updatedHistory);

      console.log(`[StorageManager] 已刪除歷史記錄: ${id}`);
      return true;
    } catch (error) {
      console.error('[StorageManager] 刪除歷史記錄失敗:', error);
      return false;
    }
  }

  /**
   * 清空歷史記錄
   * @returns {Promise<boolean>} 是否成功
   */
  async clearHistory() {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.MEMORY_HISTORY]: [],
      });

      // 清除快取
      this.cache.delete(this.STORAGE_KEYS.MEMORY_HISTORY);

      console.log('[StorageManager] 歷史記錄已清空');
      return true;
    } catch (error) {
      console.error('[StorageManager] 清空歷史記錄失敗:', error);
      return false;
    }
  }

  /**
   * 取得儲存使用量
   * @returns {Promise<Object>} 使用量資訊
   */
  async getStorageUsage() {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse();
      const quota = chrome.storage.local.QUOTA_BYTES || 10485760; // 10MB

      return {
        used: bytesInUse,
        total: quota,
        percentage: Math.round((bytesInUse / quota) * 100),
        available: quota - bytesInUse,
        formattedUsed: this.formatBytes(bytesInUse),
        formattedTotal: this.formatBytes(quota),
        formattedAvailable: this.formatBytes(quota - bytesInUse),
      };
    } catch (error) {
      console.error('[StorageManager] 取得儲存使用量失敗:', error);
      return {
        used: 0,
        total: 10485760,
        percentage: 0,
        available: 10485760,
        formattedUsed: '0 B',
        formattedTotal: '10 MB',
        formattedAvailable: '10 MB',
      };
    }
  }

  /**
   * 格式化位元組
   * @private
   */
  formatBytes(bytes) {
    if (bytes === 0) {
      return '0 B';
    }

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * 計算內容大小
   * @private
   */
  calculateSize(content) {
    return new Blob([content]).size;
  }

  /**
   * 生成唯一 ID
   * @private
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  /**
   * 生成內容雜湊值
   * @private
   */
  generateContentHash(content) {
    if (!content || content.length === 0) {
      return '0';
    }

    // 清理內容，移除可能變動的部分來產生穩定的 hash
    const cleanContent = content
      .replace(/^#\s*儲存的記憶$/gm, '') // 移除標題
      .replace(/>\s*使用量：.*$/gm, '') // 移除使用量行
      .replace(/^共\s*\d+\s*筆$/gm, '') // 移除統計行
      .replace(/^\d+\.\s*/gm, '') // 移除編號，保留內容
      .replace(/\s+/g, ' ') // 統一空白字符
      .trim();

    let hash = 0;
    for (let i = 0; i < cleanContent.length; i++) {
      const char = cleanContent.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 轉換為 32 位整數
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * 添加儲存監聽器
   * @param {Function} callback - 回調函數
   */
  addStorageListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
    }
  }

  /**
   * 移除儲存監聽器
   * @param {Function} callback - 回調函數
   */
  removeStorageListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * 匯出歷史記錄
   * @param {string} format - 匯出格式 ('json', 'csv', 'markdown')
   * @returns {Promise<string|null>} 匯出資料
   */
  async exportHistory(format = 'json') {
    try {
      const history = await this.getMemoryHistory();
      const settings = await this.getSettings();
      const usage = await this.getStorageUsage();

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '2.0.0',
        totalItems: history.length,
        settings,
        usage,
        history,
      };

      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(exportData, null, 2);
        case 'csv':
          return this.convertToCSV(history);
        case 'markdown':
          return this.convertToMarkdown(exportData);
        default:
          throw new Error(`不支援的匯出格式: ${format}`);
      }
    } catch (error) {
      console.error('[StorageManager] 匯出歷史記錄失敗:', error);
      return null;
    }
  }

  /**
   * 轉換為 CSV 格式
   * @private
   */
  convertToCSV(history) {
    const headers = ['ID', '日期', '時間', '使用量', '數量', '內容預覽'];
    const rows = history.map(item => [
      item.id,
      item.date,
      item.time,
      item.usage,
      item.count,
      item.content.substring(0, 100).replace(/"/g, '""'),
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * 轉換為 Markdown 格式
   * @private
   */
  convertToMarkdown(exportData) {
    const { exportDate, totalItems, history } = exportData;

    let markdown = '# ChatGPT Memory Manager 匯出報告\n\n';
    markdown += `**匯出時間**: ${new Date(exportDate).toLocaleString('zh-TW')}\n`;
    markdown += `**總記錄數**: ${totalItems} 筆\n\n`;

    if (history.length > 0) {
      markdown += '## 歷史記錄\n\n';
      history.forEach((item, index) => {
        markdown += `### ${index + 1}. ${item.date} ${item.time}\n`;
        markdown += `- **使用量**: ${item.usage}\n`;
        markdown += `- **記憶數量**: ${item.count} 筆\n`;
        markdown += `- **內容**:\n\n${item.content}\n\n---\n\n`;
      });
    }

    return markdown;
  }

  /**
   * 匯入歷史記錄
   * @param {string} jsonData - JSON 資料
   * @returns {Promise<Object>} 匯入結果
   */
  async importHistory(jsonData) {
    try {
      const importData = JSON.parse(jsonData);

      if (!importData.history || !Array.isArray(importData.history)) {
        throw new Error('無效的匯入格式');
      }

      const existingHistory = await this.getMemoryHistory();
      const mergedHistory = [...importData.history, ...existingHistory];

      // 去重複（基於 hash）
      const uniqueHistory = mergedHistory.reduce((acc, current) => {
        const existing = acc.find(item => item.hash === current.hash);
        if (!existing) {
          acc.push(current);
        } else if (new Date(current.timestamp) > new Date(existing.timestamp)) {
          // 如果匯入的記錄較新，則替換
          const index = acc.findIndex(item => item.hash === current.hash);
          acc[index] = current;
        }
        return acc;
      }, []);

      // 限制數量並排序
      const settings = await this.getSettings();
      const finalHistory = uniqueHistory
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, settings.maxHistoryItems);

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.MEMORY_HISTORY]: finalHistory,
      });

      // 更新快取
      this.cache.set(this.STORAGE_KEYS.MEMORY_HISTORY, finalHistory);

      console.log(
        `[StorageManager] 匯入完成: ${importData.history.length} 筆記錄`
      );
      return {
        success: true,
        imported: importData.history.length,
        total: finalHistory.length,
        duplicates: mergedHistory.length - uniqueHistory.length,
      };
    } catch (error) {
      console.error('[StorageManager] 匯入歷史記錄失敗:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 清理過期資料
   * @param {number} daysOld - 保留天數
   * @returns {Promise<number>} 清理的記錄數
   */
  async cleanupOldData(daysOld = 30) {
    try {
      const history = await this.getMemoryHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const filteredHistory = history.filter(
        item => new Date(item.timestamp) > cutoffDate
      );

      const removedCount = history.length - filteredHistory.length;

      if (removedCount > 0) {
        await chrome.storage.local.set({
          [this.STORAGE_KEYS.MEMORY_HISTORY]: filteredHistory,
        });

        // 更新快取
        this.cache.set(this.STORAGE_KEYS.MEMORY_HISTORY, filteredHistory);

        console.log(`[StorageManager] 清理了 ${removedCount} 筆過期記錄`);
      }

      return removedCount;
    } catch (error) {
      console.error('[StorageManager] 清理過期資料失敗:', error);
      return 0;
    }
  }

  /**
   * 獲取統計資訊
   * @returns {Promise<Object>} 統計資訊
   */
  async getStatistics() {
    try {
      const history = await this.getMemoryHistory();
      const usage = await this.getStorageUsage();
      const settings = await this.getSettings();

      const now = new Date();
      const today = now.toDateString();
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats = {
        total: history.length,
        todayCount: history.filter(
          item => new Date(item.timestamp).toDateString() === today
        ).length,
        weekCount: history.filter(item => new Date(item.timestamp) > thisWeek)
          .length,
        monthCount: history.filter(item => new Date(item.timestamp) > thisMonth)
          .length,
        averageSize:
          history.length > 0
            ? Math.round(
                history.reduce((sum, item) => sum + (item.size || 0), 0) /
                  history.length
              )
            : 0,
        totalSize: history.reduce((sum, item) => sum + (item.size || 0), 0),
        oldestRecord:
          history.length > 0 ? history[history.length - 1].timestamp : null,
        newestRecord: history.length > 0 ? history[0].timestamp : null,
        storage: usage,
        settings,
      };

      return stats;
    } catch (error) {
      console.error('[StorageManager] 獲取統計資訊失敗:', error);
      return null;
    }
  }

  /**
   * 清除快取
   */
  clearCache() {
    this.cache.clear();
    console.log('[StorageManager] 快取已清除');
  }

  /**
   * 銷毀管理器
   */
  destroy() {
    this.clearCache();
    this.listeners.clear();
    console.log('[StorageManager] 管理器已銷毀');
  }
}

// 建立全域實例
window.StorageManager = StorageManager;
