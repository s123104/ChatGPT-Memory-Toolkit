// ChatGPT Memory Manager - Main Flow & Orchestration
// 主要流程和協調控制模組

import {
  CONFIG,
  log,
  warn,
  sleep,
  hasTriggerText,
  findMemoryFullTargetDiv,
} from './content-core.js';
import {
  enhanceMemoryFullTargetDiv,
  openPersonalizationSettings,
} from './content-dom.js';
import {
  readUsageAndClickManage,
  scrapeMemoriesToMarkdown,
} from './content-memory.js';

// 主要流程
export async function mainFlow() {
  log('偵測到「儲存的記憶已滿」→ 開始自動匯出流程');
  const panel = await openPersonalizationSettings();
  await readUsageAndClickManage(panel);
  return await scrapeMemoriesToMarkdown();
}

// 記憶狀態檢測
export function checkMemoryStatus() {
  const isMemoryFull = hasTriggerText();
  const currentStatus = {
    isFull: isMemoryFull,
    timestamp: Date.now(),
    url: location.href,
  };

  // 儲存狀態到全域變數
  window.__memoryStatus = currentStatus;

  // 如果記憶已滿，尋找並增強對應的目標 div
  if (isMemoryFull) {
    const targetDiv = findMemoryFullTargetDiv();
    if (targetDiv) {
      enhanceMemoryFullTargetDiv(targetDiv);
    }
  }

  // 通知 popup 狀態更新
  try {
    chrome.runtime.sendMessage({
      action: 'memoryStatusUpdate',
      status: isMemoryFull ? '記憶已滿' : '記憶正常',
      isFull: isMemoryFull,
      color: isMemoryFull ? '#f59e0b' : '#10b981',
    });
  } catch (error) {
    // 忽略通訊錯誤，popup 可能未開啟
  }

  return currentStatus;
}

// 防止模態窗重複顯示的全域標記
let isModalShowing = false;

