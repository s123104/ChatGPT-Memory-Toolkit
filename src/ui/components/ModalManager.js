/**
 * Modal Manager - 模態窗管理器
 * 可重用的模態窗管理類別
 */
class ModalManager {
  constructor() {
    this.activeModals = new Set();
    this.modalCounter = 0;
  }

  /**
   * 創建並顯示模態窗
   * @param {Object} config - 模態窗配置
   */
  show(config) {
    const {
      id = `modal-${++this.modalCounter}`,
      content = '',
      type = 'default',
      closable = true,
      backdrop = true,
      animation = true
    } = config;

    // 檢查是否已存在相同 ID 的模態窗
    if (document.getElementById(id)) {
      console.warn(`Modal with id "${id}" already exists`);
      return null;
    }

    const modal = this.createModal(id, content, { type, closable, backdrop, animation });
    this.activeModals.add(modal);
    document.body.appendChild(modal);

    // 顯示動畫
    if (animation) {
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
    }

    // 添加事件監聽
    this.addEventListeners(modal, { closable, backdrop });

    return modal;
  }

  /**
   * 創建記憶已滿模態窗
   * @param {Object} options - 選項
   */
  showMemoryFullModal(options = {}) {
    const {
      onExport = null,
      onCancel = null
    } = options;

    const content = this.getMemoryFullContent();
    const modal = this.show({
      id: 'memoryFullModal',
      content,
      type: 'memory-full',
      ...options
    });

    // 添加按鈕事件
    if (modal) {
      const exportBtn = modal.querySelector('[data-action="demoExport"]');
      const canc