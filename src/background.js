/**
 * ChatGPT Memory Toolkit - Background Service Worker
 * Chrome 擴充套件背景腳本，處理 popup 和 content script 間的消息傳遞
 *
 * 創建時間: 2025-07-31T17:43:15+08:00
 * 參考: [context7:googlechrome/chrome-extensions-samples:2025-07-31T17:43:15+08:00]
 */

console.log('[Background] Service Worker 已啟動');

/**
 * 處理來自 popup 和 content script 的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] 收到消息:', message, '來自:', sender);

  // 處理不同類型的消息
  switch (message.action) {
    case 'getMemoryStatus':
      handleGetMemoryStatus(message, sender, sendResponse);
      break;

    case 'exportMemories':
      handleExportMemories(message, sender, sendResponse);
      break;

    case 'ping':
      handlePing(message, sender, sendResponse);
      break;

    case 'getMarkdown':
      handleGetMarkdown(message, sender, sendResponse);
      break;

    default:
      console.warn('[Background] 未知的消息類型:', message.action);
      sendResponse({ success: false, error: '未知的消息類型' });
  }

  // 返回 true 表示將異步發送回應
  return true;
});

/**
 * 處理獲取記憶狀態請求
 */
async function handleGetMemoryStatus(message, sender, sendResponse) {
  try {
    console.log('[Background] 處理獲取記憶狀態請求');

    // 優先使用 sender 的標籤頁，如果沒有則查詢當前活動標籤頁
    let targetTab = null;

    if (sender.tab) {
      targetTab = sender.tab;
      console.log('[Background] 使用 sender 標籤頁:', targetTab.url);
    } else {
      // 找到當前活動的標籤頁
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      targetTab = tabs[0];
      console.log('[Background] 使用活動標籤頁:', targetTab?.url);
    }

    if (!targetTab || !targetTab.url?.includes('chatgpt.com')) {
      console.warn('[Background] 不在 ChatGPT 頁面:', targetTab?.url);
      sendResponse({
        success: false,
        error: '請在 ChatGPT 頁面使用此功能',
      });
      return;
    }

    // 轉發消息到 content script
    try {
      const response = await chrome.tabs.sendMessage(targetTab.id, {
        action: 'getMemoryStatus',
      });

      console.log('[Background] Content script 回應:', response);
      sendResponse(response);
    } catch (error) {
      console.warn('[Background] Content script 通信失敗:', error);
      sendResponse({
        success: false,
        error: 'Content script 未響應，請重新整理頁面',
      });
    }
  } catch (error) {
    console.error('[Background] 處理獲取記憶狀態失敗:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 處理匯出記憶請求
 */
async function handleExportMemories(message, sender, sendResponse) {
  try {
    console.log('[Background] 處理匯出記憶請求');

    // 優先使用 sender 的標籤頁，如果沒有則查詢當前活動標籤頁
    let targetTab = null;

    if (sender.tab) {
      targetTab = sender.tab;
      console.log('[Background] 使用 sender 標籤頁:', targetTab.url);
    } else {
      // 找到當前活動的標籤頁
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      targetTab = tabs[0];
      console.log('[Background] 使用活動標籤頁:', targetTab?.url);
    }

    if (!targetTab || !targetTab.url?.includes('chatgpt.com')) {
      console.warn('[Background] 不在 ChatGPT 頁面:', targetTab?.url);
      sendResponse({
        success: false,
        error: '請在 ChatGPT 頁面使用此功能',
      });
      return;
    }

    // 轉發消息到 content script
    try {
      const response = await chrome.tabs.sendMessage(targetTab.id, {
        action: 'exportMemories',
        ...message,
      });

      console.log('[Background] Content script 匯出回應:', response);
      sendResponse(response);
    } catch (error) {
      console.warn('[Background] Content script 匯出通信失敗:', error);
      sendResponse({
        success: false,
        error: 'Content script 未響應，請重新整理頁面後重試',
      });
    }
  } catch (error) {
    console.error('[Background] 處理匯出記憶失敗:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 處理獲取 Markdown 請求
 */
async function handleGetMarkdown(message, sender, sendResponse) {
  try {
    console.log('[Background] 處理獲取 Markdown 請求');

    // 優先使用 sender 的標籤頁，如果沒有則查詢當前活動標籤頁
    let targetTab = null;

    if (sender.tab) {
      targetTab = sender.tab;
      console.log('[Background] 使用 sender 標籤頁:', targetTab.url);
    } else {
      // 找到當前活動的標籤頁
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      targetTab = tabs[0];
      console.log('[Background] 使用活動標籤頁:', targetTab?.url);
    }

    if (!targetTab || !targetTab.url?.includes('chatgpt.com')) {
      console.warn('[Background] 不在 ChatGPT 頁面:', targetTab?.url);
      sendResponse({
        success: false,
        error: '請在 ChatGPT 頁面使用此功能',
      });
      return;
    }

    // 轉發消息到 content script
    try {
      const response = await chrome.tabs.sendMessage(targetTab.id, {
        action: 'getMarkdown',
        ...message,
      });

      console.log('[Background] Content script Markdown 回應:', response);
      sendResponse(response);
    } catch (error) {
      console.warn('[Background] Content script Markdown 通信失敗:', error);
      sendResponse({
        success: false,
        error: 'Content script 未響應，請重新整理頁面後重試',
      });
    }
  } catch (error) {
    console.error('[Background] 處理獲取 Markdown 失敗:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 處理 ping 請求
 */
function handlePing(message, sender, sendResponse) {
  console.log('[Background] 收到 ping 請求');
  sendResponse({
    success: true,
    message: 'Background service worker 運行正常',
    timestamp: new Date().toISOString(),
  });
}

/**
 * 擴充套件安裝時的初始化
 */
chrome.runtime.onInstalled.addListener(details => {
  console.log('[Background] 擴充套件已安裝/更新:', details.reason);

  if (details.reason === 'install') {
    console.log('[Background] 首次安裝，執行初始化...');
  } else if (details.reason === 'update') {
    console.log(
      '[Background] 更新完成，版本:',
      chrome.runtime.getManifest().version
    );
  }
});

/**
 * 標籤頁更新監聽
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 當標籤頁完成載入且是 ChatGPT 頁面時
  if (changeInfo.status === 'complete' && tab.url?.includes('chatgpt.com')) {
    console.log('[Background] ChatGPT 頁面已載入:', tab.url);
  }
});

/**
 * 擴充套件啟動時
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('[Background] Chrome 啟動，Service Worker 重新初始化');
});

/**
 * 錯誤處理
 */
self.addEventListener('error', event => {
  console.error('[Background] Service Worker 錯誤:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[Background] 未處理的 Promise 拒絕:', event.reason);
});

console.log('[Background] Service Worker 初始化完成');
