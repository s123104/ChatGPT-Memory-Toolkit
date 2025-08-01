module.exports = {
  displayName: 'E2E Tests',
  testMatch: [
    '<rootDir>/tests/e2e/**/*.test.js'
  ],
  testEnvironment: 'node',
  testTimeout: 60000,
  maxWorkers: 1,
  detectOpenHandles: true,
  forceExit: true,
  verbose: true
};