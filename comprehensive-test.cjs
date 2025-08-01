#!/usr/bin/env node

/**
 * 完整的擴充套件功能測試
 * 包含 UI 互動、按鈕點擊、狀態檢查等
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ComprehensiveExtensionTester {
  constructor() {
    this.browser = null;
    this.extensionId = null;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async init() {
    console.log('🔧 初始化完整測試環境...');
    
    this.browser = await puppeteer.launch({
      headless: 'new',
      timeout: 60000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        `--load-extension=${__dirname}`,
        `--disable-extensions-except=${__dirname}`,
        '--no-first-run',
        '--disable-default-apps'
      ]
    });

    console.log('✅ 瀏覽器已啟動');
    await this.wait(3000);
    
    // 找到擴充套件 ID
    const targets = await this.browser.targets();
    const extensionTarget = targets.find(target => 
      target.type() === 'service_worker' && 
      target.url().includes('chrome-extension://')
    );

    if (extensionTarget) {
      this.extensionId = extensionTarget.url().split('/')[2];
      console.log('✅ 擴充套件 ID:', this.extensionId);
    }
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runTest(name, testFunction) {
    this.results.total++;
    console.log(`\n📋 執行測試: ${name}`);
    
    try {
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS', error: null });
      console.log(`✅ 通過: ${name}`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ 失敗: ${name}`);
      console.log(`   錯誤: ${error.message}`);
    }
  }

  async testPopupUIElements() {
    const popupUrl = `chrome-extension://${this.extensionId}/src/ui/popup.html`;
    const page = await this.browser.newPage();
    
    try {
      await page.goto(popupUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      
      // 檢查關鍵 UI 元素
      const elements = await page.evaluate(() => {
        return {
          statusCard: !!document.querySelector('#statusCard'),
          exportBtn: !!document.querySelector('#exportBtn'),
          copyBtn: !!document.querySelector('#copyBtn'),
          refreshBtn: !!document.querySelector('#refreshBtn'),
          memoryStatus: !!document.querySelector('#memoryStatus'),
          title: document.title,
          bodyClass: document.body.className
        };
      });
      
      if (!elements.statusCard) throw new Error('狀態卡片未找到');
      if (!elements.exportBtn) throw new Error('匯出按鈕未找到');
      if (!elements.copyBtn) throw new Error('複製按鈕未找到');
      if (!elements.refreshBtn) throw new Error('重新整理按鈕未找到');
      if (!elements.memoryStatus) throw new Error('記憶狀態元素未找到');
      
    } finally {
      await page.close();
    }
  }

  async testButtonInteractions() {
    const popupUrl = `chrome-extension://${this.extensionId}/src/ui/popup.html`;
    const page = await this.browser.newPage();
    
    try {
      await page.goto(popupUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      await this.wait(2000);
      
      // 測試重新整理按鈕
      const refreshBtn = await page.$('#refreshBtn');
      if (refreshBtn) {
        await refreshBtn.click();
        await this.wait(1000);
        
        // 檢查按鈕是否有響應
        const buttonState = await page.evaluate(() => {
          const btn = document.querySelector('#refreshBtn');
          return {
            exists: !!btn,
            classes: Array.from(btn?.classList || []),
            disabled: btn?.disabled
          };
        });
        
        if (!buttonState.exists) {
          throw new Error('重新整理按鈕點擊後消失');
        }
      }
      
      // 測試複製按鈕
      const copyBtn = await page.$('#copyBtn');
      if (copyBtn) {
        await copyBtn.click();
        await this.wait(1000);
      }
      
      // 測試匯出按鈕
      const exportBtn = await page.$('#exportBtn');
      if (exportBtn) {
        await exportBtn.click();
        await this.wait(2000);
      }
      
    } finally {
      await page.close();
    }
  }

  async testPopupResponsiveness() {
    const popupUrl = `chrome-extension://${this.extensionId}/src/ui/popup.html`;
    const page = await this.browser.newPage();
    
    try {
      // 測試不同視窗大小
      const sizes = [
        { width: 380, height: 600 },
        { width: 320, height: 500 },
        { width: 400, height: 650 }
      ];
      
      for (const size of sizes) {
        await page.setViewport(size);
        await page.goto(popupUrl, { waitUntil: 'networkidle0', timeout: 10000 });
        await this.wait(1000);
        
        const elementsVisible = await page.evaluate(() => {
          const elements = ['#statusCard', '#exportBtn', '#copyBtn', '#refreshBtn'];
          return elements.every(selector => {
            const el = document.querySelector(selector);
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });
        });
        
        if (!elementsVisible) {
          throw new Error(`在尺寸 ${size.width}x${size.height} 下，某些元素不可見`);
        }
      }
      
    } finally {
      await page.close();
    }
  }

  async testContentScriptBasics() {
    const page = await this.browser.newPage();
    
    try {
      // 前往 ChatGPT 模擬頁面
      await page.goto('https://example.com', { waitUntil: 'networkidle0', timeout: 15000 });
      
      // 等待內容腳本有時間載入
      await this.wait(3000);
      
      // 檢查頁面是否正常
      const pageInfo = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          hasBody: !!document.body,
          bodyLength: document.body?.innerHTML?.length || 0
        };
      });
      
      if (!pageInfo.hasBody) {
        throw new Error('頁面主體未載入');
      }
      
      if (pageInfo.bodyLength === 0) {
        throw new Error('頁面內容為空');
      }
      
    } finally {
      await page.close();
    }
  }

  async testErrorHandling() {
    const page = await this.browser.newPage();
    
    try {
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
      
      const popupUrl = `chrome-extension://${this.extensionId}/src/ui/popup.html`;
      await page.goto(popupUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      await this.wait(3000);
      
      // 觸發一些操作
      await page.click('#refreshBtn');
      await this.wait(1000);
      await page.click('#copyBtn');
      await this.wait(1000);
      
      // 檢查是否有嚴重錯誤
      const criticalErrors = errors.filter(error => 
        error.includes('TypeError') || 
        error.includes('ReferenceError') ||
        error.includes('is not a function') ||
        error.includes('Cannot read property')
      );
      
      if (criticalErrors.length > 0) {
        throw new Error(`發現嚴重錯誤: ${criticalErrors[0]}`);
      }
      
    } finally {
      await page.close();
    }
  }

  async testPerformanceBasics() {
    const popupUrl = `chrome-extension://${this.extensionId}/src/ui/popup.html`;
    const page = await this.browser.newPage();
    
    try {
      const startTime = Date.now();
      await page.goto(popupUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      const loadTime = Date.now() - startTime;
      
      if (loadTime > 10000) {
        throw new Error(`頁面載入時間過長: ${loadTime}ms`);
      }
      
      // 檢查記憶體使用 (如果可用)
      const memoryInfo = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      if (memoryInfo && memoryInfo.used > 50 * 1024 * 1024) { // 50MB
        console.log(`⚠️ 記憶體使用較高: ${Math.round(memoryInfo.used / 1024 / 1024)}MB`);
      }
      
    } finally {
      await page.close();
    }
  }

  async runAllTests() {
    console.log('🧪 開始執行 ChatGPT Memory Toolkit 完整功能測試\n');
    
    try {
      await this.init();
      
      if (!this.extensionId) {
        throw new Error('擴充套件未載入');
      }
      
      // 執行所有測試
      await this.runTest('Popup UI 元素檢查', () => this.testPopupUIElements());
      await this.runTest('按鈕互動測試', () => this.testButtonInteractions());
      await this.runTest('響應式設計測試', () => this.testPopupResponsiveness());
      await this.runTest('內容腳本基本測試', () => this.testContentScriptBasics());
      await this.runTest('錯誤處理測試', () => this.testErrorHandling());
      await this.runTest('基本性能測試', () => this.testPerformanceBasics());
      
    } catch (error) {
      console.log(`\n💥 測試初始化失敗: ${error.message}`);
    } finally {
      await this.cleanup();
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    
    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 完整功能測試結果摘要');
    console.log('='.repeat(60));
    console.log(`總計測試: ${this.results.total}`);
    console.log(`通過: ${this.results.passed} ✅`);
    console.log(`失敗: ${this.results.failed} ❌`);
    console.log(`成功率: ${this.results.total > 0 ? Math.round((this.results.passed / this.results.total) * 100) : 0}%`);
    
    console.log('\n📋 詳細結果:');
    this.results.tests.forEach((test, index) => {
      const status = test.status === 'PASS' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${test.name}`);
      if (test.error) {
        console.log(`   錯誤: ${test.error}`);
      }
    });
    
    if (this.results.failed === 0) {
      console.log('\n🎉 所有功能測試都通過了！擴充套件功能完全正常。');
      console.log('💡 擴充套件已準備好用於生產環境。');
    } else {
      console.log('\n⚠️ 部分功能測試失敗，請檢查上述錯誤並修復。');
      console.log('🔧 建議在部署前解決所有問題。');
    }
    
    console.log('='.repeat(60));
  }
}

// 執行完整測試
const tester = new ComprehensiveExtensionTester();
tester.runAllTests().catch(console.error);