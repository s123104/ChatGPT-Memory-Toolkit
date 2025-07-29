#!/usr/bin/env node

/**
 * Version Management Script
 * 統一更新所有文件中的版本號
 */

const fs = require('fs');
const path = require('path');

// 讀取版本配置
const versionConfig = JSON.parse(fs.readFileSync('./version.json', 'utf8'));
const { version, name, description, author, buildDate } = versionConfig;

console.log(`🔄 Updating version to ${version}...`);

// 要更新的文件配置
const filesToUpdate = [
  {
    path: './manifest.json',
    update: (content) => {
      const manifest = JSON.parse(content);
      manifest.version = version;
      manifest.name = name;
      manifest.description = description;
      manifest.author = author;
      return JSON.stringify(manifest, null, 2);
    }
  },
  {
    path: './package.json',
    update: (content) => {
      const pkg = JSON.parse(content);
      pkg.version = version;
      pkg.description = description;
      pkg.author = author;
      return JSON.stringify(pkg, null, 2);
    }
  },
  {
    path: './src/ui/popup.html',
    update: (content) => {
      return content.replace(
        /<span class="version">v[\d.]+<\/span>/,
        `<span class="version">v${version}</span>`
      );
    }
  },
  {
    path: './README.md',
    update: (content) => {
      // 更新版本號和構建日期
      return content
        .replace(/- \*\*v[\d.]+\*\*/g, `- **v${version}**`)
        .replace(/版本：v[\d.]+/g, `版本：v${version}`)
        .replace(/\*\*版本\*\*: v[\d.]+/g, `**版本**: v${version}`)
        .replace(/構建日期：[\d-]+/g, `構建日期：${buildDate}`);
    }
  },
  {
    path: './CLAUDE.md',
    update: (content) => {
      return content
        .replace(/版本：v[\d.]+/g, `版本：v${version}`)
        .replace(/\*\*版本\*\*: v[\d.]+/g, `**版本**: v${version}`);
    }
  }
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

// 生成 CHANGELOG.md
const generateChangelog = () => {
  const changelog = Object.entries(versionConfig.changelog)
    .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
    .map(([ver, info]) => {
      const changes = info.changes.map(change => `- ${change}`).join('\n');
      return `## [${ver}] - ${info.date}\n\n${changes}\n`;
    })
    .join('\n');

  const content = `# Changelog

本項目的所有重要變更都會記錄在此文件中。

版本格式遵循 [Semantic Versioning](https://semver.org/lang/zh-TW/)。

${changelog}

## 版本說明

- **Major (主版本)**: ${versionConfig.semantic.major}
- **Minor (次版本)**: ${versionConfig.semantic.minor}  
- **Patch (修訂版本)**: ${versionConfig.semantic.patch}
`;

  fs.writeFileSync('./CHANGELOG.md', content);
  console.log('✅ Generated: CHANGELOG.md');
  updatedFiles++;
};

generateChangelog();

console.log(`\n🎉 Version update completed!`);
console.log(`📊 Updated ${updatedFiles} files to version ${version}`);
console.log(`📅 Build date: ${buildDate}`);

// 提供 git 命令建議
console.log(`\n💡 Suggested git commands:`);
console.log(`   git add .`);
console.log(`   git commit -m "chore: bump version to ${version}"`);
console.log(`   git tag v${version}`);