// ChatGPT Memory Manager - Memory Data Processing
// 記憶資料處理和擷取模組

// 這些函數將從 content-core.js 和 content-dom.js 中獲取
// 確保這些文件在此文件之前載入

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
  return waitFor(findMemoryModal, CONFIG.waitModalMs);
}

// 定位表格和滾動容器
function locateTableAndScroller(modalRoot) {
  const allElements = Array.from(
    modalRoot.querySelectorAll('table, div, ul, [role="table"], [role="grid"]')
  );

  for (const element of allElements) {
    if (!isVisible(element)) continue;

    const rect = element.getBoundingClientRect();
    if (rect.height < 150) continue; // 至少150px高度

    const computedStyle = getComputedStyle(element);
    const hasScroll =
      computedStyle.overflowY === 'auto' ||
      computedStyle.overflowY === 'scroll' ||
      element.scrollHeight > element.clientHeight;

    const children = Array.from(element.children);
    const hasRowPattern = children.length >= 5;

    if (hasScroll || hasRowPattern) {
      const scrollerCandidate = hasScroll
        ? element
        : element.closest(
            '[style*="overflow"], .overflow-auto, .overflow-y-auto'
          ) || element.parentElement;

      return {
        table: element,
        scroller: scrollerCandidate || element,
      };
    }
  }

  return { table: null, scroller: null };
}

