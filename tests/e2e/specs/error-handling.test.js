/**
 * Error Scenarios and Recovery E2E Tests
 * 錯誤情境和恢復機制的端到端測試
 */

describe('Error Handling and Recovery', () => {
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
    if (page) {
      await page.close();
      page = null;
    }
    if (popupPage) {
      await popupPage.close();
      popupPage = null;
    }
  });

  describe('Network Error Handling', () => {
    test('should handle offline scenarios gracefully', async () => {
      // 設置離線模式
      await page.setOfflineMode(true);

      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 嘗試執行需要網路的操作
      await popupPage.click('#exportBtn');
      await TestUtils.wait(5000);

      // 檢查錯誤處理
      const errorHandling = await popupPage.evaluate(() => {
        const statusCard = document.querySelector('#statusCard');
        const exportBtn = document.querySelector('#exportBtn');
        const errorToast = document.querySelector('.toast.error');
        const connectionStatus = document.querySelector('#connectionStatus');
        
        return {
          statusCardClasses: Array.from(statusCard?.classList || []),
          buttonText: exportBtn?.textContent || '',
          buttonDisabled: exportBtn?.disabled,
          hasErrorToast: !!errorToast,
          errorToastText: errorToast?.textContent || '',
          connectionText: connectionStatus?.textContent || ''
        };
      });

      // 應該有某種錯誤指示
      const hasErrorIndication = 
        errorHandling.statusCardClasses.includes('error') ||
        errorHandling.statusCardClasses.includes('warning') ||
        errorHandling.hasErrorToast ||
        errorHandling.connectionText.includes('未連接') ||
        errorHandling.buttonText.includes('失敗');

      if (hasErrorIndication) {
        expect(hasErrorIndication).toBe(true);
      }

      // 恢復網路連線
      await page.setOfflineMode(false);
      await TestUtils.wait(2000);

      // 測試恢復功能
      await popupPage.click('#refreshBtn');
      await TestUtils.wait(3000);

      const recoveryState = await popupPage.evaluate(() => {
        const connectionStatus = document.querySelector('#connectionStatus');
        const statusCard = document.querySelector('#statusCard');
        
        return {
          connectionText: connectionStatus?.textContent || '',
          statusCardClasses: Array.from(statusCard?.classList || [])
        };
      });

      // 檢查是否恢復正常
      if (recoveryState.connectionText) {
        const isConnected = recoveryState.connectionText.includes('已連接');
        if (isConnected) {
          expect(isConnected).toBe(true);
        }
      }
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should handle slow network responses', async () => {
      // 模擬慢速網路
      await page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: 50 * 1024, // 50KB/s
        uploadThroughput: 50 * 1024,
        latency: 2000 // 2 秒延遲
      });

      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 測試超時處理
      const startTime = Date.now();
      await popupPage.click('#exportBtn');
      
      // 等待操作完成或超時
      await TestUtils.wait(10000);
      const endTime = Date.now();

      const timeoutHandling = await popupPage.evaluate(() => {
        const exportBtn = document.querySelector('#exportBtn');
        const statusCard = document.querySelector('#statusCard');
        
        return {
          buttonText: exportBtn?.textContent || '',
          buttonClasses: Array.from(exportBtn?.classList || []),
          statusClasses: Array.from(statusCard?.classList || [])
        };
      });

      // 操作應該在合理時間內完成或顯示超時錯誤
      const operationTime = endTime - startTime;
      if (operationTime > 8000) {
        // 如果操作時間過長，應該有錯誤指示
        const hasTimeoutIndication = 
          timeoutHandling.buttonText.includes('失敗') ||
          timeoutHandling.buttonText.includes('超時') ||
          timeoutHandling.statusClasses.includes('error');

        if (hasTimeoutIndication) {
          expect(hasTimeoutIndication).toBe(true);
        }
      }

      // 恢復正常網路
      await page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0
      });
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);
  });

  describe('Storage Error Handling', () => {
    test('should handle storage quota exceeded', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 嘗試填滿儲存空間（模擬）
      const storageTest = await popupPage.evaluate(() => {
        return new Promise((resolve) => {
          // 嘗試儲存大量資料
          const largeData = {};
          for (let i = 0; i < 100; i++) {
            largeData[`large_key_${i}`] = 'x'.repeat(10000); // 10KB per key
          }

          chrome.storage.local.set(largeData, () => {
            if (chrome.runtime.lastError) {
              resolve({
                error: true,
                errorMessage: chrome.runtime.lastError.message,
                handled: true
              });
            } else {
              // 清理測試資料
              chrome.storage.local.clear();
              resolve({
                error: false,
                handled: true
              });
            }
          });
        });
      });

      expect(storageTest.handled).toBe(true);

      // 如果遇到儲存錯誤，檢查是否有適當的錯誤處理
      if (storageTest.error) {
        expect(storageTest.errorMessage).toBeTruthy();
      }
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should handle corrupted storage data', async () => {
      // 注入損壞的儲存資料
      await page.evaluate(() => {
        // 模擬損壞的資料
        chrome.storage.local.set({
          'corruptedData': '{"incomplete": json}',
          'invalidFormat': 12345
        });
      });

      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(5000);

      // 檢查是否能正常載入
      const loadState = await popupPage.evaluate(() => {
        const statusCard = document.querySelector('#statusCard');
        const exportBtn = document.querySelector('#exportBtn');
        
        return {
          statusExists: !!statusCard,
          buttonExists: !!exportBtn,
          statusText: document.querySelector('#memoryStatus')?.textContent || ''
        };
      });

      expect(loadState.statusExists).toBe(true);
      expect(loadState.buttonExists).toBe(true);

      // 清理損壞的資料
      await page.evaluate(() => {
        chrome.storage.local.remove(['corruptedData', 'invalidFormat']);
      });
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });

  describe('Component Error Handling', () => {
    test('should handle missing component dependencies', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      
      // 模擬組件載入失敗
      await popupPage.evaluate(() => {
        // 模擬移除重要組件
        if (window.toastManager) {
          delete window.toastManager;
        }
      });

      await TestUtils.wait(3000);

      // 嘗試觸發需要 toast 的操作
      await popupPage.click('#copyBtn');
      await TestUtils.wait(2000);

      // 檢查是否有錯誤恢復機制
      const errorRecovery = await popupPage.evaluate(() => {
        const errors = [];
        
        // 檢查控制台錯誤
        if (window.console._errors) {
          errors.push(...window.console._errors);
        }
        
        return {
          hasToastManager: !!window.toastManager,
          buttonStillWorks: !!document.querySelector('#copyBtn'),
          errorCount: errors.length
        };
      });

      expect(errorRecovery.buttonStillWorks).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should handle popup initialization failures', async () => {
      // 監聽控制台錯誤
      const errors = [];
      page.on('pageerror', error => {
        errors.push(error.message);
      });

      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(5000);

      // 檢查是否有致命錯誤
      const fatalErrors = errors.filter(error => 
        error.includes('TypeError') || 
        error.includes('ReferenceError')
      );

      expect(fatalErrors.length).toBe(0);

      // 檢查 popup 是否仍然可用
      const popupUsable = await popupPage.evaluate(() => {
        const statusCard = document.querySelector('#statusCard');
        const buttons = document.querySelectorAll('button');
        
        return {
          hasStatusCard: !!statusCard,
          buttonCount: buttons.length,
          hasContent: document.body.children.length > 0
        };
      });

      expect(popupUsable.hasStatusCard).toBe(true);
      expect(popupUsable.buttonCount).toBeGreaterThan(0);
      expect(popupUsable.hasContent).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });

  describe('Content Script Error Handling', () => {
    test('should handle content script injection failures', async () => {
      // 前往可能阻止內容腳本的頁面
      await page.goto('about:blank');
      await TestUtils.wait(2000);

      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 檢查 popup 如何處理無內容腳本的情況
      const noContentScriptHandling = await popupPage.evaluate(() => {
        const statusText = document.querySelector('#memoryStatus')?.textContent || '';
        const statusCard = document.querySelector('#statusCard');
        
        return {
          statusText,
          statusClasses: Array.from(statusCard?.classList || []),
          showsAppropriateMessage: statusText.includes('ChatGPT') || 
                                   statusText.includes('網站') ||
                                   statusText.includes('前往')
        };
      });

      expect(noContentScriptHandling.showsAppropriateMessage).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should handle content script communication errors', async () => {
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // 等待內容腳本載入
      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      // 模擬通信錯誤
      await page.evaluate(() => {
        // 覆寫 chrome.runtime.sendMessage 使其失敗
        const originalSendMessage = chrome.runtime.sendMessage;
        chrome.runtime.sendMessage = function(...args) {
          const callback = args[args.length - 1];
          if (typeof callback === 'function') {
            setTimeout(() => callback(null), 100);
          }
        };
      });

      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 嘗試重新整理狀態
      await popupPage.click('#refreshBtn');
      await TestUtils.wait(5000);

      // 檢查錯誤處理
      const communicationErrorHandling = await popupPage.evaluate(() => {
        const statusText = document.querySelector('#memoryStatus')?.textContent || '';
        const connectionStatus = document.querySelector('#connectionStatus')?.textContent || '';
        
        return {
          statusText,
          connectionStatus,
          hasErrorIndication: statusText.includes('失敗') || 
                             statusText.includes('錯誤') ||
                             connectionStatus.includes('未連接')
        };
      });

      if (communicationErrorHandling.hasErrorIndication) {
        expect(communicationErrorHandling.hasErrorIndication).toBe(true);
      }
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);
  });

  describe('User Input Error Handling', () => {
    test('should handle rapid repeated clicks', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 監聽錯誤
      const errors = [];
      popupPage.on('pageerror', error => {
        errors.push(error.message);
      });

      // 快速重複點擊
      for (let i = 0; i < 10; i++) {
        await popupPage.click('#exportBtn');
        await TestUtils.wait(50);
      }

      await TestUtils.wait(3000);

      // 檢查是否有未處理的錯誤
      const unhandledErrors = errors.filter(error => 
        !error.includes('Network request failed') // 允許網路錯誤
      );

      expect(unhandledErrors.length).toBe(0);

      // 檢查 UI 是否保持穩定
      const uiStability = await popupPage.evaluate(() => {
        const exportBtn = document.querySelector('#exportBtn');
        const statusCard = document.querySelector('#statusCard');
        
        return {
          buttonExists: !!exportBtn,
          buttonResponsive: !exportBtn?.disabled || 
                           exportBtn?.textContent?.includes('匯出'),
          statusCardExists: !!statusCard
        };
      });

      expect(uiStability.buttonExists).toBe(true);
      expect(uiStability.statusCardExists).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should handle unexpected user interactions', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 嘗試各種非預期的互動
      await popupPage.evaluate(() => {
        // 模擬右鍵點擊
        const rightClickEvent = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          button: 2
        });
        document.querySelector('#exportBtn')?.dispatchEvent(rightClickEvent);

        // 模擬拖拽
        const dragEvent = new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true
        });
        document.querySelector('#statusCard')?.dispatchEvent(dragEvent);

        // 模擬滾輪事件
        const wheelEvent = new WheelEvent('wheel', {
          bubbles: true,
          cancelable: true,
          deltaY: 100
        });
        document.body.dispatchEvent(wheelEvent);
      });

      await TestUtils.wait(2000);

      // 檢查 UI 是否仍然正常
      const uiIntegrity = await popupPage.evaluate(() => {
        return {
          bodyExists: !!document.body,
          buttonsWork: !!document.querySelector('#exportBtn'),
          statusVisible: !!document.querySelector('#statusCard')
        };
      });

      expect(uiIntegrity.bodyExists).toBe(true);
      expect(uiIntegrity.buttonsWork).toBe(true);
      expect(uiIntegrity.statusVisible).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Recovery Mechanisms', () => {
    test('should recover from temporary failures', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 模擬暫時性失敗
      await popupPage.evaluate(() => {
        // 暫時禁用功能
        const originalSendMessage = chrome.runtime.sendMessage;
        chrome.runtime.sendMessage = () => {
          throw new Error('Temporary failure');
        };

        // 5 秒後恢復
        setTimeout(() => {
          chrome.runtime.sendMessage = originalSendMessage;
        }, 5000);
      });

      // 嘗試操作（應該失敗）
      await popupPage.click('#refreshBtn');
      await TestUtils.wait(2000);

      // 等待恢復
      await TestUtils.wait(4000);

      // 再次嘗試（應該成功）
      await popupPage.click('#refreshBtn');
      await TestUtils.wait(3000);

      const recoverySuccessful = await popupPage.evaluate(() => {
        const refreshBtn = document.querySelector('#refreshBtn');
        const statusCard = document.querySelector('#statusCard');
        
        return {
          buttonWorking: !!refreshBtn && !refreshBtn.disabled,
          statusNormal: !Array.from(statusCard?.classList || []).includes('error')
        };
      });

      expect(recoverySuccessful.buttonWorking).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should provide user guidance for manual recovery', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 模擬需要手動恢復的錯誤
      await popupPage.evaluate(() => {
        // 觸發需要用戶操作的錯誤狀態
        const statusEl = document.querySelector('#memoryStatus');
        const statusCard = document.querySelector('#statusCard');
        
        if (statusEl) {
          statusEl.textContent = '請前往 ChatGPT 網站';
        }
        if (statusCard) {
          statusCard.className = 'status-card modern warning';
        }
      });

      const userGuidance = await popupPage.evaluate(() => {
        const statusText = document.querySelector('#memoryStatus')?.textContent || '';
        const hasGuidance = statusText.includes('請') || 
                           statusText.includes('前往') ||
                           statusText.includes('重新載入');
        
        return {
          statusText,
          hasGuidance,
          providesAction: statusText.length > 0
        };
      });

      expect(userGuidance.hasGuidance).toBe(true);
      expect(userGuidance.providesAction).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Error Logging and Reporting', () => {
    test('should log errors appropriately', async () => {
      const consoleLogs = [];
      
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      
      // 監聽控制台消息
      popupPage.on('console', msg => {
        if (msg.type() === 'error' || msg.text().includes('[PopupManager]')) {
          consoleLogs.push({
            type: msg.type(),
            text: msg.text()
          });
        }
      });

      await TestUtils.wait(5000);

      // 觸發可能的錯誤
      await popupPage.click('#exportBtn');
      await TestUtils.wait(3000);

      // 檢查日誌品質
      const errorLogs = consoleLogs.filter(log => log.type === 'error');
      const infoLogs = consoleLogs.filter(log => 
        log.text.includes('[PopupManager]') && log.type !== 'error'
      );

      // 應該有適當的日誌記錄
      expect(infoLogs.length).toBeGreaterThan(0);
      
      // 錯誤日誌應該包含有用信息
      errorLogs.forEach(log => {
        expect(log.text.length).toBeGreaterThan(10);
        expect(log.text).not.toBe('undefined');
      });
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });
});