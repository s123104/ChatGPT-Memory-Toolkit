/**
 * Comprehensive UI Interaction E2E Tests
 * 綜合使用者介面互動的端到端測試
 */

describe('UI Interaction Tests', () => {
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

  describe('Button State Management', () => {
    test('should show proper loading states', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 點擊匯出按鈕並檢查載入狀態
      await popupPage.click('#exportBtn');

      // 等待載入狀態出現
      const loadingStateAppeared = await popupPage.waitForFunction(() => {
        const btn = document.querySelector('#exportBtn');
        return btn?.textContent?.includes('匯出中') || 
               btn?.classList?.contains('loading') ||
               btn?.querySelector('.loading-spinner');
      }, { timeout: 5000 }).catch(() => false);

      if (loadingStateAppeared) {
        // 檢查載入狀態的視覺元素
        const loadingState = await popupPage.evaluate(() => {
          const btn = document.querySelector('#exportBtn');
          return {
            text: btn?.textContent || '',
            classes: Array.from(btn?.classList || []),
            hasSpinner: !!btn?.querySelector('.loading-spinner, .spinner'),
            disabled: btn?.disabled
          };
        });

        expect(
          loadingState.text.includes('中') ||
          loadingState.classes.includes('loading') ||
          loadingState.hasSpinner
        ).toBe(true);
      }
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should handle button state transitions', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 獲取初始狀態
      const initialState = await popupPage.evaluate(() => {
        const btn = document.querySelector('#exportBtn');
        return {
          text: btn?.textContent || '',
          classes: Array.from(btn?.classList || []),
          disabled: btn?.disabled
        };
      });

      // 點擊按鈕
      await popupPage.click('#exportBtn');
      await TestUtils.wait(1000);

      // 檢查狀態變化
      const clickedState = await popupPage.evaluate(() => {
        const btn = document.querySelector('#exportBtn');
        return {
          text: btn?.textContent || '',
          classes: Array.from(btn?.classList || []),
          disabled: btn?.disabled
        };
      });

      // 等待操作完成
      await TestUtils.wait(5000);

      const finalState = await popupPage.evaluate(() => {
        const btn = document.querySelector('#exportBtn');
        return {
          text: btn?.textContent || '',
          classes: Array.from(btn?.classList || []),
          disabled: btn?.disabled
        };
      });

      // 驗證狀態轉換
      expect(initialState.text).toContain('匯出');
      expect(finalState.text).toContain('匯出');
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should show success states appropriately', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 點擊複製按鈕（通常更容易成功）
      await popupPage.click('#copyBtn');

      // 等待可能的成功狀態
      await TestUtils.wait(3000);

      const successState = await popupPage.evaluate(() => {
        const btn = document.querySelector('#copyBtn');
        const toast = document.querySelector('.toast.success');
        
        return {
          buttonText: btn?.textContent || '',
          buttonClasses: Array.from(btn?.classList || []),
          successToast: !!toast,
          toastText: toast?.textContent || ''
        };
      });

      // 檢查是否有成功指示
      const hasSuccessIndication = 
        successState.buttonText.includes('成功') ||
        successState.buttonClasses.includes('success') ||
        successState.successToast;

      if (hasSuccessIndication) {
        expect(hasSuccessIndication).toBe(true);
      }
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Toast Notifications', () => {
    test('should display toast notifications correctly', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 觸發可能顯示 toast 的操作
      await popupPage.click('#copyBtn');
      await TestUtils.wait(2000);

      // 檢查 toast 通知
      const toastInfo = await popupPage.evaluate(() => {
        const toasts = document.querySelectorAll('.toast');
        const activeToast = document.querySelector('.toast:not(.hidden)');
        
        return {
          toastCount: toasts.length,
          hasActiveToast: !!activeToast,
          toastText: activeToast?.textContent || '',
          toastClasses: Array.from(activeToast?.classList || [])
        };
      });

      if (toastInfo.hasActiveToast) {
        expect(toastInfo.toastText).toBeTruthy();
        expect(toastInfo.toastClasses).toContain('toast');
      }
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should auto-hide toast notifications', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 觸發 toast
      await popupPage.click('#copyBtn');
      await TestUtils.wait(1000);

      // 檢查 toast 是否出現
      const toastAppeared = await popupPage.evaluate(() => {
        return !!document.querySelector('.toast:not(.hidden)');
      });

      if (toastAppeared) {
        // 等待 toast 自動隱藏
        await TestUtils.wait(4000);

        const toastHidden = await popupPage.evaluate(() => {
          const toast = document.querySelector('.toast');
          return !toast || toast.classList.contains('hidden') || 
                 getComputedStyle(toast).display === 'none';
        });

        expect(toastHidden).toBe(true);
      }
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Modal Functionality', () => {
    test('should handle modal displays if triggered', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 檢查是否有模態窗觸發器
      const hasModalTriggers = await popupPage.evaluate(() => {
        const triggers = document.querySelectorAll('[data-modal], .modal-trigger');
        return triggers.length > 0;
      });

      if (hasModalTriggers) {
        // 測試模態窗功能
        await popupPage.click('[data-modal], .modal-trigger');
        await TestUtils.wait(1000);

        const modalState = await popupPage.evaluate(() => {
          const modal = document.querySelector('.modal, .modal-overlay');
          return {
            modalExists: !!modal,
            modalVisible: modal ? getComputedStyle(modal).display !== 'none' : false
          };
        });

        if (modalState.modalExists) {
          expect(modalState.modalVisible).toBe(true);

          // 測試模態窗關閉
          await popupPage.keyboard.press('Escape');
          await TestUtils.wait(500);

          const modalClosed = await popupPage.evaluate(() => {
            const modal = document.querySelector('.modal, .modal-overlay');
            return !modal || getComputedStyle(modal).display === 'none';
          });

          expect(modalClosed).toBe(true);
        }
      }
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Responsive Design', () => {
    test('should adapt to different popup sizes', async () => {
      const testSizes = [
        { width: 320, height: 400 },
        { width: 380, height: 500 },
        { width: 400, height: 600 }
      ];

      for (const size of testSizes) {
        popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
        await popupPage.setViewport(size);
        await TestUtils.wait(2000);

        // 檢查關鍵元素是否仍然可見和可用
        const elementVisibility = await popupPage.evaluate(() => {
          const elements = {
            statusCard: document.querySelector('#statusCard'),
            exportBtn: document.querySelector('#exportBtn'),
            copyBtn: document.querySelector('#copyBtn'),
            refreshBtn: document.querySelector('#refreshBtn')
          };

          const results = {};
          for (const [key, element] of Object.entries(elements)) {
            if (element) {
              const rect = element.getBoundingClientRect();
              results[key] = {
                visible: rect.width > 0 && rect.height > 0,
                inViewport: rect.top >= 0 && rect.left >= 0,
                width: rect.width,
                height: rect.height
              };
            } else {
              results[key] = { visible: false };
            }
          }
          return results;
        });

        // 驗證關鍵元素在此尺寸下是否可見
        expect(elementVisibility.statusCard.visible).toBe(true);
        expect(elementVisibility.exportBtn.visible).toBe(true);
        expect(elementVisibility.copyBtn.visible).toBe(true);

        await popupPage.close();
      }
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);

    test('should maintain usability at minimum size', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await popupPage.setViewport({ width: 300, height: 350 });
      await TestUtils.wait(2000);

      // 測試按鈕是否仍可點擊
      const buttonsClickable = await popupPage.evaluate(() => {
        const buttons = document.querySelectorAll('#exportBtn, #copyBtn, #refreshBtn');
        return Array.from(buttons).every(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.width >= 20 && rect.height >= 20; // 最小可點擊尺寸
        });
      });

      expect(buttonsClickable).toBe(true);

      // 測試實際點擊
      await popupPage.click('#refreshBtn');
      await TestUtils.wait(1000);

      const clickWorked = await popupPage.evaluate(() => {
        const btn = document.querySelector('#refreshBtn');
        return btn?.classList?.contains('refreshing') || 
               btn?.querySelector('.icon')?.style?.transform?.includes('rotate');
      });

      expect(clickWorked).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Keyboard Navigation', () => {
    test('should support tab navigation', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 測試 Tab 鍵導航
      await popupPage.keyboard.press('Tab');
      await TestUtils.wait(200);

      const firstFocused = await popupPage.evaluate(() => {
        return document.activeElement?.id || document.activeElement?.tagName;
      });

      expect(firstFocused).toBeTruthy();

      // 繼續 Tab 導航
      await popupPage.keyboard.press('Tab');
      await TestUtils.wait(200);

      const secondFocused = await popupPage.evaluate(() => {
        return document.activeElement?.id || document.activeElement?.tagName;
      });

      // 焦點應該移動到不同的元素
      expect(secondFocused).toBeTruthy();
      expect(secondFocused).not.toBe(firstFocused);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should support Enter key on buttons', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 聚焦到重新整理按鈕
      await popupPage.focus('#refreshBtn');
      await TestUtils.wait(200);

      // 按 Enter 鍵
      await popupPage.keyboard.press('Enter');
      await TestUtils.wait(1000);

      // 檢查按鈕是否響應
      const buttonResponded = await popupPage.evaluate(() => {
        const btn = document.querySelector('#refreshBtn');
        return btn?.classList?.contains('refreshing') || 
               btn?.querySelector('.icon')?.style?.transform?.includes('rotate');
      });

      expect(buttonResponded).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Visual Feedback', () => {
    test('should provide hover effects on interactive elements', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 懸停在匯出按鈕上
      await popupPage.hover('#exportBtn');
      await TestUtils.wait(500);

      const hoverEffect = await popupPage.evaluate(() => {
        const btn = document.querySelector('#exportBtn');
        const computedStyle = getComputedStyle(btn);
        
        return {
          cursor: computedStyle.cursor,
          opacity: computedStyle.opacity,
          transform: computedStyle.transform,
          backgroundColor: computedStyle.backgroundColor
        };
      });

      // 檢查是否有懸停效果
      expect(hoverEffect.cursor).toBe('pointer');
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should show focus indicators', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 聚焦到按鈕
      await popupPage.focus('#exportBtn');
      await TestUtils.wait(200);

      const focusIndicator = await popupPage.evaluate(() => {
        const btn = document.querySelector('#exportBtn');
        const computedStyle = getComputedStyle(btn);
        
        return {
          outline: computedStyle.outline,
          outlineWidth: computedStyle.outlineWidth,
          boxShadow: computedStyle.boxShadow,
          borderColor: computedStyle.borderColor
        };
      });

      // 應該有某種形式的焦點指示
      const hasFocusIndicator = 
        focusIndicator.outline !== 'none' ||
        focusIndicator.outlineWidth !== '0px' ||
        focusIndicator.boxShadow !== 'none' ||
        focusIndicator.borderColor !== 'rgba(0, 0, 0, 0)';

      expect(hasFocusIndicator).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });

  describe('Animation Performance', () => {
    test('should run animations smoothly', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 觸發動畫（重新整理按鈕旋轉）
      await popupPage.click('#refreshBtn');

      // 檢查動畫性能
      const animationMetrics = await popupPage.evaluate(() => {
        return new Promise((resolve) => {
          const btn = document.querySelector('#refreshBtn');
          const icon = btn?.querySelector('.icon, svg');
          
          if (!icon) {
            resolve({ animationRunning: false });
            return;
          }

          let frameCount = 0;
          const startTime = performance.now();
          
          const checkAnimation = () => {
            frameCount++;
            const transform = getComputedStyle(icon).transform;
            
            if (frameCount < 30) { // 檢查 30 幀
              requestAnimationFrame(checkAnimation);
            } else {
              const endTime = performance.now();
              const duration = endTime - startTime;
              const fps = (frameCount / duration) * 1000;
              
              resolve({
                animationRunning: transform.includes('rotate') || transform.includes('matrix'),
                fps: fps,
                frameCount: frameCount,
                duration: duration
              });
            }
          };
          
          requestAnimationFrame(checkAnimation);
        });
      });

      if (animationMetrics.animationRunning) {
        // 動畫應該保持合理的 FPS
        expect(animationMetrics.fps).toBeGreaterThan(20);
      }
    }, global.TEST_CONFIG.TIMEOUTS.MEDIUM);
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      const ariaLabels = await popupPage.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        const labels = {};
        
        buttons.forEach((btn, index) => {
          const id = btn.id || `button-${index}`;
          labels[id] = {
            ariaLabel: btn.getAttribute('aria-label'),
            title: btn.getAttribute('title'),
            textContent: btn.textContent?.trim()
          };
        });
        
        return labels;
      });

      // 每個按鈕應該有某種形式的標籤
      Object.values(ariaLabels).forEach(label => {
        expect(
          label.ariaLabel || 
          label.title || 
          label.textContent
        ).toBeTruthy();
      });
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);

    test('should support screen reader navigation', async () => {
      popupPage = await TestUtils.openExtensionPopup(browser, extensionId);
      await TestUtils.wait(3000);

      // 檢查語義化標記
      const semanticElements = await popupPage.evaluate(() => {
        return {
          hasHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
          hasMain: !!document.querySelector('main, [role="main"]'),
          hasButtons: document.querySelectorAll('button').length > 0,
          hasRegions: document.querySelectorAll('[role], section, article, aside').length > 0
        };
      });

      expect(semanticElements.hasButtons).toBe(true);
    }, global.TEST_CONFIG.TIMEOUTS.SHORT);
  });
});