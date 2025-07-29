# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**ChatGPT Memory Toolkit** - A Chrome extension for intelligent ChatGPT memory management with Markdown export capabilities.

## Development Commands

### Testing and Quality
```bash
# Run linting
npm run lint

# Format code
npm run format
```

### Extension Development
```bash
# Load extension for development:
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select project root directory
```

## Architecture Overview

This is a Manifest V3 Chrome extension with a simplified, focused architecture for ChatGPT memory management and Markdown export.

### Core Components

**Content Script (`src/scripts/content.js`)**
- Main application logic with 727 lines of sophisticated DOM manipulation
- Implements intelligent memory detection and automatic export workflow
- Key features:
  - `CONFIG` object with selectors, timeouts, and detection keywords
  - `waitFor()` and `waitForVisible()` utilities for async DOM operations
  - `humanClick()` function for realistic interaction simulation
  - `harvestAllMemories()` with intelligent scrolling and data collection
  - Message handling for popup communication

**Popup Interface (`src/ui/popup.js`)**
- Modern app-style popup with `ModernPopupManager` class
- Real-time status monitoring with 10-second intervals
- Button state management (loading/success/error states)
- Key methods:
  - `updateStatus()` - Communicates with content script for live data
  - `handleExport()` - Triggers memory export workflow
  - `handleCopy()` - Clipboard integration for Markdown content

### Data Flow Architecture

1. **Detection Phase**: Content script monitors DOM for "儲存的記憶已滿" trigger text
2. **Navigation Phase**: Automatically navigates to ChatGPT settings/personalization
3. **Collection Phase**: Scrapes memory data using intelligent scrolling algorithms
4. **Export Phase**: Converts to Markdown format and copies to clipboard
5. **UI Communication**: Popup queries content script status via message passing

### Key Technical Patterns

**DOM Manipulation Strategy**
- Uses `MutationObserver` for real-time DOM monitoring
- Implements visibility checking with `isVisible()` helper
- Complex scrolling algorithm in `harvestAllMemories()` handles dynamic loading

**Message Passing Protocol**
```javascript
// Popup → Content Script
{ action: 'getMemoryStatus' | 'exportMemories' | 'getMarkdown' }

// Content Script → Popup  
{ success: boolean, data: array, usage: string, markdown: string }
```

**Memory Detection Logic**
- Multi-language support (Chinese/English keywords)
- Percentage extraction from DOM text using regex patterns
- Fallback collection methods for different ChatGPT UI layouts

## Important Implementation Details

### Content Script Configuration
The `CONFIG` object in `content.js` contains critical selectors and timeouts that may need updates if ChatGPT's UI changes:

```javascript
const CONFIG = {
  triggerText: '儲存的記憶已滿',  // Memory full trigger text
  targetURL: 'https://chatgpt.com/#settings/Personalization',
  personalizationTabSel: '[data-testid="personalization-tab"][role="tab"]',
  memoryKeywords: ['管理記憶', 'Manage memory', 'Memory', '記憶'],
  modalTitleKeywords: ['儲存的記憶', 'Saved memories', 'Memories'],
  // Various timeout values for DOM operations
}
```

### Memory Collection Algorithm
The `harvestAllMemories()` function implements a sophisticated scrolling strategy:
- Uses `scrollTop` manipulation combined with `WheelEvent` and `KeyboardEvent` simulation
- Implements idle detection with `idleRoundsToStop` to prevent infinite loops
- Collects unique memory items using `Set` to avoid duplicates
- Falls back to alternative DOM parsing if table structure isn't found

### Extension Manifest Permissions
Current permissions are minimal for security:
- `activeTab`: Access to current tab only
- `scripting`: Required for content script injection
- `host_permissions`: Limited to `https://chatgpt.com/*`

## Debugging Extension Issues

### Content Script Connection
If popup shows "未連接" (disconnected):
1. Check if content script loaded: Open ChatGPT page → F12 → Console → Look for "[Memory Manager]" logs
2. Reload the ChatGPT page to reinitialize content script
3. Check manifest.json matches ChatGPT's current domain

### Memory Detection Failures
If memory detection isn't working:
1. Verify trigger text matches current ChatGPT interface language
2. Update `CONFIG.memoryKeywords` if ChatGPT changes button text
3. Check DOM selectors in browser DevTools: `document.querySelector('[data-testid="personalization-tab"]')`

### Export Process Debugging
The export workflow involves multiple async steps that can fail:
1. **Navigation**: Check if URL navigation to settings works
2. **Tab Detection**: Verify personalization tab selector is correct
3. **Modal Opening**: Ensure "管理" button click opens memory modal
4. **Data Collection**: Check if table/row selectors match current DOM structure