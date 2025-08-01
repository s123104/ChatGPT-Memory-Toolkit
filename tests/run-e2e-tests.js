#!/usr/bin/env node

/**
 * E2E Test Runner Script
 * 端到端測試運行腳本
 */

import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置選項
const CONFIG = {
  headless: process.env.HEADLESS !== 'false',
  verbose: process.argv.includes('--verbose'),
  debug: process.argv.includes('--debug'),
  suite: process.argv.find(arg => arg.startsWith('--suite='))?.split('=')[1],
  timeout: process.argv.find(arg => arg.startsWith('--timeout='))?.split('=')[1] || '60000',
  parallel: !process.argv.includes('--no-parallel'),
  screenshot: process.argv.includes('--screenshot'),
  slowMo: process.argv.find(arg => arg.startsWith('--slow-mo='))?.split('=')[1] || '0'
};

// 顏色輸出函數
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// 日誌函數
const log = {
  info: (message) => console.log(colors.cyan(`ℹ ${message}`)),
  success: (message) => console.log(colors.green(`✅ ${message}`)),
  warning: (message) => console.log(colors.yellow(`⚠️ ${message}`)),
  error: (message) => console.log(colors.red(`❌ ${message}`)),
  debug: (message) => CONFIG.debug && console.log(colors.magenta(`🐛 ${message}`)),
  header: (message) => console.log(colors.bold(colors.blue(`\n🧪 ${message}\n`)))
};

// 測試套件定義
const TEST_SUITES = {
  all: [
    'extension-loading.test.js',
    'popup-functionality.test.js',
    'content-script.test.js',
    'background-script.test.js',
    'memory-management.test.js',
    'ui-interaction.test.js',
    'error-handling.test.js',
    'performance.test.js'
  ],
  core: [
    'extension-loading.test.js',
    'popup-functionality.test.js',
    'memory-management.test.js'
  ],
  ui: [
    'popup-functionality.test.js',
    'ui-interaction.test.js'
  ],
  functionality: [
    'content-script.test.js',
    'background-script.test.js',
    'memory-management.test.js'
  ],
  stability: [
    'error-handling.test.js',
    'performance.test.js'
  ]
};

/**
 * 檢查先決條件
 */
async function checkPrerequisites() {
  log.header('檢查測試環境');

  // 檢查擴充套件文件
  const manifestPath = resolve(__dirname, '../manifest.json');
  if (!fs.existsSync(manifestPath)) {
    log.error('找不到 manifest.json 文件');
    process.exit(1);
  }

  // 檢查必要的源文件
  const requiredFiles = [
    '../src/background.js',
    '../src/scripts/content.js',
    '../src/ui/popup.html',
    '../src/ui/popup.js'
  ];

  for (const file of requiredFiles) {
    const filePath = resolve(__dirname, file);
    if (!fs.existsSync(filePath)) {
      log.error(`找不到必要文件: ${file}`);
      process.exit(1);
    }
  }

  // 創建必要的目錄
  const dirs = ['reports', 'reports/screenshots', 'downloads'];
  for (const dir of dirs) {
    const dirPath = resolve(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log.info(`創建目錄: ${dir}`);
    }
  }

  log.success('環境檢查完成');
}

/**
 * 運行測試套件
 */