// 顯示自動提醒模態窗
export function showAutoExportModal() {
  // 檢查是否已經有模態窗或正在顯示
  if (document.getElementById('memoryFullModal') || isModalShowing) {
    log('模態窗已在顯示中，跳過重複顯示');
    return;
  }

  // 設置顯示標記
  isModalShowing = true;

  const modal = document.createElement('div');
  modal.id = 'memoryFullModal';
  modal.className = 'memory-modal-overlay';

  modal.innerHTML = `
    <div class="memory-modal-content">
      <div class="memory-modal-header">
        <div class="memory-modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V21A2 2 0 0 0 5 23H19A2 2 0 0 0 21 21V9M19 9H14V4H5V21H19V9Z"/>
          </svg>
        </div>
        <div class="memory-modal-title-section">
          <h3 class="memory-modal-title">記憶已滿</h3>
          <p class="memory-modal-subtitle">Memory Storage Full</p>
        </div>
        <div class="memory-modal-status">
          <div class="memory-status-dot warning"></div>
        </div>
      </div>
      
      <div class="memory-modal-body">
        <div class="memory-alert-content">
          <div class="memory-alert-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z"/>
            </svg>
          </div>
          <div class="memory-alert-text">
            <p>您的 ChatGPT 記憶已達到上限。建議立即匯出記憶內容以釋放空間，避免遺失重要資訊。</p>
          </div>
        </div>
        
        <div class="memory-usage-info">
          <div class="usage-bar">
            <div class="usage-fill" style="width: 100%"></div>
          </div>
          <div class="usage-text">
            <span class="usage-label">記憶使用量</span>
            <span class="usage-value">100%</span>
          </div>
        </div>
      </div>
      
      <div class="memory-modal-actions">
        <button id="exportMemoriesBtn" class="btn-export">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          立即匯出記憶
        </button>
        
        <div class="memory-secondary-actions">
          <button id="dismissReminderBtn" class="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,17V15H11V17H13M13,13V7H11V13H13Z"/>
            </svg>
            暫停 24 小時
          </button>
          
          <button id="closeModalBtn" class="btn-close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
            關閉
          </button>
        </div>
      </div>
    </div>
  `;

  // 添加樣式
  if (!document.getElementById('memoryModalStyles')) {
    const styles = document.createElement('style');
    styles.id = 'memoryModalStyles';
    styles.textContent = `
      .memory-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: modalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes modalFadeIn {
        from { opacity: 0; backdrop-filter: blur(0px); }
        to { opacity: 1; backdrop-filter: blur(12px); }
      }

      .memory-modal-content {
        background: linear-gradient(145deg, #ffffff, #f8fafc);
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
                    0 0 0 1px rgba(255, 255, 255, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5);
        max-width: 480px;
        width: 100%;
        overflow: hidden;
        transform: translateY(-20px);
        animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      @keyframes modalSlideIn {
        from { transform: translateY(-20px) scale(0.95); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }

      .memory-modal-header {
        display: flex;
        align-items: center;
        padding: 24px 24px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        background: linear-gradient(135deg, #fff7ed, #fef3c7);
      }

      .memory-modal-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #f59e0b, #f97316);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);
        margin-right: 16px;
      }

      .memory-modal-title-section {
        flex: 1;
      }

      .memory-modal-title {
        font-size: 20px;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 4px 0;
        line-height: 1.3;
      }

      .memory-modal-subtitle {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
        font-weight: 500;
      }

      .memory-modal-status {
        margin-left: 16px;
      }

      .memory-status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        animation: statusPulse 2s ease-in-out infinite;
      }

      .memory-status-dot.warning {
        background: #f59e0b;
        box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
      }

      @keyframes statusPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
      }

      .memory-modal-body {
        padding: 24px;
      }

      .memory-alert-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 20px;
        padding: 16px;
        background: linear-gradient(135deg, #fef3c7, #fed7aa);
        border-radius: 16px;
        border: 1px solid rgba(245, 158, 11, 0.2);
      }

      .memory-alert-icon {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #f59e0b, #f97316);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }

      .memory-alert-text p {
        margin: 0;
        color: #92400e;
        font-size: 14px;
        line-height: 1.5;
        font-weight: 500;
      }

      .memory-usage-info {
        background: #f8fafc;
        border-radius: 12px;
        padding: 16px;
        border: 1px solid #e2e8f0;
      }

      .usage-bar {
        height: 8px;
        background: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .usage-fill {
        height: 100%;
        background: linear-gradient(90deg, #f59e0b, #f97316);
        border-radius: 4px;
        animation: usageFill 1s ease-out;
      }

      @keyframes usageFill {
        from { width: 0%; }
        to { width: 100%; }
      }

      .usage-text {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .usage-label {
        font-size: 13px;
        color: #6b7280;
        font-weight: 500;
      }

      .usage-value {
        font-size: 13px;
        color: #f59e0b;
        font-weight: 700;
      }

      .memory-modal-actions {
        padding: 20px 24px 24px;
        background: #f8fafc;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
      }

      .btn-export {
        width: 100%;
        background: linear-gradient(135deg, #f59e0b, #f97316);
        color: white;
        border: none;
        border-radius: 16px;
        padding: 16px 24px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);
        margin-bottom: 12px;
      }

      .btn-export:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(245, 158, 11, 0.4);
        background: linear-gradient(135deg, #f97316, #ea580c);
      }

      .btn-export:active {
        transform: translateY(0);
      }

      .memory-secondary-actions {
        display: flex;
        gap: 8px;
      }

      .btn-secondary, .btn-close {
        flex: 1;
        background: white;
        color: #6b7280;
        border: 1px solid #d1d5db;
        border-radius: 12px;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .btn-secondary:hover, .btn-close:hover {
        background: #f9fafb;
        border-color: #9ca3af;
        color: #374151;
      }

      @media (max-width: 520px) {
        .memory-modal-content {
          margin: 10px;
          border-radius: 20px;
        }
        
        .memory-modal-header {
          padding: 20px 20px 14px;
        }
        
        .memory-modal-body {
          padding: 20px;
        }
        
        .memory-modal-actions {
          padding: 16px 20px 20px;
        }
        
        .memory-secondary-actions {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(modal);

  // 事件處理
  const exportBtn = modal.querySelector('#exportMemoriesBtn');
  const dismissBtn = modal.querySelector('#dismissReminderBtn');
  const closeBtn = modal.querySelector('#closeModalBtn');

  const closeModal = () => {
    modal.style.animation = 'modalFadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      modal.remove();
      isModalShowing = false;
    }, 300);
  };

  exportBtn?.addEventListener('click', async () => {
    exportBtn.disabled = true;
    exportBtn.textContent = '匯出中...';

    try {
      const markdown = await mainFlow();
      if (markdown) {
        showExportResultModal(markdown);
        closeModal();
      }
    } catch (error) {
      warn('匯出失敗:', error);
      exportBtn.disabled = false;
      exportBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
        立即匯出記憶
      `;
    }
  });

  dismissBtn?.addEventListener('click', async () => {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    try {
      await chrome.storage.local.set({ memoryFullReminderDisabled: until });
      log('提醒已暫停 24 小時');
    } catch (error) {
      warn('無法設置提醒暫停:', error);
    }
    closeModal();
  });

  closeBtn?.addEventListener('click', closeModal);

  // 點擊背景關閉
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // ESC 鍵關閉
  const handleEscape = e => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  log('自動提醒模態窗已顯示');
}

