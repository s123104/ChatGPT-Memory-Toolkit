/**
 * Toast Manager - 現代化通知管理器
 * 重構版本，精簡且模組化
 */

import { TOAST_STYLES, TOAST_ICONS } from './toast-styles.js';

/**
 * Toast 通知管理器
 */
export class ToastManager {
  constructor(options = {}) {
    this.toasts = new Map();
    this.config = {
      maxToasts: 5,
      defaultDuration: 3000,
      defaultPosition: 'top-right',
      ...options,
    };

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
    this.createContainer();
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
    style.textContent = TOAST_STYLES;
    document.head.appendChild(style);
  }

  /**
   * 創建容器
   * @private
   */
  createContainer() {
    if (document.getElementById('toast-container')) {
      return;
    }

    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = `toast-container ${this.config.defaultPosition}`;
    document.body.appendChild(container);
    this.container = container;
  }

  /**
   * 顯示 Toast 通知
   * @param {string} message - 訊息內容
   * @param {string} type - 通知類型
   * @param {Object} options - 選項
   * @returns {string} Toast ID
   */
  show(message, type = 'info', options = {}) {
    const toastOptions = {
      duration: this.config.defaultDuration,
      position: this.config.defaultPosition,
      title: '',
      persistent: false,
      ...options,
    };

    const id = this.generateId();
    const toast = this.createToast(id, message, type, toastOptions);

    this.addToast(id, toast, toastOptions);
    this.displayToast(toast, toastOptions);

    // 觸發事件
    this.dispatchEvent('toastShow', {
      id,
      message,
      type,
      options: toastOptions,
    });

    return id;
  }

  /**
   * 創建 Toast 元素
   * @private
   */
  createToast(id, message, type, options) {
    const toast = document.createElement('div');
    toast.id = `toast-${id}`;
    toast.className = `toast ${type}`;

    const icon = TOAST_ICONS[type] || TOAST_ICONS.info;
    const title = options.title
      ? `<div class="toast-title">${options.title}</div>`
      : '';

    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">${icon}</div>
        <div class="toast-body">
          ${title}
          <div class="toast-message">${message}</div>
        </div>
        ${
          options.persistent
            ? ''
            : `
          <button class="toast-close" data-action="close">
            ${TOAST_ICONS.close}
          </button>
        `
        }
      </div>
      ${options.duration > 0 ? '<div class="toast-progress"></div>' : ''}
    `;

    // 綁定關閉事件
    if (!options.persistent) {
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn?.addEventListener('click', () => this.hide(id));
    }

    return toast;
  }

  /**
   * 添加 Toast 到管理器
   * @private
   */
  addToast(id, element, options) {
    // 檢查數量限制
    if (this.toasts.size >= this.config.maxToasts) {
      const oldestId = this.toasts.keys().next().value;
      this.hide(oldestId);
    }

    this.toasts.set(id, {
      element,
      options,
      timestamp: Date.now(),
    });
  }

  /**
   * 顯示 Toast
   * @private
   */
  displayToast(toast, options) {
    this.container.appendChild(toast);

    // 觸發顯示動畫
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // 設置自動隱藏
    if (options.duration > 0) {
      const progressBar = toast.querySelector('.toast-progress');
      if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.style.transitionDuration = `${options.duration}ms`;

        requestAnimationFrame(() => {
          progressBar.style.width = '0%';
        });
      }

      setTimeout(() => {
        const id = toast.id.replace('toast-', '');
        this.hide(id);
      }, options.duration);
    }
  }

  /**
   * 隱藏 Toast
   * @param {string} id - Toast ID
   * @returns {boolean} 是否成功隱藏
   */
  hide(id) {
    const toast = this.toasts.get(id);
    if (!toast) {
      return false;
    }

    const element = toast.element;
    element.classList.add('removing');

    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.toasts.delete(id);

      // 觸發事件
      this.dispatchEvent('toastHide', { id });
    }, 300);

    return true;
  }

  /**
   * 便利方法 - 成功通知
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  /**
   * 便利方法 - 錯誤通知
   */
  error(message, options = {}) {
    return this.show(message, 'error', {
      duration: 5000,
      ...options,
    });
  }

  /**
   * 便利方法 - 警告通知
   */
  warning(message, options = {}) {
    return this.show(message, 'warning', {
      duration: 4000,
      ...options,
    });
  }

  /**
   * 便利方法 - 資訊通知
   */
  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * 清除所有 Toast
   */
  clear() {
    const ids = Array.from(this.toasts.keys());
    ids.forEach(id => this.hide(id));
  }

  /**
   * 生成唯一 ID
   * @private
   */
  generateId() {
    const BASE_36 = 36;
    const SUBSTR_START = 2;
    return (
      Date.now().toString(BASE_36) +
      Math.random().toString(BASE_36).substr(SUBSTR_START)
    );
  }

  /**
   * 觸發事件
   * @private
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(`toast${eventName}`, { detail });
    document.dispatchEvent(event);
  }

  /**
   * 獲取活動的 Toast 數量
   */
  getActiveCount() {
    return this.toasts.size;
  }

  /**
   * 檢查是否有特定類型的 Toast
   */
  hasType(type) {
    for (const toast of this.toasts.values()) {
      if (toast.element.classList.contains(type)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 銷毀管理器
   */
  destroy() {
    this.clear();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    const styles = document.getElementById('toast-manager-styles');
    if (styles) {
      styles.remove();
    }

    console.log('[ToastManager] 管理器已銷毀');
  }
}

// 導出到全域變數
if (typeof window !== 'undefined') {
  window.ToastManager = ToastManager;
}
