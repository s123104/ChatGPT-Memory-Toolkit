#!/usr/bin/env node

/**
 * Version Management Script
 * 統一更新所有文件中的版本號
 */

const fs = require('fs');
const path = require('path');

// 從 package.json 讀取版本號
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = packageJson.version;

console.log(`🔄 Updating version to ${version}...`);

// 要更新的文件配置
const filesToUpdate = [
  {
    path: './manifest.json',
    update: content => {
      const manifest = JSON.parse(content);
      manifest.version = version;
      return JSON.stringify(manifest, null, 2);
    },
  },
  {
    path: './src/ui/popup.html',
    update: content => {
      return content.replace(
        /<span class="version">v[\d.]+<\/span>/,
        `<span class="version">v${version}</span>`
      );
    },
  },
];

let updatedFiles = 0;

// 更新每個文件
filesToUpdate.forEach(({ path: filePath, update }) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    const originalContent = fs.readFileSync(filePath, 'utf8');
    const updatedContent = update(originalContent);

    if (originalContent !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Updated: ${filePath}`);
      updatedFiles++;
    } else {
      console.log(`➡️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Version update completed!`);
console.log(`📊 Updated ${updatedFiles} files to version ${version}`);

// 提供 git 命令建議
console.log(`\n💡 Suggested git commands:`);
console.log(`   git add .`);
console.log(`   git commit -m "chore: bump version to ${version}"`);
console.log(`   git tag v${version}`);
