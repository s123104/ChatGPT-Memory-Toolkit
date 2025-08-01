/**
 * Modal Manager - 現代化模態窗管理器
 * 基於最佳實踐的可重用模態窗管理類別
 */
class ModalManager {
  constructor() {
    this.activeModals = new Map();
    this.modalCounter = 0;
    this.zIndexBase = 1000;
    this.focusStack = [];
    this.init();
  }

  /**
   * 初始化管理器
   * @private
   */
  init() {
    this.bindGlobalEvents();
    this.injectStyles();
  }

  /**
   * 綁定全域事件
   * @private
   */
  bindGlobalEvents() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.closeTopModal();
      }
    });
  }

  /**
   * 注入必要的樣式
   * @private
   */
  injectStyles() {
    if (document.getElementById('modal-manager-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'modal-manager-styles';
    style.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .modal-overlay.show {
        opacity: 1;
        visibility: visible;
      }
      
      .modal-content {
        background: var(--bg-card, #2d2d2d);
        border-radius: var(--radius-xl, 1rem);
        box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.4));
        max-width: 90vw;
        max-height: 90vh;
        overflow: hidden;
        transform: scale(0.9) translateY(-20px);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .modal-overlay.show .modal-content {
        transform: scale(1) translateY(0);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 創建並顯示模態窗
   * @param {Object} config - 模態窗配置
   * @returns {HTMLElement|null} 模態窗元素
   */
  show(config = {}) {
    const {
      id = `modal-${++this.modalCounter}`,
      content = '',
      type = 'default',
      closable = true,
      backdrop = true,
      animation = true,
      onShow = null,
      onHide = null,
      className = '',
    } = config;

    // 檢查是否已存在相同 ID 的模態窗
    if (this.activeModals.has(id)) {
      console.warn(`[ModalManager] Modal with id "${id}" already exists`);
      return this.activeModals.get(id).element;
    }

    try {
      const modal = this.createModal(id, content, {
        type,
        closable,
        backdrop,
        animation,
        className,
      });
      const modalData = {
        element: modal,
        config,
        onShow,
        onHide,
      };

      this.activeModals.set(id, modalData);
      document.body.appendChild(modal);

      // 管理焦點
      this.manageFocus(modal);

      // 顯示動畫
      if (animation) {
        requestAnimationFrame(() => {
          modal.classList.add('show');
        });
      }

      // 添加事件監聽
      this.addEventListeners(modal, { closable, backdrop, id });

      // 執行顯示回調
      if (onShow) {
        onShow(modal);
      }

      return modal;
    } catch (error) {
      console.error('[ModalManager] Failed to create modal:', error);
      return null;
    }
  }

  /**
   * 創建模態窗元素
   * @private
   */
  createModal(id, content, options) {
    const { type, className } = options;

    const modal = document.createElement('div');
    modal.id = id;
    modal.className = `modal-overlay ${type} ${className}`.trim();
    modal.style.zIndex = this.zIndexBase + this.activeModals.size;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', `${id}-title`);

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = content;

    modal.appendChild(modalContent);
    return modal;
  }

  /**
   * 創建記憶已滿模態窗
   * @param {Object} options - 選項
   * @returns {HTMLElement|null} 模態窗元素
   */
  showMemoryFullModal(options = {}) {
    const {
      onExport = null,
      onCancel = null,
      memoryCount = 0,
      usage = '100%',
    } = options;

    const content = this.getMemoryFullContent({ memoryCount, usage });

    const modal = this.show({
      id: 'memoryFullModal',
      content,
      type: 'memory-full',
      className: 'memory-full-modal',
      onShow: modalElement => {
        this.bindMemoryFullEvents(modalElement, { onExport, onCancel });
      },
      ...options,
    });

    return modal;
  }

  /**
   * 獲取記憶已滿模態窗內容
   * @private
   */
  getMemoryFullContent({ memoryCount, usage }) {
    return `
      <div class="memory-modal-header">
        <div class="memory-modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V21A2 2 0 0 0 5 23H19A2 2 0 0 0 21 21V9M19 9H14V4H5V21H19V9Z"/>
          </svg>
        </div>
        <div class="memory-modal-title-section">
          <h3 id="memoryFullModal-title" class="memory-modal-title">記憶已滿</h3>
          <p class="memory-modal-subtitle">Memory Storage Full</p>
        </div>
        <div class="memory-modal-status">
          <div class="memory-status-dot warning"></div>
        </div>
      </div>
      
      <div class="memory-modal-body">
        <div class="memory-alert-content">
          <div class="memory-alert-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z"/>
            </svg>
          </div>
          <div class="memory-alert-text">
            <p>您的 ChatGPT 記憶已達到上限。建議立即匯出記憶內容以釋放空間，避免遺失重要資訊。</p>
          </div>
        </div>
        
        <div class="memory-usage-info">
          <div class="usage-bar">
            <div class="usage-fill" style="width: ${usage}"></div>
          </div>
          <div class="usage-text">${usage} 已使用 • ${memoryCount} 筆記憶</div>
        </div>
        
        <div class="memory-modal-actions">
          <button class="btn-secondary" data-action="cancel">
            <span>稍後處理</span>
          </button>
          <button class="btn-primary" data-action="export">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L13.09 8.26L22 12L13.09 15.74L12 22L10.91 15.74L2 12L10.91 8.26L12 2Z"/>
            </svg>
            <span>立即匯出</span>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 綁定記憶已滿模態窗事件
   * @private
   */
  bindMemoryFullEvents(modal, { onExport, onCancel }) {
    const exportBtn = modal.querySelector('[data-action="export"]');
    const cancelBtn = modal.querySelector('[data-action="cancel"]');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (onExport) {
          onExport();
        }
        this.hide('memoryFullModal');
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (onCancel) {
          onCancel();
        }
        this.hide('memoryFullModal');
      });
    }
  }

  /**
   * 添加事件監聽器
   * @private
   */
  addEventListeners(modal, { closable, backdrop, id }) {
    if (backdrop) {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          this.hide(id);
        }
      });
    }

    if (closable) {
      const closeBtn = modal.querySelector(
        '.modal-close, [data-action="close"]'
      );
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.hide(id);
        });
      }
    }
  }

  /**
   * 管理焦點
   * @private
   */
  manageFocus(modal) {
    // 保存當前焦點元素
    this.focusStack.push(document.activeElement);

    // 設置焦點到模態窗
    const focusableElement = modal.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElement) {
      focusableElement.focus();
    }
  }

  /**
   * 恢復焦點
   * @private
   */
  restoreFocus() {
    const previousFocus = this.focusStack.pop();
    if (previousFocus && previousFocus.focus) {
      previousFocus.focus();
    }
  }

  /**
   * 隱藏模態窗
   * @param {string} id - 模態窗 ID
   */
  hide(id) {
    const modalData = this.activeModals.get(id);
    if (!modalData) {
      console.warn(`[ModalManager] Modal with id "${id}" not found`);
      return;
    }

    const { element, onHide } = modalData;

    // 執行隱藏回調
    if (onHide) {
      onHide(element);
    }

    // 隱藏動畫
    element.classList.remove('show');

    // 移除元素
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.activeModals.delete(id);
      this.restoreFocus();
    }, 300);
  }

  /**
   * 關閉最上層模態窗
   */
  closeTopModal() {
    if (this.activeModals.size === 0) {
      return;
    }

    const modalIds = Array.from(this.activeModals.keys());
    const topModalId = modalIds[modalIds.length - 1];
    this.hide(topModalId);
  }

  /**
   * 關閉所有模態窗
   */
  hideAll() {
    const modalIds = Array.from(this.activeModals.keys());
    modalIds.forEach(id => this.hide(id));
  }

  /**
   * 檢查是否有活動的模態窗
   * @returns {boolean}
   */
  hasActiveModals() {
    return this.activeModals.size > 0;
  }

  /**
   * 獲取活動模態窗數量
   * @returns {number}
   */
  getActiveModalCount() {
    return this.activeModals.size;
  }
}

// 創建全域實例
const modalManager = new ModalManager();

// 導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ModalManager, modalManager };
} else if (typeof window !== 'undefined') {
  window.ModalManager = ModalManager;
  window.modalManager = modalManager;
}
