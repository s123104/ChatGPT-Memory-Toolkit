# Git Commit 格式規範

## 概述

本專案採用專業的 Git Commit 格式規範，確保版本歷史清晰、可讀性高，並支援自動化工具處理。

## Commit 訊息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 基本結構

**標題行 (Header)**

- 格式：`<type>(<scope>): <subject>`
- 長度：不超過 50 字元
- 語言：使用繁體中文或英文（保持一致性）
- 結尾：不加句號

**內容 (Body)** - 可選

- 詳細說明變更的原因和內容
- 每行不超過 72 字元
- 與標題行空一行

**頁腳 (Footer)** - 可選

- 重大變更 (BREAKING CHANGE)
- 關閉的 Issue 編號

## Type 類型

| Type       | 說明       | 範例                                           |
| ---------- | ---------- | ---------------------------------------------- |
| `feat`     | 新功能     | `feat(export): 新增 XML 匯出格式`              |
| `fix`      | 錯誤修復   | `fix(detector): 修復記憶檢測失敗問題`          |
| `docs`     | 文檔更新   | `docs(readme): 更新安裝說明`                   |
| `style`    | 程式碼格式 | `style(popup): 調整按鈕間距`                   |
| `refactor` | 重構       | `refactor(core): 簡化記憶管理邏輯`             |
| `perf`     | 效能優化   | `perf(content): 優化 DOM 查詢效能`             |
| `test`     | 測試相關   | `test(utils): 新增匯出格式測試`                |
| `build`    | 建構系統   | `build(webpack): 更新建構配置`                 |
| `ci`       | CI/CD      | `ci(github): 新增自動測試流程`                 |
| `chore`    | 維護任務   | `chore(deps): 更新依賴套件`                    |
| `revert`   | 回滾變更   | `revert: 回滾 feat(export): 新增 XML 匯出格式` |

## Scope 範圍

### 核心模組

- `core` - 核心功能
- `detector` - 記憶檢測
- `export` - 匯出功能
- `storage` - 儲存管理
- `logger` - 日誌系統

### UI 組件

- `popup` - 彈出視窗
- `content` - 內容腳本
- `background` - 背景服務
- `options` - 設定頁面

### 工具與配置

- `utils` - 工具函數
- `config` - 配置檔案
- `build` - 建構工具
- `assets` - 靜態資源

### 文檔與測試

- `docs` - 文檔
- `test` - 測試
- `examples` - 範例

## Subject 主旨

### 撰寫原則

- 使用祈使句（如：新增、修復、更新）
- 首字母小寫（中文除外）
- 簡潔明確，描述做了什麼
- 不超過 50 字元

### 良好範例

```bash
feat(export): 新增 Markdown 匯出功能
fix(detector): 修復中文介面檢測問題
docs(api): 更新 API 使用說明
refactor(popup): 簡化 UI 組件結構
perf(content): 優化記憶掃描效能
```

### 避免的寫法

```bash
# ❌ 太模糊
fix: 修復問題

# ❌ 太詳細
feat(export): 新增支援 Markdown、JSON、CSV、HTML、TXT 等多種格式的匯出功能，包含檔案下載和剪貼簿複製

# ❌ 時態錯誤
fixed: 修復了記憶檢測問題

# ❌ 標點符號
feat(export): 新增 XML 匯出功能。
```

## Body 內容

### 撰寫指南

- 解釋變更的原因（為什麼）
- 描述變更的內容（做了什麼）
- 說明影響範圍
- 提及相關的技術細節

### 範例

```
feat(export): 新增 XML 匯出格式支援

- 實作 XMLExporter 類別，繼承 BaseExporter
- 新增 XML 格式配置到 EXPORT_FORMATS
- 更新 popup UI 以支援 XML 選項
- 新增對應的 MIME 類型和檔案副檔名

此功能讓使用者能夠以結構化的 XML 格式匯出記憶資料，
適合需要與其他系統整合的使用情境。
```

## Footer 頁腳

### 重大變更

```
BREAKING CHANGE: 移除舊版 API 支援

舊版的 exportMemory() 函數已被移除，請使用新的
ExportManager.export() 方法。

遷移指南：
- 舊：exportMemory(data, 'json')
- 新：new ExportManager().export(data, 'json')
```

### 關閉 Issue

```
Closes #123
Fixes #456, #789
Resolves #101
```

## 完整範例

### 簡單功能

```
feat(detector): 新增英文介面記憶檢測支援
```

### 複雜變更

```
refactor(core): 重構記憶管理架構

- 將單一檔案拆分為模組化架構
- 新增 MemoryManager 核心類別
- 實作事件驅動的檢測機制
- 優化記憶體使用和效能

此重構提升了程式碼的可維護性和擴充性，
為未來新功能開發奠定基礎。

BREAKING CHANGE: 移除 window.memoryManager 全域變數

請使用新的模組匯入方式：
import { MemoryManager } from './core/MemoryManager.js';

Closes #45
```

### 錯誤修復

```
fix(popup): 修復深色模式下按鈕顏色問題

在深色模式下，匯出按鈕的文字顏色與背景色對比度不足，
導致可讀性問題。調整 CSS 變數以確保符合 WCAG 2.1 AA 標準。

Fixes #78
```

## 分支命名規範

### 功能分支

```
feature/export-xml-format
feature/dark-mode-support
feature/keyboard-shortcuts
```

### 修復分支

```
fix/memory-detection-failure
fix/popup-layout-issue
fix/export-encoding-problem
```

### 重構分支

```
refactor/modular-architecture
refactor/simplify-core-logic
refactor/update-ui-components
```

## 最佳實踐

### 提交頻率

- 小而頻繁的提交優於大而稀少的提交
- 每個提交應該是一個邏輯完整的變更
- 避免混合不同類型的變更在同一個提交

### 提交前檢查

```bash
# 1. 程式碼格式檢查
npm run lint

# 2. 執行測試
npm run test

# 3. 建構驗證
npm run build

# 4. 檢查提交訊息格式
git log --oneline -1
```

### 協作規範

- 提交前先拉取最新變更：`git pull origin main`
- 使用 `git rebase` 保持線性歷史
- 重要變更前先開 Issue 討論
- Pull Request 需要至少一人審核

## 工具支援

### Commitizen

```bash
# 安裝
npm install -g commitizen cz-conventional-changelog

# 使用
git cz
```

### Conventional Changelog

```bash
# 自動生成 CHANGELOG
npm install -g conventional-changelog-cli
conventional-changelog -p angular -i CHANGELOG.md -s
```

### Git Hooks

```bash
# .gitmessage 模板
git config commit.template .gitmessage

# commit-msg hook 驗證格式
#!/bin/sh
commit_regex='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,50}'
if ! grep -qE "$commit_regex" "$1"; then
    echo "Invalid commit message format!"
    exit 1
fi
```

---

**遵循此規範能確保專案維護品質，提升團隊協作效率，並支援自動化工具的正確運作。**
