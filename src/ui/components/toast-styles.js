/**
 * Toast Styles - Toast 通知樣式定義
 * 將樣式從 ToastManager 中分離出來
 */

export const TOAST_STYLES = `
  .toast {
    position: fixed;
    background: var(--bg-card, #2d2d2d);
    border: 1px solid var(--border-light, #404040);
    border-radius: var(--radius-lg, 0.75rem);
    padding: 0;
    min-width: 300px;
    max-width: 400px;
    z-index: var(--z-toast, 10000);
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: auto;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 
      0 10px 25px -5px rgba(0, 0, 0, 0.3),
      0 4px 6px -2px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .toast::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--toast-accent-color, var(--primary-color, #667eea));
    opacity: 0.8;
  }

  .toast.show {
    opacity: 1;
    transform: translateY(0);
  }

  .toast.removing {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
    pointer-events: none;
  }

  .toast-content {
    padding: 16px 20px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .toast-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    margin-top: 2px;
  }

  .toast-icon svg {
    width: 100%;
    height: 100%;
  }

  .toast-body {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    font-weight: 600;
    font-size: 14px;
    line-height: 1.4;
    color: var(--text-primary, #ffffff);
    margin-bottom: 4px;
  }

  .toast-message {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary, #a0a0a0);
    word-wrap: break-word;
  }

  .toast-close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: var(--text-tertiary, #606060);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    margin-top: -2px;
    margin-right: -4px;
  }

  .toast-close:hover {
    background: var(--bg-overlay, rgba(255, 255, 255, 0.1));
    color: var(--text-secondary, #a0a0a0);
  }

  .toast-close svg {
    width: 14px;
    height: 14px;
  }

  .toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: var(--toast-accent-color, var(--primary-color, #667eea));
    transition: width linear;
    opacity: 0.6;
  }

  /* Toast 類型樣式 */
  .toast.success {
    --toast-accent-color: var(--success-color, #10b981);
  }

  .toast.success .toast-icon {
    color: var(--success-color, #10b981);
  }

  .toast.error {
    --toast-accent-color: var(--error-color, #ef4444);
  }

  .toast.error .toast-icon {
    color: var(--error-color, #ef4444);
  }

  .toast.warning {
    --toast-accent-color: var(--warning-color, #f59e0b);
  }

  .toast.warning .toast-icon {
    color: var(--warning-color, #f59e0b);
  }

  .toast.info {
    --toast-accent-color: var(--info-color, #3b82f6);
  }

  .toast.info .toast-icon {
    color: var(--info-color, #3b82f6);
  }

  /* 響應式設計 */
  @media (max-width: 480px) {
    .toast {
      margin: 0 10px;
      min-width: auto;
      max-width: calc(100vw - 20px);
    }

    .toast-content {
      padding: 14px 16px;
    }

    .toast-title {
      font-size: 13px;
    }

    .toast-message {
      font-size: 12px;
    }
  }

  /* 深色主題優化 */
  .dark .toast {
    background: var(--bg-card-dark, #1f1f1f);
    border-color: var(--border-dark, #333333);
  }

  .dark .toast-close:hover {
    background: var(--bg-overlay-dark, rgba(255, 255, 255, 0.05));
  }

  /* 動畫關鍵幀 */
  @keyframes toastSlideIn {
    from {
      opacity: 0;
      transform: translateY(-100%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes toastSlideOut {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(-100%) scale(0.9);
    }
  }

  @keyframes toastBounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3) rotate(6deg);
    }
    50% {
      transform: scale(1.05) rotate(-3deg);
    }
    70% {
      transform: scale(0.9) rotate(1deg);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  }

  /* 堆疊樣式 */
  .toast-container {
    position: fixed;
    z-index: var(--z-toast, 10000);
    pointer-events: none;
  }

  .toast-container.top-right {
    top: 20px;
    right: 20px;
  }

  .toast-container.top-left {
    top: 20px;
    left: 20px;
  }

  .toast-container.bottom-right {
    bottom: 20px;
    right: 20px;
  }

  .toast-container.bottom-left {
    bottom: 20px;
    left: 20px;
  }

  .toast-container.top-center {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  .toast-container.bottom-center {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  .toast-container .toast {
    margin-bottom: 10px;
    pointer-events: auto;
  }

  .toast-container .toast:last-child {
    margin-bottom: 0;
  }
`;

export const TOAST_ICONS = {
  success: `
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>
  `,
  error: `
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
    </svg>
  `,
  warning: `
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>
  `,
  info: `
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
    </svg>
  `,
  close: `
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  `,
};
