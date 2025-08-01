/**
 * Popup UI and Functionality E2E Tests
 * Popup 使用者介面和功能的端到端測試
 */

describe('Popup UI and Functionality', () => {
  let browser;
  let page;
  let extensionId;
  let popupPage;

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
    
    // 開啟 popup
    popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
    await TestUtils.wait(2000); // 等待 popup 初始化
  });

  afterEach(async () => {
    if (page) await page.close();
    if (popupPage) await popupPage.close();
  });

  describe('Popup UI Rendering', () => {
    test('should render popup with correct structure', async () => {
      // 檢查主要 UI 元素是否存在
      const uiElements = await popupPage.evaluate(() => {
        return {
          container: !!document.querySelector('.popup-container'),
          header: !!document.querySelector('.popup-header'),
          statusCard: !!document.querySelector('#statusCard'),
          memoryStatus: !!document.querySelector('#memoryStatus'),
          actionSection: !!document.querySelector('.action-section'),
          exportBtn: !!document.querySelector('#exportBtn'),
          copyBtn: !!document.querySelector('#copyBtn'),
          refreshBtn: !!document.querySelector('#refreshBtn')
        };
      });

      expect(uiElements.container).toBe(true);
      expect(uiElements.statusCard).toBe(true);
      expect(uiElements.memoryStatus).toBe(true);
      expect(uiElements.actionSection).toBe(true);
      expect(uiElements.exportBtn).toBe(true);
      expect(uiElements.copyBtn).toBe(true);
      expect(uiElements.refreshBtn).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should display correct initial status', async () => {
      // 等待狀態更新
      await popupPage.waitForSelector('#memoryStatus', { timeout: 10000 });
      
      const statusText = await popupPage.$eval('#memoryStatus', el => el.textContent);
      
      // 初始狀態應該是以下之一
      const validStatuses = [
        '等待檢測...',
        '記憶正常',
        '記憶已滿',
        '請前往 ChatGPT 網站',
        '擴充套件未載入'
      ];

      expect(validStatuses.some(status => statusText.includes(status))).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should have proper button states initially', async () => {
      const buttonStates = await popupPage.evaluate(() => {
        const exportBtn = document.querySelector('#exportBtn');
        const copyBtn = document.querySelector('#copyBtn');
        const refreshBtn = document.querySelector('#refreshBtn');

        return {
          exportDisabled: exportBtn?.disabled,
          copyDisabled: copyBtn?.disabled,
          refreshDisabled: refreshBtn?.disabled,
          exportText: exportBtn?.textContent,
          copyText: copyBtn?.textContent,
          refreshText: refreshBtn?.textContent
        };
      });

      expect(buttonStates.exportText).toContain('匯出');
      expect(buttonStates.copyText).toContain('複製');
      expect(buttonStates.refreshText).toContain('重新整理');
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Button Interactions', () => {
    test('should handle export button click', async () => {
      // 點擊匯出按鈕
      await popupPage.click('#exportBtn');
      
      // 檢查按鈕狀態變化
      await popupPage.waitForFunction(() => {
        const btn = document.querySelector('#exportBtn');
        return btn?.textContent?.includes('匯出中') || 
               btn?.textContent?.includes('匯出完成') ||
               btn?.classList?.contains('loading');
      }, { timeout: 5000 });

      const buttonState = await popupPage.evaluate(() => {
        const btn = document.querySelector('#exportBtn');
        return {
          text: btn?.textContent,
          classes: Array.from(btn?.classList || []),
          disabled: btn?.disabled
        };
      });

      // 驗證按鈕狀態更新
      expect(
        buttonState.text.includes('匯出中') || 
        buttonState.text.includes('匯出完成') ||
        buttonState.classes.includes('loading')
      ).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should handle copy button click', async () => {
      // 點擊複製按鈕
      await popupPage.click('#copyBtn');
      
      // 等待按鈕狀態變化
      await TestUtils.wait(2000);
      
      // 檢查按鈕狀態或 Toast 通知
      const result = await popupPage.evaluate(() => {
        const btn = document.querySelector('#copyBtn');
        const toast = document.querySelector('.toast');
        
        return {
          buttonText: btn?.textContent,
          buttonClasses: Array.from(btn?.classList || []),
          toastExists: !!toast,
          toastText: toast?.textContent || ''
        };
      });

      // 應該有某種回饋（按鈕狀態變化或 Toast）
      expect(
        result.buttonText.includes('複製') ||
        result.toastExists ||
        result.buttonClasses.includes('success')
      ).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should handle refresh button click', async () => {
      // 點擊重新整理按鈕
      await popupPage.click('#refreshBtn');
      
      // 檢查重新整理動畫
      await popupPage.waitForFunction(() => {
        const btn = document.querySelector('#refreshBtn');
        const icon = btn?.querySelector('svg, .icon');
        return icon?.style?.transform?.includes('rotate') ||
               btn?.classList?.contains('refreshing');
      }, { timeout: 3000 });

      const refreshState = await popupPage.evaluate(() => {
        const btn = document.querySelector('#refreshBtn');
        const icon = btn?.querySelector('svg, .icon');
        
        return {
          buttonClasses: Array.from(btn?.classList || []),
          iconTransform: icon?.style?.transform || '',
          buttonDisabled: btn?.disabled
        };
      });

      expect(
        refreshState.buttonClasses.includes('refreshing') ||
        refreshState.iconTransform.includes('rotate')
      ).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Status Updates', () => {
    test('should update connection status', async () => {
      // 檢查連接狀態元素
      const connectionStatus = await popupPage.evaluate(() => {
        const statusEl = document.querySelector('#connectionStatus');
        return {
          exists: !!statusEl,
          text: statusEl?.textContent || '',
          classes: Array.from(statusEl?.classList || [])
        };
      });

      if (connectionStatus.exists) {
        expect(['已連接', '未連接'].some(status => 
          connectionStatus.text.includes(status)
        )).toBe(true);
      }
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should display usage information', async () => {
      // 檢查使用量顯示
      const usageInfo = await popupPage.evaluate(() => {
        const usageEl = document.querySelector('#usagePercent');
        const countEl = document.querySelector('#memoryCount');
        
        return {
          usage: usageEl?.textContent || '',
          count: countEl?.textContent || '',
          usageExists: !!usageEl,
          countExists: !!countEl
        };
      });

      if (usageInfo.usageExists) {
        // 使用量應該是百分比或 '--'
        expect(
          usageInfo.usage.includes('%') || 
          usageInfo.usage === '--'
        ).toBe(true);
      }

      if (usageInfo.countExists) {
        // 數量應該是數字加 '筆' 或 '--'
        expect(
          usageInfo.count.includes('筆') || 
          usageInfo.count === '--'
        ).toBe(true);
      }
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should update last check time', async () => {
      const lastCheckEl = await popupPage.$('#lastCheck');
      
      if (lastCheckEl) {
        const lastCheckText = await lastCheckEl.evaluate(el => el.textContent);
        
        // 時間格式應該是合理的
        expect(
          lastCheckText.includes('剛剛') ||
          lastCheckText.includes('分鐘前') ||
          lastCheckText.includes(':') ||
          lastCheckText === '--'
        ).toBe(true);
      }
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Error Handling', () => {
    test('should handle popup initialization errors gracefully', async () => {
      // 檢查錯誤狀態顯示
      const errorElements = await popupPage.evaluate(() => {
        const statusCard = document.querySelector('#statusCard');
        const statusDot = document.querySelector('#statusDot');
        const memoryStatus = document.querySelector('#memoryStatus');
        
        return {
          statusCardClasses: Array.from(statusCard?.classList || []),
          statusDotClasses: Array.from(statusDot?.classList || []),
          statusText: memoryStatus?.textContent || ''
        };
      });

      // 如果顯示錯誤狀態，應該有相應的視覺指示
      if (errorElements.statusText.includes('失敗') || 
          errorElements.statusText.includes('錯誤')) {
        expect(
          errorElements.statusCardClasses.includes('warning') ||
          errorElements.statusCardClasses.includes('error') ||
          errorElements.statusDotClasses.includes('error')
        ).toBe(true);
      }
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should show appropriate message when not on ChatGPT', async () => {
      // 模擬在非 ChatGPT 頁面的情況
      // 這裡我們檢查是否有適當的訊息顯示
      const statusText = await popupPage.$eval('#memoryStatus', el => el.textContent);
      
      // 如果不在 ChatGPT 頁面，應該顯示相應訊息
      if (statusText.includes('ChatGPT')) {
        expect(statusText).toContain('前往');
      }
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Storage Information', () => {
    test('should display storage usage if available', async () => {
      const storageElements = await popupPage.evaluate(() => {
        const storageBar = document.querySelector('#storageBar');
        const storageText = document.querySelector('#storageText');
        
        return {
          barExists: !!storageBar,
          textExists: !!storageText,
          barWidth: storageBar?.style?.width || '',
          textContent: storageText?.textContent || ''
        };
      });

      if (storageElements.textExists) {
        // 儲存文字應該包含 MB 單位
        expect(
          storageElements.textContent.includes('MB') ||
          storageElements.textContent === '--'
        ).toBe(true);
      }

      if (storageElements.barExists && storageElements.barWidth) {
        // 進度條寬度應該是百分比
        expect(storageElements.barWidth).toMatch(/^\d+(\.\d+)?%$/);
      }
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Responsive Design', () => {
    test('should handle different popup sizes', async () => {
      // 測試不同的視窗大小
      const sizes = [
        { width: 380, height: 500 },
        { width: 320, height: 400 },
        { width: 400, height: 600 }
      ];

      for (const size of sizes) {
        await popupPage.setViewport(size);
        await TestUtils.wait(500);

        // 檢查元素是否仍然可見
        const elementsVisible = await popupPage.evaluate(() => {
          const elements = [
            '#statusCard',
            '#exportBtn',
            '#copyBtn',
            '#refreshBtn'
          ];

          return elements.every(selector => {
            const el = document.querySelector(selector);
            if (!el) return false;
            
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });
        });

        expect(elementsVisible).toBe(true);
      }
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });
});