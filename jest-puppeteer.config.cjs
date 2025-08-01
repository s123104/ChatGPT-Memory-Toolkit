/**
 * Jest Puppeteer Configuration
 * Puppeteer 瀏覽器啟動配置
 */

module.exports = {
  launch: {
    dumpio: false,
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--disable-web-security',
      '--allow-running-insecure-content',
      `--load-extension=${process.cwd()}`,
      `--disable-extensions-except=${process.cwd()}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-default-apps',
      '--disable-popup-blocking'
    ]
  },
  browserContext: 'default'
};