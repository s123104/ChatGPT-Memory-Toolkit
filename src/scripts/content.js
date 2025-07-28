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
    if (!location.href.startsWith(CONFIG.targetURL)) {
      location.href = CONFIG.targetURL;
    } else {
      location.hash = '#settings/Personalization';
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
    let table = modalRoot.querySelector('table');
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
      await waitFor(
        () => (table = modalRoot.querySelector('table')) || null,
        CONFIG.waitTableMs
      ).catch(() => {});
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
    } catch {
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
    } catch (error) {
      console.warn('[Memory Manager] 無法複製到剪貼簿:', error);
    }

    log(`完成：共收集 ${items.length} 筆記憶`);
    return markdown;
  }

  // 主要流程
  async function mainFlow() {
    log('偵測到「儲存的記憶已滿」→ 開始自動匯出流程');
    const panel = await openPersonalizationSettings();
    await readUsageAndClickManage(panel);
    await scrapeMemoriesToMarkdown();
    console.log(
      '%c[Memory Manager] 自動匯出完成',
      'color:#16a34a;font-weight:bold;'
    );
  }

  // 啟動監控
  async function bootstrap() {
    if (hasTriggerText()) {
      try {
        await mainFlow();
      } catch (error) {
        warn('自動匯出失敗：', error);
      }
      return;
    }

    log('開始監控記憶狀態');
    const observer = new MutationObserver(async () => {
      if (hasTriggerText()) {
        observer.disconnect();
        try {
          await mainFlow();
        } catch (error) {
          warn('自動匯出失敗：', error);
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    window.stopMemoryWatcher = () => {
      observer.disconnect();
      delete window.__MEMORY_MANAGER_LOADED__;
      log('已停止監控');
    };
  }

  // 初始化
  bootstrap()
    .then(() => log('記憶管理器已啟動'))
    .catch(error => warn('初始化失敗', error));
})();
