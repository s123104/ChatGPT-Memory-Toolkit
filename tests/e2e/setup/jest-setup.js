/**
 * Jest E2E Test Setup
 * E2E 測試環境設置
 */

import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 擴展 Jest 的 expect 斷言
expect.extend({
  /**
   * 檢查元素是否可見
   */
  async toBeVisible(received) {
    const isVisible = await received.isIntersectingViewport();
    const pass = isVisible;
    
    return {
      message: () =>
        pass
          ? `Expected element to not be visible, but it was visible`
          : `Expected element to be visible, but it was not visible`,
      pass,
    };
  },
  
  /**
   * 檢查擴充套件是否已載入
   */
  async toHaveExtensionLoaded(received, extensionName) {
    const extensions = await received.evaluate(() => {
      return Array.from(document.querySelectorAll('extensions-item'))
        .map(item => item.shadowRoot?.textContent || '')
        .join(' ');
    });
    
    const pass = extensions.includes(extensionName);
    
    return {
      message: () =>
        pass
          ? `Expected extension "${extensionName}" to not be loaded, but it was loaded`
          : `Expected extension "${extensionName}" to be loaded, but it was not loaded`,
      pass,
    };
  },
  
  /**
   * 檢查 Chrome 擴充套件是否正在運行
   */
  async toHaveExtensionRunning(received, extensionId) {
    const isRunning = await received.evaluate((id) => {
      return new Promise((resolve) => {
        chrome.management.get(id, (extension) => {
          resolve(extension && extension.enabled);
        });
      });
    }, extensionId);
    
    const pass = isRunning;
    
    return {
      message: () =>
        pass
          ? `Expected extension "${extensionId}" to not be running, but it was running`
          : `Expected extension "${extensionId}" to be running, but it was not running`,
      pass,
    };
  }
});

// 全域測試配置
global.TEST_CONFIG = {
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 15000,
    LONG: 30000,
    VERY_LONG: 60000
  },
  
  EXTENSION: {
    PATH: resolve(__dirname, '../../../'),
    NAME: 'ChatGPT Memory Toolkit',
    VERSION: '1.6.2'
  },
  
  URLS: {
    CHATGPT: 'https://chatgpt.com',
    CHATGPT_SETTINGS: 'https://chatgpt.com/#settings/Personalization',
    CHROME_EXTENSIONS: 'chrome://extensions/'
  },
  
  SELECTORS: {
    EXTENSION_ICON: '[data-testid="extension-icon"]',
    POPUP_CONTAINER: '.popup-container',
    MEMORY_STATUS: '#memoryStatus',
    EXPORT_BUTTON: '#exportBtn',
    COPY_BUTTON: '#copyBtn',
    REFRESH_BUTTON: '#refreshBtn'
  }
};

// 全域測試工具函數
global.TestUtils = {
  /**
   * 等待指定時間
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * 等待元素出現
   */
  waitForElement: async (page, selector, timeout = 10000) => {
    try {
      await page.waitForSelector(selector, { timeout });
      return await page.$(selector);
    } catch (error) {
      throw new Error(`Element "${selector}" not found within ${timeout}ms`);
    }
  },
  
  /**
   * 等待元素可見
   */
  waitForVisible: async (page, selector, timeout = 10000) => {
    try {
      await page.waitForSelector(selector, { visible: true, timeout });
      return await page.$(selector);
    } catch (error) {
      throw new Error(`Element "${selector}" not visible within ${timeout}ms`);
    }
  },
  
  /**
   * 載入擴充套件
   */
  loadExtension: async (browser, extensionPath) => {
    const page = await browser.newPage();
    await page.goto('chrome://extensions/');
    
    // 啟用開發者模式
    await page.evaluate(() => {
      const toggle = document.querySelector('extensions-manager')
        ?.shadowRoot?.querySelector('#devMode input');
      if (toggle && !toggle.checked) {
        toggle.click();
      }
    });
    
    // 載入解包的擴充套件
    await page.evaluate((path) => {
      const loadButton = document.querySelector('extensions-manager')
        ?.shadowRoot?.querySelector('#loadUnpacked');
      if (loadButton) {
        loadButton.click();
      }
    }, extensionPath);
    
    await page.close();
  },
  
  /**
   * 取得擴充套件 ID
   */
  getExtensionId: async (browser, extensionName) => {
    const page = await browser.newPage();
    await page.goto('chrome://extensions/');
    
    const extensionId = await page.evaluate((name) => {
      const items = Array.from(document.querySelectorAll('extensions-item'));
      for (const item of items) {
        const nameElement = item.shadowRoot?.querySelector('#name');
        if (nameElement?.textContent?.includes(name)) {
          return item.id;
        }
      }
      return null;
    }, extensionName);
    
    await page.close();
    return extensionId;
  },
  
  /**
   * 開啟擴充套件 popup
   */
  openExtensionPopup: async (browser, extensionId) => {
    const targets = await browser.targets();
    const extensionTarget = targets.find(
      target => target.type() === 'service_worker' && target.url().includes(extensionId)
    );
    
    if (!extensionTarget) {
      throw new Error(`Extension service worker not found for ID: ${extensionId}`);
    }
    
    // 觸發 popup
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/src/ui/popup.html`);
    
    return page;
  },
  
  /**
   * 模擬點擊擴充套件圖示
   */
  clickExtensionIcon: async (page, extensionId) => {
    await page.evaluate((id) => {
      // 模擬點擊擴充套件圖示
      chrome.browserAction.onClicked.dispatch({ id });
    }, extensionId);
  },
  
  /**
   * 截圖用於調試
   */
  takeScreenshot: async (page, name) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({
      path: `tests/reports/screenshots/${name}-${timestamp}.png`,
      fullPage: true
    });
  }
};

// 測試前的全域設置
beforeAll(async () => {
  // 確保報告目錄存在
  await TestUtils.wait(1000);
});

// 每個測試後的清理
afterEach(async () => {
  // 清理可能的錯誤狀態
  if (global.page) {
    try {
      await global.page.evaluate(() => {
        // 清理 localStorage
        localStorage.clear();
        // 清理 sessionStorage  
        sessionStorage.clear();
      });
    } catch (error) {
      // 忽略清理錯誤
    }
  }
});

// 測試後的全域清理
afterAll(async () => {
  // 確保所有 page 都已關閉
  if (global.browser) {
    const pages = await global.browser.pages();
    await Promise.all(pages.map(page => page.close()));
  }
});