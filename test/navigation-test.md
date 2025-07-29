# 導航邏輯測試

## 測試場景

### 1. 在 ChatGPT 對話頁面

**測試 URL**: `https://chatgpt.com/c/68885a0e-f0dc-832a-ba92-c1a1dddf0cf9`

**預期行為**:

- 點擊「匯出記憶」按鈕
- 應該跳轉到: `https://chatgpt.com/c/68885a0e-f0dc-832a-ba92-c1a1dddf0cf9#settings/Personalization`
- 保持在同一個對話頁面，只是添加了設定 hash

### 2. 在 ChatGPT 首頁

**測試 URL**: `https://chatgpt.com/`

**預期行為**:

- 點擊「匯出記憶」按鈕
- 應該跳轉到: `https://chatgpt.com/#settings/Personalization`
- 在首頁添加設定 hash

### 3. 在 ChatGPT 其他頁面

**測試 URL**: `https://chatgpt.com/gpts`

**預期行為**:

- 點擊「匯出記憶」按鈕
- 應該跳轉到: `https://chatgpt.com/gpts#settings/Personalization`
- 在當前頁面添加設定 hash

### 4. 在非 ChatGPT 網站

**測試 URL**: `https://google.com`

**預期行為**:

- 顯示「前往 ChatGPT 網站」按鈕
- 點擊後開啟新分頁到 `https://chatgpt.com`

## 技術實現

### Content Script 邏輯

```javascript
// 獲取當前 URL（不包含 hash 部分）
const currentUrl = location.origin + location.pathname + location.search;
const targetUrl = currentUrl + '#settings/Personalization';

// 如果當前 hash 不是設定頁面，則更新 URL
if (!location.hash.includes('settings/Personalization')) {
  location.href = targetUrl;
}
```

### Popup Script 邏輯

```javascript
// 在當前分頁中添加 hash 參數
const currentUrl = this.currentTab.url;
const newUrl = currentUrl.split('#')[0] + '#settings/Personalization';
chrome.tabs.update(this.currentTab.id, { url: newUrl });
```

## 說明文字排版

### 改善前

```
💡 自動檢測：當記憶已滿時會自動匯出
🎯 使用方式：前往 ChatGPT 記憶管理頁面
```

### 改善後

```
[燈泡圖標] 自動檢測
          當記憶已滿時會自動匯出

[星星圖標] 使用方式
          前往 ChatGPT 記憶管理頁面
```

## 驗證清單

- [ ] 在對話頁面點擊匯出，URL 正確添加 hash
- [ ] 在首頁點擊匯出，URL 正確添加 hash
- [ ] 在其他 ChatGPT 頁面點擊匯出，URL 正確添加 hash
- [ ] 在非 ChatGPT 網站顯示跳轉按鈕
- [ ] 說明文字使用分層排版
- [ ] 圖標統一使用 16x16 尺寸
- [ ] CSS 樣式正確應用

## 預期效果

1. **保持用戶狀態**: 用戶在對話中點擊匯出不會離開當前對話
2. **一致的體驗**: 所有 ChatGPT 頁面都使用相同的跳轉邏輯
3. **清晰的排版**: 說明文字層次分明，易於閱讀
4. **專業外觀**: 統一的圖標尺寸和樣式
