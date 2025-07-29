#!/usr/bin/env node
/**
 * 移除所有文檔文件中的 emoji
 */

const fs = require('fs');
const path = require('path');

// 需要處理的文件列表
const files = [
  'README.md',
  'USAGE_GUIDE.md',
  'RELEASE_CHECKLIST.md',
  'test/extension-test.js',
];

// emoji 到文字的映射
const emojiMap = {
  '🎉': '',
  '🚀': '',
  '📝': '',
  '🔧': '',
  '🎨': '',
  '🛠️': '',
  '📚': '',
  '💡': '',
  '🎯': '',
  '📊': '',
  '💾': '',
  '🔄': '',
  '⚙️': '',
  '📋': '',
  '📄': '',
  '🧠': '',
  '🎊': '',
  '✅': '- [x]',
  '❌': '- [ ]',
  '⚡': '',
  '📱': '',
  '🔍': '',
  '📦': '',
  '🏗️': '',
  '🛡️': '',
  '🧪': '',
  '📁': '',
  '📖': '',
  '📈': '',
  '🤝': '',
  '📞': '',
  '🔒': '',
  '🚨': '',
  '💻': '',
  '⚠️': '',
  '🤖': '',
};

// 處理每個文件
files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`處理文件: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 替換 emoji
    Object.entries(emojiMap).forEach(([emoji, replacement]) => {
      if (content.includes(emoji)) {
        content = content.replace(new RegExp(emoji, 'g'), replacement);
        modified = true;
      }
    });

    // 清理多餘的空格和標題
    content = content
      .replace(/^### \s+/gm, '### ') // 移除標題前的空格
      .replace(/^## \s+/gm, '## ') // 移除標題前的空格
      .replace(/^\s*-\s*\*\*/gm, '- **') // 修復列表格式
      .replace(/\n\n\n+/g, '\n\n'); // 移除多餘的空行

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ 已更新: ${filePath}`);
    } else {
      console.log(`- 無需更新: ${filePath}`);
    }
  } else {
    console.log(`! 文件不存在: ${filePath}`);
  }
});

console.log('\n所有文件處理完成！');
