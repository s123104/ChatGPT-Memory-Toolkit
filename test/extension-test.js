// ChatGPT Memory Manager - Extension Test Script
// 用於測試擴充套件功能的腳本

class ExtensionTester {
  constructor() {
    this.testResults = [];
    this.init();
  }

  init() {
    console.log('🧪 開始測試 ChatGPT Memory Manager 擴充套件');
    this.runTests();
  }

  async runTests() {
    // 測試 1: 檢查 content script 是否載入
    await this.testContentScriptLoaded();

    // 測試 2: 檢查記憶狀態檢測
    await this.testMemoryStatusDetection();

    // 測試 3: 檢查訊息通訊
    await this.testMessageCommunication();

    // 測試 4: 檢查 DOM 元素
    await this.testDOMElements();

    // 顯示測試結果
    this.showResults();
  }

  async testContentScriptLoaded() {
    const testName = 'Content Script 載入檢測';
    try {
      const isLoaded = window.__MEMORY_MANAGER_LOADED__;
      if (isLoaded) {
        this.addResult(testName, true, 'Content script 已成功載入');
      } else {
        this.addResult(testName, false, 'Content script 未載入');
      }
    } catch (error) {
      this.addResult(testName, false, `錯誤: ${error.message}`);
    }
  }

  async testMemoryStatusDetection() {
    const testName = '記憶狀態檢測';
    try {
      // 檢查是否有觸發文字檢測函數
      const hasTriggerFunction = typeof window.hasTriggerText === 'function';
      if (hasTriggerFunction) {
        this.addResult(testName, true, '記憶狀態檢測函數存在');
      } else {
        // 檢查是否有記憶狀態變數
        const hasStatus = window.__memoryStatus !== undefined;
        this.addResult(
          testName,
          hasStatus,
          hasStatus ? '記憶狀態變數存在' : '記憶狀態檢測不可用'
        );
      }
    } catch (error) {
      this.addResult(testName, false, `錯誤: ${error.message}`);
    }
  }

  async testMessageCommunication() {
    const testName = '訊息通訊測試';
    try {
      // 檢查 chrome.runtime 是否可用
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        this.addResult(testName, true, 'Chrome runtime API 可用');
      } else {
        this.addResult(testName, false, 'Chrome runtime API 不可用');
      }
    } catch (error) {
      this.addResult(testName, false, `錯誤: ${error.message}`);
    }
  }

  async testDOMElements() {
    const testName = 'DOM 元素檢測';
    try {
      // 檢查是否在 ChatGPT 網站
      const isOnChatGPT = location.href.includes('chatgpt.com');

      if (isOnChatGPT) {
        // 檢查關鍵 DOM 元素
        const hasPersonalizationTab = document.querySelector(
          '[data-testid="personalization-tab"]'
        );
        const hasMemoryElements = document.querySelectorAll('div').length > 0;

        if (hasPersonalizationTab) {
          this.addResult(testName, true, '找到個人化設定分頁');
        } else if (hasMemoryElements) {
          this.addResult(testName, true, '基本 DOM 元素存在');
        } else {
          this.addResult(testName, false, '未找到必要的 DOM 元素');
        }
      } else {
        this.addResult(testName, false, '不在 ChatGPT 網站上');
      }
    } catch (error) {
      this.addResult(testName, false, `錯誤: ${error.message}`);
    }
  }

  addResult(testName, passed, message) {
    this.testResults.push({
      name: testName,
      passed: passed,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }

  showResults() {
    console.log('\n📊 測試結果摘要:');
    console.log('='.repeat(50));

    let passedCount = 0;
    let totalCount = this.testResults.length;

    this.testResults.forEach((result, index) => {
      const status = result.passed ? '✅ 通過' : '❌ 失敗';
      const icon = result.passed ? '✅' : '❌';

      console.log(`${index + 1}. ${result.name}: ${status}`);
      console.log(`   ${result.message}`);
      console.log('');

      if (result.passed) passedCount++;
    });

    console.log('='.repeat(50));
    console.log(`總計: ${passedCount}/${totalCount} 項測試通過`);

    if (passedCount === totalCount) {
      console.log('🎉 所有測試都通過了！擴充套件運作正常。');
    } else {
      console.log('⚠️  有部分測試失敗，請檢查擴充套件配置。');
    }

    // 將結果儲存到全域變數以供檢查
    window.__testResults = this.testResults;
  }

  // 手動觸發特定測試
  static async runSingleTest(testName) {
    const tester = new ExtensionTester();
    switch (testName) {
      case 'content':
        await tester.testContentScriptLoaded();
        break;
      case 'memory':
        await tester.testMemoryStatusDetection();
        break;
      case 'message':
        await tester.testMessageCommunication();
        break;
      case 'dom':
        await tester.testDOMElements();
        break;
      default:
        console.log('可用的測試: content, memory, message, dom');
        return;
    }
    tester.showResults();
  }
}

// 自動執行測試（延遲 2 秒以確保 content script 載入完成）
setTimeout(() => {
  new ExtensionTester();
}, 2000);

// 提供手動測試介面
window.testExtension = ExtensionTester.runSingleTest;

console.log('🔧 擴充套件測試工具已載入');
console.log('💡 使用 testExtension("testName") 執行單項測試');
console.log('   可用測試: content, memory, message, dom');
