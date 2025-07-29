#!/usr/bin/env node

/**
 * Enhanced Version Management Script
 * 統一更新所有文件中的版本號，支援更多文件類型和智能更新
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 從 package.json 讀取版本號
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = packageJson.version;
const currentDate = new Date().toISOString().split('T')[0];

console.log(`🔄 Enhanced Version Update to ${version}...`);
console.log(`📅 Update Date: ${currentDate}`);

// 智能版本檢測函數
function detectCurrentVersion(content, patterns) {
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

// 要更新的文件配置（擴展版）
const filesToUpdate = [
  {
    path: './manifest.json',
    description: 'Chrome Extension Manifest',
    update: content => {
      const manifest = JSON.parse(content);
      const oldVersion = manifest.version;
      manifest.version = version;
      return {
        content: JSON.stringify(manifest, null, 2),
        changed: oldVersion !== version,
        oldVersion
      };
    },
  },
  {
    path: './src/ui/popup.html',
    description: 'Popup HTML Template',
    update: content => {
      const oldVersionMatch = content.match(/<span class="version">v([\d.]+)<\/span>/);
      const oldVersion = oldVersionMatch ? oldVersionMatch[1] : null;
      const newContent = content.replace(
        /<span class="version">v[\d.]+<\/span>/,
        `<span class="version">v${version}</span>`
      );
      return {
        content: newContent,
        changed: content !== newContent,
        oldVersion
      };
    },
  },
  {
    path: './README.md',
    description: 'Project README Documentation',
    update: content => {
      const patterns = [
        /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-([\d.]+)-green/,
        /版本.*?([\d.]+)/,
        /version-([\d.]+)-green/
      ];
      const oldVersion = detectCurrentVersion(content, patterns);
      
      let newContent = content
        .replace(
          /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[\d.]+-green\?style=flat-square\)/g,
          `![Version](https://img.shields.io/badge/version-${version}-green?style=flat-square)`
        )
        .replace(
          /version-[\d.]+-green/g,
          `version-${version}-green`
        );
      
      return {
        content: newContent,
        changed: content !== newContent,
        oldVersion
      };
    },
  },
  {
    path: './CLAUDE.md',
    description: 'Claude Project Documentation',
    update: content => {
      const oldVersionMatch = content.match(/\*\*專案狀態\*\*:.*?\*\*版本\*\*: v([\d.]+)/);
      const oldVersion = oldVersionMatch ? oldVersionMatch[1] : null;
      
      const newContent = content.replace(
        /(\*\*專案狀態\*\*:.*?\*\*版本\*\*: v)([\d.]+)/,
        `$1${version}`
      );
      
      return {
        content: newContent,
        changed: content !== newContent,
        oldVersion
      };
    },
  },
  {
    path: './CHANGELOG.md',
    description: 'Changelog Documentation',
    update: content => {
      // 檢查是否已有當前版本的條目
      const hasCurrentVersion = content.includes(`## [${version}]`);
      
      if (hasCurrentVersion) {
        return {
          content: content,
          changed: false,
          oldVersion: version,
          note: 'Version entry already exists'
        };
      }
      
      // 在第一個版本條目前插入新版本
      const versionHeader = `## [${version}] - ${currentDate}

### Changed

- 🔧 **Version Sync** - Updated all project files to version ${version}
- 📝 **Documentation** - Synchronized version numbers across all documentation

`;
      
      const insertPosition = content.indexOf('\n## [');
      if (insertPosition !== -1) {
        const newContent = content.slice(0, insertPosition + 1) + versionHeader + content.slice(insertPosition + 1);
        return {
          content: newContent,
          changed: true,
          oldVersion: null
        };
      }
      
      return {
        content: content,
        changed: false,
        oldVersion: null
      };
    },
  }
];

let updatedFiles = 0;
let skippedFiles = 0;
let errorFiles = 0;
const updateSummary = [];

// 增強的文件更新邏輯
filesToUpdate.forEach(({ path: filePath, description, update }) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath} (${description})`);
      skippedFiles++;
      return;
    }

    const originalContent = fs.readFileSync(filePath, 'utf8');
    const result = update(originalContent);

    if (result.changed) {
      fs.writeFileSync(filePath, result.content);
      const changeInfo = result.oldVersion 
        ? `${result.oldVersion} → ${version}`
        : `Updated to ${version}`;
      console.log(`✅ Updated: ${filePath} (${changeInfo})`);
      updateSummary.push({
        file: filePath,
        description,
        oldVersion: result.oldVersion,
        newVersion: version
      });
      updatedFiles++;
    } else {
      const status = result.note || 'No changes needed';
      console.log(`➡️  ${status}: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    errorFiles++;
  }
});

// 詳細更新報告
console.log(`\n🎉 Enhanced Version Update Completed!`);
console.log(`📊 Statistics:`);
console.log(`   ✅ Updated: ${updatedFiles} files`);
console.log(`   ➡️  Skipped: ${skippedFiles} files`);
console.log(`   ❌ Errors:  ${errorFiles} files`);

if (updateSummary.length > 0) {
  console.log(`\n📋 Update Summary:`);
  updateSummary.forEach(({ file, description, oldVersion, newVersion }) => {
    const change = oldVersion ? `${oldVersion} → ${newVersion}` : newVersion;
    console.log(`   • ${description}: ${change}`);
  });
}

// Git 自動化選項
console.log(`\n🤖 Automation Options:`);
console.log(`\n💡 Manual Git Commands:`);
console.log(`   git add .`);
console.log(`   git commit -m "chore: bump version to ${version}"`);
console.log(`   git tag v${version}`);

// 檢查是否在 git 倉庫中
try {
  execSync('git rev-parse --git-dir', { stdio: 'pipe' });
  console.log(`\n🔧 Auto Git Integration Available`);
  
  // 可以添加自動 git 操作的選項
  const args = process.argv.slice(2);
  if (args.includes('--auto-commit') && updatedFiles > 0) {
    console.log(`\n🚀 Auto-committing changes...`);
    try {
      execSync('git add .', { stdio: 'pipe' });
      execSync(`git commit -m "chore: bump version to ${version}

- 📦 Updated ${updatedFiles} files to version ${version}
- 🔄 Automated version synchronization
- 📝 Documentation and manifest updates

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"`, { stdio: 'pipe' });
      console.log(`✅ Successfully committed version ${version}`);
      
      if (args.includes('--auto-tag')) {
        execSync(`git tag v${version}`, { stdio: 'pipe' });
        console.log(`🏷️  Created tag v${version}`);
      }
    } catch (gitError) {
      console.error(`❌ Git operation failed:`, gitError.message);
    }
  }
} catch (e) {
  console.log(`ℹ️  Not in a git repository`);
}

console.log(`\n✨ Version management complete!`);
