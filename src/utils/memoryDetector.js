/**
 * ChatGPT Memory Usage Detector
 * 記憶使用率檢測工具
 */

import { CHATGPT_CONFIG } from '../constants/config.js';
import { contentLogger as logger } from './logger.js';

/**
 * 記憶使用率檢測器
 */
export class MemoryUsageDetector {
  constructor() {
    this.config = CHATGPT_CONFIG;
    this.observers = new Map();
  }

  /**
   * 檢測記憶是否已滿
   * @returns {boolean} 是否已滿
   */
  isMemoryFull() {
    const fullIndicators = this.config.keywords.memoryFull;
    
    for (const indicator of fullIndicators) {
      const elements = Array.from(document.querySelectorAll('div, span, p'))
        .filter(el => el.textContent && el.textContent.includes(indicator));
      
      if (elements.length > 0) {
        logger.debug('Memory full indicator found:', indicator);
        return true;
      }
    }
    
    return false;
  }

  /**
   * 提取記憶使用率百分比
   * @param {Element} container - 包含使用率資訊的容器
   * @returns {string|null} 使用率百分比字串
   */
  extractUsagePercentage(container) {
    if (!container) return null;

    // 創建 TreeWalker 遍歷文字節點
    const treeWalker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    
    while (node = treeWalker.nextNode()) {
      const text = node.textContent.trim();
      if (text) {
        textNodes.push(text);
      }
    }

    const combinedText = textNodes.join(' ');
    logger.debug('Combined text for usage detection:', combinedText);

    // 多種百分比模式匹配
    const patterns = [
      // 中文模式：90% 滿、90%滿、90% 已使用
      /(\d{1,3})\s*%\s*(?:滿|已使用|已用|used)/i,
      // 英文模式：90% full、90% used、90% of memory used
      /(\d{1,3})\s*%\s*(?:full|used|of\s+memory)/i,
      // 通用模式：90%
      /(\d{1,3})\s*%/,
      // 分數模式：90/100、9/10
      /(\d+)\s*\/\s*(\d+)/,
      // 記憶體使用描述：Memory: 90%
      /(?:memory|記憶|usage|使用)[\s:：]*(\d{1,3})\s*%/i
    ];

    for (const pattern of patterns) {
      const match = combinedText.match(pattern);
      if (match) {
        let percentage;
        
        if (match[2]) {
          // 分數格式，計算百分比
          const numerator = parseInt(match[1], 10);
          const denominator = parseInt(match[2], 10);
          percentage = Math.round((numerator / denominator) * 100);
        } else {
          percentage = parseInt(match[1], 10);
        }
        
        // 驗證百分比範圍
        if (percentage >= 0 && percentage <= 100) {
          logger.info('Memory usage detected:', `${percentage}%`);
          return `${percentage}%`;
        }
      }
    }

    return null;
  }

