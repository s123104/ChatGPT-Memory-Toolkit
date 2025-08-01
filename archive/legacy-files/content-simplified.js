/**
 * ChatGPT Memory Manager - Simplified Content Script
 * 簡化版內容腳本，解決模組載入問題
 *
 * 創建時間: 2025-07-31T18:00:00+08:00
 */

// 防止重複執行
if (window.__MEMORY_MANAGER_LOADED__) {
  console.info('[Memory Manager] 已在運行中');
} else {
  window.__MEMORY_MANAGER_LOADED__ = true;

  console.log('[Memory Manager] 簡化版內容腳本啟動');

  // 基礎配置
  const CONFIG = {
    debug: true,
    triggerText: '儲存的記憶已滿',
    targetURL: 'https://chatgpt.com/#settings/Personalization',
  };

  // 工具函數
  const log = (...args) =>
    CONFIG.debug && console.log('[Memory Manager]', ...args);
  const warn = (...args) => console.warn('[Memory Manager]', ...args);

  // 訊息監聽器
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log('收到來自 background script 的訊息:', message);

    switch (message.action) {
      case 'getMemoryStatus':
        handleGetMemoryStatus(sendResponse);
        break;

      case 'exportMemories':
        handleExportMemories(sendResponse);
        break;

      case 'ping':
        handlePing(sendResponse);
        break;

      case 'getMarkdown':
        handleGetMarkdown(sendResponse);
        break;

      default:
        console.warn('[Content Script] 未知的訊息類型:', message.action);
        sendResponse({ success: false, error: '未知的訊息類型' });
    }

    // 返回 true 表示將異步發送回應
    return true;
  });

  /**
   * 處理 ping 請求
   */
  function handlePing(sendResponse) {
    log('處理 ping 請求');
    sendResponse({
      success: true,
      message: 'Content script 運行正常',
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  }

  /**
   * 處理獲取記憶狀態請求
   */
  function handleGetMemoryStatus(sendResponse) {
    try {
      log('處理獲取記憶狀態請求');

      // 檢查當前記憶狀態
      const memoryStatus = getCurrentMemoryStatus();

      sendResponse({
        success: true,
        status: memoryStatus,
      });
    } catch (error) {
      warn('獲取記憶狀態失敗:', error);
      sendResponse({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * 處理匯出記憶請求
   */
  async function handleExportMemories(sendResponse) {
    try {
      log('處理匯出記憶請求');

      // 執行記憶匯出流程
      const exportResult = await executeMemoryExport();

      if (exportResult.success) {
        sendResponse({
          success: true,
          data: exportResult.data,
        });
      } else {
        sendResponse({
          success: false,
          error: exportResult.error,
        });
      }
    } catch (error) {
      warn('匯出記憶失敗:', error);
      sendResponse({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * 獲取當前記憶狀態
   */
  function getCurrentMemoryStatus() {
    // 檢查頁面上是否有記憶相關的元素
    const memoryElements = document.querySelectorAll(
      '[data-testid*="memory"], [aria-label*="memory"], [aria-label*="Memory"]'
    );

    // 檢查是否有記憶已滿的提示
    const bodyText = document.body.textContent || '';
    const isMemoryFull =
      bodyText.includes('儲存的記憶已滿') ||
      bodyText.includes('memory is full') ||
      bodyText.includes('Memory is full');

    return {
      isFull: isMemoryFull,
      count: memoryElements.length,
      lastCheck: new Date().toISOString(),
      url: window.location.href,
      elementCount: memoryElements.length,
    };
  }

  /**
   * 處理獲取 Markdown 請求
   */
  function handleGetMarkdown(sendResponse) {
    try {
      log('處理獲取 Markdown 請求');

      // 嘗試獲取當前頁面的記憶內容並轉換為 Markdown
      const markdown = getCurrentMarkdown();

      sendResponse({
        success: true,
        markdown: markdown,
      });
    } catch (error) {
      warn('獲取 Markdown 失敗:', error);
      sendResponse({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * 獲取當前頁面內容的 Markdown 格式
   */
  function getCurrentMarkdown() {
    // 嘗試從多個來源獲取記憶內容
    const memoryElements = document.querySelectorAll(
      '[data-testid*="memory"], [aria-label*="memory"], [aria-label*="Memory"], .memory-item'
    );

    if (memoryElements.length === 0) {
      return '暫無記憶內容可匯出';
    }

    let markdown = '# ChatGPT 記憶匯出\n\n';
    markdown += `**匯出時間**: ${new Date().toLocaleString('zh-TW')}\n`;
    markdown += `**記憶數量**: ${memoryElements.length} 筆\n\n`;
    markdown += '---\n\n';

    memoryElements.forEach((element, index) => {
      const content = element.textContent?.trim() || '';
      if (content) {
        markdown += `## 記憶 ${index + 1}\n\n`;
        markdown += `${content}\n\n`;
        markdown += '---\n\n';
      }
    });

    return markdown;
  }

  /**
   * 執行記憶匯出
   */
  async function executeMemoryExport() {
    try {
      log('開始執行記憶匯出...');

      // 嘗試找到記憶管理相關的按鈕或連結
      const memoryButtons = document.querySelectorAll('button, a');
      const memoryButton = Array.from(memoryButtons).find(btn => {
        const text = btn.textContent || '';
        return (
          text.includes('管理記憶') ||
          text.includes('Manage memory') ||
          text.includes('記憶') ||
          text.includes('Memory')
        );
      });

      if (!memoryButton) {
        throw new Error('找不到記憶管理功能，請手動前往設定頁面');
      }

      // 模擬點擊記憶管理按鈕
      memoryButton.click();

      // 等待頁面載入
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 檢查是否有記憶清單
      const memoryList = document.querySelectorAll(
        '[data-testid*="memory"], .memory-item, [aria-label*="memory"]'
      );

      const memories = Array.from(memoryList).map((item, index) => ({
        id: index + 1,
        content: item.textContent?.trim() || '',
        timestamp: new Date().toISOString(),
      }));

      return {
        success: true,
        data: {
          memories: memories,
          exportTime: new Date().toISOString(),
          format: 'json',
          count: memories.length,
        },
      };
    } catch (error) {
      warn('匯出過程發生錯誤:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 初始化檢查
  log('✅ Memory Manager 簡化版初始化完成');

  // 定期檢查記憶狀態
  setInterval(() => {
    const status = getCurrentMemoryStatus();
    if (status.isFull) {
      log('⚠️ 偵測到記憶已滿');
    }
  }, 30000); // 每30秒檢查一次
}
