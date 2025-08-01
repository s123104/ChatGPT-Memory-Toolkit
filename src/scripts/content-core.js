// ChatGPT Memory Manager - Core Configuration & Utilities
// 核心配置和工具函數模組

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
    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    check();
  });
}

// 等待可見元素
function waitForVisible(selectorOrFunction, timeoutMs) {
  if (typeof selectorOrFunction === 'string') {
    return waitFor(() => {
      const element = document.querySelector(selectorOrFunction);
      return isVisible(element) ? element : null;
    }, timeoutMs);
  }
  return waitFor(selectorOrFunction, timeoutMs);
}
// 將函數和配置導出到全域範圍
if (typeof window !== 'undefined') {
  window.ContentCore = {
    CONFIG,
    log,
    warn,
    sleep,
    raf,
    isVisible,
    hasTriggerText,
    findMemoryFullTargetDiv,
    waitFor,
    waitForVisible,
  };

  // 為了向後兼容，也將這些直接添加到 window
  window.CONFIG = CONFIG;
  window.log = log;
  window.warn = warn;
  window.sleep = sleep;
  window.raf = raf;
  window.isVisible = isVisible;
  window.hasTriggerText = hasTriggerText;
  window.findMemoryFullTargetDiv = findMemoryFullTargetDiv;
  window.waitFor = waitFor;
  window.waitForVisible = waitForVisible;
}
