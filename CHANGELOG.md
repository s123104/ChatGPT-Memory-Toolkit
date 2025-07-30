# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2025-07-30

### Added

- ✨ **Enhanced Button Animations** - 新增豐富的按鈕狀態動畫效果
  - 記憶已滿狀態：橙紅漸層背景移動、文字脈衝、圖示彈跳旋轉效果
  - 載入狀態：灰色脈衝效果、圖示旋轉、粒子透明度變化
  - 成功狀態：綠色發光擴散、圖示彈跳、粒子閃爍效果
  - 錯誤狀態：紅色閃爍、圖示震動、粒子散射效果

- 🎨 **UI Showcase Page** - 完整的UI統一化展示頁面
  - 全屏寬度設計，充分利用螢幕空間
  - 三欄式佈局：主要介面(2fr)、按鈕狀態與模態窗(1.5fr)、色彩系統與通知(1fr)
  - 響應式設計，適應不同螢幕尺寸
  - 完整的前端組件展示和互動演示

- 🔧 **Enhanced State Management** - 改進的狀態管理
  - 統一的按鈕狀態切換邏輯
  - 更好的狀態重置和清理機制
  - 記憶已滿狀態的自動檢測和視覺反饋

### Improved

- 🎯 **Memory Full Detection** - 優化記憶已滿檢測
  - 更準確的狀態檢測邏輯
  - 增強的視覺提示和動畫效果
  - 自動按鈕文字和樣式更新

- 💫 **Animation Performance** - 動畫性能優化
  - 使用 CSS3 硬體加速
  - 優化動畫時間和緩動函數
  - 減少重排和重繪操作

- 📱 **Responsive Design** - 響應式設計改進
  - 更好的大螢幕適配
  - 優化的小螢幕佈局
  - 改進的觸控體驗

### Changed

- 🔧 **Version Update** - 版本號更新至 1.6.0
- 📝 **Documentation** - 更新所有相關文檔和展示頁面

## [1.5.2] - 2025-07-30

### Changed

- 🔧 **Version Sync** - Updated all project files to version 1.5.2
- 📝 **Documentation** - Synchronized version numbers across all documentation

## [1.5.1] - 2025-07-30

### Changed

- 🔧 **Version Sync** - Updated all project files to version 1.5.1
- 📝 **Documentation** - Synchronized version numbers across all documentation

## [1.5.0] - 2025-07-30

### Changed

- 🔧 **Version Sync** - Updated all project files to version 1.5.0
- 📝 **Documentation** - Synchronized version numbers across all documentation

## [1.4.3] - 2025-07-29

### Changed

- 🔧 **Version Sync** - Updated all project files to version 1.4.3
- 📝 **Documentation** - Synchronized version numbers across all documentation

## [1.4.2] - 2025-07-29

### Changed

- 🔧 **Version Sync** - Updated all project files to version 1.4.2
- 📝 **Documentation** - Synchronized version numbers across all documentation

## [1.4.1] - 2025-07-29

### Changed

- 🔧 **Version Sync** - Updated all project files to version 1.4.1
- 📝 **Documentation** - Synchronized version numbers across all documentation

## [1.4.0] - 2025-07-29

### Changed

- 🔧 **Version Sync** - Updated all project files to version 1.4.0
- 📝 **Documentation** - Synchronized version numbers across all documentation

## [1.3.0] - 2025-07-29

### Changed

- 🔧 **Version Sync** - Updated all project files to version 1.3.0
- 📝 **Documentation** - Synchronized version numbers across all documentation

## [1.2.0] - 2025-01-29

### Added

- 🌙 **Dark Mode Support** - Modal windows now follow system dark mode preferences with purple theme
- 🔕 **Smart Reminder Control** - Users can choose "remind later" (24h) or "never remind" options
- 💾 **Local Memory Persistence** - Modal preferences are stored locally and sync with settings
- 🎨 **Enhanced Modal Design** - Consistent styling with popup interface using CSS variables
- ⚙️ **Settings Integration** - "Never remind" option automatically updates extension settings
- 📱 **Improved Responsive Design** - Better mobile and tablet support for modal windows

### Changed

- 🎯 **Version Management** - Implemented semantic versioning with automated sync across files
- 🔄 **Modal Behavior** - Non-intrusive reminder system respects user preferences
- 🎨 **Visual Consistency** - All modals now match the main popup's design language

### Fixed

- 🐛 **Version Sync** - Fixed version synchronization between package.json and manifest.json
- 🔧 **Modal Persistence** - Resolved issues with modal showing repeatedly after dismissal

## [1.2.0] - 2025-07-29

### Added

- 🎨 **Enhanced Modal UI** - Redesigned memory full modal with modern app-style interface
- 🚀 **Export Result Modal** - New modal showing export results with multiple action options
- ⏰ **24-Hour Reminder Control** - Smart reminder system with 24-hour snooze functionality
- 📋 **Multiple Export Formats** - Copy as Markdown, plain text, or download as TXT file
- 🔄 **Improved Button Interactions** - Fixed modal button click issues and enhanced UX

### Changed

- 🎨 **Modal Design** - Updated to match popup.html/popup.css design consistency
- 🔧 **Event Handling** - Improved modal event listeners and button functionality
- 📱 **Responsive Design** - Better mobile and tablet support for modals

### Fixed

- 🐛 **Modal Button Issues** - Resolved button click problems in memory full modal
- 🔧 **Event Listener Cleanup** - Proper cleanup of modal styles and event handlers

## [1.1.0] - 2025-01-29

### Added

- 📚 **History Management** - Complete export history tracking with preview and management
- ⚙️ **Settings Panel** - Customizable auto-alerts and history limits
- 🔔 **Auto Modal Alerts** - Smart notifications when memory is full
- 📊 **Storage Monitoring** - Real-time Chrome storage usage tracking
- 🛠️ **Development Tools** - ESLint, Prettier, and automated build system

### Changed

- 🎨 **Modern UI** - Redesigned popup interface with Material Design
- 🧠 **Enhanced Detection** - Improved memory full detection logic
- 📦 **Code Structure** - Complete project restructure with modular architecture
- 🚀 **Build System** - Automated build process with quality checks

### Fixed

- 🐛 **Export Stability** - Resolved memory export reliability issues
- 🔧 **Popup Display** - Fixed popup window display problems
- 📱 **Responsive Design** - Improved UI responsiveness across different screen sizes

## [1.0.0] - 2024-01-15

### Added

- 🎉 **Initial Release**
- 📤 **Basic Export** - Export ChatGPT memory in Markdown format
- 🔍 **Auto Detection** - Automatically detect when memory is full
- 📋 **Clipboard Copy** - Automatic clipboard integration
- 🎯 **Chrome Extension** - Full Chrome extension implementation
