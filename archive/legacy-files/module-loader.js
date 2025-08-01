/**
 * Module Loader - 模組載入器
 * 管理組件的正確載入順序和依賴關係
 */

/**
 * 模組載入器類別
 */
export class ModuleLoader {
  constructor() {
    this.loadedModules = new Set();
    this.loadingPromises = new Map();
    this.dependencies = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 100;
  }

  /**
   * 設定模組依賴關係
   * @param {string} moduleName - 模組名稱
   * @param {Array} deps - 依賴的模組列表
   */
  setDependencies(moduleName, deps = []) {
    this.dependencies.set(moduleName, deps);
  }

  /**
   * 載入模組
   * @param {string} moduleName - 模組名稱
   * @param {Function|string} loader - 載入函數或腳本路徑
   * @returns {Promise} 載入完成的 Promise
   */
  async loadModule(moduleName, loader) {
    // 如果已經載入，直接返回
    if (this.loadedModules.has(moduleName)) {
      return Promise.resolve();
    }

    // 如果正在載入，返回載入 Promise
    if (this.loadingPromises.has(moduleName)) {
      return this.loadingPromises.get(moduleName);
    }

    // 創建載入 Promise
    const loadingPromise = this.loadModuleWithDependencies(moduleName, loader);
    this.loadingPromises.set(moduleName, loadingPromise);

    try {
      await loadingPromise;
      this.loadedModules.add(moduleName);
      this.loadingPromises.delete(moduleName);
      console.log(`[ModuleLoader] 模組 ${moduleName} 載入完成`);
    } catch (error) {
      this.loadingPromises.delete(moduleName);
      throw error;
    }

    return loadingPromise;
  }

  /**
   * 載入模組及其依賴
   * @private
   */
  async loadModuleWithDependencies(moduleName, loader) {
    // 先載入依賴
    const deps = this.dependencies.get(moduleName) || [];
    if (deps.length > 0) {
      console.log(`[ModuleLoader] 載入 ${moduleName} 的依賴:`, deps);
      await Promise.all(deps.map(dep => this.waitForModule(dep)));
    }

    // 載入模組本身
    await this.executeLoader(moduleName, loader);
  }

  /**
   * 執行載入器
   * @private
   */
  async executeLoader(moduleName, loader) {
    const retryCount = this.retryAttempts.get(moduleName) || 0;

    try {
      if (typeof loader === 'function') {
        await loader();
      } else if (typeof loader === 'string') {
        await this.loadScript(loader);
      } else {
        throw new Error(`無效的載入器類型: ${typeof loader}`);
      }

      // 重置重試計數
      this.retryAttempts.delete(moduleName);
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.warn(
          `[ModuleLoader] 模組 ${moduleName} 載入失敗，重試 ${retryCount + 1}/${this.maxRetries}`
        );
        this.retryAttempts.set(moduleName, retryCount + 1);

        // 延遲後重試
        await new Promise(resolve =>
          setTimeout(resolve, this.retryDelay * (retryCount + 1))
        );
        return this.executeLoader(moduleName, loader);
      } else {
        console.error(`[ModuleLoader] 模組 ${moduleName} 載入最終失敗:`, error);
        throw error;
      }
    }
  }

  /**
   * 載入腳本檔案
   * @private
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      // 檢查是否已經載入
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`載入腳本失敗: ${src}`));

      document.head.appendChild(script);
    });
  }

  /**
   * 等待模組載入完成
   * @param {string} moduleName - 模組名稱
   * @param {number} timeout - 超時時間（毫秒）
   * @returns {Promise} 等待完成的 Promise
   */
  async waitForModule(moduleName, timeout = 10000) {
    if (this.loadedModules.has(moduleName)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkLoaded = () => {
        if (this.loadedModules.has(moduleName)) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`等待模組 ${moduleName} 超時`));
        } else {
          setTimeout(checkLoaded, 50);
        }
      };
      checkLoaded();
    });
  }

  /**
   * 批次載入模組
   * @param {Array} modules - 模組列表 [{name, loader, deps}]
   * @returns {Promise} 全部載入完成的 Promise
   */
  async loadModules(modules) {
    // 設定依賴關係
    modules.forEach(({ name, deps }) => {
      if (deps) {
        this.setDependencies(name, deps);
      }
    });

    // 並行載入所有模組
    const loadPromises = modules.map(({ name, loader }) =>
      this.loadModule(name, loader)
    );

    await Promise.all(loadPromises);
    console.log('[ModuleLoader] 所有模組載入完成');
  }

  /**
   * 獲取已載入的模組列表
   * @returns {Array} 已載入的模組名稱列表
   */
  getLoadedModules() {
    return Array.from(this.loadedModules);
  }

  /**
   * 檢查模組是否已載入
   * @param {string} moduleName - 模組名稱
   * @returns {boolean} 是否已載入
   */
  isLoaded(moduleName) {
    return this.loadedModules.has(moduleName);
  }

  /**
   * 清除載入狀態
   * @param {string} moduleName - 模組名稱（可選）
   */
  clear(moduleName = null) {
    if (moduleName) {
      this.loadedModules.delete(moduleName);
      this.loadingPromises.delete(moduleName);
      this.retryAttempts.delete(moduleName);
    } else {
      this.loadedModules.clear();
      this.loadingPromises.clear();
      this.retryAttempts.clear();
    }
  }
}

// 創建全域載入器實例
if (typeof window !== 'undefined') {
  window.moduleLoader = new ModuleLoader();
}
