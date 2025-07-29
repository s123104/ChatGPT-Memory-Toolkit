# CLAUDE.md

## 專案概述 (Project Overview)

此專案為 ChatGPT Memory Toolkit - 專業的 ChatGPT 記憶管理 Chrome 擴充套件。

### 專案資訊
- **名稱**: ChatGPT Memory Toolkit
- **版本**: 1.2.0
- **類型**: Chrome Extension
- **主要語言**: JavaScript
- **建置工具**: Node.js
- **程式碼檢查**: ESLint
- **程式碼格式化**: Prettier

### 開發指令
```bash
npm run dev      # 開發模式（檢查 + 建置）
npm run lint     # 程式碼檢查
npm run format   # 程式碼格式化
npm run build    # 建置擴充套件
```

### 專案結構
```
src/
├── scripts/
│   └── content.js          # 內容腳本 - 主要邏輯
├── ui/
│   ├── popup.html          # 彈出視窗 HTML
│   ├── popup.css           # 彈出視窗樣式
│   └── popup.js            # 彈出視窗邏輯
└── utils/
    └── storage-manager.js  # 儲存管理
```

## 自動委派 (Automatic Delegation)

Claude Code 會根據以下情境自動挑選並召喚 Sub-Agent：

- **code-quality-reviewer**：在偵測到任何 `git commit`、`git push` 或 Pull Request 時自動現身
- **test-runner**：在 Pre-Push、CI Pipeline 或 Merge Request 階段自動執行測試
- **error-debugger**：當測試失敗、Build Crash 或 uncaught exception 時自動啟動
- **doc-writer**：在功能分支合併至 `main`、公開 API 變動或 release 標籤前自動觸發

### 觸發條件詳述

#### code-quality-reviewer
- **自動觸發**: 
  - Git commit 操作
  - Git push 操作  
  - Pull Request 建立或更新
  - 程式碼變更檢測
- **執行內容**: 程式碼品質檢查、安全性分析、最佳實務驗證

#### test-runner
- **自動觸發**:
  - Pre-Push hooks 執行
  - CI Pipeline 測試階段
  - Merge Request 流程
  - `npm run dev` 或 `npm run lint` 指令
- **執行內容**: 自動化測試執行、覆蓋率報告生成、品質閘門驗證

#### error-debugger
- **自動觸發**:
  - 測試失敗事件
  - 建置崩潰 (Build Crash)
  - 未捕獲的例外狀況
  - 系統日誌異常紀錄
- **執行內容**: 根本原因分析、錯誤修復建議、即時問題解決

#### doc-writer
- **自動觸發**:
  - 程式碼合併至 `main` 分支
  - API 變動檢測
  - 版本標籤建立 (release tags)
  - 重大功能更新
- **執行內容**: 文件自動更新、CHANGELOG 維護、API 參考文件同步

### 整合設定

這些 Sub-Agent 與專案的開發流程緊密整合：

1. **開發階段**: code-quality-reviewer 確保程式碼品質
2. **測試階段**: test-runner 執行完整測試套件
3. **除錯階段**: error-debugger 提供智能除錯支援
4. **文件階段**: doc-writer 維護最新文件狀態

透過這個自動委派系統，確保專案在各個開發階段都能獲得適當的 AI 協助與品質保證。