// 顯示匯出結果模態窗
export function showExportResultModal(markdownContent) {
  const modal = document.createElement('div');
  modal.id = 'exportResultModal';
  modal.className = 'memory-modal-overlay';

  const wordCount = markdownContent.split(/\s+/).length;
  const charCount = markdownContent.length;
  const memoryCount = (markdownContent.match(/^\d+\./gm) || []).length;

  modal.innerHTML = `
    <div class="memory-modal-content export-result">
      <div class="memory-modal-header success">
        <div class="memory-modal-icon success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
          </svg>
        </div>
        <div class="memory-modal-title-section">
          <h3 class="memory-modal-title">匯出完成</h3>
          <p class="memory-modal-subtitle">Export Completed Successfully</p>
        </div>
        <div class="memory-modal-status">
          <div class="memory-status-dot success"></div>
        </div>
      </div>
      
      <div class="memory-modal-body">
        <div class="export-stats">
          <div class="stat-item">
            <div class="stat-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">${memoryCount}</div>
              <div class="stat-label">記憶項目</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">${(charCount / 1024).toFixed(1)}KB</div>
              <div class="stat-label">檔案大小</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.61L12.75,4H11.25Z"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">${wordCount.toLocaleString()}</div>
              <div class="stat-label">字數統計</div>
            </div>
          </div>
        </div>
        
        <div class="export-success-message">
          <div class="success-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
            </svg>
          </div>
          <div class="success-text">
            <p>記憶內容已成功匯出為 Markdown 格式。您可以將內容複製到剪貼簿或下載為檔案。</p>
          </div>
        </div>
      </div>
      
      <div class="memory-modal-actions">
        <button id="copyMarkdownBtn" class="btn-export">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
          </svg>
          複製到剪貼簿
        </button>
        
        <div class="memory-secondary-actions">
          <button id="downloadMarkdownBtn" class="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            下載檔案
          </button>
          
          <button id="closeResultModalBtn" class="btn-close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
            關閉
          </button>
        </div>
      </div>
    </div>
  `;

  // 添加成功主題樣式
  if (!document.getElementById('exportResultStyles')) {
    const styles = document.createElement('style');
    styles.id = 'exportResultStyles';
    styles.textContent = `
      .memory-modal-header.success {
        background: linear-gradient(135deg, #ecfdf5, #d1fae5);
        border-bottom-color: rgba(34, 197, 94, 0.1);
      }
      
      .memory-modal-icon.success {
        background: linear-gradient(135deg, #10b981, #059669);
        box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
      }
      
      .memory-status-dot.success {
        background: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
      }
      
      .export-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 20px;
      }
      
      .stat-item {
        background: white;
        border-radius: 12px;
        padding: 16px;
        border: 1px solid #e5e7eb;
        text-align: center;
      }
      
      .stat-icon {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin: 0 auto 8px;
      }
      
      .stat-value {
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
      }
      
      .export-success-message {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: linear-gradient(135deg, #ecfdf5, #d1fae5);
        border-radius: 16px;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }
      
      .success-icon {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }
      
      .success-text p {
        margin: 0;
        color: #047857;
        font-size: 14px;
        line-height: 1.5;
        font-weight: 500;
      }
      
      @media (max-width: 520px) {
        .export-stats {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        
        .memory-secondary-actions {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(modal);

  // 事件處理
  const copyBtn = modal.querySelector('#copyMarkdownBtn');
  const downloadBtn = modal.querySelector('#downloadMarkdownBtn');
  const closeBtn = modal.querySelector('#closeResultModalBtn');

  const closeModal = () => {
    modal.style.animation = 'modalFadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      modal.remove();
    }, 300);
  };

  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
        </svg>
        已複製！
      `;
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
          </svg>
          複製到剪貼簿
        `;
      }, 2000);
    } catch (error) {
      warn('複製失敗:', error);
    }
  });

  downloadBtn?.addEventListener('click', () => {
    const blob = new Blob([markdownContent], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ChatGPT_記憶_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  closeBtn?.addEventListener('click', closeModal);

  // 點擊背景關閉
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeModal();
    }
  });

  log('匯出結果模態窗已顯示');
}

// 檢查並顯示模態窗
export async function checkAndShowModal() {
  try {
    const result = await chrome.storage.local.get('memoryFullReminderDisabled');
    const reminderDisabled = result.memoryFullReminderDisabled;

    if (reminderDisabled) {
      if (typeof reminderDisabled !== 'string') {
        await chrome.storage.local.remove('memoryFullReminderDisabled');
        log('清除無效的提醒暫停設定');
        return;
      }

      const disabledUntil = new Date(reminderDisabled);
      const now = new Date();

      if (now < disabledUntil) {
        return;
      } else {
        await chrome.storage.local.remove('memoryFullReminderDisabled');
        log('提醒暫停期已過，恢復正常提醒');
      }
    }

    if (hasTriggerText()) {
      showAutoExportModal();
    }
  } catch (error) {
    if (hasTriggerText()) {
      showAutoExportModal();
    }
  }
}

// 啟動監控
export async function bootstrap() {
  log('🚀 Memory Manager 啟動');

  // 暴露主流程函數供 DOM 模組使用
  window.memoryManagerMainFlow = mainFlow;

  try {
    // 初始檢查
    checkMemoryStatus();
    await checkAndShowModal();

    // 定期檢查
    const observer = new MutationObserver(() => {
      checkMemoryStatus();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 監聽 storage 變更
    chrome.storage.onChanged.addListener(changes => {
      if (changes.memoryFullReminderDisabled?.newValue === undefined) {
        log('提醒暫停已取消，重新檢查狀態');
        checkAndShowModal();
      }
    });

    log('✅ Memory Manager 初始化完成');
  } catch (error) {
    warn('❌ Memory Manager 初始化失敗:', error);
  }

  // 設置訊息監聽器處理來自 background script 的請求
  setupMessageListener();
}

/**
 * 設置訊息監聽器
 */
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log('收到來自 background script 的訊息:', message);

    switch (message.action) {
      case 'getMemoryStatus':
        handleGetMemoryStatus(sendResponse);
        break;

      case 'exportMemories':
        handleExportMemories(sendResponse);
        break;

      default:
        console.warn('[Content Script] 未知的訊息類型:', message.action);
        sendResponse({ success: false, error: '未知的訊息類型' });
    }

    // 返回 true 表示將異步發送回應
    return true;
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
  // 實際的記憶狀態檢查邏輯
  // 這裡需要根據現有的檢查機制來實作
  return {
    isFull: false, // 暫時返回預設值，需要實際實作
    count: 0,
    lastCheck: new Date().toISOString(),
  };
}

/**
 * 執行記憶匯出
 */
async function executeMemoryExport() {
  try {
    // 實際的匯出邏輯
    // 這裡需要根據現有的匯出機制來實作
    log('開始執行記憶匯出...');

    // 暫時返回模擬數據，需要實際實作
    return {
      success: true,
      data: {
        memories: [],
        exportTime: new Date().toISOString(),
        format: 'json',
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
