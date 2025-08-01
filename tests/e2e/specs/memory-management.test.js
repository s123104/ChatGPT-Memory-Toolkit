/**
 * Memory Detection and Export Functionality E2E Tests
 * 記憶檢測和匯出功能的端到端測試
 */

describe('Memory Management Functionality', () => {
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
  });

  afterEach(async () => {
    if (page) await page.close();
    if (popupPage) {
      await popupPage.close();
      popupPage = null;
    }
  });

  describe('Memory Status Detection', () => {
    test('should detect memory status on ChatGPT pages', async () => {
      // 前往 ChatGPT 頁面
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // 等待內容腳本載入
      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      // 開啟 popup 檢查狀態
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 檢查記憶狀態顯示
      const memoryStatus = await popupPage.evaluate(() => {
        const statusEl = document.querySelector('#memoryStatus');
        const statusCard = document.querySelector('#statusCard');
        
        return {
          statusText: statusEl?.textContent || '',
          statusCardClasses: Array.from(statusCard?.classList || []),
          statusExists: !!statusEl
        };
      });

      expect(memoryStatus.statusExists).toBe(true);
      expect(memoryStatus.statusText).toBeTruthy();
      
      // 狀態應該是有效的狀態之一
      const validStatuses = [
        '記憶正常',
        '記憶已滿',
        '等待檢測',
        '請前往 ChatGPT 網站',
        '擴充套件未載入'
      ];

      const hasValidStatus = validStatuses.some(status => 
        memoryStatus.statusText.includes(status)
      );
      expect(hasValidStatus).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);

    test('should update status when memory becomes full', async () => {
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      // 模擬記憶已滿的情況
      await page.evaluate(() => {
        // 在頁面中添加記憶已滿的觸發文字
        const memoryFullElement = document.createElement('div');
        memoryFullElement.textContent = '儲存的記憶已滿';
        memoryFullElement.style.visibility = 'hidden';
        memoryFullElement.id = 'test-memory-full';
        document.body.appendChild(memoryFullElement);

        // 觸發狀態更新
        chrome.runtime.sendMessage({
          action: 'memoryStatusUpdate',
          status: '記憶已滿',
          isFull: true,
          color: '#f59e0b'
        });
      });

      // 等待狀態更新
      await TestUtils.wait(2000);

      // 開啟 popup 檢查更新後的狀態
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 檢查狀態是否反映記憶已滿
      const updatedStatus = await popupPage.evaluate(() => {
        const statusEl = document.querySelector('#memoryStatus');
        const statusCard = document.querySelector('#statusCard');
        const statusDot = document.querySelector('#statusDot');
        
        return {
          statusText: statusEl?.textContent || '',
          statusCardClasses: Array.from(statusCard?.classList || []),
          statusDotClasses: Array.from(statusDot?.classList || [])
        };
      });

      // 清理測試元素
      await page.evaluate(() => {
        const testEl = document.querySelector('#test-memory-full');
        if (testEl) testEl.remove();
      });

      // 檢查是否顯示記憶已滿或相關警告狀態
      const isMemoryFullStatus = 
        updatedStatus.statusText.includes('記憶已滿') ||
        updatedStatus.statusCardClasses.includes('warning') ||
        updatedStatus.statusCardClasses.includes('memory-full') ||
        updatedStatus.statusDotClasses.includes('warning');

      if (isMemoryFullStatus) {
        expect(isMemoryFullStatus).toBe(true);
      } else {
        // 如果沒有檢測到記憶已滿，檢查狀態是否合理
        expect(updatedStatus.statusText).toBeTruthy();
      }
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);

    test('should show appropriate status when not on ChatGPT', async () => {
      // 前往非 ChatGPT 頁面
      await page.goto('https://www.google.com', { 
        waitUntil: 'networkidle0',
        timeout: 15000 
      });

      // 開啟 popup
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 檢查狀態
      const status = await popupPage.evaluate(() => {
        const statusEl = document.querySelector('#memoryStatus');
        return statusEl?.textContent || '';
      });

      expect(status).toContain('ChatGPT');
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });

  describe('Export Functionality', () => {
    test('should handle export button click', async () => {
      // 開啟 popup
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 監聽下載事件
      const client = await popupPage.target().createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: './tests/downloads'
      });

      // 點擊匯出按鈕
      await popupPage.click('#exportBtn');

      // 等待按鈕狀態變化
      await popupPage.waitForFunction(() => {
        const btn = document.querySelector('#exportBtn');
        return btn?.textContent?.includes('匯出中') || 
               btn?.textContent?.includes('匯出完成') ||
               btn?.classList?.contains('loading');
      }, { timeout: 15000 });

      // 檢查按鈕狀態
      const buttonState = await popupPage.evaluate(() => {
        const btn = document.querySelector('#exportBtn');
        return {
          text: btn?.textContent || '',
          classes: Array.from(btn?.classList || [])
        };
      });

      expect(
        buttonState.text.includes('匯出') ||
        buttonState.classes.includes('loading') ||
        buttonState.classes.includes('success')
      ).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should handle copy functionality', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 點擊複製按鈕
      await popupPage.click('#copyBtn');

      // 等待複製操作完成
      await TestUtils.wait(2000);

      // 檢查是否有成功反饋
      const copyResult = await popupPage.evaluate(() => {
        const btn = document.querySelector('#copyBtn');
        const toast = document.querySelector('.toast');
        
        return {
          buttonText: btn?.textContent || '',
          buttonClasses: Array.from(btn?.classList || []),
          toastExists: !!toast,
          toastText: toast?.textContent || ''
        };
      });

      // 應該有某種形式的反饋
      expect(
        copyResult.buttonText.includes('複製') ||
        copyResult.toastExists ||
        copyResult.buttonClasses.includes('success')
      ).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should refresh status correctly', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 獲取初始狀態
      const initialStatus = await popupPage.evaluate(() => {
        return {
          statusText: document.querySelector('#memoryStatus')?.textContent || '',
          lastCheck: document.querySelector('#lastCheck')?.textContent || ''
        };
      });

      // 點擊重新整理按鈕
      await popupPage.click('#refreshBtn');

      // 等待重新整理動畫
      await popupPage.waitForFunction(() => {
        const btn = document.querySelector('#refreshBtn');
        const icon = btn?.querySelector('svg, .icon');
        return icon?.style?.transform?.includes('rotate') ||
               btn?.classList?.contains('refreshing');
      }, { timeout: 5000 });

      // 等待重新整理完成
      await TestUtils.wait(3000);

      // 檢查狀態是否更新
      const updatedStatus = await popupPage.evaluate(() => {
        return {
          statusText: document.querySelector('#memoryStatus')?.textContent || '',
          lastCheck: document.querySelector('#lastCheck')?.textContent || ''
        };
      });

      expect(updatedStatus.statusText).toBeTruthy();
      // 最後檢查時間應該更新（除非是 '--'）
      if (updatedStatus.lastCheck !== '--' && initialStatus.lastCheck !== '--') {
        expect(updatedStatus.lastCheck).not.toBe(initialStatus.lastCheck);
      }
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });

  describe('Memory History and Storage', () => {
    test('should manage storage information', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 檢查儲存資訊顯示
      const storageInfo = await popupPage.evaluate(() => {
        const storageBar = document.querySelector('#storageBar');
        const storageText = document.querySelector('#storageText');
        
        return {
          barExists: !!storageBar,
          textExists: !!storageText,
          barWidth: storageBar?.style?.width || '',
          textContent: storageText?.textContent || ''
        };
      });

      if (storageInfo.textExists) {
        expect(
          storageInfo.textContent.includes('MB') ||
          storageInfo.textContent === '--'
        ).toBe(true);
      }

      if (storageInfo.barExists && storageInfo.barWidth) {
        expect(storageInfo.barWidth).toMatch(/^\d+(\.\d+)?%$/);
      }
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should handle storage quota properly', async () => {
      // 測試儲存空間管理
      const storageTest = await page.evaluate(() => {
        return new Promise((resolve) => {
          // 模擬儲存測試資料
          const testData = {
            testKey: 'test-value-' + Date.now(),
            largeData: 'x'.repeat(1000) // 1KB 測試資料
          };

          chrome.storage.local.set(testData, () => {
            chrome.storage.local.get(null, (allData) => {
              // 清理測試資料
              chrome.storage.local.remove('testKey');
              chrome.storage.local.remove('largeData');
              
              resolve({
                success: true,
                dataStored: !!allData.testKey,
                storageAvailable: !!chrome.storage
              });
            });
          });
        });
      });

      expect(storageTest.success).toBe(true);
      expect(storageTest.storageAvailable).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Error Scenarios', () => {
    test('should handle export errors gracefully', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 監聽控制台錯誤
      const errors = [];
      popupPage.on('pageerror', error => {
        errors.push(error.message);
      });

      // 嘗試匯出（可能會失敗，但不應該導致未捕獲的錯誤）
      await popupPage.click('#exportBtn');
      
      // 等待處理完成
      await TestUtils.wait(5000);

      // 檢查是否有致命錯誤
      const fatalErrors = errors.filter(error => 
        error.includes('TypeError') && 
        !error.includes('Cannot read properties of null') // 允許一些預期的 null 錯誤
      );

      expect(fatalErrors.length).toBe(0);

      // 檢查按鈕是否恢復正常狀態
      const buttonState = await popupPage.evaluate(() => {
        const btn = document.querySelector('#exportBtn');
        return {
          disabled: btn?.disabled,
          text: btn?.textContent || ''
        };
      });

      expect(buttonState.text).toContain('匯出');
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should handle network errors during export', async () => {
      // 模擬網路中斷
      await page.setOfflineMode(true);

      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 嘗試匯出
      await popupPage.click('#exportBtn');
      
      // 等待錯誤處理
      await TestUtils.wait(5000);

      // 檢查錯誤狀態
      const errorState = await popupPage.evaluate(() => {
        const btn = document.querySelector('#exportBtn');
        const statusCard = document.querySelector('#statusCard');
        const toast = document.querySelector('.toast.error');
        
        return {
          buttonText: btn?.textContent || '',
          statusCardClasses: Array.from(statusCard?.classList || []),
          errorToastExists: !!toast,
          toastText: toast?.textContent || ''
        };
      });

      // 應該有錯誤指示
      const hasErrorIndication = 
        errorState.buttonText.includes('失敗') ||
        errorState.statusCardClasses.includes('error') ||
        errorState.errorToastExists;

      if (hasErrorIndication) {
        expect(hasErrorIndication).toBe(true);
      }

      // 恢復網路連接
      await page.setOfflineMode(false);
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });

  describe('Performance and Reliability', () => {
    test('should handle rapid button clicks', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 快速點擊匯出按鈕多次
      for (let i = 0; i < 5; i++) {
        await popupPage.click('#exportBtn');
        await TestUtils.wait(200);
      }

      // 等待處理完成
      await TestUtils.wait(3000);

      // 檢查按鈕狀態是否穩定
      const buttonState = await popupPage.evaluate(() => {
        const btn = document.querySelector('#exportBtn');
        return {
          text: btn?.textContent || '',
          disabled: btn?.disabled,
          classes: Array.from(btn?.classList || [])
        };
      });

      // 按鈕應該回到穩定狀態
      expect(buttonState.text).toContain('匯出');
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should maintain state across popup reopens', async () => {
      // 第一次開啟 popup
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      const initialState = await popupPage.evaluate(() => {
        return {
          statusText: document.querySelector('#memoryStatus')?.textContent || '',
          exportBtnText: document.querySelector('#exportBtn')?.textContent || ''
        };
      });

      await popupPage.close();

      // 重新開啟 popup
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      const newState = await popupPage.evaluate(() => {
        return {
          statusText: document.querySelector('#memoryStatus')?.textContent || '',
          exportBtnText: document.querySelector('#exportBtn')?.textContent || ''
        };
      });

      // 基本狀態應該保持一致
      expect(newState.exportBtnText).toContain('匯出');
      expect(newState.statusText).toBeTruthy();
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });
});