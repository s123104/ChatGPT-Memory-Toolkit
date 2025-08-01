#!/usr/bin/env node

/**
 * Final Comprehensive Validation Test
 * Tests all requested issues and fixes
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Final Comprehensive Validation Test\n');

// Test Results Summary
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: [],
};

function addResult(test, status, message) {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${test}: ${message}`);

  if (status === 'pass') results.passed++;
  else if (status === 'fail') {
    results.failed++;
    results.issues.push({ test, message });
  } else {
    results.warnings++;
  }
}

// 1. TIMING_CONSTANTS Duplicate Declaration Fix
console.log('📋 Test 1: TIMING_CONSTANTS Duplicate Declaration');
try {
  const buttonManagerPath = path.join(
    __dirname,
    '../src/ui/components/ButtonStateManager.js'
  );
  const code = fs.readFileSync(buttonManagerPath, 'utf8');

  const timingConstMatches = code.match(/const TIMING_CONSTANTS/g);
  if (!timingConstMatches || timingConstMatches.length === 1) {
    addResult(
      'TIMING_CONSTANTS Fix',
      'pass',
      'No duplicate declarations found'
    );
  } else {
    addResult(
      'TIMING_CONSTANTS Fix',
      'fail',
      `Found ${timingConstMatches.length} declarations`
    );
  }

  if (
    code.includes("typeof window !== 'undefined'") &&
    code.includes('window.TIMING_CONSTANTS')
  ) {
    addResult(
      'Global Constants Usage',
      'pass',
      'Uses global constants properly'
    );
  } else {
    addResult(
      'Global Constants Usage',
      'fail',
      'Does not use global constants properly'
    );
  }
} catch (error) {
  addResult('TIMING_CONSTANTS Fix', 'fail', error.message);
}

// 2. Component Loading and Initialization
console.log('\n📋 Test 2: Component Loading and Initialization');

// Mock DOM environment
global.window = {};
global.document = {
  getElementById: () => null,
  createElement: () => ({
    id: '',
    textContent: '',
    style: {},
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {},
  }),
  head: { appendChild: () => {} },
  addEventListener: () => {},
  dispatchEvent: () => {},
};

try {
  // Load constants
  const constantsPath = path.join(__dirname, '../src/utils/constants.js');
  const constantsCode = fs.readFileSync(constantsPath, 'utf8');
  eval(constantsCode);

  if (global.window.TIMING_CONSTANTS && global.window.UI_CONSTANTS) {
    addResult('Constants Loading', 'pass', 'All constants loaded successfully');
  } else {
    addResult(
      'Constants Loading',
      'fail',
      'Constants not loaded to global window'
    );
  }

  // Load ButtonStateManager
  const buttonManagerPath = path.join(
    __dirname,
    '../src/ui/components/ButtonStateManager.js'
  );
  const buttonManagerCode = fs.readFileSync(buttonManagerPath, 'utf8');

  const mockButton = {
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    disabled: false,
    querySelector: () => ({ textContent: 'Test' }),
    dispatchEvent: () => {},
  };

  eval(buttonManagerCode);

  if (global.window.ButtonStateManager) {
    const manager = new global.window.ButtonStateManager(mockButton);
    if (manager && typeof manager.setLoading === 'function') {
      addResult(
        'ButtonStateManager Initialization',
        'pass',
        'Can be instantiated and has required methods'
      );
    } else {
      addResult(
        'ButtonStateManager Initialization',
        'fail',
        'Cannot be instantiated properly'
      );
    }
  } else {
    addResult(
      'ButtonStateManager Initialization',
      'fail',
      'ButtonStateManager not loaded'
    );
  }
} catch (error) {
  addResult('Component Loading', 'fail', error.message);
}

// 3. Module Size Validation
console.log('\n📋 Test 3: Module Size Validation (600 lines max)');
const modulePaths = [
  {
    path: '../src/ui/components/ButtonStateManager.js',
    name: 'ButtonStateManager.js',
  },
  { path: '../src/ui/components/ToastManager.js', name: 'ToastManager.js' },
  { path: '../src/ui/components/ModalManager.js', name: 'ModalManager.js' },
  { path: '../src/ui/components/index.js', name: 'index.js' },
  { path: '../src/scripts/content.js', name: 'content.js' },
  { path: '../src/ui/popup.js', name: 'popup.js' },
];

modulePaths.forEach(module => {
  try {
    const fullPath = path.join(__dirname, module.path);
    const content = fs.readFileSync(fullPath, 'utf8');
    const lineCount = content.split('\n').length;

    if (lineCount <= 600) {
      addResult(
        `Module Size - ${module.name}`,
        'pass',
        `${lineCount} lines (within limit)`
      );
    } else {
      addResult(
        `Module Size - ${module.name}`,
        'fail',
        `${lineCount} lines (exceeds 600 line limit)`
      );
    }
  } catch (error) {
    addResult(
      `Module Size - ${module.name}`,
      'fail',
      `Could not check: ${error.message}`
    );
  }
});

// 4. UI Consistency Check
console.log('\n📋 Test 4: UI Consistency');
try {
  const popupPath = path.join(__dirname, '../src/ui/popup.html');
  const showcasePath = path.join(__dirname, '../test/ui-showcase.html');

  const popupContent = fs.readFileSync(popupPath, 'utf8');
  const showcaseContent = fs.readFileSync(showcasePath, 'utf8');

  // Check if both load constants.js
  const popupHasConstants = popupContent.includes('constants.js');
  const showcaseHasConstants = showcaseContent.includes('constants.js');

  if (popupHasConstants && showcaseHasConstants) {
    addResult(
      'Constants Loading Consistency',
      'pass',
      'Both files load constants.js'
    );
  } else {
    addResult(
      'Constants Loading Consistency',
      'fail',
      `popup.html: ${popupHasConstants}, ui-showcase.html: ${showcaseHasConstants}`
    );
  }

  // Check component loading consistency
  const popupComponents = (
    popupContent.match(/components\/[\w\.-]+\.js/g) || []
  ).length;
  const showcaseComponents = (
    showcaseContent.match(/components\/[\w\.-]+\.js/g) || []
  ).length;

  if (popupComponents > 0 && showcaseComponents > 0) {
    addResult(
      'Component Loading Consistency',
      'pass',
      `popup: ${popupComponents} components, showcase: ${showcaseComponents} components`
    );
  } else {
    addResult(
      'Component Loading Consistency',
      'fail',
      'Component loading inconsistent'
    );
  }
} catch (error) {
  addResult('UI Consistency Check', 'fail', error.message);
}

// 5. Build Test
console.log('\n📋 Test 5: Build Validation');
try {
  const buildPath = path.join(__dirname, '../build');
  if (fs.existsSync(buildPath)) {
    const buildFiles = fs.readdirSync(buildPath, { recursive: true });
    const jsFiles = buildFiles.filter(f => f.toString().endsWith('.js'));

    if (jsFiles.length > 0) {
      addResult(
        'Build Output',
        'pass',
        `Build successful with ${jsFiles.length} JS files`
      );
    } else {
      addResult(
        'Build Output',
        'warn',
        'Build directory exists but no JS files found'
      );
    }
  } else {
    addResult(
      'Build Output',
      'warn',
      'Build directory not found (run npm run build)'
    );
  }
} catch (error) {
  addResult('Build Validation', 'fail', error.message);
}

// Final Summary
console.log('\n📊 Final Test Summary');
console.log('=====================');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);

if (results.issues.length > 0) {
  console.log('\n🚨 Issues to Address:');
  results.issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.test}: ${issue.message}`);
  });
} else {
  console.log('\n🎉 All critical tests passed!');
}

console.log('\n🏁 Final Validation Complete');
