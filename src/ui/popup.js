// Modern ChatGPT Memory Manager - Popup Script
// 現代化 app 風格的彈出視窗邏輯

class ModernPopupManager {
  constructor() {
    this.currentTab = null;
    this.memoryData = [];
    this.isInitialized = false;
    this.statusCheckInterval = null;
    this.lastStatusCheck = null;
    this.storageManager = null;
    this.settings = {};
    this.init();
  }

  async init() {
    try {
      // 初始化儲存管理器
      this.storageManager = new StorageManager();
      this.settings = await this.storageManager.initializeSettings();

      await this.getCurrentTab();
      this.setupEventListeners();
      await this.updateStatus();
      await this.updateStorageInfo();
      this.startStatusMonitoring();
      this.isInitialized = true;
      this.updateConnectionStatus(true);
    } catch (error) {
      console.error('[Popup] 初始化失敗:', error);
      this.showError('初始化失敗');
      this.updateConnectionStatus(false);
    }
  }

  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    this.currentTab = tab;
    return tab;
  }

  setupEventListeners() {
    // 主要按鈕
    const exportBtn = document.getElementById('exportBtn');
    const copyBtn = document.getElementById('copyBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const historyBtn = document.getElementById('historyBtn');
    const appSettingsBtn = document.getElementById('appSettingsBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    exportBtn?.addEventListener('click', () => this.handleExport());
    copyBtn?.addEventListener('click', () => this.handleCopy());
    refreshBtn?.addEventListener('click', () => this.handleRefresh());
    historyBtn?.addEventListener('click', () => this.toggleHistory());
    appSettingsBtn?.addEventListener('click', () => this.toggleSettings());
    settingsBtn?.addEventListener('click', () => this.handleSettings());

    // 匯出結果區塊
    const exportResultClose = document.getElementById('exportResultClose');
    const copyResultBtn = document.getElementById('copyResultBtn');
    const formatOptions = document.querySelectorAll('.format-option');

    exportResultClose?.addEventListener('click', () => this.hideExportResult());
    copyResultBtn?.addEventListener('click', () => this.handleCopyResult());

    // 格式選擇
    formatOptions.forEach(option => {
      option.addEventListener('click', () =>
        this.selectFormat(option.dataset.format)
      );
    });

    // 歷史記憶區按鈕
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    closeHistoryBtn?.addEventListener('click', () => this.toggleHistory());
    clearHistoryBtn?.addEventListener('click', () => this.clearHistory());

    // 設定區按鈕
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const autoShowModalToggle = document.getElementById('autoShowModalToggle');
    const maxHistorySelect = document.getElementById('maxHistorySelect');
    const autoCleanupToggle = document.getElementById('autoCleanupToggle');
    const developerModeToggle = document.getElementById('developerModeToggle');

    closeSettingsBtn?.addEventListener('click', () => this.toggleSettings());
    autoShowModalToggle?.addEventListener('change', e =>
      this.updateSetting('autoShowModal', e.target.checked)
    );
    maxHistorySelect?.addEventListener('change', e =>
      this.updateSetting('maxHistoryItems', parseInt(e.target.value))
    );
    autoCleanupToggle?.addEventListener('change', e =>
      this.updateSetting('autoCleanup', e.target.checked)
    );
    developerModeToggle?.addEventListener('change', e =>
      this.updateDeveloperMode(e.target.checked)
    );

    // 添加按鈕點擊效果
    this.addRippleEffect();
  }

  addRippleEffect() {
    // 為新的匯出按鈕添加點擊效果
    const exportBtn = document.querySelector('.memory-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', _e => {
        const ripple = exportBtn.querySelector('.export-btn-ripple');
        if (ripple) {
          ripple.style.animation = 'none';
          ripple.offsetHeight; // 觸發重排
          ripple.style.animation = null;
        }
      });
    }

    // 為複製按鈕添加點擊效果
    const copyBtn = document.querySelector('.copy-btn.modern');
    if (copyBtn) {
      copyBtn.addEventListener('click', _e => {
        const ripple = copyBtn.querySelector('.copy-btn-ripple');
        if (ripple) {
          ripple.style.animation = 'none';
          ripple.offsetHeight; // 觸發重排
          ripple.style.animation = null;
        }
      });
    }
  }

  async updateStatus() {
    const memoryStatusEl = document.getElementById('memoryStatus');
    const usagePercentEl = document.getElementById('usagePercent');
    const memoryCountEl = document.getElementById('memoryCount');
    const lastCheckEl = document.getElementById('lastCheck');
    const statusCard = document.getElementById('statusCard');
    const statusDot = document.getElementById('statusDot');
    if (!this.currentTab) {
      this.showError('無法取得當前分頁');
      return;
    }

    // 檢查是否在 ChatGPT 網站
    if (!this.currentTab.url?.includes('chatgpt.com')) {
      this.showNotOnChatGPT();
      return;
    }

    try {
      // 首先檢查 content script 是否已載入
      await chrome.tabs.sendMessage(this.currentTab.id, { action: 'ping' });
      this.updateConnectionStatus(true);

      // 檢查頁面中是否有記憶已滿的元素
      const memoryFullDetected = await this.detectMemoryFullElement();

      // 獲取記憶狀態
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'getMemoryStatus',
      });

      if (response?.success) {
        this.memoryData = response.data || [];
        const usage = response.usage || '--';
        const count = this.memoryData.length;
        const isFull = response.isFull || memoryFullDetected;

        // 更新狀態顯示
        if (isFull) {
          memoryStatusEl.innerHTML = `
            <div class="memory-status-full">
              <span class="status-text">記憶已滿</span>
              <span class="status-action">點擊匯出</span>
            </div>
          `;
          statusCard.className = 'status-card modern warning memory-full';
          statusDot.className = 'status-dot warning pulse';
        } else {
          memoryStatusEl.textContent = '記憶正常';
          statusCard.className = 'status-card modern success';
          statusDot.className = 'status-dot';
        }

        // 更新使用量顯示和顏色
        this.updateUsageDisplay(usagePercentEl, usage);
        memoryCountEl.textContent = count > 0 ? `${count} 筆` : '--';

        // 更新最後檢查時間
        this.lastStatusCheck = new Date();
        lastCheckEl.textContent = this.formatTime(this.lastStatusCheck);

        // 如果有資料，啟用複製按鈕
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
          copyBtn.disabled = count === 0 && !response.markdown;
        }

        // 如果記憶已滿，為匯出按鈕添加特殊樣式和文字
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
          const subText = exportBtn.querySelector('.export-sub-text');
          if (isFull) {
            exportBtn.classList.add('memory-full-urgent');
            if (subText) {
              subText.textContent = 'Memory Full - Export Now';
            }
          } else {
            exportBtn.classList.remove('memory-full-urgent');
            if (subText) {
              subText.textContent = 'Export Memory';
            }
          }
        }
      } else {
        memoryStatusEl.textContent = '等待檢測...';
        statusCard.className = 'status-card modern';
        statusDot.className = 'status-dot';
      }
    } catch (error) {
      console.warn('[Popup] 無法取得記憶資料:', error);

      // 檢查是否是連接錯誤
      if (error.message.includes('Could not establish connection')) {
        this.showConnectionError();
      } else {
        memoryStatusEl.textContent = '請前往記憶管理頁面';
        statusCard.className = 'status-card modern warning';
        statusDot.className = 'status-dot warning';
      }
      this.updateConnectionStatus(false);
    }
  }

  startStatusMonitoring() {
    // 每 10 秒檢查一次狀態
    this.statusCheckInterval = setInterval(() => {
      this.updateStatus();
    }, 10000);
  }

  stopStatusMonitoring() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  async handleExport() {
    const exportBtn = document.getElementById('exportBtn');
    if (!exportBtn || exportBtn.disabled) {
      return;
    }

    if (!this.currentTab?.url?.includes('chatgpt.com')) {
      this.showError('請前往 ChatGPT 網站');
      return;
    }

    try {
      this.setButtonLoading(exportBtn, true);

      // 發送匯出請求到 content script
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'exportMemories',
      });

      if (response?.success) {
        // 顯示成功狀態
        this.setButtonSuccess(exportBtn, '匯出完成');

        // 更新狀態
        await this.updateStatus();

        // 如果有 markdown 資料，顯示匯出結果區塊
        if (response.markdown) {
          this.currentExportData = {
            markdown: response.markdown,
            usage: response.usage,
            count: response.data?.length || 0,
            format: 'markdown', // 預設格式
          };

          // 顯示匯出結果區塊
          this.showExportResult(this.currentExportData);

          // 儲存到歷史記錄
          const historyItem = await this.saveToHistory({
            markdown: response.markdown,
            usage: response.usage,
            count: response.data?.length || 0,
          });

          if (historyItem) {
            // 顯示儲存成功的提示
            this.showToast(
              `已儲存 ${response.data?.length || 0} 筆記憶到歷史記錄`
            );

            // 如果記憶已滿，顯示特殊提示
            if (response.isFull) {
              this.showMemoryFullNotification(historyItem);
            }
          }
        }
      } else {
        throw new Error(response?.error || '匯出失敗');
      }
    } catch (error) {
      console.error('[Popup] 匯出失敗:', error);

      // 檢查是否是連接錯誤
      if (error.message.includes('Could not establish connection')) {
        this.setButtonError(exportBtn, '請重新整理頁面');
      } else {
        this.setButtonError(exportBtn, '匯出失敗');
      }
    } finally {
      setTimeout(() => this.resetButton(exportBtn, '匯出記憶'), 2500);
    }
  }

  // 顯示匯出結果區塊
  showExportResult(data) {
    const exportResultSection = document.getElementById('exportResultSection');
    const exportResultStats = document.getElementById('exportResultStats');

    if (exportResultSection && exportResultStats) {
      exportResultStats.textContent = `共 ${data.count} 筆記憶`;
      exportResultSection.style.display = 'block';

      // 添加顯示動畫
      setTimeout(() => {
        exportResultSection.classList.add('show');
      }, 10);

      // 設定預設選中的格式
      this.selectFormat('markdown');
    }
  }

  // 隱藏匯出結果區塊
  hideExportResult() {
    const exportResultSection = document.getElementById('exportResultSection');

    if (exportResultSection) {
      exportResultSection.classList.remove('show');
      setTimeout(() => {
        exportResultSection.style.display = 'none';
      }, 250);
    }
  }

  // 選擇格式
  selectFormat(format) {
    const formatOptions = document.querySelectorAll('.format-option');

    formatOptions.forEach(option => {
      if (option.dataset.format === format) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });

    // 更新當前選中的格式
    if (this.currentExportData) {
      this.currentExportData.format = format;
    }
  }

  // 處理複製結果
  async handleCopyResult() {
    const copyResultBtn = document.getElementById('copyResultBtn');

    if (!copyResultBtn || !this.currentExportData) {
      return;
    }

    try {
      let content = this.currentExportData.markdown;

      // 如果選擇純文字格式，轉換內容
      if (this.currentExportData.format === 'text') {
        content = this.convertMarkdownToText(content);
      }

      await navigator.clipboard.writeText(content);

      // 顯示成功狀態
      const originalText = copyResultBtn.innerHTML;
      copyResultBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
        </svg>
        已複製
      `;
      copyResultBtn.disabled = true;

      setTimeout(() => {
        copyResultBtn.innerHTML = originalText;
        copyResultBtn.disabled = false;
      }, 1500);

      // 隱藏匯出結果區塊
      setTimeout(() => {
        this.hideExportResult();
      }, 1000);
    } catch (error) {
      console.error('[Popup] 複製失敗:', error);
      this.showToast('複製失敗');
    }
  }

  // 轉換 Markdown 為純文字
  convertMarkdownToText(markdown) {
    if (!markdown) {
      return '';
    }

    return markdown
      .replace(/^#.*$/gm, '') // 移除標題
      .replace(/>\s*使用量：.*$/gm, '') // 移除使用量行
      .replace(/^共\s*\d+\s*筆$/gm, '') // 移除統計行
      .replace(/^\d+\.\s*/gm, '') // 移除編號
      .replace(/\n+/g, '\n') // 合併多個換行
      .trim();
  }

  async handleCopy() {
    const copyBtn = document.getElementById('copyBtn');
    if (!copyBtn || copyBtn.disabled) {
      return;
    }

    try {
      let markdown = window.__lastMarkdown;

      // 如果沒有快取的 markdown，嘗試從 content script 取得
      if (!markdown) {
        const response = await chrome.tabs.sendMessage(this.currentTab.id, {
          action: 'getMarkdown',
        });
        markdown = response?.markdown;
      }

      if (!markdown) {
        throw new Error('沒有可複製的資料');
      }

      await navigator.clipboard.writeText(markdown);
      this.setButtonSuccess(copyBtn, '已複製');
    } catch (error) {
      console.error('[Popup] 複製失敗:', error);

      // 檢查是否是連接錯誤
      if (error.message.includes('Could not establish connection')) {
        this.setButtonError(copyBtn, '請重新整理頁面');
      } else {
        this.setButtonError(copyBtn, '複製失敗');
      }
    } finally {
      setTimeout(() => this.resetButton(copyBtn, '複製內容'), 1500);
    }
  }

  async handleRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (!refreshBtn) {
      return;
    }

    // 添加旋轉動畫
    refreshBtn.style.transform = 'rotate(360deg)';
    refreshBtn.style.transition = 'transform 0.5s ease-in-out';

    setTimeout(() => {
      refreshBtn.style.transform = '';
      refreshBtn.style.transition = '';
    }, 500);

    await this.updateStatus();
  }

  handleSettings() {
    if (this.currentTab?.url?.includes('chatgpt.com')) {
      // 在當前分頁中添加hash參數
      const currentUrl = this.currentTab.url;
      const newUrl = `${currentUrl.split('#')[0]}#settings/Personalization`;
      chrome.tabs.update(this.currentTab.id, {
        url: newUrl,
      });
      window.close();
    } else {
      // 開啟新分頁
      chrome.tabs.create({
        url: 'https://chatgpt.com/#settings/Personalization',
      });
    }
  }

  setButtonLoading(button, loading = true) {
    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
    } else {
      button.disabled = false;
      button.classList.remove('loading');
    }
  }

  setButtonSuccess(button, text) {
    button.disabled = false;
    button.classList.remove('loading', 'error');
    button.classList.add('success');

    // 處理匯出按鈕的文字更新
    const exportTextEl = button.querySelector('.export-main-text');
    const copyTextEl = button.querySelector('.copy-text');

    if (exportTextEl) {
      exportTextEl.textContent = text;
    } else if (copyTextEl) {
      copyTextEl.textContent = text;
    }
  }

  setButtonError(button, text) {
    button.disabled = false;
    button.classList.remove('loading', 'success');
    button.classList.add('error');

    // 處理匯出按鈕的文字更新
    const exportTextEl = button.querySelector('.export-main-text');
    const copyTextEl = button.querySelector('.copy-text');

    if (exportTextEl) {
      exportTextEl.textContent = text;
    } else if (copyTextEl) {
      copyTextEl.textContent = text;
    }
  }

  resetButton(button, originalText) {
    button.disabled = false;
    button.classList.remove('loading', 'success', 'error');

    // 處理匯出按鈕的文字重置
    const exportTextEl = button.querySelector('.export-main-text');
    const copyTextEl = button.querySelector('.copy-text');

    if (exportTextEl) {
      exportTextEl.textContent = originalText;
    } else if (copyTextEl) {
      copyTextEl.textContent = originalText;
    }
  }

  showError(message) {
    const memoryStatusEl = document.getElementById('memoryStatus');
    const statusCard = document.getElementById('statusCard');
    const statusDot = document.getElementById('statusDot');

    if (memoryStatusEl) {
      memoryStatusEl.textContent = message;
      statusCard.className = 'status-card modern warning';
      statusDot.className = 'status-dot error';
    }
  }

  showConnectionError() {
    const memoryStatusEl = document.getElementById('memoryStatus');
    const statusCard = document.getElementById('statusCard');
    const statusDot = document.getElementById('statusDot');

    if (memoryStatusEl) {
      memoryStatusEl.textContent = '擴充套件未載入';
      statusCard.className = 'status-card modern warning';
      statusDot.className = 'status-dot error';
    }

    // 禁用所有按鈕
    const exportBtn = document.getElementById('exportBtn');
    const copyBtn = document.getElementById('copyBtn');
    if (exportBtn) {
      exportBtn.disabled = true;
    }
    if (copyBtn) {
      copyBtn.disabled = true;
    }
  }

  updateConnectionStatus(connected) {
    const connectionStatus = document.getElementById('connectionStatus');
    if (connectionStatus) {
      connectionStatus.textContent = connected ? '已連接' : '未連接';
      connectionStatus.className = connected
        ? 'status-text'
        : 'status-text disconnected';
    }
  }

  formatTime(date) {
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      // 小於 1 分鐘
      return '剛剛';
    } else if (diff < 3600000) {
      // 小於 1 小時
      const minutes = Math.floor(diff / 60000);
      return `${minutes} 分鐘前`;
    } else {
      return date.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  updateUsageDisplay(element, usage) {
    element.textContent = usage;

    // 解析百分比並設置顏色
    if (usage && usage !== '--') {
      const percentage = parseInt(usage.replace('%', ''));
      if (!isNaN(percentage)) {
        element.classList.remove(
          'usage-normal',
          'usage-warning',
          'usage-critical'
        );

        if (percentage >= 100) {
          element.classList.add('usage-critical');
        } else if (percentage >= 80) {
          element.classList.add('usage-warning');
        } else {
          element.classList.add('usage-normal');
        }
      }
    }
  }

  showNotOnChatGPT() {
    const memoryStatusEl = document.getElementById('memoryStatus');
    const statusCard = document.getElementById('statusCard');
    const statusDot = document.getElementById('statusDot');
    const actionSection = document.querySelector('.action-section');

    if (memoryStatusEl) {
      memoryStatusEl.textContent = '請前往 ChatGPT 網站';
      statusCard.className = 'status-card modern warning';
      statusDot.className = 'status-dot warning';
    }

    // 隱藏原本的按鈕，顯示 ChatGPT 導航按鈕
    if (actionSection) {
      actionSection.innerHTML = `
<button class="action-btn primary modern" id="goChatGPTBtn">
  <div class="btn-content">
    <svg width="18" height="18" viewBox="0 0 24 24" class="btn-icon">
      <path
        fill="currentColor"
        d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"
      />
    </svg>
    <span class="btn-text">前往 ChatGPT 網站</span>
  </div>
  <div class="btn-ripple"></div>
</button>
      `;

      // 添加點擊事件
      const goChatGPTBtn = document.getElementById('goChatGPTBtn');
      if (goChatGPTBtn) {
        goChatGPTBtn.addEventListener('click', () => {
          chrome.tabs.create({
            url: 'https://chatgpt.com/',
          });
          window.close();
        });
      }
    }

    this.updateConnectionStatus(false);
  }

  // 儲存到歷史記錄
  async saveToHistory(memoryData) {
    if (!this.storageManager) {
      return;
    }

    try {
      await this.storageManager.saveMemoryHistory(memoryData);
      await this.updateStorageInfo();

      // 如果歷史記憶區塊已經顯示，立即更新內容
      const historySection = document.getElementById('historySection');
      if (
        historySection &&
        (historySection.style.display !== 'none' ||
          historySection.classList.contains('show'))
      ) {
        console.log('[Popup] 歷史區塊已開啟，立即更新歷史記錄');
        await this.loadHistory();
      }
    } catch (error) {
      console.error('[Popup] 儲存歷史記錄失敗:', error);
    }
  }

  // 切換歷史記憶區
  async toggleHistory() {
    const historySection = document.getElementById('historySection');
    const settingsSection = document.getElementById('settingsSection');

    if (historySection.style.display === 'none') {
      // 關閉設定區
      if (settingsSection.style.display !== 'none') {
        settingsSection.classList.remove('show');
        setTimeout(() => {
          settingsSection.style.display = 'none';
        }, 250);
      }

      // 開啟歷史區
      historySection.style.display = 'block';
      setTimeout(() => {
        historySection.classList.add('show');
      }, 10);

      // 載入歷史記錄
      await this.loadHistory();
    } else {
      // 關閉歷史區
      historySection.classList.remove('show');
      setTimeout(() => {
        historySection.style.display = 'none';
      }, 250);
    }
  }

  // 載入歷史記錄
  async loadHistory() {
    if (!this.storageManager) {
      return;
    }

    const historyList = document.getElementById('historyList');

    // 顯示載入指示器
    historyList.innerHTML = `
      <div class="history-empty">
        <div class="empty-text">載入中...</div>
      </div>
    `;

    try {
      const history = await this.storageManager.getMemoryHistory();

      if (history.length === 0) {
        historyList.innerHTML = `
<div class="history-empty">
  <svg width="48" height="48" viewBox="0 0 24 24" class="empty-icon">
    <path fill="currentColor" d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3"/>
  </svg>
  <div class="empty-text">尚無歷史記錄</div>
  <div class="empty-desc">匯出記憶後會自動儲存到這裡</div>
</div>
        `;
        return;
      }

      const historyHTML = history
        .map(
          item => `
<div class="history-item" data-id="${item.id}">
  <div class="history-icon">${item.date.split('/')[1]}/${item.date.split('/')[2]}</div>
  <div class="history-content">
    <div class="history-meta">
      <span class="history-date">${item.date}</span>
      <span class="history-time">${item.time}</span>
    </div>
    <div class="history-stats">
      <span>使用量: ${item.usage}</span>
      <span>數量: ${item.count} 筆</span>
    </div>
    <div class="history-preview">${this.getPreview(item.content)}</div>
  </div>
  <div class="history-actions">
    <button class="history-action-btn copy-btn" data-id="${item.id}" title="複製">
      <svg width="12" height="12" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
      </svg>
    </button>
    <button class="history-action-btn delete-btn" data-id="${item.id}" title="刪除">
      <svg width="12" height="12" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
      </svg>
    </button>
  </div>
</div>
      `
        )
        .join('');

      historyList.innerHTML = historyHTML;

      // 添加點擊事件
      historyList.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', e => {
          if (!e.target.closest('.history-actions')) {
            this.loadHistoryItem(item.dataset.id);
          }
        });
      });

      // 添加複製按鈕事件
      historyList.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.dataset.id;
          this.copyHistoryItem(id);
        });
      });

      // 添加刪除按鈕事件
      historyList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.dataset.id;
          this.deleteHistoryItem(id);
        });
      });
    } catch (error) {
      console.error('[Popup] 載入歷史記錄失敗:', error);
    }
  }

  // 取得內容預覽
  getPreview(content) {
    if (!content) {
      return '無內容';
    }

    // 移除 Markdown 標記並取得前 100 個字元
    const plainText = content
      .replace(/^#.*$/gm, '') // 移除標題
      .replace(/>\s*使用量：.*$/gm, '') // 移除使用量行
      .replace(/^共\s*\d+\s*筆$/gm, '') // 移除統計行
      .replace(/^\d+\.\s*/gm, '') // 移除編號
      .replace(/\n+/g, ' ') // 替換換行為空格
      .trim();

    return plainText.length > 100
      ? `${plainText.substring(0, 100)}...`
      : plainText;
  }

  // 載入歷史項目
  async loadHistoryItem(id) {
    if (!this.storageManager) {
      return;
    }

    try {
      const history = await this.storageManager.getMemoryHistory();
      const item = history.find(h => h.id === id);

      if (item) {
        window.__lastMarkdown = item.content;
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
          copyBtn.disabled = false;
        }

        // 顯示載入成功的提示
        this.showToast('歷史記錄已載入');
      }
    } catch (error) {
      console.error('[Popup] 載入歷史項目失敗:', error);
    }
  }

  // 複製歷史項目
  async copyHistoryItem(id) {
    if (!this.storageManager) {
      return;
    }

    try {
      const history = await this.storageManager.getMemoryHistory();
      const item = history.find(h => h.id === id);

      if (item && item.content) {
        await navigator.clipboard.writeText(item.content);
        this.showToast('已複製到剪貼簿');
      }
    } catch (error) {
      console.error('[Popup] 複製歷史項目失敗:', error);
      this.showToast('複製失敗');
    }
  }

  // 刪除歷史項目
  async deleteHistoryItem(id) {
    if (!this.storageManager) {
      return;
    }

    try {
      await this.storageManager.deleteHistoryItem(id);
      await this.loadHistory();
      await this.updateStorageInfo();
      this.showToast('已刪除');
    } catch (error) {
      console.error('[Popup] 刪除歷史項目失敗:', error);
    }
  }

  // 清空歷史記錄
  async clearHistory() {
    if (!this.storageManager) {
      return;
    }

    if (confirm('確定要清空所有歷史記錄嗎？此操作無法復原。')) {
      try {
        await this.storageManager.clearHistory();
        await this.loadHistory();
        await this.updateStorageInfo();
        this.showToast('歷史記錄已清空');
      } catch (error) {
        console.error('[Popup] 清空歷史記錄失敗:', error);
      }
    }
  }

  // 切換設定區
  async toggleSettings() {
    const settingsSection = document.getElementById('settingsSection');
    const historySection = document.getElementById('historySection');

    if (settingsSection.style.display === 'none') {
      // 關閉歷史區
      if (historySection.style.display !== 'none') {
        historySection.classList.remove('show');
        setTimeout(() => {
          historySection.style.display = 'none';
        }, 250);
      }

      // 開啟設定區
      settingsSection.style.display = 'block';
      setTimeout(() => {
        settingsSection.classList.add('show');
      }, 10);

      // 載入設定
      await this.loadSettings();
    } else {
      // 關閉設定區
      settingsSection.classList.remove('show');
      setTimeout(() => {
        settingsSection.style.display = 'none';
      }, 250);
    }
  }

  // 載入設定
  async loadSettings() {
    if (!this.storageManager) {
      return;
    }

    try {
      this.settings = await this.storageManager.getSettings();

      // 更新 UI
      const autoShowModalToggle = document.getElementById(
        'autoShowModalToggle'
      );
      const maxHistorySelect = document.getElementById('maxHistorySelect');
      const autoCleanupToggle = document.getElementById('autoCleanupToggle');
      const developerModeToggle = document.getElementById(
        'developerModeToggle'
      );

      if (autoShowModalToggle) {
        autoShowModalToggle.checked = this.settings.autoShowModal;
      }
      if (maxHistorySelect) {
        maxHistorySelect.value = this.settings.maxHistoryItems;
      }
      if (autoCleanupToggle) {
        autoCleanupToggle.checked = this.settings.autoCleanup;
      }
      if (developerModeToggle) {
        developerModeToggle.checked = this.settings.developerMode || false;
      }

      await this.updateStorageInfo();
    } catch (error) {
      console.error('[Popup] 載入設定失敗:', error);
    }
  }

  // 更新設定
  async updateSetting(key, value) {
    if (!this.storageManager) {
      return;
    }

    try {
      this.settings[key] = value;
      await this.storageManager.saveSettings(this.settings);
      this.showToast('設定已儲存');
    } catch (error) {
      console.error('[Popup] 更新設定失敗:', error);
    }
  }

  // 更新開發者模式
  async updateDeveloperMode(enabled) {
    if (!this.storageManager) {
      return;
    }

    try {
      this.settings.developerMode = enabled;
      await this.storageManager.saveSettings(this.settings);

      // 通知 content script 更新開發者工具
      if (this.currentTab?.url?.includes('chatgpt.com')) {
        try {
          await chrome.tabs.sendMessage(this.currentTab.id, {
            action: 'updateDeveloperMode',
            enabled,
          });
        } catch (error) {
          // 忽略通訊錯誤
        }
      }

      this.showToast(enabled ? '開發者模式已啟用' : '開發者模式已關閉');
    } catch (error) {
      console.error('[Popup] 更新開發者模式失敗:', error);
    }
  }

  // 更新儲存資訊
  async updateStorageInfo() {
    if (!this.storageManager) {
      return;
    }

    try {
      const usage = await this.storageManager.getStorageUsage();
      const storageBar = document.getElementById('storageBar');
      const storageText = document.getElementById('storageText');

      if (storageBar) {
        storageBar.style.width = `${usage.percentage}%`;

        // 根據使用量設定顏色
        if (usage.percentage > 80) {
          storageBar.style.background = 'var(--error-color)';
        } else if (usage.percentage > 60) {
          storageBar.style.background = 'var(--warning-color)';
        } else {
          storageBar.style.background = 'var(--primary-color)';
        }
      }

      if (storageText) {
        const usedMB = (usage.used / 1024 / 1024).toFixed(1);
        const totalMB = (usage.total / 1024 / 1024).toFixed(0);
        storageText.textContent = `${usedMB} / ${totalMB} MB`;
      }
    } catch (error) {
      console.error('[Popup] 更新儲存資訊失敗:', error);
    }
  }

  // 顯示 Toast 通知
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon =
      type === 'success'
        ? '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/></svg>'
        : type === 'error'
          ? '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>';

    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // 添加顯示動畫
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // 自動消失
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // 顯示記憶已滿的通知
  showMemoryFullNotification(historyItem) {
    this.showToast(
      `記憶已滿 - 已自動匯出 ${historyItem.count} 筆記憶到歷史記錄`,
      'success'
    );
  }

  // 檢測頁面中的記憶已滿元素
  async detectMemoryFullElement() {
    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'detectMemoryFull',
      });
      return response?.memoryFull || false;
    } catch (error) {
      console.warn('[Popup] 檢測記憶已滿元素失敗:', error);
      return false;
    }
  }

  // 清理資源
  destroy() {
    this.stopStatusMonitoring();
  }
}

// 當 DOM 載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
  window.popupManager = new ModernPopupManager();
});

// 當視窗關閉時清理資源
window.addEventListener('beforeunload', () => {
  if (window.popupManager) {
    window.popupManager.destroy();
  }
});

// 監聽來自 content script 的訊息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'memoryStatusUpdate') {
    // 更新記憶狀態顯示
    const memoryStatusEl = document.getElementById('memoryStatus');
    const statusCard = document.getElementById('statusCard');
    const statusDot = document.getElementById('statusDot');

    if (memoryStatusEl) {
      memoryStatusEl.textContent = message.status || '檢查中...';

      if (message.isFull) {
        statusCard.className = 'status-card modern warning';
        statusDot.className = 'status-dot warning';
      } else {
        statusCard.className = 'status-card modern success';
        statusDot.className = 'status-dot';
      }
    }

    sendResponse({ success: true });
  }
});
