#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Build configuration
const BUILD_DIR = 'build';
const SOURCE_FILES = ['manifest.json', 'src/', 'assets/'];

// Utility functions
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} -> ${dest}`);
}

function copyDirectory(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function cleanBuild() {
  if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
    console.log(`Cleaned build directory: ${BUILD_DIR}`);
  }
}

function build() {
  console.log('🚀 Building ChatGPT Memory Manager Extension...\n');

  // Clean previous build
  cleanBuild();

  // Create build directory
  ensureDir(BUILD_DIR);

  // Copy files
  for (const file of SOURCE_FILES) {
    const srcPath = path.resolve(file);
    const destPath = path.resolve(BUILD_DIR, file);

    if (fs.existsSync(srcPath)) {
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        copyFile(srcPath, destPath);
      }
    } else {
      console.warn(`⚠️  Source not found: ${file}`);
    }
  }

  console.log('\n✅ Build completed successfully!');
  console.log(`📦 Extension files are in: ${path.resolve(BUILD_DIR)}`);
  console.log('\n📋 To load the extension in Chrome:');
  console.log('1. Open Chrome and go to chrome://extensions/');
  console.log('2. Enable "Developer mode" (top right toggle)');
  console.log('3. Click "Load unpacked" and select the build folder');
  console.log('4. The extension should now be loaded and ready to use!');
}

// Run build
try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
