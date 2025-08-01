/**
 * Modern ChatGPT Memory Manager - Popup Actions
 * 彈出視窗操作處理器
 */

/**
 * 處理匯出動作
 */
async function handleExport(manager) {
  const exportBtnManager = manager.buttonManagers.get('exportBtn');

  if (!manager.currentTab?.url?.includes('chatgpt.com')) {
    manager.showError('請前往 ChatGPT 網站');
    return;
  }

  try {
    if (exportBtnManager) {
      exportBtnManager.setLoading('匯出中...', 'Exporting...');
    }

    // 發送匯出請求到 background script，再轉發到 content script
    const response = await chrome.runtime.sendMessage({
      action: 'exportMemories',
    });

    if (response?.success) {
      // 儲存匯出的資料
      manager.currentExportData = response.data;

      // 顯示成功狀態
      if (exportBtnManager) {
        exportBtnManager.setSuccess('匯出完成', 'Export Completed');
      }

      // 更新狀態
      await manager.updateStatus();

      // 顯示成功通知
      if (window.toastManager) {
        window.toastManager.success('記憶匯出成功！');
      }

      // 顯示匯出結果
      displayExportResult(response.data);
    } else {
      throw new Error(response?.error || '匯出失敗');
    }
  } catch (error) {
    console.error('[PopupActions] 匯出失敗:', error);
    handleExportError(error, exportBtnManager, manager);
  }
}

/**
 * 處理匯出錯誤
 */
function handleExportError(error, exportBtnManager, manager) {
  let errorMessage = '匯出失敗';

  if (error.message.includes('Could not establish connection')) {
    errorMessage = '請重新整理頁面';
  } else if (error.message.includes('timeout')) {
    errorMessage = '連線逾時，請重試';
  } else if (error.message.includes('memory full')) {
    errorMessage = '記憶體已滿';
  }

  if (exportBtnManager) {
    exportBtnManager.setError(errorMessage, 'Export Failed');
  }

  if (window.toastManager) {
    window.toastManager.error(`匯出失敗: ${error.message}`);
  }

  manager.showError(errorMessage);
}

/**
 * 處理複製動作
 */
async function handleCopy(manager) {
  const copyBtnManager = manager.buttonManagers.get('copyBtn');

  try {
    let markdown = manager.currentExportData || window.__lastMarkdown;

    // 如果沒有快取的 markdown，嘗試從 content script 取得
    if (!markdown) {
      if (copyBtnManager) {
        copyBtnManager.setLoading('取得資料...', 'Getting data...');
      }

      const response = await chrome.tabs.sendMessage(manager.currentTab.id, {
        action: 'getMarkdown',
      });
      markdown = response?.markdown;
    }

    if (!markdown) {
      throw new Error('沒有可複製的資料，請先匯出記憶');
    }

    await navigator.clipboard.writeText(markdown);

    if (copyBtnManager) {
      copyBtnManager.setSuccess('已複製', 'Copied');
    }

    if (window.toastManager) {
      window.toastManager.success('內容已複製到剪貼簿');
    }

    manager.showSuccess('內容已複製');
  } catch (error) {
    console.error('[PopupActions] 複製失敗:', error);

    let errorMessage = '複製失敗';
    if (error.message.includes('Could not establish connection')) {
      errorMessage = '請重新整理頁面';
    } else if (error.message.includes('沒有可複製的資料')) {
      errorMessage = '請先匯出記憶';
    } else if (error.name === 'NotAllowedError') {
      errorMessage = '無法存取剪貼簿';
    }

    if (copyBtnManager) {
      copyBtnManager.setError(errorMessage, 'Copy Failed');
    }

    if (window.toastManager) {
      window.toastManager.error(errorMessage);
    }

    manager.showError(errorMessage);
  }
}

/**
 * 處理重新整理動作
 */
