/**
 * Toast Manager - 現代化通知管理器
 * 基於最佳實踐的可重用通知管理類別
 */
class ToastManager {
  constructor() {
    this.toasts = new Map();
    this.maxToasts = 5;
    this.defaultDuration = 3000;
    this.positions = {
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' },
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-center': {
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
      },
    };
    this.init();
  }

  /**
   * 初始化管理器
   * @private
   */
  init() {
    this.injectStyles();
  }

  /**
   * 注入必要的樣式
   * @private
   */
  injectStyles() {
    if (document.getElementById('toast-manager-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'toast-manager-styles';
    style.textContent = `
      .toast {
        position: fixed;
        background: var(--bg-card, #2d2d2d);
        border: 1px solid var(--border-light, #404040);
        border-radius: var(--radius-lg, 0.75rem);
        padding: 0;
        min-width: 300px;
        max-width: 400px;
        box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.4));
        z-index: 10000;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .toast.show {
        transform: translateX(0);
      }

      .toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
      }

      .toast-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-success {
        border-left: 4px solid var(--success-color, #10b981);
      }

      .toast-success .toast-icon {
        background: var(--success-color, #10b981);
        color: white;
      }

      .toast-error {
        border-left: 4px solid var(--error-color, #ef4444);
      }

      .toast-error .toast-icon {
        background: var(--error-color, #ef4444);
        color: white;
      }

      .toast-warning {
        border-left: 4px solid var(--warning-color, #f59e0b);
      }

      .toast-warning .toast-icon {
        background: var(--warning-color, #f59e0b);
        color: white;
      }

      .toast-info {
        border-left: 4px solid var(--info-color, #3b82f6);
      }

      .toast-info .toast-icon {
        background: var(--info-color, #3b82f6);
        color: white;
      }

      .toast-message {
        flex: 1;
        color: var(--text-primary, #ffffff);
        font-size: 14px;
        line-height: 1.4;
      }

      .toast-close {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border: none;
        background: none;
        color: var(--text-tertiary, #808080);
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .toast-close:hover {
        background: var(--bg-overlay, rgba(255, 255, 255, 0.05));
        color: var(--text-secondary, #b3b3b3);
      }

      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: var(--primary-color, #667eea);
        border-radius: 0 0 var(--radius-lg, 0.75rem) var(--radius-lg, 0.75rem);
        transition: width linear;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 顯示 Toast 通知
   * @param {string} message - 通知訊息
   * @param {string} type - 通知類型 ('success', 'error', 'info', 'warning')
   * @param {Object} options - 選項
   * @returns {HTMLElement} Toast 元素
   */
  show(message, type = 'info', options = {}) {
    const {
      duration = this.defaultDuration,
      closable = true,
      position = 'top-right',
      showProgress = false,
      id = null,
    } = options;

    // 如果超過最大數量，移除最舊的
    if (this.toasts.size >= this.maxToasts) {
      const oldestToast = this.toasts.values().next().value;
      this.remove(oldestToast.element);
    }

    try {
      const toast = this.createToast(message, type, {
        closable,
        position,
        showProgress,
        id,
      });
      const toastId =
        id ||
        `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      const toastData = {
        element: toast,
        id: toastId,
        type,
        message,
        createdAt: Date.now(),
      };

      this.toasts.set(toastId, toastData);
      document.body.appendChild(toast);

      // 設置位置
      this.setPosition(toast, position);

      // 顯示動畫
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      // 進度條動畫
      if (showProgress && duration > 0) {
        this.animateProgress(toast, duration);
      }

      // 自動移除
      if (duration > 0) {
        setTimeout(() => {
          this.remove(toast);
        }, duration);
      }

      return toast;
    } catch (error) {
      console.error('[ToastManager] Failed to create toast:', error);
      return null;
    }
  }

  /**
   * 創建 Toast 元素
   * @private
   */
  createToast(message, type, options) {
    const { closable, showProgress } = options;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    const icon = this.getIcon(type);
    const progressBar = showProgress
      ? '<div class="toast-progress"></div>'
      : '';

    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${this.escapeHtml(message)}</div>
        ${
          closable
            ? `
          <button class="toast-close" data-action="closeToast" aria-label="關閉通知">
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        `
            : ''
        }
      </div>
      ${progressBar}
    `;

    // 添加關閉事件
    if (closable) {
      const closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.remove(toast);
        });
      }
    }

    return toast;
  }

  /**
   * 設置 Toast 位置
   * @private
   */
  setPosition(toast, position) {
    const pos = this.positions[position] || this.positions['top-right'];
    Object.assign(toast.style, pos);
  }

  /**
   * 動畫進度條
   * @private
   */
  animateProgress(toast, duration) {
    const progressBar = toast.querySelector('.toast-progress');
    if (!progressBar) {
      return;
    }

    progressBar.style.width = '100%';
    progressBar.style.transitionDuration = `${duration}ms`;

    requestAnimationFrame(() => {
      progressBar.style.width = '0%';
    });
  }

  /**
   * 獲取圖示
   * @private
   */
  getIcon(type) {
    const icons = {
      success:
        '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/></svg>',
      error:
        '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>',
      warning:
        '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z"/></svg>',
      info: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>',
    };
    return icons[type] || icons.info;
  }

  /**
   * 轉義 HTML
   * @private
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 移除 Toast
   * @param {HTMLElement} toast - Toast 元素
   */
  remove(toast) {
    if (!toast) {
      return;
    }

    // 找到對應的 toast 數據
    let toastId = null;
    for (const [id, data] of this.toasts.entries()) {
      if (data.element === toast) {
        toastId = id;
        break;
      }
    }

    if (!toastId) {
      return;
    }

    toast.classList.remove('show');

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(toastId);
    }, 300);
  }

  /**
   * 根據 ID 移除 Toast
   * @param {string} id - Toast ID
   */
  removeById(id) {
    const toastData = this.toasts.get(id);
    if (toastData) {
      this.remove(toastData.element);
    }
  }

  /**
   * 清除所有 Toast
   */
  clear() {
    const toastElements = Array.from(this.toasts.values()).map(
      data => data.element
    );
    toastElements.forEach(toast => {
      this.remove(toast);
    });
  }

  /**
   * 清除指定類型的 Toast
   * @param {string} type - Toast 類型
   */
  clearByType(type) {
    const toastElements = Array.from(this.toasts.values())
      .filter(data => data.type === type)
      .map(data => data.element);

    toastElements.forEach(toast => {
      this.remove(toast);
    });
  }

  /**
   * 獲取活動 Toast 數量
   * @returns {number}
   */
  getActiveCount() {
    return this.toasts.size;
  }

  /**
   * 快捷方法
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', options);
  }

  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  info(message, options = {}) {
    return this.show(message, 'info', options);
  }
}

// 創建全域實例
const toastManager = new ToastManager();

// 導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ToastManager, toastManager };
} else if (typeof window !== 'undefined') {
  window.ToastManager = ToastManager;
  window.toastManager = toastManager;
}
