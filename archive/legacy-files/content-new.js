// ChatGPT Memory Manager - Content Script
// 記憶管理器內容腳本主入口
// 模組化重構版本

(() => {
  // 防止重複執行
  if (window.__MEMORY_MANAGER_LOADED__) {
    console.info('[Memory Manager] 已在運行中');
    return;
  }
  window.__MEMORY_MANAGER_LOADED__ = true;

  // 動態載入所有模組並啟動
  const loadModulesAndBootstrap = async () => {
    try {
      // 載入核心模組
      const coreModule = await import('./content-core.js');
      const domModule = await import('./content-dom.js');
      const memoryModule = await import('./content-memory.js');
      const mainModule = await import('./content-main.js');

      console.log('[Memory Manager] 所有模組載入完成');

      // 啟動主程式
      await mainModule.bootstrap();
    } catch (error) {
      console.error('[Memory Manager] 模組載入失敗:', error);

      // 如果模組載入失敗，嘗試降級到原始版本
      console.warn('[Memory Manager] 嘗試降級到原始版本...');
      try {
        // 這裡可以載入原始的單一檔案版本作為後備
        const fallbackScript = document.createElement('script');
        fallbackScript.src = chrome.runtime.getURL(
          'scripts/content-fallback.js'
        );
        document.head.appendChild(fallbackScript);
      } catch (fallbackError) {
        console.error('[Memory Manager] 降級失敗:', fallbackError);
      }
    }
  };

  // 等待 DOM 載入完成後啟動
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModulesAndBootstrap);
  } else {
    loadModulesAndBootstrap();
  }
})();
