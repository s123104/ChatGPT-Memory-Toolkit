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
    if (!element || !(element instanceof Element)) {
      return false;
    }
    const style = getComputedStyle(element);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      Number(style.opacity) === 0
    ) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
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

  // 尋找記憶已滿的特定 div 元素
  const findMemoryFullTargetDiv = () => {
    // 尋找包含指定類別和結構的 div
    const targetDivs = document.querySelectorAll(
      'div.flex.items-center.gap-1.text-sm.font-semibold.opacity-70'
    );

    for (const div of targetDivs) {
      // 檢查是否包含"儲存的記憶已滿"文字
      if (div.textContent?.includes(CONFIG.triggerText)) {
        return div;
      }
    }

    return null;
  };

  // 讓記憶已滿的目標 div 變成可點擊並添加動畫
  const enhanceMemoryFullTargetDiv = targetDiv => {
    if (!targetDiv || targetDiv.dataset.enhanced) {
      return; // 避免重複處理
    }

    // 標記已處理
    targetDiv.dataset.enhanced = 'true';

    // 添加動畫樣式到頁面
    const animationStyles = document.createElement('style');
    animationStyles.id = 'memory-full-target-styles';
    animationStyles.textContent = `
      /* 記憶已滿元素的現代化精緻樣式 */
      .memory-full-clickable {
        cursor: pointer !important;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        position: relative !important;
        padding: 12px 20px !important;
        border-radius: 16px !important;
        background: linear-gradient(135deg, 
                    rgba(245, 158, 11, 0.12) 0%, 
                    rgba(249, 115, 22, 0.1) 50%,
                    rgba(239, 68, 68, 0.08) 100%) !important;
        border: 2px solid rgba(245, 158, 11, 0.3) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        box-shadow: 0 8px 32px -8px rgba(245, 158, 11, 0.25),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        animation: memoryFullPulse 2.5s ease-in-out infinite,
                   memoryFullGlow 3s ease-in-out infinite alternate !important;
        opacity: 1 !important;
        overflow: hidden !important;
        transform-origin: center !important;
      }

      /* 優雅的脈衝動畫 */
      @keyframes memoryFullPulse {
        0%, 100% { 
          transform: scale(1);
          box-shadow: 0 8px 32px -8px rgba(245, 158, 11, 0.25),
                      0 0 0 0 rgba(245, 158, 11, 0.4),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        50% { 
          transform: scale(1.02);
          box-shadow: 0 12px 40px -8px rgba(245, 158, 11, 0.35),
                      0 0 0 8px rgba(245, 158, 11, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }
      }

      /* 柔和的發光動畫 */
      @keyframes memoryFullGlow {
        0% { 
          background: linear-gradient(135deg, 
                      rgba(245, 158, 11, 0.12) 0%, 
                      rgba(249, 115, 22, 0.1) 50%,
                      rgba(239, 68, 68, 0.08) 100%) !important;
          border-color: rgba(245, 158, 11, 0.3) !important;
        }
        100% { 
          background: linear-gradient(135deg, 
                      rgba(245, 158, 11, 0.18) 0%, 
                      rgba(249, 115, 22, 0.15) 50%,
                      rgba(239, 68, 68, 0.12) 100%) !important;
          border-color: rgba(245, 158, 11, 0.5) !important;
        }
      }

      /* 精緻的光澤效果 */
      .memory-full-clickable::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.25),
          transparent
        );
        animation: memoryShimmer 3.5s ease-in-out infinite;
        border-radius: inherit;
        pointer-events: none;
        z-index: 1;
      }

      @keyframes memoryShimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }

      /* 現代化提示氣泡 */
      .memory-full-clickable::after {
        content: '💾 點擊匯出記憶';
        position: absolute;
        top: -48px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #f59e0b, #f97316);
        color: white;
        font-size: 13px;
        font-weight: 600;
        padding: 10px 16px;
        border-radius: 24px;
        white-space: nowrap;
        opacity: 0;
        animation: memoryTooltip 4.5s ease-in-out infinite;
        pointer-events: none;
        z-index: 1000;
        box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.15);
      }

      /* 提示氣泡動畫 */
      @keyframes memoryTooltip {
        0%, 60% { 
          opacity: 0; 
          transform: translateX(-50%) translateY(10px) scale(0.9); 
        }
        70%, 85% { 
          opacity: 1; 
          transform: translateX(-50%) translateY(0) scale(1); 
        }
        100% { 
          opacity: 0; 
          transform: translateX(-50%) translateY(-10px) scale(0.9); 
        }
      }

      /* 精緻的懸停效果 */
      .memory-full-clickable:hover {
        transform: scale(1.05) translateY(-3px) !important;
        box-shadow: 0 20px 60px -12px rgba(245, 158, 11, 0.4),
                    0 0 0 6px rgba(245, 158, 11, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
        background: linear-gradient(135deg, 
                    rgba(245, 158, 11, 0.22) 0%, 
                    rgba(249, 115, 22, 0.18) 50%,
                    rgba(239, 68, 68, 0.15) 100%) !important;
        border-color: rgba(245, 158, 11, 0.6) !important;
      }

      /* 點擊反饋效果 */
      .memory-full-clickable:active {
        transform: scale(0.98) translateY(1px) !important;
        transition: transform 0.15s ease !important;
        box-shadow: 0 4px 16px -4px rgba(245, 158, 11, 0.4),
                    inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }

      /* 圖標增強效果 */
      .memory-full-clickable svg {
        filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3)) !important;
        transition: all 0.3s ease !important;
      }

      .memory-full-clickable:hover svg {
        filter: drop-shadow(0 4px 8px rgba(245, 158, 11, 0.4)) !important;
        transform: scale(1.1) rotate(5deg) !important;
      }

      /* 文字樣式增強 */
      .memory-full-clickable div {
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
        font-weight: 600 !important;
        position: relative !important;
        z-index: 2 !important;
      }

      /* 深色模式適配 */
      @media (prefers-color-scheme: dark) {
        .memory-full-clickable {
          background: linear-gradient(135deg, 
                      rgba(245, 158, 11, 0.15) 0%, 
                      rgba(249, 115, 22, 0.12) 50%,
                      rgba(239, 68, 68, 0.1) 100%) !important;
          border-color: rgba(245, 158, 11, 0.4) !important;
          box-shadow: 0 8px 32px -8px rgba(245, 158, 11, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
        }
        
        .memory-full-clickable:hover {
          background: linear-gradient(135deg, 
                      rgba(245, 158, 11, 0.25) 0%, 
                      rgba(249, 115, 22, 0.2) 50%,
                      rgba(239, 68, 68, 0.18) 100%) !important;
          border-color: rgba(245, 158, 11, 0.7) !important;
        }
      }

      /* 移動端優化 */
      @media (max-width: 768px) {
        .memory-full-clickable {
          padding: 10px 16px !important;
          border-radius: 14px !important;
          animation-duration: 2s;
        }
        
        .memory-full-clickable::after {
          font-size: 12px;
          padding: 8px 14px;
          top: -42px;
        }
      }

      /* 無障礙和動畫偏好 */
      @media (prefers-reduced-motion: reduce) {
        .memory-full-clickable {
          animation: none !important;
        }
        
        .memory-full-clickable::before {
          animation: none !important;
        }
        
        .memory-full-clickable::after {
          animation: none !important;
          opacity: 1;
        }
      }

      /* 高對比度模式支援 */
      @media (prefers-contrast: high) {
        .memory-full-clickable {
          border-width: 3px !important;
          border-color: #f59e0b !important;
          background: rgba(245, 158, 11, 0.2) !important;
        }
      }
    `;

    // 如果樣式還沒添加，添加到頁面
    if (!document.getElementById('memory-full-target-styles')) {
      document.head.appendChild(animationStyles);
    }

    // 添加增強類別
    targetDiv.classList.add('memory-full-clickable');

    // 添加點擊事件
    const clickHandler = async e => {
      e.preventDefault();
      e.stopPropagation();

      log('用戶點擊記憶已滿提示，開始自動匯出');

      // 添加點擊反饋
      targetDiv.style.transform = 'scale(0.95)';
      setTimeout(() => {
        targetDiv.style.transform = '';
      }, 150);

      try {
        await mainFlow();

        // 匯出成功後移除動畫和點擊功能
        targetDiv.classList.remove('memory-full-clickable');
        targetDiv.style.cursor = 'default';
        targetDiv.removeEventListener('click', clickHandler);

        // 顯示成功提示
        const successTooltip = document.createElement('div');
        successTooltip.style.cssText = `
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          white-space: nowrap;
          box-shadow: 0 4px 20px -4px rgba(16, 185, 129, 0.4);
          z-index: 1000;
        `;
        successTooltip.textContent = '✅ 記憶匯出成功';
        targetDiv.style.position = 'relative';
        targetDiv.appendChild(successTooltip);

        setTimeout(() => {
          successTooltip.remove();
        }, 3000);
      } catch (error) {
        warn('點擊匯出失敗:', error);

        // 顯示錯誤提示
        const errorTooltip = document.createElement('div');
        errorTooltip.style.cssText = `
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          white-space: nowrap;
          box-shadow: 0 4px 20px -4px rgba(239, 68, 68, 0.4);
          z-index: 1000;
        `;
        errorTooltip.textContent = '❌ 匯出失敗，請稍後再試';
        targetDiv.style.position = 'relative';
        targetDiv.appendChild(errorTooltip);

        setTimeout(() => {
          errorTooltip.remove();
        }, 3000);
      }
    };

    targetDiv.addEventListener('click', clickHandler);
    log('記憶已滿目標 div 已增強為可點擊並添加動畫效果');
  };

  // 等待元素出現
  function waitFor(checkFunction, timeoutMs) {
    return new Promise((resolve, reject) => {
      let done = false;
      const startTime = performance.now();

      const check = () => {
        if (done) {
          return;
        }
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
    if (!(element instanceof Element)) {
      throw new Error('humanClick: 不是元素');
    }

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
      const targetUrl = `${currentUrl}#settings/Personalization`;

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
      if (text) {
        texts.push(text);
      }
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
      if (!headers.length) {
        return null;
      }
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
      if (root && isVisible(root)) {
        return root;
      }
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
        if (text) {
          results.push(text);
        }
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
        if (text) {
          results.push(text);
        }
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
      if (fallbackResults.length) {
        return { mode: 'fallback', table: null, scroller };
      }
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
            if (text) {
              memorySet.add(text);
            }
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
          deltaY,
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
      ? `\n${items.map((text, index) => `${index + 1}. ${text}`).join('\n')}`
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

  // 實現新的記憶滿提醒機制：兩鍵（立即匯出 / 稍後處理）
  function showAutoExportModal() {
    if (isModalShowing) return;
    isModalShowing = true;

    const OVERLAY_ID = 'memoryAutoExportModal';
    const STYLE_ID = 'memory-auto-modal-styles';

    // 若已存在，避免重複建立
    if (document.getElementById(OVERLAY_ID)) return;

    // 样式
    if (!document.getElementById(STYLE_ID)) {
      const styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      styleEl.textContent = `
        .memory-auto-overlay {
          position: fixed; inset: 0; z-index: 2147483000;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
        }
        .memory-auto-panel {
          width: 360px; max-width: calc(100% - 40px);
          background: #111827; color: #f9fafb; border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
          overflow: hidden; animation: memModalIn 200ms ease-out;
        }
        .memory-auto-header { display: flex; align-items: center; gap: 10px; padding: 16px 18px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .memory-auto-title { font-size: 16px; font-weight: 700; }
        .memory-auto-body { padding: 14px 18px; font-size: 14px; color: #d1d5db; line-height: 1.5; }
        .memory-auto-usage { display:flex; align-items:center; gap:10px; margin-top:10px; }
        .memory-auto-bar { flex:1; height:6px; background:#374151; border-radius: 3px; overflow:hidden; }
        .memory-auto-fill { height:100%; background: linear-gradient(90deg,#f59e0b,#ef4444); width:100%; }
        .memory-auto-actions { display:flex; gap:10px; padding: 14px 18px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); }
        .memory-auto-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:8px; height:40px; border:none; border-radius:10px; cursor:pointer; font-weight:600; }
        .memory-auto-btn.primary { background: linear-gradient(135deg,#667eea,#764ba2); color:#fff; }
        .memory-auto-btn.secondary { background: #1f2937; color:#f3f4f6; border:1px solid #374151; }
        .memory-auto-close { position:absolute; top:10px; right:10px; width:28px; height:28px; border:none; border-radius:8px; background:transparent; color:#9ca3af; cursor:pointer; }
        .memory-auto-close:hover { background: rgba(255,255,255,0.06); color:#e5e7eb; }
        @keyframes memModalIn { from { opacity:0; transform: translateY(-8px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
      `;
      document.head.appendChild(styleEl);
    }

    // 組裝 DOM
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'memory-auto-overlay';

    overlay.innerHTML = `
      <div class="memory-auto-panel">
        <div class="memory-auto-header">
          <div class="memory-auto-title">記憶已滿</div>
        </div>
        <div class="memory-auto-body">
          您的 ChatGPT 記憶已達到上限。建議立即匯出記憶內容以釋放空間，避免遺失重要資訊。
          <div class="memory-auto-usage">
            <div class="memory-auto-bar"><div class="memory-auto-fill"></div></div>
            <span style="font-weight:700;color:#f59e0b">100%</span>
          </div>
        </div>
        <div class="memory-auto-actions">
          <button class="memory-auto-btn secondary" data-action="later">稍後處理</button>
          <button class="memory-auto-btn primary" data-action="exportNow">立即匯出</button>
        </div>
      </div>
    `;

    // 關閉處理
    const closeOverlay = () => {
      overlay.remove();
      isModalShowing = false;
    };
    overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });

    // 綁定按鈕
    overlay.querySelector('[data-action="exportNow"]').addEventListener('click', async () => {
      try {
        closeOverlay();
        await mainFlow();
      } catch (e) {
        warn('立即匯出失敗', e);
      }
    });

    overlay.querySelector('[data-action="later"]').addEventListener('click', async () => {
      try {
        const oneDayLater = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await chrome.storage.local.set({ memoryFullReminderDisabled: oneDayLater.toISOString() });
      } catch (e) {
        // 忽略錯誤
      } finally {
        closeOverlay();
      }
    });

    document.documentElement.appendChild(overlay);
  }

  // TODO: 實現新的匯出結果提醒機制
  function showExportResultModal() {
    log('舊的匯出結果模態窗功能已移除');
    // 待實現：整合到 popup 介面中
    return;
  }

  // 檢查設定並決定是否顯示模態窗
  async function checkAndShowModal() {
    try {
      // 從 storage 取得設定和提醒狀態
      const result = await chrome.storage.local.get([
        'settings',
        'memoryFullReminderDisabled',
      ]);
      const settings = result.settings || { autoShowModal: true };
      const reminderDisabled = result.memoryFullReminderDisabled;

      // 檢查是否應該顯示模態窗
      if (!settings.autoShowModal) {
        log('自動提醒已在設定中關閉');
        return;
      }

      // 檢查是否在禁用期間內
      if (reminderDisabled) {
        if (reminderDisabled === 'never') {
          log('用戶選擇永遠不再提醒');
          return;
        }

        const disabledUntil = new Date(reminderDisabled);
        const now = new Date();

        if (now < disabledUntil) {
          return;
        } else {
          // 過期了，清除禁用狀態
          await chrome.storage.local.remove('memoryFullReminderDisabled');
          log('提醒暫停期已過，恢復正常提醒');
        }
      }

      if (hasTriggerText()) {
        // 顯示兩鍵提醒模態，而非直接觸發
        showAutoExportModal();
      }
    } catch (error) {
      // 如果無法取得設定，預設執行提醒
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

      case 'detectMemoryFull':
        // 檢測頁面中是否有記憶已滿的元素
        try {
          const memoryFullElement = document.querySelector(
            '.memory-full-clickable, [class*="memory-full"]'
          );
          const hasMemoryFullText =
            document.body.textContent.includes('儲存的記憶已滿') ||
            document.body.textContent.includes('Memory is full');

          sendResponse({
            success: true,
            memoryFull: !!(memoryFullElement || hasMemoryFullText),
          });
        } catch (error) {
          sendResponse({
            success: false,
            error: error.message,
          });
        }
        break;

      default:
        sendResponse({ success: false, error: '未知的操作' });
    }

    return true; // 保持訊息通道開啟以支援非同步回應
  });

  // 初始化
  bootstrap()
    .then(() => {
      log('記憶管理器已啟動');
      console.log('🚀 ChatGPT Memory Manager 已啟動');
    })
    .catch(error => warn('初始化失敗', error));
})();
