/**
 * Jest Configuration for Unit Tests
 * 單元測試的 Jest 配置
 */

export default {
  displayName: 'Unit Tests',
  testEnvironment: 'jsdom',
  
  // 測試檔案匹配模式
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/unit/**/*.spec.js'
  ],
  
  // 設置檔案
  setupFilesAfterEnv: [
    '<rootDir>/tests/unit/setup/jest-setup.js'
  ],
  
  // 模組路徑映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // 轉換設定
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // 覆蓋率設定
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'tests/coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 測試報告
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './tests/reports',
      filename: 'unit-test-report.html',
      expand: true
    }]
  ],
  
  // 清理設定
  clearMocks: true,
  restoreMocks: true,
  
  // 超時設定
  testTimeout: 10000,
  
  // 忽略的模式
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/build/',
    '<rootDir>/dist/'
  ]
};