async function handleRefresh(manager) {
  const refreshBtnManager = manager.buttonManagers.get('refreshBtn');

  try {
    if (refreshBtnManager) {
      refreshBtnManager.setLoading('更新中...', 'Updating...');
    }

    // 重新獲取當前分頁
    await manager.getCurrentTab();

    // 更新狀態
    await manager.updateStatus();
    await manager.updateStorageInfo();

    // 如果在 ChatGPT 頁面，重新注入 content script
    if (manager.currentTab?.url?.includes('chatgpt.com')) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: manager.currentTab.id },
          files: ['scripts/content.js'],
        });
      } catch (scriptError) {
        console.warn('[PopupActions] Content script 注入警告:', scriptError);
      }
    }

    if (refreshBtnManager) {
      refreshBtnManager.setSuccess('已更新', 'Updated');
    }

    if (window.toastManager) {
      window.toastManager.success('狀態已更新');
    }

    manager.showSuccess('狀態已更新');
  } catch (error) {
    console.error('[PopupActions] 重新整理失敗:', error);

    if (refreshBtnManager) {
      refreshBtnManager.setError('更新失敗', 'Update Failed');
    }

    if (window.toastManager) {
      window.toastManager.error('更新失敗');
    }

    manager.showError('更新失敗');
  }
}

/**
 * 顯示匯出結果
 */
function displayExportResult(data) {
  if (!data) return;

  const resultContainer = document.getElementById('exportResult');
  if (!resultContainer) return;

  const stats = analyzeExportData(data);

  resultContainer.innerHTML = `
    <div class="export-result-panel">
      <div class="result-header">
        <div class="result-icon success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
          </svg>
        </div>
        <div class="result-title">匯出成功</div>
      </div>
      
      <div class="result-stats">
        <div class="stat-item">
          <div class="stat-value">${stats.itemCount}</div>
          <div class="stat-label">記憶項目</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.sizeKB}KB</div>
          <div class="stat-label">檔案大小</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.wordCount}</div>
          <div class="stat-label">字數</div>
        </div>
      </div>
      
      <div class="result-actions">
        <button id="downloadBtn" class="btn-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          下載檔案
        </button>
      </div>
    </div>
  `;

  // 設置下載按鈕事件
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => downloadMarkdown(data));
  }

  // 顯示結果面板
  resultContainer.style.display = 'block';

  // 5 秒後自動隱藏
  setTimeout(() => {
    resultContainer.style.display = 'none';
  }, 5000);
}

/**
 * 分析匯出資料
 */
function analyzeExportData(data) {
  if (!data || typeof data !== 'string') {
    return { itemCount: 0, sizeKB: 0, wordCount: 0 };
  }

  const itemCount = (data.match(/^\d+\./gm) || []).length;
  const sizeKB = Math.round((new Blob([data]).size / 1024) * 10) / 10;
  const wordCount = data.split(/\s+/).length;

  return { itemCount, sizeKB, wordCount };
}

/**
 * 下載 Markdown 檔案
 */
function downloadMarkdown(content) {
  try {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `ChatGPT_記憶_${new Date().toISOString().slice(0, 10)}.md`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    if (window.toastManager) {
      window.toastManager.success('檔案下載已開始');
    }
  } catch (error) {
    console.error('[PopupActions] 下載失敗:', error);

    if (window.toastManager) {
      window.toastManager.error('下載失敗');
    }
  }
}

/**
 * 處理設定相關動作
 */
async function handleSettings(manager) {
  try {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      // 降級處理：開啟設定頁面
      chrome.tabs.create({
        url: chrome.runtime.getURL('options.html'),
      });
    }
  } catch (error) {
    console.error('[PopupActions] 開啟設定失敗:', error);

    if (window.toastManager) {
      window.toastManager.error('無法開啟設定頁面');
    }
  }
}

/**
 * 獲取系統資訊
 */
async function getSystemInfo(manager) {
  try {
    const info = {
      version: chrome.runtime.getManifest()?.version || 'Unknown',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      tabUrl: manager.currentTab?.url || 'Unknown',
      settings: manager.settings || {},
    };

    return info;
  } catch (error) {
    console.error('[PopupActions] 獲取系統資訊失敗:', error);
    return null;
  }
}

// 導出到全域變數
if (typeof window !== 'undefined') {
  window.PopupActions = {
    handleExport,
    handleCopy,
    handleRefresh,
    handleSettings,
    getSystemInfo,
  };
}
