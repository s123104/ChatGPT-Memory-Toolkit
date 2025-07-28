# 🔍 Chrome 擴充套件載入與除錯指南

## 📋 **載入步驟**

### **1. 正確載入方式**

```bash
# 1. 開啟 Chrome 擴充套件管理頁面
chrome://extensions/

# 2. 開啟開發者模式（右上角開關）

# 3. 點擊「載入未封裝項目」

# 4. 選擇專案根目錄：D:\Tools\ChatGPT-Memory-Toolkit
```

### **2. 載入點確認**

**正確的載入目錄**: `D:\Tools\ChatGPT-Memory-Toolkit`  
**主要檔案**: `manifest.json`（必須在根目錄）

## 🚨 **常見問題與解決方案**

### **問題 1: 擴充套件無法載入**

**症狀**: 載入時出現錯誤訊息

**解決方案**:

1. **檢查 manifest.json 語法**

   ```bash
   # 使用 JSON 驗證工具檢查語法
   # 確保所有引號、逗號正確
   ```

2. **確認檔案路徑**

   ```bash
   # 檢查以下檔案是否存在：
   - src/scripts/background.js
   - src/scripts/content.js
   - src/ui/popup.html
   - src/ui/options.html
   - assets/icons/icon16.png
   - assets/icons/icon32.png
   - assets/icons/icon48.png
   - assets/icons/icon128.png
   ```

3. **檢查圖標檔案**
   ```bash
   # 確認圖標檔案是有效的 PNG 格式
   file assets/icons/*.png
   ```

### **問題 2: ES6 模組錯誤**

**症狀**: 控制台出現 "Cannot use import statement outside a module" 錯誤

**解決方案**:

1. **確認 manifest.json 中的 type: "module"**

   ```json
   {
     "background": {
       "service_worker": "src/scripts/background.js",
       "type": "module"
     }
   }
   ```

2. **檢查所有 JavaScript 檔案使用 ES6 語法**
   ```javascript
   // 正確的 import 語法
   import { APP_CONFIG } from '../constants/config.js';
   ```

### **問題 3: 權限錯誤**

**症狀**: 擴充套件載入但功能無法使用

**解決方案**:

1. **檢查權限設定**

   ```json
   {
     "permissions": [
       "storage",
       "activeTab",
       "scripting",
       "notifications",
       "contextMenus",
       "downloads"
     ],
     "host_permissions": ["https://chatgpt.com/*", "https://chat.openai.com/*"]
   }
   ```

2. **確認 host_permissions 分離**
   - Manifest V3 中，主機權限必須在 `host_permissions` 中宣告

### **問題 4: 內容腳本無法注入**

**症狀**: 在 ChatGPT 頁面無法檢測到記憶

**解決方案**:

1. **檢查 content_scripts 設定**

   ```json
   {
     "content_scripts": [
       {
         "matches": ["https://chatgpt.com/*", "https://chat.openai.com/*"],
         "js": ["src/scripts/content.js"],
         "run_at": "document_end"
       }
     ]
   }
   ```

2. **確認網址匹配**
   - 檢查是否在正確的 ChatGPT 網址上測試

## 🔧 **除錯工具與技巧**

### **1. Chrome 開發者工具**

**背景腳本除錯**:

```bash
# 1. 前往 chrome://extensions/
# 2. 找到您的擴充套件
# 3. 點擊「檢查檢視畫面」-> Service Worker
```

**彈出視窗除錯**:

```bash
# 1. 右鍵點擊擴充套件圖標
# 2. 選擇「檢查彈出視窗」
```

**內容腳本除錯**:

```bash
# 1. 在 ChatGPT 頁面按 F12
# 2. 查看 Console 標籤
# 3. 內容腳本的錯誤會顯示在這裡
```

### **2. 錯誤訊息解讀**

**常見錯誤訊息**:

- `"Failed to load extension"`: manifest.json 語法錯誤
- `"Cannot use import statement"`: ES6 模組設定問題
- `"Permission denied"`: 權限設定錯誤
- `"Resource not found"`: 檔案路徑錯誤

### **3. 逐步除錯流程**

1. **檢查基本載入**

   ```bash
   # 1. 載入擴充套件
   # 2. 檢查是否有錯誤訊息
   # 3. 確認圖標是否顯示
   ```

2. **檢查背景腳本**

   ```bash
   # 1. 開啟 Service Worker 除錯視窗
   # 2. 查看 Console 是否有錯誤
   # 3. 檢查 Network 標籤是否有載入失敗
   ```

3. **檢查內容腳本**

   ```bash
   # 1. 前往 ChatGPT 頁面
   # 2. 開啟開發者工具
   # 3. 查看 Console 是否有錯誤
   ```

4. **檢查彈出視窗**
   ```bash
   # 1. 點擊擴充套件圖標
   # 2. 檢查彈出視窗是否正常顯示
   # 3. 查看是否有 JavaScript 錯誤
   ```

## 📊 **最佳實踐檢查清單**

### **載入前檢查**:

- [ ] manifest.json 語法正確
- [ ] 所有引用的檔案存在
- [ ] 圖標檔案格式正確
- [ ] 權限設定正確
- [ ] ES6 模組設定正確

### **載入後檢查**:

- [ ] 擴充套件圖標顯示
- [ ] 背景腳本無錯誤
- [ ] 內容腳本正常注入
- [ ] 彈出視窗正常顯示
- [ ] 功能按鈕可點擊

### **功能測試**:

- [ ] 在 ChatGPT 頁面檢測記憶
- [ ] 匯出功能正常運作
- [ ] 設定頁面可存取
- [ ] 通知功能正常

## 🛠 **進階除錯技巧**

### **1. 使用 console.log 除錯**

```javascript
// 在背景腳本中
console.log('Background script loaded');

// 在內容腳本中
console.log('Content script injected');

// 在彈出視窗中
console.log('Popup initialized');
```

### **2. 檢查 Chrome Storage**

```javascript
// 檢查儲存的設定
chrome.storage.sync.get(null, items => {
  console.log('Stored settings:', items);
});
```

### **3. 檢查網路請求**

```javascript
// 在 Service Worker 中檢查網路請求
chrome.webRequest.onBeforeRequest.addListener(
  details => {
    console.log('Request:', details);
  },
  { urls: ['<all_urls>'] }
);
```

## 📞 **支援與協助**

如果以上步驟都無法解決問題，請：

1. **收集錯誤訊息**
   - 複製完整的錯誤訊息
   - 截圖顯示問題

2. **檢查 Chrome 版本**
   - 確保使用 Chrome 88+ 版本
   - 檢查是否支援 Manifest V3

3. **重新載入擴充套件**
   ```bash
   # 1. 移除擴充套件
   # 2. 重新載入
   # 3. 清除瀏覽器快取
   ```

---

**最後更新**: 2025-01-16  
**版本**: v1.0.0  
**適用於**: Chrome 88+ | Manifest V3
