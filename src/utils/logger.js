/**
 * ChatGPT Memory Toolkit Logger
 * 統一的日誌記錄系統
 */

import { DEFAULT_SETTINGS } from '../constants/config.js';

class Logger {
  constructor(module = 'CMT') {
    this.module = module;
    this.enabled = DEFAULT_SETTINGS.advanced.debugMode;
  }

  /**
   * 設置日誌記錄狀態
   * @param {boolean} enabled - 是否啟用日誌
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * 格式化日誌訊息
   * @param {string} level - 日誌級別
   * @param {Array} args - 日誌參數
   * @returns {Array} 格式化後的參數
   */
  formatMessage(level, args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.module}] [${level.toUpperCase()}]`;
    return [prefix, ...args];
  }

  /**
   * Debug 級別日誌
   * @param {...any} args - 日誌參數
   */
  debug(...args) {
    if (this.enabled) {
      console.debug(...this.formatMessage('debug', args));
    }
  }

  /**
   * Info 級別日誌
   * @param {...any} args - 日誌參數
   */
  info(...args) {
    if (this.enabled) {
      console.info(...this.formatMessage('info', args));
    }
  }

  /**
   * Warning 級別日誌
   * @param {...any} args - 日誌參數
   */
  warn(...args) {
    console.warn(...this.formatMessage('warn', args));
  }

  /**
   * Error 級別日誌
   * @param {...any} args - 日誌參數
   */
  error(...args) {
    console.error(...this.formatMessage('error', args));
  }

  /**
   * 性能計時開始
   * @param {string} label - 計時標籤
   */
  time(label) {
    if (this.enabled) {
      console.time(`[${this.module}] ${label}`);
    }
  }

  /**
   * 性能計時結束
   * @param {string} label - 計時標籤
   */
  timeEnd(label) {
    if (this.enabled) {
      console.timeEnd(`[${this.module}] ${label}`);
    }
  }

  /**
   * 記錄函數執行
   * @param {string} functionName - 函數名稱
   * @param {Object} params - 參數
   * @param {any} result - 執行結果
   */
  logFunctionCall(functionName, params = {}, result = null) {
    if (this.enabled) {
      this.debug(`Function: ${functionName}`, {
        params,
        result: result !== null ? result : 'void',
        timestamp: Date.now()
      });
    }
  }

  /**
   * 記錄錯誤詳情
   * @param {Error} error - 錯誤對象
   * @param {Object} context - 錯誤上下文
   */
  logError(error, context = {}) {
    this.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
  }

  /**
   * 記錄用戶操作
   * @param {string} action - 操作名稱
   * @param {Object} details - 操作詳情
   */
  logUserAction(action, details = {}) {
    this.info(`User Action: ${action}`, {
      ...details,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  }

  /**
   * 記錄性能指標
   * @param {string} metric - 指標名稱
   * @param {number} value - 指標值
   * @param {string} unit - 單位
   */
  logPerformance(metric, value, unit = 'ms') {
    this.info(`Performance: ${metric}`, {
      value,
      unit,
      timestamp: Date.now()
    });
  }
}

// 創建不同模組的 Logger 實例
export const createLogger = (module) => new Logger(module);

// 預設 Logger 實例
export const logger = new Logger();

// 模組特定的 Logger
export const contentLogger = new Logger('Content');
export const backgroundLogger = new Logger('Background');
export const popupLogger = new Logger('Popup');
export const utilsLogger = new Logger('Utils');