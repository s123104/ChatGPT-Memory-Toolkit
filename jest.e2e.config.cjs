/**
 * Jest E2E Testing Configuration for Chrome Extension
 * 專為 Chrome 擴充套件 E2E 測試設計的 Jest 配置
 */

module.exports = {
  displayName: 'E2E Tests',
  preset: 'jest-puppeteer',
  testMatch: [
    '<rootDir>/tests/e2e/**/*.test.js',
    '<rootDir>/tests/e2e/**/*.spec.js'
  ],
  testEnvironment: 'puppeteer',
  
  // 設置檔案
  setupFilesAfterEnv: [
    '<rootDir>/tests/e2e/setup/jest-setup.js'
  ],
  
  // 全域變數
  globals: {
    EXTENSION_PATH: '<rootDir>',
    EXTENSION_ID: '',
    HEADLESS: process.env.PUPPETEER_HEADLESS !== 'false'
  },
  
  // 超時設定
  testTimeout: 60000,
  
  // 測試運行配置
  maxWorkers: 1, // Chrome 擴充套件測試需要序列執行
  detectOpenHandles: true,
  forceExit: true,
  
  // 覆蓋率設定
  collectCoverage: false, // E2E 測試不需要程式碼覆蓋率
  
  // 測試報告
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './tests/reports',
      filename: 'e2e-test-report.html',
      expand: true
    }]
  ],
  
  // 模組路徑映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // 轉換設定
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // 忽略的模式
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/'
  ],
  
};