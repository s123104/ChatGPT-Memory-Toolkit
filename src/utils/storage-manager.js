// Storage Manager - 歷史記憶和設定管理
// 使用 Chrome Storage API 的最佳實踐

class StorageManager {
  constructor() {
    this.STORAGE_KEYS = {
      MEMORY_HISTORY: 'memoryHistory',
      SETTINGS: 'settings',
      LAST_EXPORT: 'lastExport',
    };

    this.DEFAULT_SETTINGS = {
      autoShowModal: true, // 記憶已滿時是否自動顯示模態窗
      maxHistoryItems: 50, // 最大歷史記錄數量
      autoCleanup: true, // 是否自動清理舊記錄
      developerMode: false, // 開發者模式
    };
  }

  // 初始化設定
  async initializeSettings() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.SETTINGS);
      if (!result[this.STORAGE_KEYS.SETTINGS]) {
        await this.saveSettings(this.DEFAULT_SETTINGS);
        return this.DEFAULT_SETTINGS;
      }
      return {
        ...this.DEFAULT_SETTINGS,
        ...result[this.STORAGE_KEYS.SETTINGS],
      };
    } catch (error) {
      console.error('[StorageManager] 初始化設定失敗:', error);
      return this.DEFAULT_SETTINGS;
    }
  }

  // 儲存設定
  async saveSettings(settings) {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.SETTINGS]: settings,
      });
      return true;
    } catch (error) {
      console.error('[StorageManager] 儲存設定失敗:', error);
      return false;
    }
  }

  // 取得設定
  async getSettings() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.SETTINGS);
      return {
        ...this.DEFAULT_SETTINGS,
        ...result[this.STORAGE_KEYS.SETTINGS],
      };
    } catch (error) {
      console.error('[StorageManager] 取得設定失敗:', error);
      return this.DEFAULT_SETTINGS;
    }
  }

  // 儲存記憶歷史
  async saveMemoryHistory(memoryData) {
    try {
      const timestamp = new Date().toISOString();
      const historyItem = {
        id: this.generateId(),
        timestamp,
        date: new Date().toLocaleDateString('zh-TW'),
        time: new Date().toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        content: memoryData.markdown || '',
        usage: memoryData.usage || '--',
        count: memoryData.count || 0,
        hash: this.generateContentHash(memoryData.markdown || ''),
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
        console.log('[StorageManager] 發現相同內容，更新現有記錄的時間戳記');
        const updatedItem = {
          ...existingHistory[existingIndex],
          timestamp,
          date: historyItem.date,
          time: historyItem.time,
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
        updatedHistory = updatedHistory.slice(0, settings.maxHistoryItems);
      }

      // 按日期排序（最新的在前）
      updatedHistory.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.MEMORY_HISTORY]: updatedHistory,
      });

      return historyItem;
    } catch (error) {
      console.error('[StorageManager] 儲存記憶歷史失敗:', error);
      return null;
    }
  }

  // 取得記憶歷史
  async getMemoryHistory() {
    try {
      const result = await chrome.storage.local.get(
        this.STORAGE_KEYS.MEMORY_HISTORY
      );
      const history = result[this.STORAGE_KEYS.MEMORY_HISTORY] || [];

      // 按日期排序（最新的在前）
      return history.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    } catch (error) {
      console.error('[StorageManager] 取得記憶歷史失敗:', error);
      return [];
    }
  }

  // 刪除歷史記錄
  async deleteHistoryItem(id) {
    try {
      const history = await this.getMemoryHistory();
      const updatedHistory = history.filter(item => item.id !== id);

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.MEMORY_HISTORY]: updatedHistory,
      });

      return true;
    } catch (error) {
      console.error('[StorageManager] 刪除歷史記錄失敗:', error);
      return false;
    }
  }

  // 清空歷史記錄
  async clearHistory() {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.MEMORY_HISTORY]: [],
      });
      return true;
    } catch (error) {
      console.error('[StorageManager] 清空歷史記錄失敗:', error);
      return false;
    }
  }

  // 取得儲存使用量
  async getStorageUsage() {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse();
      const quota = chrome.storage.local.QUOTA_BYTES || 10485760; // 10MB

      return {
        used: bytesInUse,
        total: quota,
        percentage: Math.round((bytesInUse / quota) * 100),
      };
    } catch (error) {
      console.error('[StorageManager] 取得儲存使用量失敗:', error);
      return { used: 0, total: 10485760, percentage: 0 };
    }
  }

  // 生成唯一 ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // 生成內容雜湊值
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

  // 監聽儲存變更
  addStorageListener(callback) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        callback(changes);
      }
    });
  }

  // 匯出歷史記錄
  async exportHistory() {
    try {
      const history = await this.getMemoryHistory();
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        totalItems: history.length,
        history,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('[StorageManager] 匯出歷史記錄失敗:', error);
      return null;
    }
  }

  // 匯入歷史記錄
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

      return {
        success: true,
        imported: importData.history.length,
        total: finalHistory.length,
      };
    } catch (error) {
      console.error('[StorageManager] 匯入歷史記錄失敗:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// 建立全域實例
window.StorageManager = StorageManager;
