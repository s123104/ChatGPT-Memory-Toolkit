/**
 * Button State Manager - 按鈕狀態管理器
 * 可重用的按鈕狀態管理類別
 */
class ButtonStateManager {
  constructor(buttonElement) {
    this.button = buttonElement;
    this.isAnimating = false;
  }

  /**
   * 設置載入狀態
   * @param {string} text - 載入時顯示的文字
   * @param {string} subText - 載入時顯示的副文字
   */
  setLoading(text = '載入中...', subText = 'Processing...') {
    if (this.isAnimating) return;

    this.button.classList.remove('success', 'error');
    this.button.classList.add('loading');
    this.button.disabled = true;

    const mainText = this.button.querySelector('.export-main-text');
    const subTextEl = this.button.querySelector('.export-sub-text');

    if (mainText) mainText.textContent = text;
    if (subTextEl) subTextEl.textContent = subText;

    this.isAnimating = true;
  }

  /**
   * 設置成功狀態
   * @param {string} text - 成功時顯示的文字
   * @param {string} subText - 成功時顯示的副文字
   * @param {number} duration - 成功狀態持續時間（毫秒）
   */
  setSuccess(text = '操作成功', subText = 'Success', duration = 2000) {
    this.button.classList.remove('loading', 'error');
    this.button.classList.add('success');

    const mainText = this.button.querySelector('.export-main-text');
    const subTextEl = this.button.querySelector('.export-sub-text');

    if (mainText) mainText.textContent = text;
    if (subTextEl) subTextEl.textContent = subText;

    if (duration > 0) {
      setTimeout(() => {
        this.reset();
      }, duration);
    }
  }

  /**
   * 設置錯誤狀態
   * @param {string} text - 錯誤時顯示的文字
   * @param {string} subText - 錯誤時顯示的副文字
   * @param {number} duration - 錯誤狀態持續時間（毫秒）
   */
  setError(text = '操作失敗', subText = 'Failed', duration = 2000) {
    this.button.classList.remove('loading', 'success');
    this.button.classList.add('error');

    const mainText = this.button.querySelector('.export-main-text');
    const subTextEl = this.button.querySelector('.export-sub-text');

    if (mainText) mainText.textContent = text;
    if (subTextEl) subTextEl.textContent = subText;

    if (duration > 0) {
      setTimeout(() => {
        this.reset();
      }, duration);
    }
  }

  /**
   * 設置記憶已滿緊急狀態
   * @param {string} text - 緊急狀態顯示的文字
   * @param {string} subText - 緊急狀態顯示的副文字
   */
  setMemoryFullUrgent(text = '立即匯出', subText = 'Memory Full - Export Now') {
    this.button.classList.remove('loading', 'success', 'error');
    this.button.classList.add('memory-full-urgent');

    const mainText = this.button.querySelector('.export-main-text');
    const subTextEl = this.button.querySelector('.export-sub-text');

    if (mainText) mainText.textContent = text;
    if (subTextEl) subTextEl.textContent = subText;
  }

  /**
   * 重置按鈕狀態
   * @param {string} defaultText - 預設文字
   * @param {string} defaultSubText - 預設副文字
   */
  reset(defaultText = '匯出記憶', defaultSubText = 'Export Memory') {
    this.button.classList.remove(
      'loading',
      'success',
      'error',
      'memory-full-urgent'
    );
    this.button.disabled = false;
    this.isAnimating = false;

    const mainText = this.button.querySelector('.export-main-text');
    const subTextEl = this.button.querySelector('.export-sub-text');

    if (mainText) mainText.textContent = defaultText;
    if (subTextEl) subTextEl.textContent = defaultSubText;
  }

  /**
   * 執行完整動畫序列
   * @param {Object} options - 動畫選項
   * @param {Function} onSuccess - 成功回調
   * @param {Function} onError - 錯誤回調
   */
  async executeFullAnimation(options = {}) {
    const {
      loadingDuration = 2500,
      successDuration = 2000,
      errorDuration = 2000,
      successCallback = null,
      errorCallback = null,
      successProbability = 0.5,
      scrollToTarget = null, // 新增：成功時滾動到的目標元素
      scrollBehavior = 'smooth', // 新增：滾動行為
      scrollDelay = 800, // 新增：滾動延遲時間
    } = options;

    // 開始載入
    this.setLoading();

    // 等待載入完成
    await new Promise(resolve => setTimeout(resolve, loadingDuration));

    // 隨機決定成功或失敗
    const isSuccess = Math.random() > 1 - successProbability;

    if (isSuccess) {
      this.setSuccess('匯出完成', 'Export Completed', successDuration);

      // 執行成功回調
      if (successCallback) {
        setTimeout(() => successCallback(), 1000);
      }

      // 滾動到目標元素
      if (scrollToTarget) {
        setTimeout(() => {
          this.scrollToElement(scrollToTarget, scrollBehavior);
        }, scrollDelay);
      }
    } else {
      this.setError('匯出失敗', 'Export Failed', errorDuration);
      if (errorCallback) {
        setTimeout(() => errorCallback(), 1000);
      }
    }

    return isSuccess;
  }

  /**
   * 滾動到指定元素
   * @param {string|HTMLElement} target - 目標元素或選擇器
   * @param {string} behavior - 滾動行為 ('smooth', 'instant', 'auto')
   */
  scrollToElement(target, behavior = 'smooth') {
    let element;

    if (typeof target === 'string') {
      element = document.querySelector(target);
    } else if (target instanceof HTMLElement) {
      element = target;
    }

    if (element) {
      element.scrollIntoView({
        behavior: behavior,
        block: 'start',
        inline: 'nearest',
      });

      // 添加視覺提示效果
      this.highlightElement(element);
    } else {
      console.warn('ButtonStateManager: 找不到滾動目標元素', target);
    }
  }

  /**
   * 高亮顯示元素
   * @param {HTMLElement} element - 要高亮的元素
   */
  highlightElement(element) {
    // 添加高亮類別
    element.classList.add('scroll-highlight');

    // 如果沒有對應的 CSS，動態添加
    if (!document.getElementById('scroll-highlight-styles')) {
      const style = document.createElement('style');
      style.id = 'scroll-highlight-styles';
      style.textContent = `
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

    // 移除高亮效果
    setTimeout(() => {
      element.classList.remove('scroll-highlight');
    }, 2000);
  }

  /**
   * 檢查當前狀態
   */
  getCurrentState() {
    if (this.button.classList.contains('loading')) return 'loading';
    if (this.button.classList.contains('success')) return 'success';
    if (this.button.classList.contains('error')) return 'error';
    if (this.button.classList.contains('memory-full-urgent'))
      return 'memory-full-urgent';
    return 'normal';
  }

  /**
   * 檢查是否正在動畫中
   */
  isInAnimation() {
    return this.isAnimating;
  }
}

// 導出類別
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ButtonStateManager;
} else if (typeof window !== 'undefined') {
  window.ButtonStateManager = ButtonStateManager;
}