// 後備收集方法
function collectRowsFallback(modalRoot) {
  log('使用後備方法收集行...');
  const allDivs = Array.from(modalRoot.querySelectorAll('div')).filter(
    isVisible
  );

  const candidates = allDivs.filter(div => {
    const text = (div.innerText || div.textContent || '').trim();
    return text.length >= 20 && text.length <= 500;
  });

  const groups = [];
  const usedElements = new Set();

  for (const candidate of candidates) {
    if (usedElements.has(candidate)) continue;

    const rect = candidate.getBoundingClientRect();
    const sameLevelElements = candidates.filter(other => {
      if (usedElements.has(other) || other === candidate) return false;
      const otherRect = other.getBoundingClientRect();
      return Math.abs(rect.height - otherRect.height) <= 10;
    });

    if (sameLevelElements.length >= 3) {
      const group = [candidate, ...sameLevelElements];
      group.sort(
        (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
      );
      group.forEach(el => usedElements.add(el));
      groups.push(group);
    }
  }

  return groups.flat().slice(0, 50);
}

// 等待列表準備就緒
async function waitForListReady(modalRoot) {
  const startTime = performance.now();
  let lastCount = 0;
  let stableCount = 0;

  while (performance.now() - startTime < CONFIG.waitRowsMs) {
    await sleep(CONFIG.settleMs);

    const { table } = locateTableAndScroller(modalRoot);
    if (!table) continue;

    const rows = Array.from(table.children).filter(isVisible);
    const currentCount = rows.length;

    if (currentCount === lastCount) {
      stableCount++;
      if (stableCount >= 3) {
        log(`列表穩定，找到 ${currentCount} 行`);
        return true;
      }
    } else {
      stableCount = 0;
      lastCount = currentCount;
    }
  }

  log('等待列表準備超時，使用當前狀態');
  return false;
}

// 取得行文字內容
function getRowText(tableRow) {
  if (!tableRow) return '';

  const clonedRow = tableRow.cloneNode(true);

  // 移除按鈕和圖示
  clonedRow
    .querySelectorAll('button, svg, .icon, [role="button"]')
    .forEach(el => el.remove());

  const text = (clonedRow.innerText || clonedRow.textContent || '').trim();

  return text
    .replace(/\s+/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

// 收集所有記憶項目
async function harvestAllMemories(modalRoot, mode, table, scroller) {
  log(`開始收集記憶項目 (${mode} 模式)...`);

  const collectedRows = new Set();
  const results = [];
  let scanStartTime = performance.now();
  let lastNewCount = 0;
  let idleRounds = 0;

  const collectCurrentRows = () => {
    const rows = table
      ? Array.from(table.children).filter(isVisible)
      : collectRowsFallback(modalRoot);
    const newItems = [];

    for (const row of rows) {
      const text = getRowText(row);
      if (text && text.length >= 10 && !collectedRows.has(text)) {
        collectedRows.add(text);
        newItems.push(text);
      }
    }

    return newItems;
  };

  // 初始收集
  const initialItems = collectCurrentRows();
  results.push(...initialItems);
  log(`初始收集到 ${initialItems.length} 項`);

  // 滾動收集更多項目
  if (
    mode === 'scroll' &&
    scroller &&
    scroller.scrollHeight > scroller.clientHeight
  ) {
    let lastScrollTop = scroller.scrollTop;
    let scrollStep = Math.max(150, scroller.clientHeight * CONFIG.stepRatio);

    while (performance.now() - scanStartTime < CONFIG.maxScanMs) {
      // 滾動到下一個位置
      scroller.scrollBy(0, scrollStep);
      await sleep(CONFIG.settleMs);

      // 等待內容載入
      let waitTime = 0;
      while (scroller.scrollTop === lastScrollTop && waitTime < 1000) {
        await sleep(50);
        waitTime += 50;
      }

      // 收集新項目
      const newItems = collectCurrentRows();
      if (newItems.length > 0) {
        results.push(...newItems);
        lastNewCount = newItems.length;
        idleRounds = 0;
        log(`滾動收集到 ${newItems.length} 項，總計 ${results.length} 項`);
      } else {
        idleRounds++;
      }

      // 檢查是否到底或無新內容
      if (
        scroller.scrollTop + scroller.clientHeight >=
        scroller.scrollHeight - 10
      ) {
        log('已滾動到底部');
        break;
      }

      if (idleRounds >= CONFIG.idleRoundsToStop) {
        log(`連續 ${idleRounds} 次無新內容，停止滾動`);
        break;
      }

      lastScrollTop = scroller.scrollTop;
    }
  }

  // 最終收集
  await sleep(CONFIG.endBounceMs);
  const finalItems = collectCurrentRows();
  const newFinalItems = finalItems.filter(item => !results.includes(item));
  results.push(...newFinalItems);

  log(`記憶收集完成，總計 ${results.length} 項`);
  return results.filter(item => item && item.length >= 10);
}

// 建立 Markdown 格式
function buildMarkdown({ title, usageText, items }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeStr = now.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `# ${title}\n\n**匯出時間**: ${dateStr} ${timeStr}\n**記憶使用量**: ${usageText}\n**項目數量**: ${items.length}\n\n---\n\n${items
    .map((item, index) => `${index + 1}. ${item}`)
    .join('\n\n')}\n\n---\n\n*由 ChatGPT Memory Toolkit 自動生成*`;
}

// 收集記憶並轉換為 Markdown
async function scrapeMemoriesToMarkdown() {
  log('開始收集記憶資料...');

  const modalRoot = await waitForMemoryModal();
  log('找到記憶模態窗', modalRoot);

  await waitForListReady(modalRoot);

  const { table, scroller } = locateTableAndScroller(modalRoot);
  const mode = table && scroller ? 'scroll' : 'fallback';
  log(`使用 ${mode} 模式收集記憶`);

  const memories = await harvestAllMemories(modalRoot, mode, table, scroller);

  if (memories.length === 0) {
    throw new Error('未找到任何記憶項目');
  }

  const title = '儲存的記憶';
  const usageText = window.__memoryUsagePercent || '未知';

  return buildMarkdown({
    title,
    usageText,
    items: memories,
  });
}

// 將函數導出到全域範圍
if (typeof window !== 'undefined') {
  window.ContentMemory = {
    findMemoryElements,
    getMemoryContainer,
    extractUsagePercent,
    findManageButton,
    readUsageAndClickManage,
    findMemoryModal,
    waitForMemoryModal,
    locateTableAndScroller,
    collectRowsFallback,
    waitForListReady,
    getRowText,
    harvestAllMemories,
    buildMarkdown,
    scrapeMemoriesToMarkdown,
  };
}
