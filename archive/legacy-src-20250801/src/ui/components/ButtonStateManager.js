/**
 * Button State Manager - 現代化按鈕狀態管理器
 * 基於最佳實踐的可重用按鈕狀態管理類別
 */

// 從全域變數獲取常數，確保與主常數檔案同步
const getConstants = () => {
  const timing =
    typeof window !== 'undefined' && window.TIMING_CONSTANTS
      ? window.TIMING_CONSTANTS
      : {
          BUTTON_SUCCESS_DURATION: 2000,
          BUTTON_ERROR_DURATION: 2000,
          SCROLL_HIGHLIGHT_DURATION: 2000,
          FULL_ANIMATION_LOADING: 2500,
          FULL_ANIMATION_SUCCESS: 2000,
          FULL_ANIMATION_ERROR: 2000,
          CALLBACK_DELAY: 1000,
          SCROLL_DELAY: 800,
        };

  const ui =
    typeof window !== 'undefined' && window.UI_CONSTANTS
      ? window.UI_CONSTANTS
      : {
          DEFAULT_SUCCESS_PROBABILITY: 0.8,
        };

  return { timing, ui };
};
class ButtonStateManager {
  constructor(buttonElement) {
    if (!buttonElement) {
      throw new Error('ButtonStateManager requires a button element');
    }

    this.button = buttonElement;
    this.isAnimating = false;
    this.currentState = 'normal';
    this.originalContent = this.getButtonContent();
    this.timeouts = new Set();
    this.constants = getConstants(); // 初始化時獲取常數
    this.init();
  }

  /**
   * 初始化管理器
   * @private
   */
  init() {
    this.injectStyles();
    this.bindEvents();
  }

