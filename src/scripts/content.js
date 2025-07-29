// ChatGPT Memory Manager - Content Script
// 基於 chatgpt-memory-manager.js 的簡化版本
// 自動檢測記憶已滿並匯出 Markdown 格式

(() => {
  // 防止重複執行
  if (window.__MEMORY_MANAGER_LOADED__) {
    console.info('[Memory Manager] 已在運行中');
    return;
  }
  window.__MEMORY_MANAGER_LOADED__ = true;

  // 配置設定
  const CONFIG = {
    debug: true,
    triggerText: '儲存的記憶已滿',
    targetURL: 'https://chatgpt.com/#settings/Personalization',

    // 選擇器
    personalizationTabSel: '[data-testid="personalization-tab"][role="tab"]',
    memoryKeywords: ['管理記憶', 'Manage memory', 'Memory', '記憶'],
    modalTitleKeywords: ['儲存的記憶', 'Saved memories', 'Memories'],

    // 等待時間
    waitSettingsMs: 15000,
    waitTabMs: 12000,
    waitPanelMs: 10000,
    waitMemoryMs: 15000,
    waitModalMs: 20000,
    waitTableMs: 12000,
    waitRowsMs: 12000,

    clickDelayMs: 100,
    maxScanMs: 40000,
    stepRatio: 0.6,
    idleRoundsToStop: 8,
    settleMs: 70,
    endBounceMs: 140,
  };

  // 工具函數
  const log = (...args) =>
    CONFIG.debug && console.log('[Memory Manager]', ...args);
  const warn = (...args) => console.warn('[Memory Manager]', ...args);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const raf = () => new Promise(resolve => requestAnimationFrame(resolve));

  // 檢查元素是否可見
  const isVisible = element => {
    if (!element || !(element instanceof Element)) return false;
    const style = getComputedStyle(element);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      +style.opacity === 0
    ) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    return !(
      rect.bottom < 0 ||
      rect.top > innerHeight ||
      rect.right < 0 ||
      rect.left > innerWidth
    );
  };

  // 檢查是否出現觸發文字
  const hasTriggerText = () => {
    return Array.from(document.querySelectorAll('div')).some(div =>
      div.textContent?.includes(CONFIG.triggerText)
    );
  };

  // 等待元素出現
  function waitFor(checkFunction, timeoutMs) {
    return new Promise((resolve, reject) => {
      let done = false;
      const startTime = performance.now();

      const check = () => {
        if (done) return;
        try {
          const result = checkFunction();
          if (result) {
            done = true;
            observer.disconnect();
            resolve(result);
            return;
          }
          if (performance.now() - startTime >= timeoutMs) {
            done = true;
            observer.disconnect();
            reject(new Error('timeout'));
          }
        } catch (error) {
          done = true;
          observer.disconnect();
          reject(error);
        }
      };

      const observer = new MutationObserver(check);
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
      check(); // 初始檢查
    });
  }

  // 等待可見元素
  function waitForVisible(selectorOrFunction, timeoutMs) {
    return waitFor(() => {
      const element =
        typeof selectorOrFunction === 'string'
          ? document.querySelector(selectorOrFunction)
          : selectorOrFunction();
      return element && isVisible(element) ? element : null;
    }, timeoutMs);
  }

  // 模擬人類點擊
  async function humanClick(element) {
    if (!(element instanceof Element)) throw new Error('humanClick: 不是元素');

    element.scrollIntoView({ block: 'center', inline: 'center' });
    await raf();

    const rect = element.getBoundingClientRect();
    const centerX =
      rect.left + Math.min(rect.width - 2, Math.max(2, rect.width / 2));
    const centerY =
      rect.top + Math.min(rect.height - 2, Math.max(2, rect.height / 2));

    const createMouseEvent = type =>
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: centerY,
      });

    const createPointerEvent = type =>
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: centerY,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
      });

    // 模擬完整的點擊序列
    element.dispatchEvent(createPointerEvent('pointerover'));
    element.dispatchEvent(createMouseEvent('mouseover'));
    element.dispatchEvent(createPointerEvent('pointerenter'));
    element.dispatchEvent(createMouseEvent('mouseenter'));
    element.dispatchEvent(createPointerEvent('pointerdown'));
    element.dispatchEvent(createMouseEvent('mousedown'));
    element.focus?.();
    element.dispatchEvent(createPointerEvent('pointerup'));
    element.dispatchEvent(createMouseEvent('mouseup'));
    element.dispatchEvent(createMouseEvent('click'));

    await sleep(CONFIG.clickDelayMs);
  }

  // 開啟個人化設定頁面
  async function openPersonalizationSettings() {
    // 如果在 ChatGPT 網站上，在當前 URL 後面添加 hash
    if (location.href.includes('chatgpt.com')) {
      // 獲取當前 URL（不包含 hash 部分）
      const currentUrl = location.origin + location.pathname + location.search;
      const targetUrl = currentUrl + '#settings/Personalization';

      log('跳轉到個人化設定:', targetUrl);

      // 如果當前 hash 不是設定頁面，則更新 URL
      if (!location.hash.includes('settings/Personalization')) {
        location.href = targetUrl;
      }
    } else {
      // 如果不在 ChatGPT 網站，跳轉到完整 URL
      location.href = CONFIG.targetURL;
    }

    const tab = await waitForVisible(
      CONFIG.personalizationTabSel,
      CONFIG.waitSettingsMs
    );
    log('找到個人化分頁', tab);

    if (tab.getAttribute('aria-selected') !== 'true') {
      await humanClick(tab);
    }

    const panelId = tab.getAttribute('aria-controls');
    await waitForVisible(() => {
      const panel = panelId ? document.getElementById(panelId) : null;
      return panel &&
        panel.getAttribute('data-state') === 'active' &&
        !panel.hidden &&
        isVisible(panel)
        ? panel
        : null;
    }, CONFIG.waitPanelMs);

    const panel = document.getElementById(panelId);
    log('個人化面板已啟用', panel);
    return panel;
  }

  // 尋找記憶管理相關元素
  function findMemoryElements(root) {
    return Array.from(
      root.querySelectorAll('div,h1,h2,h3,h4,h5,h6,span,p,button,[role]')
    )
      .filter(isVisible)
      .filter(element => {
        const text = (element.innerText || element.textContent || '').trim();
        return (
          text && CONFIG.memoryKeywords.some(keyword => text.includes(keyword))
        );
      });
  }

  // 取得記憶容器
  function getMemoryContainer(headerElement) {
    return (
      headerElement.closest('div.w-full,section,[data-section],.card,.panel') ||
      headerElement.parentElement ||
      headerElement
    );
  }

  // 提取使用率百分比
  function extractUsagePercent(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    const texts = [];

    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim();
      if (text) texts.push(text);
    }

    const joinedText = texts.join(' ');
    const match = joinedText.match(/(\d{1,3})\s*%\s*滿?/);
    return match
      ? `${Math.max(0, Math.min(100, parseInt(match[1], 10)))}%`
      : null;
  }

  // 尋找管理按鈕
  function findManageButton(root) {
    return (
      Array.from(root.querySelectorAll('button,.btn,[role="button"]'))
        .filter(isVisible)
        .find(
          button =>
            (button.innerText || button.textContent || '').trim() === '管理'
        ) || null
    );
  }

  // 讀取使用率並點擊管理
  async function readUsageAndClickManage(panelRoot) {
    const section = await waitFor(() => {
      const headers = findMemoryElements(panelRoot);
      if (!headers.length) return null;
      headers.sort(
        (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
      );
      return getMemoryContainer(headers[0]);
    }, CONFIG.waitMemoryMs);

    log('找到記憶管理區塊', section);

    const usagePercent = extractUsagePercent(section);
    if (usagePercent) {
      window.__memoryUsagePercent = usagePercent;
      console.info('[Memory Manager] 記憶使用量：', usagePercent);
    }

    const manageButton = await waitForVisible(
      () => findManageButton(section),
      8000
    );
    await humanClick(manageButton);
    log('已點擊管理按鈕');
    return usagePercent;
  }

  // 尋找記憶模態窗
  function findMemoryModal() {
    const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
      .filter(isVisible)
      .filter(heading =>
        CONFIG.modalTitleKeywords.some(keyword =>
          (heading.innerText || heading.textContent || '').includes(keyword)
        )
      );

    for (const heading of headings) {
      const root =
        heading.closest('.popover,[role="dialog"],[aria-modal="true"]') ||
        heading.closest('div[id],section,div');
      if (root && isVisible(root)) return root;
    }
    return null;
  }

  // 等待記憶模態窗出現
  async function waitForMemoryModal() {
    const modal = await waitFor(() => findMemoryModal(), CONFIG.waitModalMs);
    log('記憶模態窗已開啟', modal);
    return modal;
  }

  // 定位表格和滾動容器
  function locateTableAndScroller(modalRoot) {
    const table = modalRoot.querySelector('table');
    let scroller =
      table?.closest('[class*="overflow-y"],[style*="overflow-y"]') || null;

    if (!scroller) {
      const candidates = Array.from(
        modalRoot.querySelectorAll(
          '[class*="overflow"],[style*="overflow"],.overflow-y-auto,.overflow-auto'
        )
      );
      scroller =
        candidates.find(el => el.querySelector('table')) ||
        candidates.find(el => el.scrollHeight > el.clientHeight);
    }

    if (!scroller && table) {
      let parent = table.parentElement;
      while (parent && parent !== modalRoot) {
        if (parent.scrollHeight > parent.clientHeight) {
          scroller = parent;
          break;
        }
        parent = parent.parentElement;
      }
    }

    return { table: table || null, scroller: scroller || modalRoot };
  }

  // 後備收集方法
  function collectRowsFallback(modalRoot) {
    const results = [];
    const rows = Array.from(modalRoot.querySelectorAll('[role="row"]')).filter(
      isVisible
    );

    if (rows.length) {
      for (const row of rows) {
        const cell =
          row.querySelector('[role="cell"], .whitespace-pre-wrap, .py-2') ||
          row;
        const text = (cell.innerText || cell.textContent || '')
          .replace(/\s+\n/g, '\n')
          .replace(/[ \t]+/g, ' ')
          .trim();
        if (text) results.push(text);
      }
      return results;
    }

    Array.from(modalRoot.querySelectorAll('td,.whitespace-pre-wrap,.py-2'))
      .filter(isVisible)
      .forEach(element => {
        const text = (element.innerText || element.textContent || '')
          .replace(/\s+\n/g, '\n')
          .replace(/[ \t]+/g, ' ')
          .trim();
        if (text) results.push(text);
      });

    return results;
  }

  // 等待列表準備就緒
  async function waitForListReady(modalRoot) {
    let { table, scroller } = locateTableAndScroller(modalRoot);

    if (!table) {
      await waitFor(() => {
        const foundTable = modalRoot.querySelector('table');
        return foundTable || null;
      }, CONFIG.waitTableMs).catch(() => {});
      ({ table, scroller } = locateTableAndScroller(modalRoot));
    }

    if (table) {
      await waitFor(
        () => table.querySelector('tbody > tr'),
        CONFIG.waitRowsMs
      ).catch(() => {});
    }

    if (!table || !table.querySelector('tbody > tr')) {
      const fallbackResults = collectRowsFallback(modalRoot);
      if (fallbackResults.length)
        return { mode: 'fallback', table: null, scroller };
    }

    return { mode: table ? 'table' : 'fallback', table, scroller };
  }

  // 取得行文字內容
  function getRowText(tableRow) {
    try {
      const firstCell =
        tableRow.querySelector('td:nth-child(1)') ||
        tableRow.querySelector('td') ||
        tableRow;
      const innerElement =
        firstCell.querySelector('.whitespace-pre-wrap, .py-2') || firstCell;
      return (innerElement.innerText || innerElement.textContent || '')
        .replace(/\s+\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .trim();
    } catch (error) {
      return '';
    }
  }

  // 收集所有記憶項目
  async function harvestAllMemories(modalRoot, mode, table, scroller) {
    const memorySet = new Set();

    const harvestCurrentView = () => {
      if (mode === 'table' && table) {
        Array.from(table.querySelectorAll('tbody > tr'))
          .filter(isVisible)
          .forEach(row => {
            const text = getRowText(row);
            if (text) memorySet.add(text);
          });
      } else {
        collectRowsFallback(modalRoot).forEach(text => memorySet.add(text));
      }
    };

    const scrollStep = () => {
      const deltaY = Math.max(
        80,
        Math.floor(scroller.clientHeight * CONFIG.stepRatio)
      );
      scroller.dispatchEvent(
        new WheelEvent('wheel', {
          bubbles: true,
          cancelable: true,
          deltaX: 0,
          deltaY: deltaY,
        })
      );
    };

    const keyStep = () => {
      scroller.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'PageDown',
          code: 'PageDown',
          bubbles: true,
        })
      );
    };

    const startTime = performance.now();
    let lastCount = -1;
    let idleRounds = 0;

    // 從頂部開始
    scroller.scrollTop = 0;
    await sleep(CONFIG.endBounceMs);
    harvestCurrentView();

    while (performance.now() - startTime < CONFIG.maxScanMs) {
      // 滾動到下一個位置
      scroller.scrollTop = Math.min(
        scroller.scrollTop +
          Math.floor(scroller.clientHeight * CONFIG.stepRatio),
        scroller.scrollHeight
      );
      await raf();
      await sleep(CONFIG.settleMs);

      // 如果是表格模式，確保最後一行可見
      if (mode === 'table' && table) {
        const rows = table.querySelectorAll('tbody > tr');
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
          lastRow.scrollIntoView({ block: 'end' });
          await raf();
          await sleep(40);
        }
      }

      // 額外的滾動操作
      scrollStep();
      await sleep(30);
      keyStep();
      await sleep(30);

      harvestCurrentView();

      const currentCount = memorySet.size;
      if (currentCount === lastCount) {
        idleRounds++;
      } else {
        idleRounds = 0;
        lastCount = currentCount;
      }

      const isAtBottom =
        Math.abs(
          scroller.scrollTop + scroller.clientHeight - scroller.scrollHeight
        ) < 2;

      if (
        (idleRounds >= CONFIG.idleRoundsToStop && isAtBottom) ||
        idleRounds >= CONFIG.idleRoundsToStop + 4
      ) {
        break;
      }
    }

    // 最後回到頂部再收集一次
    scroller.scrollTop = 0;
    await sleep(CONFIG.endBounceMs);
    harvestCurrentView();

    return Array.from(memorySet);
  }

  // 建立 Markdown 格式
  function buildMarkdown({ title, usageText, items }) {
    const header = `# ${title || '儲存的記憶'}`;
    const usage = usageText ? `\n> 使用量：${usageText}\n` : '';
    const itemList = items.length
      ? '\n' + items.map((text, index) => `${index + 1}. ${text}`).join('\n')
      : '\n（無資料）';
    return `${header}${usage}\n共 ${items.length} 筆\n${itemList}\n`;
  }

  // 收集記憶並轉換為 Markdown
  async function scrapeMemoriesToMarkdown() {
    const modal = await waitForMemoryModal();

    const heading = Array.from(modal.querySelectorAll('h1,h2,h3')).find(h =>
      CONFIG.modalTitleKeywords.some(keyword =>
        (h.innerText || '').includes(keyword)
      )
    );
    const titleText = (heading?.innerText || '儲存的記憶').trim();

    const usageBox = modal.querySelector(
      '.rounded-lg.border.p-1,.rounded-lg.border'
    );
    const usageText = usageBox ? extractUsagePercent(usageBox) : null;

    const { mode, table, scroller } = await waitForListReady(modal);
    log('收集模式：', mode);

    const items = await harvestAllMemories(modal, mode, table, scroller);
    const markdown = buildMarkdown({ title: titleText, usageText, items });

    console.log(markdown);
    window.__memoryList = items;
    window.__memoryMarkdown = markdown;

    try {
      await navigator.clipboard.writeText(markdown);
      console.info('[Memory Manager] Markdown 已複製到剪貼簿');
    } catch (error) {}

    log(`完成：共收集 ${items.length} 筆記憶`);
    return markdown;
  }

  // 主要流程
  async function mainFlow() {
    log('偵測到「儲存的記憶已滿」→ 開始自動匯出流程');
    const panel = await openPersonalizationSettings();
    await readUsageAndClickManage(panel);
    await scrapeMemoriesToMarkdown();
  }

  // 記憶狀態檢測
  function checkMemoryStatus() {
    const isMemoryFull = hasTriggerText();
    const currentStatus = {
      isFull: isMemoryFull,
      timestamp: Date.now(),
      url: location.href,
    };

    // 儲存狀態到全域變數
    window.__memoryStatus = currentStatus;

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

  // 顯示自動提醒模態窗
  function showAutoExportModal() {
    // 檢查是否已經有模態窗
    if (document.getElementById('memoryFullModal')) {
      return;
    }

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
          <button id="modalCancelBtn" class="memory-modal-btn secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
            </svg>
            <span>稍後處理</span>
          </button>
          <button id="modalExportBtn" class="memory-modal-btn primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2M18 20H6V4H13V9H18V20Z"/>
            </svg>
            <span>立即匯出</span>
          </button>
        </div>
      </div>
    `;

    // 添加樣式
    const style = document.createElement('style');
    style.id = 'memoryModalStyles';
    style.textContent = `
      .memory-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        animation: modalFadeIn 0.3s ease-out;
      }

      .memory-modal-content {
        background: #ffffff;
        border-radius: 16px;
        padding: 0;
        max-width: 420px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border: 1px solid #e2e8f0;
        overflow: hidden;
        animation: modalSlideIn 0.3s ease-out;
      }

      .memory-modal-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-bottom: 1px solid #e2e8f0;
      }

      .memory-modal-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3);
      }

      .memory-modal-title-section {
        flex: 1;
      }

      .memory-modal-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        line-height: 1.2;
      }

      .memory-modal-subtitle {
        margin: 4px 0 0 0;
        font-size: 14px;
        color: #64748b;
        font-weight: 500;
      }

      .memory-modal-status {
        display: flex;
        align-items: center;
      }

      .memory-status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #10b981;
        animation: pulse 2s infinite;
      }

      .memory-status-dot.warning {
        background: #f59e0b;
      }

      .memory-modal-body {
        padding: 24px;
      }

      .memory-alert-content {
        display: flex;
        gap: 16px;
        margin-bottom: 20px;
      }

      .memory-alert-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        color: #f59e0b;
        margin-top: 2px;
      }

      .memory-alert-text {
        flex: 1;
      }

      .memory-alert-text p {
        margin: 0;
        color: #475569;
        line-height: 1.6;
        font-size: 15px;
      }

      .memory-usage-info {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
      }

      .usage-bar {
        height: 8px;
        background: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 12px;
      }

      .usage-fill {
        height: 100%;
        background: linear-gradient(90deg, #f59e0b 0%, #dc2626 100%);
        border-radius: 4px;
        transition: width 0.3s ease;
      }

      .usage-text {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .usage-label {
        font-size: 14px;
        color: #64748b;
        font-weight: 500;
      }

      .usage-value {
        font-size: 14px;
        font-weight: 600;
        color: #dc2626;
      }

      .memory-modal-actions {
        display: flex;
        gap: 12px;
        padding: 20px 24px 24px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
      }

      .memory-modal-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        flex: 1;
        justify-content: center;
        min-height: 44px;
      }

      .memory-modal-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);
      }

      .memory-modal-btn.primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 8px -1px rgba(102, 126, 234, 0.4);
      }

      .memory-modal-btn.secondary {
        background: #ffffff;
        color: #475569;
        border: 1px solid #d1d5db;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }

      .memory-modal-btn.secondary:hover {
        background: #f8fafc;
        border-color: #9ca3af;
      }

      .memory-modal-btn:active {
        transform: translateY(0);
      }

      .memory-modal-btn svg {
        flex-shrink: 0;
      }

      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes modalSlideIn {
        from { 
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 480px) {
        .memory-modal-content {
          margin: 20px;
          width: calc(100% - 40px);
        }
        
        .memory-modal-header {
          padding: 20px;
        }
        
        .memory-modal-body {
          padding: 20px;
        }
        
        .memory-modal-actions {
          flex-direction: column;
          padding: 16px 20px 20px;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // 添加事件監聽器
    document.getElementById('modalCancelBtn').addEventListener('click', () => {
      modal.style.animation = 'modalFadeIn 0.2s ease-out reverse';
      setTimeout(() => {
        modal.remove();
        style.remove();
      }, 200);
    });

    document
      .getElementById('modalExportBtn')
      .addEventListener('click', async () => {
        const exportBtn = document.getElementById('modalExportBtn');
        exportBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
        </svg>
        <span>匯出中...</span>
      `;
        exportBtn.disabled = true;

        try {
          await mainFlow();
          // 匯出成功後顯示結果模態窗
          showExportResultModal();
          modal.remove();
          style.remove();
        } catch (error) {
          warn('模態窗匯出失敗:', error);
          exportBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
          </svg>
          <span>匯出失敗</span>
        `;
          setTimeout(() => {
            modal.remove();
            style.remove();
          }, 2000);
        }
      });

    // 點擊背景關閉
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.style.animation = 'modalFadeIn 0.2s ease-out reverse';
        setTimeout(() => {
          modal.remove();
          style.remove();
        }, 200);
      }
    });
  }

  // 顯示匯出結果模態窗
  function showExportResultModal() {
    // 檢查是否已經有結果模態窗
    if (document.getElementById('exportResultModal')) {
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'exportResultModal';
    modal.className = 'memory-modal-overlay';

    const memoryCount = window.__memoryList ? window.__memoryList.length : 0;
    const usagePercent = window.__memoryUsagePercent || '100%';

    modal.innerHTML = `
      <div class="memory-modal-content">
        <div class="memory-modal-header">
          <div class="memory-modal-icon success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
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
          <div class="export-summary">
            <div class="summary-item">
              <div class="summary-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V21A2 2 0 0 0 5 23H19A2 2 0 0 0 21 21V9M19 9H14V4H5V21H19V9Z"/>
                </svg>
              </div>
              <div class="summary-content">
                <div class="summary-label">匯出記憶數量</div>
                <div class="summary-value">${memoryCount} 筆</div>
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16,11V3H8V9H2V21H22V11H16M10,5H14V9H10V5M20,19H4V11H6V9H8V11H16V9H18V11H20V19Z"/>
                </svg>
              </div>
              <div class="summary-content">
                <div class="summary-label">記憶使用量</div>
                <div class="summary-value">${usagePercent}</div>
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3"/>
                </svg>
              </div>
              <div class="summary-content">
                <div class="summary-label">匯出時間</div>
                <div class="summary-value">${new Date().toLocaleString('zh-TW')}</div>
              </div>
            </div>
          </div>
          
          <div class="export-actions-grid">
            <button id="copyMarkdownBtn" class="export-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
              </svg>
              <span>複製 Markdown</span>
            </button>
            
            <button id="copyTextBtn" class="export-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/>
              </svg>
              <span>複製純文字</span>
            </button>
            
            <button id="downloadTxtBtn" class="export-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              <span>下載 TXT</span>
            </button>
            
            <button id="openExtensionBtn" class="export-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3"/>
              </svg>
              <span>查看歷史</span>
            </button>
          </div>
        </div>

        <div class="memory-modal-actions">
          <button id="resultCloseBtn" class="memory-modal-btn secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
            </svg>
            <span>關閉</span>
          </button>
        </div>
      </div>
    `;

    // 添加額外樣式
    const style = document.createElement('style');
    style.id = 'exportResultModalStyles';
    style.textContent = `
      .memory-modal-icon.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
      }

      .memory-status-dot.success {
        background: #10b981;
      }

      .export-summary {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 24px;
      }

      .summary-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
      }

      .summary-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748b;
        flex-shrink: 0;
      }

      .summary-content {
        flex: 1;
      }

      .summary-label {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
        margin-bottom: 2px;
      }

      .summary-value {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
      }

      .export-actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 20px;
      }

      .export-action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        color: #475569;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        justify-content: center;
      }

      .export-action-btn:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
      }

      .export-action-btn:active {
        transform: translateY(0);
      }

      .export-action-btn svg {
        flex-shrink: 0;
      }

      .export-action-btn.success {
        background: #dcfce7;
        border-color: #16a34a;
        color: #15803d;
      }

      @media (max-width: 480px) {
        .export-actions-grid {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // 添加事件監聽器
    document.getElementById('resultCloseBtn').addEventListener('click', () => {
      modal.style.animation = 'modalFadeIn 0.2s ease-out reverse';
      setTimeout(() => {
        modal.remove();
        style.remove();
      }, 200);
    });

    // 複製 Markdown
    document
      .getElementById('copyMarkdownBtn')
      .addEventListener('click', async () => {
        const btn = document.getElementById('copyMarkdownBtn');
        try {
          await navigator.clipboard.writeText(window.__memoryMarkdown || '');
          btn.classList.add('success');
          btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
          </svg>
          <span>已複製</span>
        `;
          setTimeout(() => {
            btn.classList.remove('success');
            btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
            </svg>
            <span>複製 Markdown</span>
          `;
          }, 2000);
        } catch (error) {
          console.error('複製失敗:', error);
        }
      });

    // 複製純文字
    document
      .getElementById('copyTextBtn')
      .addEventListener('click', async () => {
        const btn = document.getElementById('copyTextBtn');
        try {
          const plainText = (window.__memoryList || [])
            .map((item, index) => `${index + 1}. ${item}`)
            .join('\n');
          await navigator.clipboard.writeText(plainText);
          btn.classList.add('success');
          btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
          </svg>
          <span>已複製</span>
        `;
          setTimeout(() => {
            btn.classList.remove('success');
            btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/>
            </svg>
            <span>複製純文字</span>
          `;
          }, 2000);
        } catch (error) {
          console.error('複製失敗:', error);
        }
      });

    // 下載 TXT
    document.getElementById('downloadTxtBtn').addEventListener('click', () => {
      const content = window.__memoryMarkdown || '';
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ChatGPT_Memory_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // 開啟擴充套件
    document
      .getElementById('openExtensionBtn')
      .addEventListener('click', () => {
        // 嘗試開啟擴充套件 popup
        try {
          chrome.runtime.sendMessage({ action: 'openPopup' });
        } catch (error) {
          console.log('無法開啟擴充套件 popup:', error);
        }
        modal.remove();
        style.remove();
      });

    // 點擊背景關閉
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.style.animation = 'modalFadeIn 0.2s ease-out reverse';
        setTimeout(() => {
          modal.remove();
          style.remove();
        }, 200);
      }
    });
  }

  // 檢查設定並決定是否顯示模態窗
  async function checkAndShowModal() {
    try {
      // 從 storage 取得設定
      const result = await chrome.storage.local.get('settings');
      const settings = result.settings || { autoShowModal: true };

      if (settings.autoShowModal && hasTriggerText()) {
        showAutoExportModal();
      }
    } catch (error) {
      // 如果無法取得設定，預設顯示模態窗
      if (hasTriggerText()) {
        showAutoExportModal();
      }
    }
  }

  // 啟動監控 - 只監控狀態，不自動執行匯出
  async function bootstrap() {
    log('開始監控記憶狀態（被動模式）');

    // 初始檢查
    checkMemoryStatus();
    await checkAndShowModal();

    // 持續監控狀態變化
    const observer = new MutationObserver(async () => {
      checkMemoryStatus();
      await checkAndShowModal();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    // 定期檢查（每30秒）
    const statusInterval = setInterval(async () => {
      checkMemoryStatus();
      await checkAndShowModal();
    }, 30000);

    window.stopMemoryWatcher = () => {
      observer.disconnect();
      clearInterval(statusInterval);
      delete window.__MEMORY_MANAGER_LOADED__;
      log('已停止監控');
    };
  }

  // 訊息監聽器 - 處理來自 popup 的請求
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    log('收到訊息:', message);

    switch (message.action) {
    case 'ping':
      // 回應 ping 請求，確認 content script 已載入
      sendResponse({ success: true, status: 'ready' });
      break;

    case 'getMemoryStatus': {
      // 回傳當前記憶狀態（不觸發匯出）
      const status = checkMemoryStatus();
      sendResponse({
        success: true,
        isFull: status.isFull,
        timestamp: status.timestamp,
        data: window.__memoryList || [],
        usage: window.__memoryUsagePercent || null,
        markdown: window.__memoryMarkdown || null,
      });
      break;
    }

    case 'getMemoryData':
      // 回傳當前記憶資料（向後相容）
      sendResponse({
        success: true,
        data: window.__memoryList || [],
        usage: window.__memoryUsagePercent || null,
        markdown: window.__memoryMarkdown || null,
      });
      break;

    case 'exportMemories':
      // 執行匯出流程
      (async () => {
        try {
          // 檢查當前頁面是否適合匯出
          if (!location.href.includes('chatgpt.com')) {
            sendResponse({
              success: false,
              error: '請在 ChatGPT 網站上使用此功能',
            });
            return;
          }

          log('開始匯出流程');
          await mainFlow();

          sendResponse({
            success: true,
            markdown: window.__memoryMarkdown || '',
            data: window.__memoryList || [],
            usage: window.__memoryUsagePercent || null,
          });
        } catch (error) {
          warn('匯出失敗:', error);
          sendResponse({
            success: false,
            error: error.message || '匯出過程中發生錯誤',
          });
        }
      })();
      return true; // 保持訊息通道開啟以支援非同步回應

    case 'getMarkdown':
      // 回傳 Markdown 資料
      sendResponse({
        success: true,
        markdown: window.__memoryMarkdown || null,
      });
      break;

    default:
      sendResponse({ success: false, error: '未知的操作' });
    }
  });

  // 初始化
  bootstrap()
    .then(() => log('記憶管理器已啟動'))
    .catch(error => warn('初始化失敗', error));
})();
