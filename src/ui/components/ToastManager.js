/**
 * Toast Manager - Toast 通知管理器
 * 可重用的通知管理類別
 */
class ToastManager {
  constructor() {
    this.toasts = new Set();
    this.maxToasts = 5;
    this.defaultDuration = 3000;
  }

  /**
   * 顯示 Toast 通知
   * @param {string} message - 通知訊息
   * @param {string} type - 通知類型 ('success', 'error', 'info', 'warning')
   * @param {Object} options - 選項
   */
  show(message, type = 'info', options = {}) {
    const {
      duration = this.defaultDuration,
      closable = true,
      position = 'top-right',
    } = options;

    // 如果超過最大數量，移除最舊的
    if (this.toasts.size >= this.maxToasts) {
      const oldestToast = this.toasts.values().next().value;
      this.remove(oldestToast);
    }

    const toast = this.createToast(message, type, { closable, position });
    this.toasts.add(toast);
    document.body.appendChild(toast);

    // 顯示動畫
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // 自動移除
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    return toast;
  }

  /**
   * 創建 Toast 元素
   * @private
   */
  createToast(message, type, options) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = this.getIcon(type);

    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        ${
          options.closable
            ? `
          <button class="toast-close" data-action="closeToast">
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        `
            : ''
        }
      </div>
    `;

    // 添加關閉事件
    if (options.closable) {
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => {
        this.remove(toast);
      });
    }

    return toast;
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
   * 移除 Toast
   * @param {HTMLElement} toast - Toast 元素
   */
  remove(toast) {
    if (!toast || !this.toasts.has(toast)) return;

    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(toast);
    }, 300);
  }

  /**
   * 清除所有 Toast
   */
  clear() {
    this.toasts.forEach(toast => {
      this.remove(toast);
    });
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
