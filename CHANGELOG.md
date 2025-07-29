# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
