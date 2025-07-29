module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    chrome: 'readonly',
    StorageManager: 'readonly',
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': 'off', // Disable for Windows compatibility
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'off', // Allow console for extension debugging
    'prefer-const': 'error',
    'no-var': 'error',
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
};
