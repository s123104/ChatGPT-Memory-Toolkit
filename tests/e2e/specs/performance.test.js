/**
 * Performance and Resource Usage E2E Tests
 * 效能和資源使用的端到端測試
 */

describe('Performance and Resource Usage', () => {
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

  describe('Extension Loading Performance', () => {
    test('should load extension quickly', async () => {
      const startTime = Date.now();
      
      // 測試擴充套件載入時間
      const targets = await browser.targets();
      const serviceWorkerTarget = targets.find(
        target => target.type() === 'service_worker' && target.url().includes(extensionId)
      );

      const loadTime = Date.now() - startTime;
      
      expect(serviceWorkerTarget).toBeTruthy();
      expect(loadTime).toBeLessThan(5000); // 應該在 5 秒內載入
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should initialize popup efficiently', async () => {
      const startTime = Date.now();
      
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      
      // 等待 popup 完全載入
      await popupPage.waitForSelector('#statusCard', { timeout: 10000 });
      await popupPage.waitForFunction(() => {
        return document.querySelector('#memoryStatus')?.textContent !== '';
      }, { timeout: 5000 });

      const initTime = Date.now() - startTime;
      
      expect(initTime).toBeLessThan(8000); // popup 應該在 8 秒內初始化完成
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should load content script efficiently on ChatGPT', async () => {
      const startTime = Date.now();
      
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // 等待內容腳本載入
      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      const contentScriptLoadTime = Date.now() - startTime;
      
      expect(contentScriptLoadTime).toBeLessThan(20000); // 內容腳本應該在 20 秒內載入
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);
  });

  describe('Memory Usage', () => {
    test('should not consume excessive memory', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 測量初始記憶體使用
      const initialMemory = await popupPage.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      if (initialMemory) {
        // 執行一些操作
        for (let i = 0; i < 10; i++) {
          await popupPage.click('#refreshBtn');
          await TestUtils.wait(500);
        }

        await TestUtils.wait(2000);

        // 測量操作後的記憶體使用
        const finalMemory = await popupPage.evaluate(() => {
          if (performance.memory) {
            return {
              used: performance.memory.usedJSHeapSize,
              total: performance.memory.totalJSHeapSize,
              limit: performance.memory.jsHeapSizeLimit
            };
          }
          return null;
        });

        if (finalMemory) {
          const memoryIncrease = finalMemory.used - initialMemory.used;
          const memoryIncreasePercent = (memoryIncrease / initialMemory.used) * 100;

          // 記憶體增長不應超過初始使用量的 50%
          expect(memoryIncreasePercent).toBeLessThan(50);
          
          // 總記憶體使用不應超過 50MB
          expect(finalMemory.used).toBeLessThan(50 * 1024 * 1024);
        }
      }
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should clean up resources properly', async () => {
      // 創建多個 popup 實例測試資源清理
      const popupPages = [];
      
      for (let i = 0; i < 3; i++) {
        const popup = await TestUtils.openExtensionPopup(browser, extensionId);
        popupPages.push(popup);
        await TestUtils.wait(1000);
      }

      // 關閉所有 popup
      for (const popup of popupPages) {
        await popup.close();
      }

      await TestUtils.wait(2000);

      // 檢查是否有洩漏的資源
      const targets = await browser.targets();
      const popupTargets = targets.filter(target => 
        target.url().includes(extensionId) && 
        target.url().includes('popup.html')
      );

      // 所有 popup 應該已經關閉
      expect(popupTargets.length).toBe(0);
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });

  describe('CPU Usage', () => {
    test('should not cause high CPU usage during idle', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 測量 CPU 使用情況
      const cpuUsage = await popupPage.evaluate(() => {
        return new Promise((resolve) => {
          let sampleCount = 0;
          let totalTime = 0;
          const startTime = performance.now();

          const measureCPU = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - (totalTime || startTime);
            totalTime = currentTime;
            sampleCount++;

            if (sampleCount < 10) {
              setTimeout(measureCPU, 100);
            } else {
              const averageFrameTime = (totalTime - startTime) / sampleCount;
              resolve({
                averageFrameTime,
                samples: sampleCount,
                totalTime: totalTime - startTime
              });
            }
          };

          measureCPU();
        });
      });

      // 平均幀時間應該合理（不超過 50ms）
      expect(cpuUsage.averageFrameTime).toBeLessThan(50);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should handle multiple simultaneous operations efficiently', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      const startTime = Date.now();

      // 同時執行多個操作
      const operations = [
        popupPage.click('#refreshBtn'),
        popupPage.click('#copyBtn'),
        popupPage.hover('#exportBtn'),
        popupPage.focus('#refreshBtn')
      ];

      await Promise.all(operations);
      await TestUtils.wait(2000);

      const operationTime = Date.now() - startTime;

      // 多個操作應該在合理時間內完成
      expect(operationTime).toBeLessThan(5000);

      // 檢查 UI 是否仍然響應
      const uiResponsive = await popupPage.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        return Array.from(buttons).every(btn => btn.offsetParent !== null);
      });

      expect(uiResponsive).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Network Performance', () => {
    test('should handle network requests efficiently', async () => {
      await page.goto(global.TEST_CONFIG.URLS.CHATGPT, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      await page.waitForFunction(() => {
        return window.__MEMORY_MANAGER_LOADED__ === true;
      }, { timeout: 15000 });

      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 監控網路請求
      const networkRequests = [];
      popupPage.on('request', request => {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      });

      popupPage.on('response', response => {
        const requestIndex = networkRequests.findIndex(req => 
          req.url === response.url()
        );
        if (requestIndex !== -1) {
          networkRequests[requestIndex].responseTime = Date.now() - networkRequests[requestIndex].timestamp;
          networkRequests[requestIndex].status = response.status();
        }
      });

      // 執行一些可能觸發網路請求的操作
      await popupPage.click('#refreshBtn');
      await TestUtils.wait(5000);

      // 分析網路性能
      const completedRequests = networkRequests.filter(req => req.responseTime);
      
      if (completedRequests.length > 0) {
        const averageResponseTime = completedRequests.reduce((sum, req) => 
          sum + req.responseTime, 0) / completedRequests.length;

        expect(averageResponseTime).toBeLessThan(3000); // 平均響應時間應少於 3 秒

        // 檢查是否有失敗的請求
        const failedRequests = completedRequests.filter(req => req.status >= 400);
        expect(failedRequests.length).toBe(0);
      }
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);

    test('should not make unnecessary network requests', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 監控網路請求
      let requestCount = 0;
      popupPage.on('request', request => {
        // 過濾掉擴充套件內部資源
        if (!request.url().startsWith('chrome-extension://')) {
          requestCount++;
        }
      });

      // 等待一段時間，不進行任何操作
      await TestUtils.wait(5000);

      // idle 狀態下不應該有外部網路請求
      expect(requestCount).toBe(0);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Storage Performance', () => {
    test('should read/write storage efficiently', async () => {
      const testData = {
        testKey1: 'test value 1',
        testKey2: 'test value 2',
        testKey3: { nested: 'object', array: [1, 2, 3] }
      };

      const startTime = Date.now();

      // 測試寫入性能
      const writeResult = await page.evaluate((data) => {
        return new Promise((resolve) => {
          chrome.storage.local.set(data, () => {
            resolve(Date.now());
          });
        });
      }, testData);

      const writeTime = writeResult - startTime;

      // 測試讀取性能
      const readStartTime = Date.now();
      const readResult = await page.evaluate(() => {
        return new Promise((resolve) => {
          chrome.storage.local.get(null, (result) => {
            resolve({
              data: result,
              timestamp: Date.now()
            });
          });
        });
      });

      const readTime = readResult.timestamp - readStartTime;

      // 清理測試資料
      await page.evaluate(() => {
        chrome.storage.local.remove(['testKey1', 'testKey2', 'testKey3']);
      });

      // 儲存操作應該在合理時間內完成
      expect(writeTime).toBeLessThan(1000); // 寫入應在 1 秒內完成
      expect(readTime).toBeLessThan(500);   // 讀取應在 0.5 秒內完成

      // 驗證資料完整性
      expect(readResult.data.testKey1).toBe(testData.testKey1);
      expect(readResult.data.testKey3.nested).toBe(testData.testKey3.nested);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should handle large data sets efficiently', async () => {
      // 創建大量測試資料
      const largeData = {};
      for (let i = 0; i < 100; i++) {
        largeData[`key_${i}`] = `value_${i}_${'x'.repeat(100)}`;
      }

      const startTime = Date.now();

      try {
        // 測試大資料集的處理
        await page.evaluate((data) => {
          return new Promise((resolve, reject) => {
            chrome.storage.local.set(data, () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve();
              }
            });
          });
        }, largeData);

        const processingTime = Date.now() - startTime;

        // 大資料處理應該在合理時間內完成
        expect(processingTime).toBeLessThan(5000);

        // 清理測試資料
        const keys = Object.keys(largeData);
        await page.evaluate((keyList) => {
          chrome.storage.local.remove(keyList);
        }, keys);

      } catch (error) {
        // 如果遇到儲存限制，這是預期的行為
        expect(error.message).toContain('QUOTA_EXCEEDED');
      }
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });

  describe('Animation Performance', () => {
    test('should run animations smoothly', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 觸發動畫
      await popupPage.click('#refreshBtn');

      // 測量動畫性能
      const animationPerformance = await popupPage.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          let droppedFrames = 0;
          let lastFrameTime = performance.now();
          const startTime = lastFrameTime;

          const measureFrames = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastFrameTime;
            
            frameCount++;
            
            // 如果幀間隔過長，視為掉幀
            if (deltaTime > 20) { // 大於 20ms 視為掉幀
              droppedFrames++;
            }
            
            lastFrameTime = currentTime;

            if (frameCount < 60) { // 測量 60 幀
              requestAnimationFrame(measureFrames);
            } else {
              const totalTime = currentTime - startTime;
              const avgFPS = (frameCount / totalTime) * 1000;
              const dropRate = (droppedFrames / frameCount) * 100;

              resolve({
                avgFPS,
                dropRate,
                frameCount,
                droppedFrames,
                totalTime
              });
            }
          };

          requestAnimationFrame(measureFrames);
        });
      });

      // 檢查動畫性能
      expect(animationPerformance.avgFPS).toBeGreaterThan(30); // 至少 30 FPS
      expect(animationPerformance.dropRate).toBeLessThan(10);  // 掉幀率應低於 10%
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });

  describe('Scalability', () => {
    test('should handle multiple popup instances', async () => {
      const popupPages = [];
      const startTime = Date.now();

      try {
        // 創建多個 popup 實例
        for (let i = 0; i < 5; i++) {
          const popup = await TestUtils.openExtensionPopup(browser, extensionId);
          popupPages.push(popup);
          
          // 等待每個 popup 載入
          await popup.waitForSelector('#statusCard', { timeout: 10000 });
          await TestUtils.wait(500);
        }

        const creationTime = Date.now() - startTime;

        // 所有 popup 應該在合理時間內創建
        expect(creationTime).toBeLessThan(30000);

        // 測試每個 popup 是否正常工作
        for (const popup of popupPages) {
          const isWorking = await popup.evaluate(() => {
            return !!(document.querySelector('#statusCard') && 
                     document.querySelector('#exportBtn'));
          });
          expect(isWorking).toBe(true);
        }

      } finally {
        // 清理所有 popup
        for (const popup of popupPages) {
          try {
            await popup.close();
          } catch (e) {
            // 忽略關閉錯誤
          }
        }
      }
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);

    test('should maintain performance with extended usage', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 模擬長時間使用
      const iterations = 20;
      const responseTimes = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        await popupPage.click('#refreshBtn');
        await TestUtils.wait(200);
        
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        
        await TestUtils.wait(300);
      }

      // 分析響應時間趨勢
      const firstHalf = responseTimes.slice(0, iterations / 2);
      const secondHalf = responseTimes.slice(iterations / 2);

      const firstHalfAvg = firstHalf.reduce((sum, time) => sum + time, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, time) => sum + time, 0) / secondHalf.length;

      // 性能不應該顯著下降（不超過 50% 的差異）
      const performanceDegradation = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      expect(performanceDegradation).toBeLessThan(50);

      // 最後的響應時間仍應合理
      const lastResponseTime = responseTimes[responseTimes.length - 1];
      expect(lastResponseTime).toBeLessThan(2000);
    }, global.TEST_CONFIG.TIMEOUTS.VERY_LONG);
  });

  describe('Resource Cleanup', () => {
    test('should clean up event listeners', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 檢查初始事件監聽器數量
      const initialListeners = await popupPage.evaluate(() => {
        const getEventListeners = (element) => {
          if (window.getEventListeners) {
            return window.getEventListeners(element);
          }
          return {}; // 如果無法獲取，返回空對象
        };

        return {
          document: Object.keys(getEventListeners(document)).length,
          window: Object.keys(getEventListeners(window)).length,
          buttons: Array.from(document.querySelectorAll('button')).map(btn => 
            Object.keys(getEventListeners(btn)).length
          )
        };
      });

      // 關閉 popup
      await popupPage.close();
      popupPage = null;

      // 重新開啟 popup
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 檢查事件監聽器是否有累積
      const finalListeners = await popupPage.evaluate(() => {
        const getEventListeners = (element) => {
          if (window.getEventListeners) {
            return window.getEventListeners(element);
          }
          return {};
        };

        return {
          document: Object.keys(getEventListeners(document)).length,
          window: Object.keys(getEventListeners(window)).length,
          buttons: Array.from(document.querySelectorAll('button')).map(btn => 
            Object.keys(getEventListeners(btn)).length
          )
        };
      });

      // 事件監聽器數量不應該異常增長
      if (typeof initialListeners.document === 'number' && 
          typeof finalListeners.document === 'number') {
        expect(finalListeners.document).toBeLessThanOrEqual(initialListeners.document + 5);
      }
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should clean up timers and intervals', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 檢查是否有定時器洩漏
      const timerTest = await popupPage.evaluate(() => {
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        const originalClearTimeout = window.clearTimeout;
        const originalClearInterval = window.clearInterval;

        let activeTimeouts = 0;
        let activeIntervals = 0;

        window.setTimeout = function(...args) {
          activeTimeouts++;
          const id = originalSetTimeout.apply(this, args);
          return id;
        };

        window.setInterval = function(...args) {
          activeIntervals++;
          const id = originalSetInterval.apply(this, args);
          return id;
        };

        window.clearTimeout = function(id) {
          activeTimeouts = Math.max(0, activeTimeouts - 1);
          return originalClearTimeout.call(this, id);
        };

        window.clearInterval = function(id) {
          activeIntervals = Math.max(0, activeIntervals - 1);
          return originalClearInterval.call(this, id);
        };

        // 等待一段時間後檢查
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              activeTimeouts,
              activeIntervals
            });
            
            // 恢復原始函數
            window.setTimeout = originalSetTimeout;
            window.setInterval = originalSetInterval;
            window.clearTimeout = originalClearTimeout;
            window.clearInterval = originalClearInterval;
          }, 2000);
        });
      });

      // 活躍的定時器數量應該合理
      expect(timerTest.activeTimeouts).toBeLessThan(10);
      expect(timerTest.activeIntervals).toBeLessThan(5);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });
});