  /**
   * 尋找記憶管理區域
   * @param {Element} root - 根元素
   * @returns {Element|null} 記憶管理區域元素
   */
  findMemoryManagementSection(root = document) {
    const keywords = this.config.keywords.memoryManagement;
    
    // 直接尋找包含記憶管理關鍵字的元素
    const headerElements = Array.from(
      root.querySelectorAll('div, h1, h2, h3, h4, h5, h6, span, p, button, [role]')
    ).filter(el => {
      const text = el.innerText || el.textContent || '';
      return keywords.some(keyword => text.includes(keyword));
    });

    if (headerElements.length === 0) {
      logger.debug('No memory management headers found');
      return null;
    }

    // 按照在頁面中的位置排序
    headerElements.sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      return rectA.top - rectB.top;
    });

    const headerElement = headerElements[0];
    logger.debug('Found memory management header:', headerElement);

    // 尋找包含記憶管理資訊的容器
    const containers = [
      // 嘗試多種容器選擇器
      headerElement.closest('div.w-full'),
      headerElement.closest('section'),
      headerElement.closest('div[class*="container"]'),
      headerElement.closest('div[class*="card"]'),
      headerElement.closest('div[class*="panel"]'),
      headerElement.parentElement,
      headerElement
    ].filter(Boolean);

    // 選擇最合適的容器
    for (const container of containers) {
      const usageInfo = this.extractUsagePercentage(container);
      if (usageInfo) {
        logger.debug('Found memory container with usage info:', container);
        return container;
      }
    }

    // 如果沒有找到使用率資訊，返回第一個容器
    return containers[0] || headerElement;
  }

  /**
   * 檢測記憶使用率
   * @returns {Object} 檢測結果
   */
  detectMemoryUsage() {
    try {
      logger.time('Memory usage detection');
      
      const result = {
        isMemoryFull: this.isMemoryFull(),
        usagePercentage: null,
        memorySection: null,
        detectionTime: Date.now()
      };

      // 尋找記憶管理區域
      const memorySection = this.findMemoryManagementSection();
      if (memorySection) {
        result.memorySection = memorySection;
        result.usagePercentage = this.extractUsagePercentage(memorySection);
      }

      // 如果在記憶管理區域找不到使用率，嘗試在整個頁面搜尋
      if (!result.usagePercentage) {
        logger.debug('Searching for usage info in entire page');
        result.usagePercentage = this.extractUsagePercentage(document.body);
      }

      // 如果記憶已滿但沒有具體百分比，設為 100%
      if (result.isMemoryFull && !result.usagePercentage) {
        result.usagePercentage = '100%';
        logger.info('Memory is full, setting usage to 100%');
      }

      logger.timeEnd('Memory usage detection');
      logger.info('Memory usage detection result:', result);

      return result;
    } catch (error) {
      logger.logError(error, { operation: 'detectMemoryUsage' });
      return {
        isMemoryFull: false,
        usagePercentage: null,
        memorySection: null,
        detectionTime: Date.now(),
        error: error.message
      };
    }
  }

  /**
   * 監控記憶狀態變化
   * @param {Function} callback - 狀態變化回調函數
   * @returns {Function} 停止監控的函數
   */
  startMonitoring(callback) {
    let lastState = this.detectMemoryUsage();
    callback(lastState);

    // 使用 MutationObserver 監控 DOM 變化
    const observer = new MutationObserver(() => {
      const currentState = this.detectMemoryUsage();
      
      // 檢查狀態是否有變化
      if (
        currentState.isMemoryFull !== lastState.isMemoryFull ||
        currentState.usagePercentage !== lastState.usagePercentage
      ) {
        logger.info('Memory state changed:', {
          from: lastState,
          to: currentState
        });
        
        lastState = currentState;
        callback(currentState);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-state', 'aria-label']
    });

    const observerId = Date.now().toString();
    this.observers.set(observerId, observer);

    // 返回停止監控的函數
    return () => {
      observer.disconnect();
      this.observers.delete(observerId);
      logger.debug('Memory monitoring stopped:', observerId);
    };
  }

  /**
   * 停止所有監控
   */
  stopAllMonitoring() {
    this.observers.forEach((observer, id) => {
      observer.disconnect();
      logger.debug('Stopped monitoring:', id);
    });
    this.observers.clear();
  }

  /**
   * 尋找管理按鈕
   * @param {Element} container - 容器元素
   * @returns {Element|null} 管理按鈕元素
   */
  findManageButton(container) {
    if (!container) return null;

    const manageKeywords = this.config.keywords.manageButtons;
    
    const buttons = Array.from(
      container.querySelectorAll('button, [role="button"], a[href*="manage"]')
    ).filter(button => {
      const text = (button.innerText || button.textContent || '').trim();
      return manageKeywords.some(keyword => text === keyword || text.includes(keyword));
    });

    if (buttons.length > 0) {
      logger.debug('Found manage button:', buttons[0]);
      return buttons[0];
    }

    return null;
  }

  /**
   * 驗證是否在正確的頁面
   * @returns {boolean} 是否為支援的頁面
   */
  isValidPage() {
    const hostname = window.location.hostname;
    return this.config.supportedDomains.some(domain => hostname.includes(domain));
  }
}

// 創建單例實例
export const memoryDetector = new MemoryUsageDetector();