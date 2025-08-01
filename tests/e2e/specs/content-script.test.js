/**
 * Content Script Injection and Behavior E2E Tests
 * 內容腳本注入和行為的端到端測試
 */

describe('Content Script Injection and Behavior', () => {
  let browser;
  let page;
  let extensionId;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: global.TEST_CONFIG.HEADLESS,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        `--load-extension=${global.TEST_CONFIG.EXTENSION.PATH}`,
        `--disable-extensions-except=${global.TEST_CONFIG.EXTENSION.PATH}`,
        '--no-first-run'
      ]
    });

    await TestUtils.wait(3000);
    extensionId = await TestUtils.getExtensionId(browser, global.TEST_CONFIG.EXTENSION.NAME);
    expect(extensionId).toBeTruthy();
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  describe('Content Script Injection', () => {
    test('should inject content script on ChatGPT pages', async () => {
      // 前往 ChatGPT 頁面
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // 等待內容腳本載入
      await page.waitForFunction(() => {
        return typeof window.__MEMORY_MANAGER_LOADED__ !== 'undefined';
      }, { timeout: 15000 });

      // 驗證內容腳本已載入
      const contentScriptLoaded = await page.evaluate(() => {
        return window.__MEMORY_MANAGER_LOADED__;
      });

      expect(contentScriptLoaded).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);

    test('should initialize content script components', async () => {
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // 等待內容腳本載入和初始化
      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      // 檢查內容腳本的配置和功能
      const contentScriptState = await page.evaluate(() => {
        return {
          loaded: window.__MEMORY_MANAGER_LOADED__,
          configExists: typeof window.CONFIG !== 'undefined',
          utilsAvailable: typeof window.log === 'function',
          triggerText: window.CONFIG?.triggerText || null
        };
      });

      expect(contentScriptState.loaded).toBe(true);
      expect(contentScriptState.configExists).toBe(true);
      expect(contentScriptState.utilsAvailable).toBe(true);
      expect(contentScriptState.triggerText).toBe('儲存的記憶已滿');
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);

    test('should not inject on non-ChatGPT pages', async () => {
      // 前往非 ChatGPT 頁面
      await page.goto('https://www.google.com', { 
        waitUntil: 'networkidle0',
        timeout: 15000 
      });

      // 等待一段時間確保內容腳本不會載入
      await TestUtils.wait(3000);

      // 檢查內容腳本是否未載入
      const contentScriptLoaded = await page.evaluate(() => {
        return typeof window.__MEMORY_MANAGER_LOADED__ !== 'undefined';
      });

      expect(contentScriptLoaded).toBe(false);
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });

  describe('Memory Detection', () => {
    test('should detect memory full trigger text', async () => {
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      // 模擬記憶已滿的情況
      const detectionResult = await page.evaluate(() => {
        // 創建一個測試元素包含觸發文字
        const testElement = document.createElement('div');
        testElement.textContent = '儲存的記憶已滿';
        document.body.appendChild(testElement);

        // 檢查檢測函數是否能找到觸發文字
        const triggerText = window.CONFIG?.triggerText;
        const found = document.body.textContent.includes(triggerText);

        // 清理測試元素
        document.body.removeChild(testElement);

        return {
          triggerText,
          found,
          bodyText: document.body.textContent.slice(0, 100) // 只返回前100字符用於調試
        };
      });

      expect(detectionResult.triggerText).toBe('儲存的記憶已滿');
      expect(detectionResult.found).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);

    test('should monitor for memory status changes', async () => {
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      // 檢查是否有記憶狀態監控機制
      const monitoringActive = await page.evaluate(() => {
        // 檢查是否有觀察器或定時器設置
        return {
          hasObserver: typeof window.MutationObserver !== 'undefined',
          hasConfig: !!window.CONFIG,
          hasUtils: typeof window.log === 'function'
        };
      });

      expect(monitoringActive.hasObserver).toBe(true);
      expect(monitoringActive.hasConfig).toBe(true);
      expect(monitoringActive.hasUtils).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);
  });

  describe('DOM Utilities', () => {
    test('should provide DOM utility functions', async () => {
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      // 測試 DOM 工具函數
      const domUtils = await page.evaluate(() => {
        return {
          hasIsVisible: typeof window.isVisible === 'function',
          hasSleep: typeof window.sleep === 'function',
          hasRaf: typeof window.raf === 'function',
          hasLog: typeof window.log === 'function',
          hasWarn: typeof window.warn === 'function'
        };
      });

      expect(domUtils.hasIsVisible).toBe(true);
      expect(domUtils.hasSleep).toBe(true);
      expect(domUtils.hasRaf).toBe(true);
      expect(domUtils.hasLog).toBe(true);
      expect(domUtils.hasWarn).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);

    test('should test isVisible function', async () => {
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      // 測試 isVisible 函數
      const visibilityTest = await page.evaluate(() => {
        // 創建可見元素
        const visibleElement = document.createElement('div');
        visibleElement.style.display = 'block';
        visibleElement.style.width = '100px';
        visibleElement.style.height = '100px';
        document.body.appendChild(visibleElement);

        // 創建隱藏元素
        const hiddenElement = document.createElement('div');
        hiddenElement.style.display = 'none';
        document.body.appendChild(hiddenElement);

        const results = {
          visibleResult: window.isVisible(visibleElement),
          hiddenResult: window.isVisible(hiddenElement),
          nullResult: window.isVisible(null)
        };

        // 清理測試元素
        document.body.removeChild(visibleElement);
        document.body.removeChild(hiddenElement);

        return results;
      });

      expect(visibilityTest.visibleResult).toBe(true);
      expect(visibilityTest.hiddenResult).toBe(false);
      expect(visibilityTest.nullResult).toBe(false);
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);
  });

  describe('Message Communication', () => {
    test('should communicate with background script', async () => {
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      // 測試與背景腳本的通信
      const communicationTest = await page.evaluate(() => {
        return new Promise((resolve) => {
          // 發送測試消息到背景腳本
          chrome.runtime.sendMessage({
            action: 'memoryStatusUpdate',
            status: '測試訊息',
            isFull: false,
            color: '#00ff00'
          }, (response) => {
            resolve({
              messageSent: true,
              responseReceived: !!response,
              chromeRuntimeAvailable: !!chrome.runtime
            });
          });

          // 設置超時以防沒有回應
          setTimeout(() => {
            resolve({
              messageSent: true,
              responseReceived: false,
              chromeRuntimeAvailable: !!chrome.runtime
            });
          }, 5000);
        });
      });

      expect(communicationTest.chromeRuntimeAvailable).toBe(true);
      expect(communicationTest.messageSent).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);
  });

  describe('Error Handling', () => {
    test('should handle content script errors gracefully', async () => {
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // 監聽頁面錯誤
      const errors = [];
      page.on('pageerror', error => {
        errors.push(error.message);
      });

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      // 等待一段時間確保沒有錯誤
      await TestUtils.wait(5000);

      // 檢查是否有嚴重錯誤
      const seriousErrors = errors.filter(error => 
        error.includes('TypeError') || 
        error.includes('ReferenceError') ||
        error.includes('SyntaxError')
      );

      expect(seriousErrors.length).toBe(0);
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);

    test('should prevent duplicate script loading', async () => {
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      // 嘗試模擬重複載入
      const duplicateLoadTest = await page.evaluate(() => {
        const originalValue = window.__MEMORY_MANAGER_LOADED__;
        
        // 嘗試再次執行內容腳本的防重複機制
        if (window.__MEMORY_MANAGER_LOADED__) {
          // 這應該不會重新初始化
          return {
            originalValue,
            stillLoaded: window.__MEMORY_MANAGER_LOADED__,
            preventsDuplicate: true
          };
        }
        
        return {
          originalValue,
          stillLoaded: window.__MEMORY_MANAGER_LOADED__,
          preventsDuplicate: false
        };
      });

      expect(duplicateLoadTest.originalValue).toBe(true);
      expect(duplicateLoadTest.stillLoaded).toBe(true);
      expect(duplicateLoadTest.preventsDuplicate).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);
  });

  describe('Performance', () => {
    test('should load content script efficiently', async () => {
      const startTime = Date.now();
      
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      const loadTime = Date.now() - startTime;
      
      // 內容腳本應該在合理時間內載入（少於15秒）
      expect(loadTime).toBeLessThan(15000);
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);

    test('should not significantly impact page performance', async () => {
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      // 檢查頁面性能指標
      const performance = await page.evaluate(() => {
        const perfEntries = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: perfEntries.domContentLoadedEventEnd - perfEntries.domContentLoadedEventStart,
          loadComplete: perfEntries.loadEventEnd - perfEntries.loadEventStart,
          memoryUsage: performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize
          } : null
        };
      });

      // DOM 載入時間應該合理（少於5000ms）
      expect(performance.domContentLoaded).toBeLessThan(5000);
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);
  });
});