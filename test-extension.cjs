#!/usr/bin/env node

/**
 * 簡單的擴充套件測試腳本
 * 使用 Node.js 和 Puppeteer 直接測試擴充套件
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ExtensionTester {
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
    console.log('🔧 初始化測試環境...');
    
    // 檢查必要檔案
    const requiredFiles = [
      'manifest.json',
      'src/background.js', 
      'src/scripts/content.js',
      'src/ui/popup.html',
      'src/ui/popup.js'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(__dirname, file))) {
        throw new Error(`必要檔案不存在: ${file}`);
      }
    }

    // 啟動瀏覽器
    this.browser = await puppeteer.launch({
      headless: 'new',
      timeout: 60000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        `--load-extension=${__dirname}`,
        `--disable-extensions-except=${__dirname}`,
        '--no-first-run',
        '--disable-default-apps'
      ]
    });

    console.log('✅ 瀏覽器已啟動');
    await this.wait(3000);
  }

  async findExtensionId() {
    console.log('🔍 尋找擴充套件 ID...');
    
    const targets = await this.browser.targets();
    const extensionTarget = targets.find(target => 
      target.type() === 'service_worker' && 
      target.url().includes('chrome-extension://')
    );

    if (extensionTarget) {
      this.extensionId = extensionTarget.url().split('/')[2];
      console.log('✅ 擴充套件 ID:', this.extensionId);
      return true;
    }
    
    return false;
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

  async testExtensionLoading() {
    if (!this.extensionId) {
      throw new Error('擴充套件未載入');
    }
    
    // 檢查 Service Worker 是否運行
    const targets = await this.browser.targets();
    const serviceWorker = targets.find(target => 
      target.type() === 'service_worker' && 
      target.url().includes(this.extensionId)
    );
    
    if (!serviceWorker) {
      throw new Error('Service Worker 未運行');
    }
  }

  async testPopupOpening() {
    if (!this.extensionId) {
      throw new Error('擴充套件 ID 未找到');
    }

    const popupUrl = `chrome-extension://${this.extensionId}/src/ui/popup.html`;
    const page = await this.browser.newPage();
    
    try {
      await page.goto(popupUrl, { waitUntil: 'networkidle0', timeout: 10000 });
      
      // 檢查基本 UI 元素
      const statusCard = await page.$('#statusCard');
      const exportBtn = await page.$('#exportBtn');
      
      if (!statusCard) {
        throw new Error('狀態卡片未找到');
      }
      
      if (!exportBtn) {
        throw new Error('匯出按鈕未找到');
      }
      
    } finally {
      await page.close();
    }
  }

  async testManifestValidation() {
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    if (!manifest.manifest_version) {
      throw new Error('manifest_version 未定義');
    }
    
    if (!manifest.name) {
      throw new Error('擴充套件名稱未定義');
    }
    
    if (!manifest.version) {
      throw new Error('版本號未定義');
    }
    
    if (!manifest.background) {
      throw new Error('背景腳本配置未定義');
    }
    
    if (!manifest.content_scripts) {
      throw new Error('內容腳本配置未定義');
    }
  }

  async testContentScriptInjection() {
    const page = await this.browser.newPage();
    
    try {
      // 前往測試頁面
      await page.goto('https://example.com', { waitUntil: 'networkidle0', timeout: 15000 });
      
      // 等待一段時間讓內容腳本載入
      await this.wait(3000);
      
      // 檢查是否有任何 console 錯誤
      const errors = [];
      page.on('pageerror', error => {
        errors.push(error.message);
      });
      
      await this.wait(2000);
      
      // 如果有嚴重錯誤，拋出異常
      const criticalErrors = errors.filter(error => 
        error.includes('TypeError') || error.includes('ReferenceError')
      );
      
      if (criticalErrors.length > 0) {
        throw new Error(`內容腳本錯誤: ${criticalErrors[0]}`);
      }
      
    } finally {
      await page.close();
    }
  }

  async runAllTests() {
    console.log('🧪 開始執行 ChatGPT Memory Toolkit 自動化測試\n');
    
    try {
      await this.init();
      
      // 基本檢查
      await this.runTest('檔案結構驗證', () => this.testManifestValidation());
      
      // 擴充套件載入
      await this.runTest('擴充套件載入檢測', async () => {
        const found = await this.findExtensionId();
        if (!found) throw new Error('擴充套件未載入');
      });
      
      await this.runTest('Service Worker 運行測試', () => this.testExtensionLoading());
      
      // UI 測試
      await this.runTest('Popup UI 開啟測試', () => this.testPopupOpening());
      
      // 內容腳本測試
      await this.runTest('內容腳本注入測試', () => this.testContentScriptInjection());
      
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
    console.log('\n' + '='.repeat(50));
    console.log('📊 測試結果摘要');
    console.log('='.repeat(50));
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
      console.log('\n🎉 所有測試都通過了！擴充套件運行正常。');
    } else {
      console.log('\n⚠️ 部分測試失敗，請檢查上述錯誤並修復。');
    }
    
    console.log('='.repeat(50));
  }
}

// 執行測試
const tester = new ExtensionTester();
tester.runAllTests().catch(console.error);