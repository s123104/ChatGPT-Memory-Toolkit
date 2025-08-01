# 使用者指南 | User Guide

> ChatGPT Memory Toolkit v1.6.2 完整使用說明  
> Complete user guide for ChatGPT Memory Toolkit v1.6.2

---

## 目錄 | Table of Contents

- [中文使用指南](#中文使用指南)
  - [快速入門](#快速入門)
  - [功能詳解](#功能詳解)
  - [進階操作](#進階操作)
- [English User Guide](#english-user-guide)
  - [Quick Start](#quick-start)
  - [Feature Guide](#feature-guide)
  - [Advanced Operations](#advanced-operations)

---

## 中文使用指南

### 快速入門

#### 首次使用設定

1. **確認安裝成功**
   ```
   ✅ Chrome 工具列顯示腦部圖示
   ✅ 前往 https://chatgpt.com
   ✅ 點擊擴充套件圖示測試彈出視窗
   ```

2. **了解介面佈局**
   ```
   🎯 頂部：記憶狀態卡片
   🎨 中央：匯出操作區域
   📚 底部：歷史記錄與設定
   ```

3. **基本操作流程**
   ```
   監控記憶狀態 → 執行匯出操作 → 管理歷史記錄
   ```

#### 5分鐘上手指南

**步驟 1: 檢視記憶狀態**
- 點擊 Chrome 工具列的擴充套件圖示
- 查看記憶狀態卡片的顏色指示：
  - 🟢 **綠色**: 記憶使用正常
  - 🟠 **橘色**: 記憶接近滿載
  - 🔴 **紅色**: 記憶已滿，需要處理

**步驟 2: 匯出記憶內容**
- 點擊「匯出記憶」按鈕
- 觀察紫色漸層動畫效果
- 等待匯出完成（自動複製到剪貼簿）

**步驟 3: 查看匯出結果**
- 匯出完成後會顯示結果模態視窗
- 內容已自動複製到剪貼簿
- 可選擇儲存為檔案或分享

### 功能詳解

#### 🧠 智能記憶管理

**自動檢測功能**
- **即時監控**: 持續監控 ChatGPT 記憶使用狀況
- **智能提醒**: 記憶接近滿載時自動顯示警告
- **狀態指示**: 直觀的顏色和圖示系統

**記憶狀態說明**
```
🟢 正常狀態 (0-70%)
   └── 記憶使用量在安全範圍內
   └── 建議動作：繼續正常使用

🟠 警告狀態 (70-90%)
   └── 記憶即將達到容量上限
   └── 建議動作：考慮匯出部分內容

🔴 危險狀態 (90-100%)
   └── 記憶已滿或接近滿載
   └── 建議動作：立即匯出並清理記憶
```

#### 📤 進階匯出系統

**紫色漸層匯出動畫**
- **視覺效果**: 美麗的紫色到紫羅蘭色漸層
- **粒子系統**: 5個粒子的錯落動畫效果
- **狀態轉換**: 
  ```
  閒置 → 載入中 → 成功/錯誤
  ```

**匯出格式與選項**
```markdown
# ChatGPT Memory Export
**匯出時間**: 2025-08-01 12:00:00
**記憶項目數量**: 25
**總字數**: 1,247

## 記憶內容

1. **類別**: 個人偏好
   - 內容描述...
   
2. **類別**: 工作相關
   - 內容描述...
```

**匯出操作步驟**
1. **開始匯出**
   - 點擊帶有紫色漸層的「匯出記憶」按鈕
   - 按鈕顯示載入動畫（旋轉效果）

2. **處理中狀態**
   - 紫色漸層動畫開始運行
   - 粒子效果顯示處理進度
   - 按鈕文字變更為「匯出中...」

3. **完成狀態**
   - 成功：綠色發光效果，內容已複製到剪貼簿
   - 失敗：紅色警告效果，顯示錯誤資訊

#### 📚 歷史記錄管理

**歷史記錄功能**
- **完整追蹤**: 記錄所有匯出操作的詳細資訊
- **時間戳記**: 精確的匯出時間記錄
- **內容預覽**: 快速預覽匯出內容摘要
- **搜尋功能**: 根據日期、關鍵字搜尋歷史記錄

**歷史記錄介面**
```
📋 匯出歷史 (最近10筆)

🗓️ 2025-08-01 12:30:15
   📝 25項記憶內容 (1,247字)
   📋 [重新複製] 🗑️ [刪除]

🗓️ 2025-07-31 18:45:22
   📝 18項記憶內容 (892字)
   📋 [重新複製] 🗑️ [刪除]
```

**歷史記錄操作**
- **查看詳情**: 點擊記錄查看完整內容
- **重新複製**: 將歷史匯出內容複製到剪貼簿
- **刪除記錄**: 移除不需要的歷史記錄
- **匯出歷史**: 將歷史記錄匯出為檔案

#### ⚙️ 個人化設定

**設定選項**
```
🔔 通知設定
   ├── 記憶滿載提醒：啟用
   ├── 提醒頻率：每2小時
   └── 聲音通知：停用

📋 匯出設定
   ├── 預設格式：Markdown
   ├── 包含時間戳記：啟用
   └── 自動複製：啟用

📚 歷史記錄
   ├── 保留期限：30天
   ├── 最大記錄數：100筆
   └── 自動清理：啟用

🎨 介面設定
   ├── 主題：跟隨系統
   ├── 動畫效果：啟用
   └── 緊湊模式：停用
```

**設定建議**
- **新手用戶**: 使用預設設定，啟用所有提醒功能
- **進階用戶**: 可關閉部分通知，調整匯出格式
- **重度用戶**: 增加歷史記錄保留期限和數量

#### 🎨 UI 狀態系統詳解

**按鈕狀態與動畫**

1. **紫色漸層匯出狀態** ✨
   ```css
   特效：紫色到紫羅蘭漸層移動
   粒子：5個粒子錯落動畫
   時機：匯出操作期間
   持續：2-5秒（依網路速度）
   ```

2. **橘色記憶滿載狀態** 🟠
   ```css
   特效：橘色警告背景
   圖示：記憶滿載警告圖示
   時機：記憶使用量 > 90%
   互動：點擊查看詳細資訊
   ```

3. **旋轉載入動畫** 🔄
   ```css
   特效：360度順時針旋轉
   速度：1秒一圈
   時機：所有非同步操作
   樣式：半透明載入指示器
   ```

4. **綠色成功狀態** ✅
   ```css
   特效：綠色發光擴散
   圖示：勾選標記
   時機：操作成功完成
   持續：2秒後自動恢復
   ```

5. **紅色錯誤狀態** ❌
   ```css
   特效：紅色閃爍警告
   圖示：錯誤警告標記
   時機：操作失敗或錯誤
   互動：點擊查看錯誤詳情
   ```

### 進階操作

#### 🔧 高級匯出功能

**自訂匯出範本**
```javascript
// 匯出範本設定
{
  "template": "detailed",
  "includeMetadata": true,
  "groupByCategory": true,
  "sortByDate": "desc",
  "includeStats": true
}
```

**批次匯出操作**
1. 選取多個時間段的記憶內容
2. 設定匯出格式和選項
3. 執行批次匯出
4. 下載為壓縮檔案

#### 📊 統計與分析

**記憶使用分析**
```
📈 記憶使用統計

本月統計：
├── 新增記憶：47項
├── 匯出次數：12次
├── 平均記憶項目：25項
└── 記憶清理頻率：每週2次

使用模式：
├── 最活躍時段：下午2-6點
├── 最常用類別：工作相關 (35%)
├── 平均記憶長度：52字
└── 匯出成功率：98.5%
```

#### 🔄 自動化功能

**自動記憶管理**
- **智能清理**: 自動識別過期或重複的記憶內容
- **定期匯出**: 設定自動匯出時間表
- **容量預警**: 提前預測記憶滿載時間
- **內容分類**: 自動分類和標籤記憶內容

**自動化設定範例**
```
⏰ 自動化規則

規則1：記憶滿載自動匯出
├── 觸發條件：記憶使用量 > 95%
├── 執行動作：匯出並提示清理
└── 執行頻率：即時

規則2：每週定期匯出
├── 觸發條件：每週日 23:00
├── 執行動作：匯出本週記憶
└── 執行頻率：每週
```

#### 🛡️ 隱私與安全

**資料保護措施**
- **本地儲存**: 所有資料保存在本地 Chrome 儲存中
- **加密傳輸**: 與 ChatGPT 的通訊使用 HTTPS 加密
- **無外部傳輸**: 記憶內容不會發送到第三方伺服器
- **用戶控制**: 用戶完全控制資料的匯出和刪除

**隱私設定**
```
🔒 隱私與安全設定

資料處理：
├── 本地儲存：僅存於裝置中
├── 自動清理：30天後自動刪除
├── 匯出記錄：可手動清除
└── 敏感內容：可設定過濾規則

權限管理：
├── ChatGPT 存取：僅限必要功能
├── 檔案下載：需用戶確認
├── 剪貼簿存取：僅匯出時使用
└── 網路存取：僅限 ChatGPT 網域
```

---

## English User Guide

### Quick Start

#### Initial Setup

1. **Confirm Successful Installation**
   ```
   ✅ Brain icon visible in Chrome toolbar
   ✅ Navigate to https://chatgpt.com
   ✅ Click extension icon to test popup
   ```

2. **Understanding Interface Layout**
   ```
   🎯 Top: Memory status cards
   🎨 Center: Export operation area
   📚 Bottom: History and settings
   ```

3. **Basic Operation Flow**
   ```
   Monitor Memory Status → Execute Export → Manage History
   ```

#### 5-Minute Getting Started Guide

**Step 1: Check Memory Status**
- Click the extension icon in Chrome toolbar
- View color indicators on memory status card:
  - 🟢 **Green**: Normal memory usage
  - 🟠 **Orange**: Memory approaching capacity
  - 🔴 **Red**: Memory full, action needed

**Step 2: Export Memory Content**
- Click "Export Memory" button
- Observe purple gradient animation
- Wait for completion (auto-copied to clipboard)

**Step 3: View Export Results**
- Result modal displays after export completion
- Content automatically copied to clipboard
- Options to save as file or share

### Feature Guide

#### 🧠 Smart Memory Management

**Auto-Detection Features**
- **Real-time Monitoring**: Continuous ChatGPT memory usage monitoring
- **Smart Alerts**: Automatic warnings when memory approaches capacity
- **Status Indicators**: Intuitive color and icon system

**Memory Status Explanation**
```
🟢 Normal Status (0-70%)
   └── Memory usage within safe range
   └── Recommended action: Continue normal use

🟠 Warning Status (70-90%)
   └── Memory approaching capacity limit
   └── Recommended action: Consider exporting content

🔴 Critical Status (90-100%)
   └── Memory full or near capacity
   └── Recommended action: Export immediately and clear memory
```

#### 📤 Advanced Export System

**Purple Gradient Export Animation**
- **Visual Effects**: Beautiful purple to violet gradient
- **Particle System**: 5-particle staggered animation
- **State Transitions**: 
  ```
  Idle → Loading → Success/Error
  ```

**Export Format and Options**
```markdown
# ChatGPT Memory Export
**Export Time**: 2025-08-01 12:00:00
**Memory Items**: 25
**Total Words**: 1,247

## Memory Content

1. **Category**: Personal Preferences
   - Content description...
   
2. **Category**: Work Related
   - Content description...
```

**Export Operation Steps**
1. **Start Export**
   - Click purple gradient "Export Memory" button
   - Button shows loading animation (rotating effect)

2. **Processing State**
   - Purple gradient animation starts
   - Particle effects show progress
   - Button text changes to "Exporting..."

3. **Completion State**
   - Success: Green glow effect, content copied to clipboard
   - Failure: Red warning effect, error information displayed

#### 📚 History Management

**History Features**
- **Complete Tracking**: Records detailed information of all export operations
- **Timestamps**: Precise export time records
- **Content Preview**: Quick preview of export content summary
- **Search Function**: Search history by date and keywords

**History Interface**
```
📋 Export History (Recent 10)

🗓️ 2025-08-01 12:30:15
   📝 25 memory items (1,247 words)
   📋 [Re-copy] 🗑️ [Delete]

🗓️ 2025-07-31 18:45:22
   📝 18 memory items (892 words)
   📋 [Re-copy] 🗑️ [Delete]
```

**History Operations**
- **View Details**: Click record to view complete content
- **Re-copy**: Copy historical export content to clipboard
- **Delete Record**: Remove unwanted history records
- **Export History**: Export history records as file

#### ⚙️ Personalization Settings

**Settings Options**
```
🔔 Notification Settings
   ├── Memory Full Alerts: Enabled
   ├── Alert Frequency: Every 2 hours
   └── Sound Notifications: Disabled

📋 Export Settings
   ├── Default Format: Markdown
   ├── Include Timestamps: Enabled
   └── Auto Copy: Enabled

📚 History Records
   ├── Retention Period: 30 days
   ├── Maximum Records: 100 entries
   └── Auto Cleanup: Enabled

🎨 Interface Settings
   ├── Theme: Follow System
   ├── Animation Effects: Enabled
   └── Compact Mode: Disabled
```

**Setting Recommendations**
- **New Users**: Use default settings, enable all alert features
- **Advanced Users**: Can disable some notifications, adjust export formats
- **Power Users**: Increase history retention period and quantity

#### 🎨 UI State System Details

**Button States and Animations**

1. **Purple Gradient Export State** ✨
   ```css
   Effect: Purple to violet gradient movement
   Particles: 5-particle staggered animation
   Timing: During export operations
   Duration: 2-5 seconds (depending on network)
   ```

2. **Orange Memory Full State** 🟠
   ```css
   Effect: Orange warning background
   Icon: Memory full warning icon
   Timing: Memory usage > 90%
   Interaction: Click for detailed information
   ```

3. **Rotating Loading Animation** 🔄
   ```css
   Effect: 360-degree clockwise rotation
   Speed: 1 rotation per second
   Timing: All asynchronous operations
   Style: Semi-transparent loading indicator
   ```

4. **Green Success State** ✅
   ```css
   Effect: Green glow expansion
   Icon: Checkmark
   Timing: Operation completed successfully
   Duration: Auto-reset after 2 seconds
   ```

5. **Red Error State** ❌
   ```css
   Effect: Red flashing warning
   Icon: Error warning mark
   Timing: Operation failure or error
   Interaction: Click for error details
   ```

### Advanced Operations

#### 🔧 Advanced Export Features

**Custom Export Templates**
```javascript
// Export template configuration
{
  "template": "detailed",
  "includeMetadata": true,
  "groupByCategory": true,
  "sortByDate": "desc",
  "includeStats": true
}
```

**Batch Export Operations**
1. Select memory content from multiple time periods
2. Set export format and options
3. Execute batch export
4. Download as compressed file

#### 📊 Statistics and Analysis

**Memory Usage Analysis**
```
📈 Memory Usage Statistics

Monthly Stats:
├── New Memories: 47 items
├── Export Count: 12 times
├── Average Memory Items: 25 items
└── Memory Cleanup Frequency: 2 times/week

Usage Patterns:
├── Most Active Hours: 2-6 PM
├── Most Used Category: Work Related (35%)
├── Average Memory Length: 52 characters
└── Export Success Rate: 98.5%
```

#### 🔄 Automation Features

**Automatic Memory Management**
- **Smart Cleanup**: Automatically identify expired or duplicate memory content
- **Scheduled Export**: Set automatic export schedules
- **Capacity Alerts**: Predict memory full time in advance
- **Content Classification**: Automatic categorization and tagging of memory content

**Automation Settings Example**
```
⏰ Automation Rules

Rule 1: Auto Export on Memory Full
├── Trigger: Memory usage > 95%
├── Action: Export and prompt cleanup
└── Frequency: Real-time

Rule 2: Weekly Scheduled Export
├── Trigger: Every Sunday 23:00
├── Action: Export weekly memories
└── Frequency: Weekly
```

#### 🛡️ Privacy and Security

**Data Protection Measures**
- **Local Storage**: All data saved in local Chrome storage
- **Encrypted Communication**: HTTPS encrypted communication with ChatGPT
- **No External Transmission**: Memory content not sent to third-party servers
- **User Control**: Users have complete control over data export and deletion

**Privacy Settings**
```
🔒 Privacy and Security Settings

Data Processing:
├── Local Storage: Device-only storage
├── Auto Cleanup: Auto-delete after 30 days
├── Export Records: Manual cleanup available
└── Sensitive Content: Configurable filter rules

Permission Management:
├── ChatGPT Access: Essential functions only
├── File Downloads: User confirmation required
├── Clipboard Access: Export operations only
└── Network Access: ChatGPT domain only
```

---

## 常見問題 | FAQ

### 中文 FAQ

**Q: 為什麼匯出按鈕沒有紫色漸層效果？**
A: 請確認：1) Chrome 版本 >= 88；2) 重新載入擴充套件；3) 清除瀏覽器快取

**Q: 記憶狀態顯示不正確怎麼辦？**
A: 1) 重新整理 ChatGPT 頁面；2) 重新載入擴充套件；3) 檢查網路連線

**Q: 歷史記錄消失了如何恢復？**
A: 歷史記錄儲存在本地，無法恢復。建議定期匯出重要記錄

**Q: 如何備份我的設定？**
A: 前往設定 → 匯出設定 → 儲存設定檔案

### English FAQ

**Q: Why doesn't the export button show purple gradient effect?**
A: Please check: 1) Chrome version >= 88; 2) Reload extension; 3) Clear browser cache

**Q: What if memory status displays incorrectly?**
A: 1) Refresh ChatGPT page; 2) Reload extension; 3) Check network connection

**Q: How to recover disappeared history records?**
A: History is stored locally and cannot be recovered. Recommend regular export of important records

**Q: How to backup my settings?**
A: Go to Settings → Export Settings → Save configuration file

---

**技術支援 | Technical Support**: [GitHub Issues](https://github.com/your-username/chatgpt-memory-toolkit/issues)  
**使用者社群 | User Community**: [Discussions](https://github.com/your-username/chatgpt-memory-toolkit/discussions)  
**文件版本 | Document Version**: v1.6.2  
**最後更新 | Last Updated**: 2025-08-01