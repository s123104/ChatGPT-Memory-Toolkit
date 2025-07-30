# 版本管理系統 (Version Management System)

## 🚀 功能概覽

本專案採用增強型版本管理系統，支援自動同步所有文件中的版本號，並提供 Git 自動化操作。

## 📋 支援的文件類型

| 文件                | 描述                | 更新內容         |
| ------------------- | ------------------- | ---------------- |
| `package.json`      | NPM 套件配置        | 主版本號來源     |
| `manifest.json`     | Chrome 擴充套件清單 | `version` 欄位   |
| `src/ui/popup.html` | 彈出視窗模板        | 版本顯示標籤     |
| `README.md`         | 專案說明文檔        | 版本徽章和連結   |
| `CLAUDE.md`         | Claude 專案文檔     | 專案狀態版本資訊 |
| `CHANGELOG.md`      | 變更日誌            | 自動新增版本條目 |

## 🛠️ NPM 腳本命令

### 基本版本更新

```bash
# 手動版本同步（不提交）
npm run version:update

# 自動版本同步（自動提交）
npm run version:update:auto

# 完整自動化（提交 + 標籤）
npm run version:update:full
```

### 語義化版本更新

```bash
# 修補版本（1.3.0 → 1.3.1）
npm run version:patch        # 手動更新
npm run version:patch:auto   # 自動提交

# 次版本（1.3.0 → 1.4.0）
npm run version:minor        # 手動更新
npm run version:minor:auto   # 自動提交

# 主版本（1.3.0 → 2.0.0）
npm run version:major        # 手動更新
npm run version:major:auto   # 自動提交
```

### 發布命令（推薦）

```bash
# 一鍵發布修補版本
npm run release:patch

# 一鍵發布次版本
npm run release:minor

# 一鍵發布主版本
npm run release:major
```

## 🔧 腳本參數

### update-version.js 參數

```bash
# 基本用法
node scripts/update-version.js

# 自動提交變更
node scripts/update-version.js --auto-commit

# 自動提交 + 創建標籤
node scripts/update-version.js --auto-commit --auto-tag
```

## 📊 自動化功能

### 智能文件檢測

- ✅ 自動檢測現有版本號
- ✅ 比較新舊版本避免重複更新
- ✅ 詳細變更報告
- ✅ 錯誤處理和統計

### Git 自動化

- ✅ 自動檢測 Git 倉庫
- ✅ 自動提交變更
- ✅ 自動創建版本標籤
- ✅ 語義化提交訊息

### CHANGELOG 自動更新

- ✅ 自動檢測重複版本條目
- ✅ 按時間排序插入新版本
- ✅ 標準化格式和結構

## 📈 使用範例

### 情境 1：修復 Bug 發布

```bash
# 1. 修復完成後，發布修補版本
npm run release:patch

# 結果：
# - package.json: 1.3.0 → 1.3.1
# - 所有文件版本同步更新
# - 自動提交 + 標籤 v1.3.1
```

### 情境 2：新功能發布

```bash
# 1. 新功能開發完成後，發布次版本
npm run release:minor

# 結果：
# - package.json: 1.3.0 → 1.4.0
# - CHANGELOG.md 自動新增 1.4.0 條目
# - Git 自動提交 + 標籤 v1.4.0
```

### 情境 3：手動控制

```bash
# 1. 先更新版本號
npm version minor --no-git-tag-version

# 2. 手動同步文件（檢查用）
npm run version:update

# 3. 手動提交
git add .
git commit -m "feat: 新增功能 X"
git tag v1.4.0
```

## 🎯 最佳實踐

### 1. 發布流程

```bash
# 開發 → 測試 → 發布
npm run dev          # 開發階段檢查
npm run release:minor # 發布新版本
```

### 2. 版本類型選擇

- **Patch (1.3.x)**: Bug 修復、小幅改進
- **Minor (1.x.0)**: 新功能、向後相容
- **Major (x.0.0)**: 重大變更、不相容

### 3. 提交訊息格式

自動生成的提交訊息遵循規範：

```
chore: bump version to 1.3.0

- 📦 Updated 4 files to version 1.3.0
- 🔄 Automated version synchronization
- 📝 Documentation and manifest updates

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 🔍 故障排除

### 常見問題

**Q: 版本同步失敗**

```bash
# 檢查文件權限
ls -la manifest.json src/ui/popup.html

# 手動運行腳本查看詳細錯誤
node scripts/update-version.js
```

**Q: Git 操作失敗**

```bash
# 檢查 Git 狀態
git status

# 檢查是否有未提交的變更
git diff
```

**Q: CHANGELOG 格式問題**

- 確保 CHANGELOG.md 遵循 [Keep a Changelog](https://keepachangelog.com) 格式
- 檢查是否有重複的版本條目

### 腳本輸出說明

```bash
🔄 Enhanced Version Update to 1.3.0...        # 開始更新
📅 Update Date: 2025-07-29                   # 更新日期
✅ Updated: ./manifest.json (1.2.0 → 1.3.0)  # 成功更新
➡️  No changes needed: ./CLAUDE.md           # 無需更新
📊 Statistics:                               # 統計資訊
   ✅ Updated: 4 files                       # 更新文件數
   ➡️  Skipped: 0 files                     # 跳過文件數
   ❌ Errors:  0 files                      # 錯誤文件數
```

## 📚 技術實現

### 核心特性

- **智能版本檢測**: 使用正則表達式模式匹配
- **原子性操作**: 確保所有文件一致性更新
- **錯誤恢復**: 單個文件失敗不影響其他文件
- **詳細報告**: 完整的操作日誌和統計

### 程式架構

```javascript
// 主要組件
- detectCurrentVersion()     // 版本檢測
- filesToUpdate[]           // 文件配置
- enhanced update logic     // 更新邏輯
- Git integration          // Git 自動化
- error handling           // 錯誤處理
```

---

**版本**: v1.4.3 | **更新日期**: 2025-07-29
