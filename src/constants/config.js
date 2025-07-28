/**
 * ChatGPT Memory Toolkit Configuration
 * 應用程式設定和常量定義
 */

export const APP_CONFIG = {
  name: 'ChatGPT Memory Toolkit',
  version: '1.0.0',
  author: 'ChatGPT Memory Toolkit Team',
  website: 'https://github.com/chatgpt-memory-toolkit/extension',
  supportEmail: 'support@chatgpt-memory-toolkit.com'
};

export const CHATGPT_CONFIG = {
  // 支援的網域
  supportedDomains: [
    'chatgpt.com',
    'chat.openai.com'
  ],
  
  // UI 選擇器
  selectors: {
    profileButton: '[data-testid="accounts-profile-button"][role="button"]',
    settingsMenuItem: '[data-testid="settings-menu-item"]',
    personalizationTab: '[data-testid="personalization-tab"][role="tab"]',
    memoryManagementSection: '.memory-management',
    manageButton: 'button:contains("管理"), button:contains("Manage")',
    memoryModal: '.popover,[role="dialog"],[aria-modal="true"]',
    memoryTable: 'table',
    memoryRows: 'tbody tr, [role="row"]',
    memoryCells: 'td, [role="cell"], .whitespace-pre-wrap, .py-2',
    scrollContainer: '[class*="overflow-y"],[style*="overflow-y"],.overflow-y-auto,.overflow-auto'
  },
  
  // 關鍵字匹配
  keywords: {
    memoryFull: ['儲存的記憶已滿', 'Memory storage is full', 'Memory is full'],
    memoryManagement: ['管理記憶', 'Manage memory', 'Memory', '記憶'],
    modalTitles: ['儲存的記憶', 'Saved memories', 'Memories', '記憶列表'],
    manageButtons: ['管理', 'Manage']
  },
  
  // 操作超時設定（毫秒）
  timeouts: {
    elementWait: 15000,
    menuExpand: 8000,
    settingsLoad: 15000,
    tabSwitch: 12000,
    panelActivate: 10000,
    memoryLoad: 15000,
    modalOpen: 20000,
    tableLoad: 12000,
    rowsLoad: 12000,
    clickDelay: 120,
    expandRetries: 5
  },
  
  // 滾動和掃描設定
  scrolling: {
    maxScanTime: 40000,
    stepRatio: 0.6,
    idleRoundsToStop: 8,
    settleTime: 70,
    endBounceTime: 140
  }
};

export const UI_CONFIG = {
  // 主題設定
  theme: {
    primary: '#10a37f',
    primaryHover: '#0d9668',
    secondary: '#f8fafc',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    text: '#374151',
    textLight: '#6b7280',
    textDark: '#1f2937',
    border: '#e2e8f0',
    background: '#ffffff',
    backgroundDark: '#1e293b'
  },
  
  // 動畫設定
  animations: {
    duration: 200,
    easing: 'ease-in-out'
  },
  
  // 響應式斷點
  breakpoints: {
    mobile: 320,
    tablet: 768,
    desktop: 1024
  }
};

export const STORAGE_KEYS = {
  // 用戶設定
  settings: 'cmt_settings',
  
  // 匯出資料
  memoryList: 'cmt_memory_list',
  memoryMarkdown: 'cmt_memory_markdown',
  lastExport: 'cmt_last_export',
  exportCount: 'cmt_export_count',
  exportHistory: 'cmt_export_history',
  
  // 統計資料
  usageStats: 'cmt_usage_stats',
  performanceMetrics: 'cmt_performance_metrics'
};

export const DEFAULT_SETTINGS = {
  // 通知設定
  notifications: {
    memoryFull: true,
    exportComplete: true,
    exportError: true
  },
  
  // 匯出設定
  export: {
    defaultFormat: 'markdown',
    includeTimestamp: true,
    includeUsageStats: true,
    autoClipboard: true,
    showProgress: true
  },
  
  // 進階設定
  advanced: {
    debugMode: false,
    retryAttempts: 3,
    batchSize: 100,
    maxConcurrentRequests: 3
  },
  
  // UI 設定
  ui: {
    theme: 'auto', // 'light', 'dark', 'auto'
    language: 'auto', // 'zh-TW', 'en', 'auto'
    compactMode: false,
    showTooltips: true
  }
};

export const EXPORT_FORMATS = {
  markdown: {
    extension: 'md',
    mimeType: 'text/markdown',
    name: 'Markdown',
    description: '標準 Markdown 格式，適合文檔編輯'
  },
  json: {
    extension: 'json',
    mimeType: 'application/json',
    name: 'JSON',
    description: '結構化資料格式，適合程式處理'
  },
  csv: {
    extension: 'csv',
    mimeType: 'text/csv',
    name: 'CSV',
    description: '表格格式，適合試算表應用'
  },
  txt: {
    extension: 'txt',
    mimeType: 'text/plain',
    name: 'Pure Text',
    description: '純文字格式，最大相容性'
  },
  html: {
    extension: 'html',
    mimeType: 'text/html',
    name: 'HTML',
    description: 'HTML 格式，適合網頁顯示'
  }
};

export const MESSAGE_TYPES = {
  // 內容腳本到背景的消息
  EXPORT_START: 'export_start',
  EXPORT_PROGRESS: 'export_progress',
  EXPORT_COMPLETE: 'export_complete',
  EXPORT_ERROR: 'export_error',
  MEMORY_FULL_DETECTED: 'memory_full_detected',
  PAGE_STATUS_CHECK: 'page_status_check',
  
  // 彈出視窗到背景的消息
  GET_EXPORT_STATUS: 'get_export_status',
  GET_SETTINGS: 'get_settings',
  UPDATE_SETTINGS: 'update_settings',
  START_EXPORT: 'start_export',
  CLEAR_HISTORY: 'clear_history',
  
  // 背景到其他組件的消息
  SETTINGS_UPDATED: 'settings_updated',
  EXPORT_STATUS_CHANGED: 'export_status_changed'
};

export const ERROR_CODES = {
  UNSUPPORTED_PAGE: 'UNSUPPORTED_PAGE',
  CONTENT_SCRIPT_NOT_LOADED: 'CONTENT_SCRIPT_NOT_LOADED',
  MEMORY_NOT_FULL: 'MEMORY_NOT_FULL',
  NAVIGATION_FAILED: 'NAVIGATION_FAILED',
  EXTRACTION_FAILED: 'EXTRACTION_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR'
};