async function runTests() {
  const suite = CONFIG.suite || 'all';
  const testFiles = TEST_SUITES[suite] || [suite + '.test.js'];

  log.header(`運行測試套件: ${suite}`);
  log.info(`測試文件: ${testFiles.join(', ')}`);
  log.info(`無頭模式: ${CONFIG.headless ? '是' : '否'}`);
  log.info(`並行執行: ${CONFIG.parallel ? '是' : '否'}`);

  // 設置環境變數
  const env = {
    ...process.env,
    PUPPETEER_HEADLESS: CONFIG.headless.toString(),
    SLOW_MO: CONFIG.slowMo,
    TEST_TIMEOUT: CONFIG.timeout
  };

  // 構建 Jest 命令
  const jestArgs = [
    '--config=jest.e2e.config.js',
    '--testTimeout=' + CONFIG.timeout,
    '--verbose'
  ];

  if (!CONFIG.parallel) {
    jestArgs.push('--runInBand');
  }

  if (CONFIG.debug) {
    jestArgs.push('--no-cache', '--detectOpenHandles');
  }

  if (suite !== 'all') {
    // 指定測試文件
    jestArgs.push(...testFiles.map(file => `tests/e2e/specs/${file}`));
  }

  return new Promise((resolve, reject) => {
    const jest = spawn('npx', ['jest', ...jestArgs], {
      cwd: resolve(__dirname, '..'),
      env,
      stdio: 'inherit'
    });

    jest.on('close', (code) => {
      if (code === 0) {
        log.success('所有測試通過');
        resolve();
      } else {
        log.error(`測試失敗，退出代碼: ${code}`);
        reject(new Error(`Tests failed with code ${code}`));
      }
    });

    jest.on('error', (error) => {
      log.error(`無法運行測試: ${error.message}`);
      reject(error);
    });
  });
}

/**
 * 生成測試報告
 */
async function generateReport() {
  log.header('生成測試報告');

  const reportPath = resolve(__dirname, 'reports/e2e-test-report.html');
  if (fs.existsSync(reportPath)) {
    log.success(`測試報告已生成: ${reportPath}`);
    
    if (process.platform === 'darwin') {
      spawn('open', [reportPath]);
    } else if (process.platform === 'win32') {
      spawn('start', [reportPath], { shell: true });
    } else {
      spawn('xdg-open', [reportPath]);
    }
  } else {
    log.warning('測試報告未找到');
  }
}

/**
 * 清理測試環境
 */
async function cleanup() {
  log.info('清理測試環境');
  
  // 清理下載文件（可選）
  if (process.argv.includes('--clean-downloads')) {
    const downloadsPath = resolve(__dirname, 'downloads');
    if (fs.existsSync(downloadsPath)) {
      fs.rmSync(downloadsPath, { recursive: true, force: true });
      fs.mkdirSync(downloadsPath);
      log.info('已清理下載目錄');
    }
  }
}

/**
 * 顯示幫助信息
 */
function showHelp() {
  console.log(`
${colors.bold('ChatGPT Memory Toolkit E2E 測試運行器')}

用法:
  node run-e2e-tests.js [選項]

選項:
  --suite=<套件名>     運行指定的測試套件 (all, core, ui, functionality, stability)
  --headless=false     在有頭模式下運行瀏覽器 (用於調試)
  --verbose           顯示詳細輸出
  --debug             啟用調試模式
  --no-parallel       禁用並行執行
  --screenshot        啟用截圖功能
  --slow-mo=<毫秒>    設置操作間的延遲時間
  --timeout=<毫秒>    設置測試超時時間 (默認: 60000)
  --clean-downloads   運行前清理下載目錄
  --help              顯示此幫助信息

測試套件:
  all             運行所有測試 (默認)
  core            核心功能測試 (載入、彈窗、記憶管理)
  ui              用戶界面測試 (彈窗、互動)
  functionality   功能測試 (內容腳本、背景腳本、記憶管理)
  stability       穩定性測試 (錯誤處理、性能)

示例:
  node run-e2e-tests.js                    # 運行所有測試
  node run-e2e-tests.js --suite=core       # 只運行核心測試
  node run-e2e-tests.js --headless=false   # 在可見瀏覽器中運行
  node run-e2e-tests.js --debug --verbose  # 調試模式
`);
}

/**
 * 主函數
 */
async function main() {
  try {
    // 檢查是否需要顯示幫助
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      showHelp();
      return;
    }

    console.log(colors.bold(colors.blue('🧪 ChatGPT Memory Toolkit E2E 測試系統')));
    console.log('================================================\n');

    await checkPrerequisites();
    await runTests();
    await generateReport();
    await cleanup();

    log.success('測試運行完成');

  } catch (error) {
    log.error(`測試運行失敗: ${error.message}`);
    process.exit(1);
  }
}

// 處理未捕獲的異常
process.on('unhandledRejection', (reason, promise) => {
  log.error(`未處理的 Promise 拒絕: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log.error(`未捕獲的異常: ${error.message}`);
  process.exit(1);
});

// 運行主函數
main();