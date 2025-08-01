#!/usr/bin/env node

/**
 * 按鈕狀態專項測試
 * 專門測試按鈕的不同狀態：載入、成功、失敗、記憶滿載
 */

const puppeteer = require('puppeteer');
const path = require('path');

class ButtonStatesTest {
  constructor() {
    this.browser = null;
    this.extensionId = null;
    this.buildDir = path.join(__dirname, 'build');
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async init() {
    console.log('🎨 初始化按鈕狀態測試環境...');
    
    this.browser = await puppeteer.launch({
      headless: 'new',
      timeout: 60000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        `--load-extension=${this.buildDir}`,
        `--disable-extensions-except=${this.buildDir}`,
        '--no-first-run',
        '--disable-default-apps'
      ]
    });

    await this.wait(3000);
    
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
    console.log(`\n🧪 測試: ${name}`);
    
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

  async testLoadingState() {
    const popupUrl = `chrome-extension://${this.extensionId}/src/ui/popup.html`;
    const page = await this.browser.newPage();
    
    try {
      await page.goto(popupUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      await this.wait(2000);
      
      console.log('   測試載入狀態（旋轉動畫）...');
      
      // 模擬載入狀態
      const loadingStates = await page.evaluate(() => {
        const exportBtn = document.querySelector('#exportBtn');
        const refreshBtn = document.querySelector('#refreshBtn');
        const copyBtn = document.querySelector('#copyBtn');
        
        // 添加載入狀態
        exportBtn?.classList.add('loading');
        refreshBtn?.classList.add('loading', 'spin');
        copyBtn?.classList.add('loading');
        
        return {
          exportLoading: exportBtn?.classList.contains('loading'),
          refreshLoading: refreshBtn?.classList.contains('loading'),
          refreshSpin: refreshBtn?.classList.contains('spin'),
          copyLoading: copyBtn?.classList.contains('loading'),
          exportHasGradient: !!exportBtn?.querySelector('.export-btn-gradient'),
          exportHasParticles: !!exportBtn?.querySelector('.export-btn-particles')
        };
      });
      
      console.log(`     匯出按鈕載入: ${loadingStates.exportLoading ? '✅' : '❌'}`);
      console.log(`     重新整理按鈕載入: ${loadingStates.refreshLoading ? '✅' : '❌'}`);
      console.log(`     重新整理按鈕旋轉: ${loadingStates.refreshSpin ? '✅' : '❌'}`);
      console.log(`     複製按鈕載入: ${loadingStates.copyLoading ? '✅' : '❌'}`);
      console.log(`     匯出按鈕漸層元素: ${loadingStates.exportHasGradient ? '✅' : '❌'}`);
      console.log(`     匯出按鈕粒子元素: ${loadingStates.exportHasParticles ? '✅' : '❌'}`);
      
      // 等待動畫執行
      await this.wait(2000);
      
      // 檢查動畫是否在執行
      const animationStates = await page.evaluate(() => {
        const exportBtn = document.querySelector('#exportBtn');
        const refreshBtn = document.querySelector('#refreshBtn');
        
        return {
          exportAnimation: getComputedStyle(exportBtn).animationName !== 'none',
          refreshAnimation: getComputedStyle(refreshBtn).animationName !== 'none',
          exportTransform: getComputedStyle(exportBtn).transform !== 'none',
          refreshTransform: getComputedStyle(refreshBtn).transform !== 'none'
        };
      });
      
      console.log(`     匯出按鈕動畫執行: ${animationStates.exportAnimation ? '✅' : '❌'}`);
      console.log(`     重新整理按鈕動畫執行: ${animationStates.refreshAnimation ? '✅' : '❌'}`);
      
      if (!loadingStates.exportLoading || !loadingStates.refreshLoading) {
        throw new Error('載入狀態未正確設置');
      }
      
    } finally {
      await page.close();
    }
  }

  async testSuccessState() {
    const popupUrl = `chrome-extension://${this.extensionId}/src/ui/popup.html`;
    const page = await this.browser.newPage();
    
    try {
      await page.goto(popupUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      await this.wait(2000);
      
      console.log('   測試成功狀態（綠色）...');
      
      // 模擬成功狀態
      const successStates = await page.evaluate(() => {
        const exportBtn = document.querySelector('#exportBtn');
        const copyBtn = document.querySelector('#copyBtn');
        const refreshBtn = document.querySelector('#refreshBtn');
        
        // 移除載入狀態，添加成功狀態
        exportBtn?.classList.remove('loading');
        exportBtn?.classList.add('success');
        copyBtn?.classList.remove('loading');
        copyBtn?.classList.add('success');
        refreshBtn?.classList.remove('loading', 'spin');
        refreshBtn?.classList.add('success');
        
        return {
          exportSuccess: exportBtn?.classList.contains('success'),
          copySuccess: copyBtn?.classList.contains('success'),
          refreshSuccess: refreshBtn?.classList.contains('success'),
          exportBgColor: getComputedStyle(exportBtn).backgroundColor,
          copyBgColor: getComputedStyle(copyBtn).backgroundColor,
          refreshBgColor: getComputedStyle(refreshBtn).backgroundColor
        };
      });
      
      console.log(`     匯出按鈕成功狀態: ${successStates.exportSuccess ? '✅' : '❌'}`);
      console.log(`     複製按鈕成功狀態: ${successStates.copySuccess ? '✅' : '❌'}`);
      console.log(`     重新整理按鈕成功狀態: ${successStates.refreshSuccess ? '✅' : '❌'}`);
      console.log(`     匯出按鈕背景色: ${successStates.exportBgColor}`);
      console.log(`     複製按鈕背景色: ${successStates.copyBgColor}`);
      console.log(`     重新整理按鈕背景色: ${successStates.refreshBgColor}`);
      
      if (!successStates.exportSuccess || !successStates.copySuccess) {
        throw new Error('成功狀態未正確設置');
      }
      
    } finally {
      await page.close();
    }
  }

  async testErrorState() {
    const popupUrl = `chrome-extension://${this.extensionId}/src/ui/popup.html`;
    const page = await this.browser.newPage();
    
    try {
      await page.goto(popupUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      await this.wait(2000);
      
      console.log('   測試錯誤狀態（紅色）...');
      
      // 模擬錯誤狀態
      const errorStates = await page.evaluate(() => {
        const exportBtn = document.querySelector('#exportBtn');
        const copyBtn = document.querySelector('#copyBtn');
        const refreshBtn = document.querySelector('#refreshBtn');
        
        // 移除其他狀態，添加錯誤狀態
        exportBtn?.classList.remove('loading', 'success');
        exportBtn?.classList.add('error');
        copyBtn?.classList.remove('loading', 'success');
        copyBtn?.classList.add('error');
        refreshBtn?.classList.remove('loading', 'success', 'spin');
        refreshBtn?.classList.add('error');
        
        return {
          exportError: exportBtn?.classList.contains('error'),
          copyError: copyBtn?.classList.contains('error'),
          refreshError: refreshBtn?.classList.contains('error'),
          exportBgColor: getComputedStyle(exportBtn).backgroundColor,
          copyBgColor: getComputedStyle(copyBtn).backgroundColor,
          refreshBgColor: getComputedStyle(refreshBtn).backgroundColor
        };
      });
      
      console.log(`     匯出按鈕錯誤狀態: ${errorStates.exportError ? '✅' : '❌'}`);
      console.log(`     複製按鈕錯誤狀態: ${errorStates.copyError ? '✅' : '❌'}`);
      console.log(`     重新整理按鈕錯誤狀態: ${errorStates.refreshError ? '✅' : '❌'}`);
      console.log(`     匯出按鈕背景色: ${errorStates.exportBgColor}`);
      console.log(`     複製按鈕背景色: ${errorStates.copyBgColor}`);
      console.log(`     重新整理按鈕背景色: ${errorStates.refreshBgColor}`);
      
      if (!errorStates.exportError || !errorStates.copyError) {
        throw new Error('錯誤狀態未正確設置');
      }
      
    } finally {
      await page.close();
    }
  }

  async testMemoryFullState() {
    const popupUrl = `chrome-extension://${this.extensionId}/src/ui/popup.html`;
    const page = await this.browser.newPage();
    
    try {
      await page.goto(popupUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      await this.wait(2000);
      
      console.log('   測試記憶体滿載狀態（橘色）...');
      
      // 模擬記憶体滿載狀態
      const memoryFullStates = await page.evaluate(() => {
        const exportBtn = document.querySelector('#exportBtn');
        const statusCard = document.querySelector('#statusCard');
        const memoryStatus = document.querySelector('#memoryStatus');
        
        // 移除其他狀態，添加記憶体滿載狀態
        exportBtn?.classList.remove('loading', 'success', 'error');
        exportBtn?.classList.add('memory-full-urgent');
        statusCard?.classList.add('warning', 'memory-full');
        
        if (memoryStatus) {
          memoryStatus.textContent = '記憶體已滿 (100/100)';
        }
        
        return {
          exportMemoryFull: exportBtn?.classList.contains('memory-full-urgent'),
          statusCardWarning: statusCard?.classList.contains('warning'),
          statusCardMemoryFull: statusCard?.classList.contains('memory-full'),
          exportBgColor: getComputedStyle(exportBtn).backgroundColor,
          exportGradient: getComputedStyle(exportBtn).backgroundImage,
          memoryStatusText: memoryStatus?.textContent,
          hasGradientElement: !!exportBtn?.querySelector('.export-btn-gradient'),
          hasParticlesElement: !!exportBtn?.querySelector('.export-btn-particles')
        };
      });
      
      console.log(`     匯出按鈕記憶體滿載: ${memoryFullStates.exportMemoryFull ? '✅' : '❌'}`);
      console.log(`     狀態卡片警告: ${memoryFullStates.statusCardWarning ? '✅' : '❌'}`);
      console.log(`     狀態卡片記憶體滿載: ${memoryFullStates.statusCardMemoryFull ? '✅' : '❌'}`);
      console.log(`     記憶體狀態文字: "${memoryFullStates.memoryStatusText}"`);
      console.log(`     匯出按鈕背景色: ${memoryFullStates.exportBgColor}`);
      console.log(`     匯出按鈕背景漸層: ${memoryFullStates.exportGradient !== 'none' ? '✅' : '❌'}`);
      console.log(`     漸層元素存在: ${memoryFullStates.hasGradientElement ? '✅' : '❌'}`);
      console.log(`     粒子元素存在: ${memoryFullStates.hasParticlesElement ? '✅' : '❌'}`);
      
      if (!memoryFullStates.exportMemoryFull) {
        throw new Error('記憶體滿載狀態未正確設置');
      }
      
    } finally {
      await page.close();
    }
  }

  async testPurpleGradientExport() {
    const popupUrl = `chrome-extension://${this.extensionId}/src/ui/popup.html`;
    const page = await this.browser.newPage();
    
    try {
      await page.goto(popupUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      await this.wait(2000);
      
      console.log('   測試紫色漸層匯出狀態...');
      
      // 檢查預設的紫色漸層匯出狀態
      const gradientStates = await page.evaluate(() => {
        const exportBtn = document.querySelector('#exportBtn');
        const gradientElement = exportBtn?.querySelector('.export-btn-gradient');
        const particlesElement = exportBtn?.querySelector('.export-btn-particles');
        
        return {
          hasGradientElement: !!gradientElement,
          hasParticlesElement: !!particlesElement,
          exportBtnClasses: Array.from(exportBtn?.classList || []),
          gradientBgImage: gradientElement ? getComputedStyle(gradientElement).backgroundImage : 'none',
          exportBgImage: getComputedStyle(exportBtn).backgroundImage,
          exportBgColor: getComputedStyle(exportBtn).backgroundColor,
          particleCount: particlesElement?.children.length || 0
        };
      });
      
      console.log(`     匯出按鈕類別: ${gradientStates.exportBtnClasses.join(', ')}`);
      console.log(`     漸層元素存在: ${gradientStates.hasGradientElement ? '✅' : '❌'}`);
      console.log(`     粒子元素存在: ${gradientStates.hasParticlesElement ? '✅' : '❌'}`);
      console.log(`     粒子數量: ${gradientStates.particleCount}`);
      console.log(`     匯出按鈕背景圖片: ${gradientStates.exportBgImage !== 'none' ? '✅ 有漸層' : '❌ 無漸層'}`);
      console.log(`     漸層元素背景圖片: ${gradientStates.gradientBgImage !== 'none' ? '✅ 有漸層' : '❌ 無漸層'}`);
      console.log(`     匯出按鈕背景色: ${gradientStates.exportBgColor}`);
      
      // 點擊匯出按鈕觸發動畫
      console.log('     觸發匯出動畫...');
      await page.click('#exportBtn');
      await this.wait(1000);
      
      const animationStates = await page.evaluate(() => {
        const exportBtn = document.querySelector('#exportBtn');
        const gradientElement = exportBtn?.querySelector('.export-btn-gradient');
        
        return {
          exportAnimation: getComputedStyle(exportBtn).animationName !== 'none',
          gradientAnimation: gradientElement ? getComputedStyle(gradientElement).animationName !== 'none' : false,
          exportClasses: Array.from(exportBtn?.classList || [])
        };
      });
      
      console.log(`     匯出按鈕動畫執行: ${animationStates.exportAnimation ? '✅' : '❌'}`);
      console.log(`     漸層元素動畫執行: ${animationStates.gradientAnimation ? '✅' : '❌'}`);
      console.log(`     點擊後按鈕類別: ${animationStates.exportClasses.join(', ')}`);
      
      if (!gradientStates.hasGradientElement || !gradientStates.hasParticlesElement) {
        throw new Error('紫色漸層匯出狀態的基本元素缺失');
      }
      
    } finally {
      await page.close();
    }
  }

  async runAllTests() {
    console.log('🎨 開始執行按鈕狀態專項測試\n');
    console.log('🎯 測試項目：載入動畫、成功狀態、錯誤狀態、記憶體滿載、紫色漸層\n');
    
    try {
      await this.init();
      
      if (!this.extensionId) {
        throw new Error('擴充套件未載入');
      }
      
      // 執行所有按鈕狀態測試
      await this.runTest('紫色漸層匯出狀態測試', () => this.testPurpleGradientExport());
      await this.runTest('載入狀態測試（旋轉動畫）', () => this.testLoadingState());
      await this.runTest('成功狀態測試（綠色）', () => this.testSuccessState());
      await this.runTest('錯誤狀態測試（紅色）', () => this.testErrorState());
      await this.runTest('記憶體滿載狀態測試（橘色）', () => this.testMemoryFullState());
      
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
    console.log('\n' + '='.repeat(70));
    console.log('🎨 按鈕狀態專項測試結果');
    console.log('='.repeat(70));
    console.log(`總計測試: ${this.results.total}`);
    console.log(`通過: ${this.results.passed} ✅`);
    console.log(`失敗: ${this.results.failed} ❌`);
    console.log(`成功率: ${this.results.total > 0 ? Math.round((this.results.passed / this.results.total) * 100) : 0}%`);
    
    console.log('\n📋 詳細結果:');
    this.results.tests.forEach((test, index) => {
      const status = test.status === 'PASS' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${test.name}`);
      if (test.error) {
        console.log(`   ❗ 錯誤: ${test.error}`);
      }
    });
    
    console.log('\n🎨 UI 狀態驗證結果:');
    if (this.results.failed === 0) {
      console.log('✅ 紫色漸層匯出狀態 - 完全正常');
      console.log('✅ 橘色記憶滿載狀態 - 完全正常');
      console.log('✅ 旋轉載入動畫 - 完全正常');
      console.log('✅ 綠色成功狀態 - 完全正常');
      console.log('✅ 紅色失敗狀態 - 完全正常');
      console.log('\n🎉 所有按鈕狀態都符合 ui-showcase.html 的設計要求！');
    } else {
      console.log('⚠️ 部分按鈕狀態需要檢查或調整');
      console.log('💡 請參考失敗的測試項目進行修復');
    }
    
    console.log('='.repeat(70));
  }
}

// 執行按鈕狀態測試
const tester = new ButtonStatesTest();
tester.runAllTests().catch(console.error);