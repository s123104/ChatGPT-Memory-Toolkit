/**
 * Memory History - 記憶歷史管理模組
 * 處理記憶歷史的存取、匯出和管理功能
 */

import { StorageCore } from './storage-core.js';

/**
 * 記憶歷史管理器
 */
export class MemoryHistory {
  constructor(storageCore) {
    this.storage = storageCore || new StorageCore();
  }

  /**
   * 獲取記憶歷史
   * @returns {Promise<Array>} 記憶歷史陣列
   */
  async getHistory() {
    try {
      const history = await this.storage.get(
        this.storage.STORAGE_KEYS.MEMORY_HISTORY
      );
      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error('[MemoryHistory] 獲取記憶歷史失敗:', error);
      return [];
    }
  }

  /**
   * 保存記憶歷史項目
   * @param {Array} memories - 記憶陣列
   * @param {Object} metadata - 額外元資料
   * @returns {Promise<Object>} 保存結果
   */
  async saveMemories(memories, metadata = {}) {
    if (!Array.isArray(memories) || memories.length === 0) {
      throw new Error('記憶資料無效或為空');
    }

    try {
      const timestamp = new Date().toISOString();
      const historyItem = {
        id: this.generateId(),
        timestamp,
        memories,
        count: memories.length,
        size: this.calculateSize(memories),
        metadata: {
          source: 'manual',
          version: '1.6.0',
          ...metadata,
        },
      };

      const history = await this.getHistory();
      const updatedHistory = [historyItem, ...history];

      // 限制歷史記錄數量
      const settings = await this.storage.getSettings();
      const DEFAULT_MAX_ITEMS = 50;
      const maxItems = settings.maxHistoryItems || DEFAULT_MAX_ITEMS;
      const trimmedHistory = updatedHistory.slice(0, maxItems);

      await this.storage.set(
        this.storage.STORAGE_KEYS.MEMORY_HISTORY,
        trimmedHistory
      );

      console.log(`[MemoryHistory] 保存了 ${memories.length} 筆記憶`);
      return {
        success: true,
        id: historyItem.id,
        count: memories.length,
        timestamp,
      };
    } catch (error) {
      console.error('[MemoryHistory] 保存記憶失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除歷史記錄項目
   * @param {string} id - 項目ID
   * @returns {Promise<boolean>} 是否成功刪除
   */
  async deleteHistoryItem(id) {
    try {
      const history = await this.getHistory();
      const filteredHistory = history.filter(item => item.id !== id);

      if (filteredHistory.length === history.length) {
        return false; // 未找到要刪除的項目
      }

      await this.storage.set(
        this.storage.STORAGE_KEYS.MEMORY_HISTORY,
        filteredHistory
      );
      return true;
    } catch (error) {
      console.error('[MemoryHistory] 刪除歷史記錄失敗:', error);
      return false;
    }
  }

  /**
   * 清除所有歷史記錄
   * @returns {Promise<boolean>} 是否成功清除
   */
  async clearAllHistory() {
    try {
      await this.storage.set(this.storage.STORAGE_KEYS.MEMORY_HISTORY, []);
      return true;
    } catch (error) {
      console.error('[MemoryHistory] 清除歷史記錄失敗:', error);
      return false;
    }
  }

  /**
   * 匯出歷史記錄
   * @param {string} format - 匯出格式 ('markdown' | 'json' | 'csv')
   * @param {string} historyId - 特定歷史記錄ID（可選）
   * @returns {Promise<Object>} 匯出結果
   */
  async exportHistory(format = 'markdown', historyId = null) {
    try {
      let dataToExport;

      if (historyId) {
        const history = await this.getHistory();
        const item = history.find(h => h.id === historyId);
        if (!item) {
          throw new Error('找不到指定的歷史記錄');
        }
        dataToExport = [item];
      } else {
        dataToExport = await this.getHistory();
      }

      const exportData = this.formatExportData(dataToExport, format);
      const exportInfo = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        format,
        count: dataToExport.length,
        size: exportData.length,
      };

      // 保存最後匯出資訊
      await this.storage.set(this.storage.STORAGE_KEYS.LAST_EXPORT, exportInfo);

      return {
        success: true,
        data: exportData,
        info: exportInfo,
      };
    } catch (error) {
      console.error('[MemoryHistory] 匯出歷史記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 格式化匯出資料
   * @private
   */
  formatExportData(history, format) {
    switch (format) {
      case 'json':
        return JSON.stringify(history, null, 2);

      case 'csv':
        return this.formatAsCsv(history);

      case 'markdown':
      default:
        return this.formatAsMarkdown(history);
    }
  }

  /**
   * 格式化為 Markdown
   * @private
   */
  formatAsMarkdown(history) {
    let markdown = '# ChatGPT 記憶匯出\n\n';
    markdown += `匯出時間: ${new Date().toLocaleString('zh-TW')}\n`;
    markdown += `總記錄數: ${history.length}\n\n`;

    history.forEach((item, index) => {
      markdown += `## 記錄 ${index + 1}\n\n`;
      markdown += `- **時間**: ${new Date(item.timestamp).toLocaleString('zh-TW')}\n`;
      markdown += `- **記憶數量**: ${item.count}\n\n`;

      if (item.memories && item.memories.length > 0) {
        item.memories.forEach((memory, memIndex) => {
          markdown += `### 記憶 ${memIndex + 1}\n\n`;
          markdown += `${memory}\n\n`;
        });
      }

      markdown += '---\n\n';
    });

    return markdown;
  }

  /**
   * 格式化為 CSV
   * @private
   */
  formatAsCsv(history) {
    let csv = 'ID,時間,記憶數量,記憶內容\n';

    history.forEach(item => {
      const memories = item.memories || [];
      const memoriesText = memories.join(' | ').replace(/"/g, '""');
      csv += `"${item.id}","${item.timestamp}","${item.count}","${memoriesText}"\n`;
    });

    return csv;
  }

  /**
   * 計算資料大小（字節）
   * @private
   */
  calculateSize(data) {
    return new Blob([JSON.stringify(data)]).size;
  }

  /**
   * 生成唯一ID
   * @private
   */
  generateId() {
    const BASE_36 = 36;
    const SUBSTR_START = 2;
    return (
      Date.now().toString(BASE_36) +
      Math.random().toString(BASE_36).substr(SUBSTR_START)
    );
  }

  /**
   * 清理過期資料
   * @param {number} daysOld - 保留天數
   * @returns {Promise<number>} 清理的記錄數
   */
  async cleanupOldData(daysOld = 30) {
    try {
      const history = await this.getHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const filteredHistory = history.filter(
        item => new Date(item.timestamp) > cutoffDate
      );

      const removedCount = history.length - filteredHistory.length;

      if (removedCount > 0) {
        await this.storage.set(
          this.storage.STORAGE_KEYS.MEMORY_HISTORY,
          filteredHistory
        );
        console.log(`[MemoryHistory] 清理了 ${removedCount} 筆過期記錄`);
      }

      return removedCount;
    } catch (error) {
      console.error('[MemoryHistory] 清理過期資料失敗:', error);
      return 0;
    }
  }

  /**
   * 獲取統計資訊
   * @returns {Promise<Object>} 統計資訊
   */
  async getStatistics() {
    try {
      const history = await this.getHistory();
      const now = new Date();
      const today = now.toDateString();
      const DAYS_IN_WEEK = 7;
      const HOURS_IN_DAY = 24;
      const MINUTES_IN_HOUR = 60;
      const SECONDS_IN_MINUTE = 60;
      const MS_IN_SECOND = 1000;
      const WEEK_MS =
        DAYS_IN_WEEK *
        HOURS_IN_DAY *
        MINUTES_IN_HOUR *
        SECONDS_IN_MINUTE *
        MS_IN_SECOND;
      const thisWeek = new Date(now.getTime() - WEEK_MS);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return {
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
      };
    } catch (error) {
      console.error('[MemoryHistory] 獲取統計資訊失敗:', error);
      return null;
    }
  }
}
