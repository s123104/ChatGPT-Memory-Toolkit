#!/usr/bin/env node

/**
 * Component Validation Test
 * Tests component loading and initialization logic
 */

const fs = require('fs');
const path = require('path');

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

console.log('🧪 Component Validation Test Starting...\n');

// Test 1: Constants Loading
console.log('📋 Test 1: Constants Loading');
try {
  // Load constants.js
  const constantsPath = path.join(__dirname, '../src/utils/constants.js');
  const constantsCode = fs.readFileSync(constantsPath, 'utf8');

  // Execute constants.js code
  eval(constantsCode);

  if (global.window.TIMING_CONSTANTS && global.window.UI_CONSTANTS) {
    console.log('✅ Constants loaded successfully');
    console.log(
      `   - TIMING_CONSTANTS has ${Object.keys(global.window.TIMING_CONSTANTS).length} properties`
    );
    console.log(
      `   - UI_CONSTANTS has ${Object.keys(global.window.UI_CONSTANTS).length} properties`
    );
  } else {
    console.log('❌ Constants not loaded to global window');
  }
} catch (error) {
  console.log('❌ Constants loading failed:', error.message);
}

// Test 2: ButtonStateManager Loading
console.log('\n📋 Test 2: ButtonStateManager Loading');
try {
  const buttonManagerPath = path.join(
    __dirname,
    '../src/ui/components/ButtonStateManager.js'
  );
  const buttonManagerCode = fs.readFileSync(buttonManagerPath, 'utf8');

  // Mock button element
  const mockButton = {
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
    },
    disabled: false,
    querySelector: () => ({ textContent: 'Test' }),
    dispatchEvent: () => {},
  };

  // Execute ButtonStateManager code
  eval(buttonManagerCode);

  if (global.window.ButtonStateManager) {
    console.log('✅ ButtonStateManager class loaded');

    // Test instantiation
    const manager = new global.window.ButtonStateManager(mockButton);
    if (manager && typeof manager.setLoading === 'function') {
      console.log('✅ ButtonStateManager can be instantiated');
      console.log('✅ ButtonStateManager has required methods');
    } else {
      console.log('❌ ButtonStateManager instantiation failed');
    }
  } else {
    console.log('❌ ButtonStateManager not loaded to global window');
  }
} catch (error) {
  console.log('❌ ButtonStateManager loading failed:', error.message);
}

// Test 3: ComponentManager Loading
console.log('\n📋 Test 3: ComponentManager Loading');
try {
  const indexPath = path.join(__dirname, '../src/ui/components/index.js');
  const indexCode = fs.readFileSync(indexPath, 'utf8');

  // Mock additional components
  global.window.ModalManager = class ModalManager {};
  global.window.ToastManager = class ToastManager {};

  // Execute index.js code
  eval(indexCode);

  if (global.window.ComponentManager && global.window.componentManager) {
    console.log('✅ ComponentManager class and instance loaded');

    if (typeof global.window.componentManager.init === 'function') {
      console.log('✅ ComponentManager has required methods');
    } else {
      console.log('❌ ComponentManager missing required methods');
    }
  } else {
    console.log('❌ ComponentManager not loaded properly');
  }
} catch (error) {
  console.log('❌ ComponentManager loading failed:', error.message);
}

// Test 4: Module Size Check
console.log('\n📋 Test 4: Module Size Validation');
const modulePaths = [
  '../src/ui/components/ButtonStateManager.js',
  '../src/ui/components/ToastManager.js',
  '../src/ui/components/ModalManager.js',
  '../src/ui/components/index.js',
  '../src/scripts/content.js',
  '../src/ui/popup.js',
];

let oversizedModules = [];

modulePaths.forEach(modulePath => {
  try {
    const fullPath = path.join(__dirname, modulePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const lineCount = content.split('\n').length;
    const moduleName = path.basename(modulePath);

    if (lineCount > 600) {
      oversizedModules.push({ name: moduleName, lines: lineCount });
      console.log(`❌ ${moduleName}: ${lineCount} lines (exceeds 600)`);
    } else {
      console.log(`✅ ${moduleName}: ${lineCount} lines (within limit)`);
    }
  } catch (error) {
    console.log(
      `❌ Could not check ${path.basename(modulePath)}: ${error.message}`
    );
  }
});

// Test Summary
console.log('\n📊 Test Summary');
if (oversizedModules.length > 0) {
  console.log(`⚠️  ${oversizedModules.length} module(s) exceed 600 lines:`);
  oversizedModules.forEach(module => {
    console.log(`   - ${module.name}: ${module.lines} lines`);
  });
} else {
  console.log('✅ All modules are properly sized');
}

console.log('\n🏁 Component Validation Test Complete');