  /**
   * 注入必要的樣式
   * @private
   */
  injectStyles() {
    if (document.getElementById('button-state-manager-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'button-state-manager-styles';
    style.textContent = `
      .btn-state-loading {
        pointer-events: none;
        position: relative;
      }

      .btn-state-loading::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        margin: auto;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: btnStateSpinner 1s linear infinite;
      }

      @keyframes btnStateSpinner {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .btn-state-success {
        background: var(--success-color, #10b981) !important;
        border-color: var(--success-color, #10b981) !important;
      }

      .btn-state-error {
        background: var(--error-color, #ef4444) !important;
        border-color: var(--error-color, #ef4444) !important;
      }

      .btn-state-memory-full-urgent {
        background: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%) !important;
        animation: btnStateUrgentPulse 2s ease-in-out infinite;
      }

      @keyframes btnStateUrgentPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      .scroll-highlight {
        animation: scrollHighlight 2s ease-out;
      }
      
      @keyframes scrollHighlight {
        0% {
          box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.6);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.2);
          transform: scale(1.02);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 綁定事件
   * @private
   */
  bindEvents() {
    // 監聽按鈕被移除的情況
    if (window.MutationObserver) {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.removedNodes.forEach(node => {
              if (
                node === this.button ||
                (node.contains && node.contains(this.button))
              ) {
                this.destroy();
              }
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      this.observer = observer;
    }
  }

  /**
   * 獲取按鈕內容
   * @private
   */
  getButtonContent() {
    const mainText = this.button.querySelector(
      '.export-main-text, .btn-text, .copy-text'
    );
    const subText = this.button.querySelector('.export-sub-text, .btn-subtext');

    return {
      mainText: mainText ? mainText.textContent : '',
      subText: subText ? subText.textContent : '',
    };
  }

  /**
   * 設置按鈕內容
   * @private
   */
  setButtonContent(mainText, subText) {
    const mainTextEl = this.button.querySelector(
      '.export-main-text, .btn-text, .copy-text'
    );
    const subTextEl = this.button.querySelector(
      '.export-sub-text, .btn-subtext'
    );

    if (mainTextEl && mainText !== undefined) {
      mainTextEl.textContent = mainText;
    }
    if (subTextEl && subText !== undefined) {
      subTextEl.textContent = subText;
    }
  }

  /**
   * 清除所有狀態類別
   * @private
   */
  clearStateClasses() {
    this.button.classList.remove(
      'btn-state-loading',
      'btn-state-success',
      'btn-state-error',
      'btn-state-memory-full-urgent',
      'loading',
      'success',
      'error',
      'memory-full-urgent'
    );
  }

  /**
   * 清除所有超時
   * @private
   */
  clearTimeouts() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }

  /**
   * 設置載入狀態
   * @param {string} text - 載入時顯示的文字
   * @param {string} subText - 載入時顯示的副文字
   */
  setLoading(text = '載入中...', subText = 'Processing...') {
    if (this.isAnimating) {
      return;
    }

    this.clearStateClasses();
    this.clearTimeouts();

    this.button.classList.add('btn-state-loading', 'loading');
    this.button.disabled = true;
    this.currentState = 'loading';
    this.isAnimating = true;

    this.setButtonContent(text, subText);

    // 觸發自定義事件
    this.dispatchStateEvent('loading', { text, subText });
  }

  /**
   * 設置成功狀態
   * @param {string} text - 成功時顯示的文字
   * @param {string} subText - 成功時顯示的副文字
   * @param {number} duration - 成功狀態持續時間（毫秒）
   */
  setSuccess(
    text = '操作成功',
    subText = 'Success',
    duration = this.constants.timing.BUTTON_SUCCESS_DURATION
  ) {
    this.clearStateClasses();
    this.clearTimeouts();

    this.button.classList.add('btn-state-success', 'success');
    this.button.disabled = false;
    this.currentState = 'success';
    this.isAnimating = false;

    this.setButtonContent(text, subText);

    // 觸發自定義事件
    this.dispatchStateEvent('success', { text, subText, duration });

    if (duration > 0) {
      const timeout = setTimeout(() => {
        this.reset();
      }, duration);
      this.timeouts.add(timeout);
    }
  }

  /**
   * 設置錯誤狀態
   * @param {string} text - 錯誤時顯示的文字
   * @param {string} subText - 錯誤時顯示的副文字
   * @param {number} duration - 錯誤狀態持續時間（毫秒）
   */
  setError(
    text = '操作失敗',
    subText = 'Failed',
    duration = this.constants.timing.BUTTON_ERROR_DURATION
  ) {
    this.clearStateClasses();
    this.clearTimeouts();

    this.button.classList.add('btn-state-error', 'error');
    this.button.disabled = false;
    this.currentState = 'error';
    this.isAnimating = false;

    this.setButtonContent(text, subText);

    // 觸發自定義事件
    this.dispatchStateEvent('error', { text, subText, duration });

    if (duration > 0) {
      const timeout = setTimeout(() => {
        this.reset();
      }, duration);
      this.timeouts.add(timeout);
    }
  }

  /**
   * 設置記憶已滿緊急狀態
   * @param {string} text - 緊急狀態顯示的文字
   * @param {string} subText - 緊急狀態顯示的副文字
   */
  setMemoryFullUrgent(text = '立即匯出', subText = 'Memory Full - Export Now') {
    this.clearStateClasses();
    this.clearTimeouts();

    this.button.classList.add(
      'btn-state-memory-full-urgent',
      'memory-full-urgent'
    );
    this.button.disabled = false;
    this.currentState = 'memory-full-urgent';
    this.isAnimating = false;

    this.setButtonContent(text, subText);

    // 觸發自定義事件
    this.dispatchStateEvent('memory-full-urgent', { text, subText });
  }

  /**
   * 重置按鈕狀態
   * @param {string} defaultText - 預設文字
   * @param {string} defaultSubText - 預設副文字
   */
  reset(defaultText, defaultSubText) {
    this.clearStateClasses();
    this.clearTimeouts();

    this.button.disabled = false;
    this.currentState = 'normal';
    this.isAnimating = false;

    // 使用提供的文字或原始內容
    const mainText =
      defaultText !== undefined ? defaultText : this.originalContent.mainText;
    const subText =
      defaultSubText !== undefined
        ? defaultSubText
        : this.originalContent.subText;

    this.setButtonContent(mainText, subText);

    // 觸發自定義事件
    this.dispatchStateEvent('reset', { text: mainText, subText });
  }

  /**
   * 觸發狀態事件
   * @private
   */
  dispatchStateEvent(state, data) {
    const event = new CustomEvent('buttonStateChange', {
      detail: { state, data, button: this.button },
    });
    this.button.dispatchEvent(event);
  }

  /**
   * 執行完整動畫序列
   * @param {Object} options - 動畫選項
   * @returns {Promise<boolean>} 是否成功
   */
  async executeFullAnimation(options = {}) {
    const {
      loadingDuration = this.constants.timing.FULL_ANIMATION_LOADING,
      successDuration = this.constants.timing.FULL_ANIMATION_SUCCESS,
      errorDuration = this.constants.timing.FULL_ANIMATION_ERROR,
      successCallback = null,
      errorCallback = null,
      successProbability = this.constants.ui.DEFAULT_SUCCESS_PROBABILITY,
      scrollToTarget = null,
      scrollBehavior = 'smooth',
      scrollDelay = this.constants.timing.SCROLL_DELAY,
      loadingText = '處理中...',
      loadingSubText = 'Processing...',
      successText = '操作完成',
      successSubText = 'Completed',
      errorText = '操作失敗',
      errorSubText = 'Failed',
    } = options;

    try {
      // 開始載入
      this.setLoading(loadingText, loadingSubText);

      // 等待載入完成
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, loadingDuration);
        this.timeouts.add(timeout);
      });

      // 決定成功或失敗
      const isSuccess = Math.random() < successProbability;

      if (isSuccess) {
        this.setSuccess(successText, successSubText, successDuration);

        // 執行成功回調
        if (successCallback) {
          const timeout = setTimeout(
            () => successCallback(),
            this.constants.timing.CALLBACK_DELAY
          );
          this.timeouts.add(timeout);
        }

        // 滾動到目標元素
        if (scrollToTarget) {
          const timeout = setTimeout(() => {
            this.scrollToElement(scrollToTarget, scrollBehavior);
          }, scrollDelay);
          this.timeouts.add(timeout);
        }
      } else {
        this.setError(errorText, errorSubText, errorDuration);
        if (errorCallback) {
          const timeout = setTimeout(
            () => errorCallback(),
            this.constants.timing.CALLBACK_DELAY
          );
          this.timeouts.add(timeout);
        }
      }

      return isSuccess;
    } catch (error) {
      console.error('[ButtonStateManager] Animation failed:', error);
      this.setError('執行失敗', 'Execution Failed');
      return false;
    }
  }

  /**
   * 滾動到指定元素
   * @param {string|HTMLElement} target - 目標元素或選擇器
   * @param {string} behavior - 滾動行為 ('smooth', 'instant', 'auto')
   */
  scrollToElement(target, behavior = 'smooth') {
    let element;

    try {
      if (typeof target === 'string') {
        element = document.querySelector(target);
      } else if (target instanceof HTMLElement) {
        element = target;
      }

      if (element) {
        element.scrollIntoView({
          behavior,
          block: 'start',
          inline: 'nearest',
        });

        // 添加視覺提示效果
        this.highlightElement(element);
      } else {
        console.warn('[ButtonStateManager] 找不到滾動目標元素:', target);
      }
    } catch (error) {
      console.error('[ButtonStateManager] 滾動失敗:', error);
    }
  }

  /**
   * 高亮顯示元素
   * @param {HTMLElement} element - 要高亮的元素
   */
  highlightElement(element) {
    if (!element) {
      return;
    }

    try {
      // 添加高亮類別
      element.classList.add('scroll-highlight');

      // 移除高亮效果
      const timeout = setTimeout(() => {
        element.classList.remove('scroll-highlight');
      }, this.constants.timing.SCROLL_HIGHLIGHT_DURATION);
      this.timeouts.add(timeout);
    } catch (error) {
      console.error('[ButtonStateManager] 高亮失敗:', error);
    }
  }

  /**
   * 檢查當前狀態
   * @returns {string} 當前狀態
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * 檢查是否正在動畫中
   * @returns {boolean} 是否在動畫中
   */
  isInAnimation() {
    return this.isAnimating;
  }

  /**
   * 檢查按鈕是否可用
   * @returns {boolean} 是否可用
   */
  isEnabled() {
    return !this.button.disabled;
  }

  /**
   * 添加狀態變更監聽器
   * @param {Function} callback - 回調函數
   */
  onStateChange(callback) {
    if (typeof callback === 'function') {
      this.button.addEventListener('buttonStateChange', callback);
    }
  }

  /**
   * 移除狀態變更監聽器
   * @param {Function} callback - 回調函數
   */
  offStateChange(callback) {
    if (typeof callback === 'function') {
      this.button.removeEventListener('buttonStateChange', callback);
    }
  }

  /**
   * 銷毀管理器
   */
  destroy() {
    this.clearTimeouts();
    this.reset();

    if (this.observer) {
      this.observer.disconnect();
    }

    // 清理引用
    this.button = null;
    this.originalContent = null;
  }
}

// 導出類別到全域變數
if (typeof window !== 'undefined') {
  window.ButtonStateManager = ButtonStateManager;
}
