/**
 * Extension Loading and Initialization E2E Tests
 * 擴充套件載入和初始化的端到端測試
 */

describe('Extension Loading and Initialization', () => {
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

    // 等待擴充套件載入
    await TestUtils.wait(3000);
    
    // 取得擴充套件 ID
    extensionId = await TestUtils.getExtensionId(browser, global.TEST_CONFIG.EXTENSION.NAME);
    
    expect(extensionId).toBeTruthy();
    console.log(`Extension loaded with ID: ${extensionId}`);
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    
    // 設置頁面大小
    await page.setViewport({ width: 1920, height: 1080 });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  describe('Extension Installation and Loading', () => {
    test('should load extension successfully', async () => {
      // 前往擴充套件管理頁面
      await page.goto('chrome://extensions/');
      
      // 等待頁面載入
      await page.waitForSelector('extensions-manager', { timeout: 10000 });
      
      // 檢查擴充套件是否已載入
      const extensionExists = await page.evaluate((name) => {
        const manager = document.querySelector('extensions-manager');
        const items = manager?.shadowRoot?.querySelectorAll('extensions-item') || [];
        
        return Array.from(items).some(item => {
          const nameElement = item.shadowRoot?.querySelector('#name');
          return nameElement?.textContent?.includes(name);
        });
      }, global.TEST_CONFIG.EXTENSION.NAME);

      expect(extensionExists).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should have correct extension manifest', async () => {
      // 前往擴充套件詳情頁
      await page.goto(`chrome://extensions/?id=${extensionId}`);
      
      // 檢查擴充套件資訊
      const extensionInfo = await page.evaluate(() => {
        const manager = document.querySelector('extensions-manager');
        const item = manager?.shadowRoot?.querySelector('extensions-item');
        
        if (!item) return null;
        
        const name = item.shadowRoot?.querySelector('#name')?.textContent || '';
        const version = item.shadowRoot?.querySelector('#version')?.textContent || '';
        const description = item.shadowRoot?.querySelector('#description')?.textContent || '';
        
        return { name, version, description };
      });

      expect(extensionInfo).toBeTruthy();
      expect(extensionInfo.name).toContain('ChatGPT Memory');
      expect(extensionInfo.version).toBe(global.TEST_CONFIG.EXTENSION.VERSION);
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should be enabled by default', async () => {
      await page.goto('chrome://extensions/');
      
      const isEnabled = await page.evaluate((name) => {
        const manager = document.querySelector('extensions-manager');
        const items = manager?.shadowRoot?.querySelectorAll('extensions-item') || [];
        
        for (const item of items) {
          const nameElement = item.shadowRoot?.querySelector('#name');
          if (nameElement?.textContent?.includes(name)) {
            const toggle = item.shadowRoot?.querySelector('#enableToggle input');
            return toggle?.checked || false;
          }
        }
        return false;
      }, global.TEST_CONFIG.EXTENSION.NAME);

      expect(isEnabled).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Background Script Initialization', () => {
    test('should initialize background script', async () => {
      // 檢查 service worker 是否運行
      const targets = await browser.targets();
      const serviceWorkerTarget = targets.find(
        target => target.type() === 'service_worker' && target.url().includes(extensionId)
      );

      expect(serviceWorkerTarget).toBeTruthy();
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should respond to runtime messages', async () => {
      // 創建一個測試頁面來與背景腳本通信
      await page.goto('chrome://newtab/');
      
      // 注入測試腳本
      const response = await page.evaluate(async (extId) => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(extId, { action: 'ping' }, (response) => {
            resolve(response);
          });
        });
      }, extensionId);

      // 檢查是否收到回應（可能是錯誤回應，但至少有回應）
      expect(response).toBeDefined();
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });

  describe('Content Script Injection', () => {
    test('should inject content script on ChatGPT pages', async () => {
      // 前往 ChatGPT 網站
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT);
      
      // 等待頁面載入
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // 檢查內容腳本是否已注入
      const contentScriptLoaded = await page.evaluate(() => {
        return typeof window.__MEMORY_MANAGER_LOADED__ !== 'undefined';
      });

      expect(contentScriptLoaded).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.LONG);

    test('should not inject content script on non-ChatGPT pages', async () => {
      // 前往非 ChatGPT 網站
      await page.goto('https://www.google.com');
      
      // 等待頁面載入
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // 檢查內容腳本是否未注入
      const contentScriptLoaded = await page.evaluate(() => {
        return typeof window.__MEMORY_MANAGER_LOADED__ !== 'undefined';
      });

      expect(contentScriptLoaded).toBe(false);
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });

  describe('Extension Components Loading', () => {
    test('should load all required components', async () => {
      // 開啟擴充套件 popup
      const popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      
      // 等待組件載入
      await popupPage.waitForFunction(() => {
        return window.componentManager && window.componentManager.isInitialized();
      }, { timeout: 10000 });

      // 檢查組件是否載入
      const componentsLoaded = await popupPage.evaluate(() => {
        return {
          componentManager: !!window.componentManager,
          modalManager: !!window.modalManager,
          toastManager: !!window.toastManager,
          buttonStateManager: !!window.ButtonStateManager,
          storageManager: !!window.StorageManager
        };
      });

      expect(componentsLoaded.componentManager).toBe(true);
      expect(componentsLoaded.modalManager).toBe(true);
      expect(componentsLoaded.toastManager).toBe(true);
      expect(componentsLoaded.buttonStateManager).toBe(true);

      await popupPage.close();
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should initialize constants correctly', async () => {
      const popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      
      // 檢查常數是否正確載入
      const constantsLoaded = await popupPage.evaluate(() => {
        return {
          timing: !!window.TIMING_CONSTANTS,
          ui: !!window.UI_CONSTANTS,
          storage: !!window.STORAGE_CONSTANTS,
          api: !!window.API_CONSTANTS
        };
      });

      expect(constantsLoaded.timing).toBe(true);
      expect(constantsLoaded.ui).toBe(true);
      expect(constantsLoaded.storage).toBe(true);

      await popupPage.close();
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Extension Error Handling', () => {
    test('should handle initialization errors gracefully', async () => {
      const popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      
      // 檢查是否有未捕獲的錯誤
      const errors = [];
      popupPage.on('pageerror', error => {
        errors.push(error.message);
      });
      
      // 等待初始化完成
      await TestUtils.wait(5000);
      
      // 檢查控制台錯誤（允許一些預期的錯誤）
      const logs = await popupPage.evaluate(() => {
        return window.console._errors || [];
      });

      // 不應該有致命錯誤
      const fatalErrors = errors.filter(error => 
        error.includes('TypeError') || 
        error.includes('ReferenceError') ||
        error.includes('SyntaxError')
      );

      expect(fatalErrors.length).toBe(0);

      await popupPage.close();
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });
});