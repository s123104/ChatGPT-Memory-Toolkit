/**
 * 基本測試 - 驗證測試環境是否正常
 */

describe('基本測試', () => {
  test('測試環境應該正常運作', () => {
    expect(true).toBe(true);
  });

  test('專案檔案應該存在', () => {
    const fs = require('fs');
    const path = require('path');
    
    // 檢查 manifest.json
    const manifestPath = path.join(__dirname, '..', 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
    
    // 檢查關鍵檔案
    const files = [
      'src/background.js',
      'src/scripts/content.js',
      'src/ui/popup.html',
      'src/ui/popup.js'
    ];
    
    files.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('package.json 應該包含必要資訊', () => {
    const fs = require('fs');
    const path = require('path');
    
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    expect(packageJson.name).toBe('chatgpt-memory-manager');
    expect(packageJson.version).toBeTruthy();
    expect(packageJson.scripts).toBeTruthy();
  });
});