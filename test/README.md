# 測試文件目錄

本目錄包含ChatGPT Memory Manager專案的所有測試文件和相關文檔。

## 📁 目錄結構

### 測試頁面 (HTML)

- `ui-showcase.html` - 完整的UI組件展示頁面，包含所有統一化後的組件和狀態演示
- `test-dark-ui.html` - 深色主題UI測試頁面
- `test-modern-ui.html` - 現代化UI設計測試頁面
- `test-button-design.html` - 按鈕設計和狀態測試頁面
- `test-syntax.html` - JavaScript語法測試頁面

### 文檔 (docs/)

- `UI_COMPONENTS_GUIDE.md` - UI組件使用指南和設計系統文檔
- `BUGFIX_SUMMARY.md` - 錯誤修復總結
- `CSP_FIX_SUMMARY.md` - Content Security Policy修復總結
- `SYNTAX_FIX_SUMMARY.md` - JavaScript語法錯誤修復總結
- `MEMORY_EXPORT_BUTTON_UPDATE.md` - 記憶匯出按鈕更新文檔

## 🧪 如何使用測試文件

### 1. UI組件測試

開啟 `ui-showcase.html` 來查看：

- 所有UI組件的完整展示
- 不同狀態的按鈕效果
- 深色主題色彩系統
- Toast通知系統演示
- 互動效果測試

### 2. 主題測試

- `test-dark-ui.html` - 測試深色主題的一致性
- `test-modern-ui.html` - 測試現代化設計元素

### 3. 功能測試

- `test-button-design.html` - 測試按鈕的各種狀態和動畫
- `test-syntax.html` - 驗證JavaScript語法修復

## 📋 測試檢查清單

### UI統一化驗證

- [ ] 所有組件使用統一的深色主題色彩
- [ ] 按鈕狀態和動畫效果一致
- [ ] Toast通知系統正常運作
- [ ] 摺疊式介面動畫流暢
- [ ] 響應式設計在不同尺寸下正常

### 功能完整性測試

- [ ] 匯出流程無模態窗設計正常
- [ ] 格式選擇功能運作正常
- [ ] 歷史記錄摺疊展開正常
- [ ] 設定區塊功能完整
- [ ] 無障礙功能支援

### 技術合規性

- [ ] 無Content Security Policy違規
- [ ] JavaScript語法正確無錯誤
- [ ] 事件處理器正常運作
- [ ] 無內聯事件處理器

## 🔧 開發者注意事項

1. **測試環境**: 這些測試文件可以直接在瀏覽器中開啟
2. **CSP合規**: 所有測試文件都符合Content Security Policy要求
3. **更新維護**: 當主要UI組件更新時，請同步更新相關測試文件
4. **文檔同步**: 修復或更新功能時，請更新對應的文檔

## 📚 相關文檔

- [主要README](../README.md) - 專案主要說明
- [更新日誌](../CHANGELOG.md) - 版本更新記錄
- [專案狀態](../PROJECT_STATUS.md) - 當前開發狀態
