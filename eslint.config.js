import js from '@eslint/js';
import globals from 'globals';
import security from 'eslint-plugin-security';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Global ignores (must be first)
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
      'chatgpt-memory-manager.js', // Legacy file
      'logs/**',
    ],
  },

  // Base recommended configuration
  js.configs.recommended,

  // Security plugin configuration
  security.configs.recommended,

  // Prettier integration (must be last)
  prettierConfig,

  {
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        chrome: 'readonly',
        browser: 'readonly', // For Firefox compatibility
        StorageManager: 'readonly', // Project specific global
      },
    },

    plugins: {
      security,
      prettier,
    },

    rules: {
      // Chrome Extension specific
      'no-undef': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Security rules for extensions
      'security/detect-eval-with-expression': 'error',
      'security/detect-non-literal-fs-filename': 'off', // Not applicable for extensions
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'off', // Not applicable for browser
      'security/detect-child-process': 'off', // Not applicable for browser
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-new-buffer': 'off', // Not applicable for browser
      'security/detect-no-csrf-before-method-override': 'off', // Not applicable
      'security/detect-object-injection': 'warn', // Can be too strict
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',

      // Modern JavaScript best practices
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': 'error',

      // Code quality
      'no-console': 'off', // Allow console for extension debugging
      'no-debugger': 'error',
      'no-alert': 'warn', // Extensions might use alerts
      'consistent-return': 'error',
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-implicit-coercion': 'error',
      'no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
        },
      ],

      // Style consistency
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-empty': ['error', { allowEmptyCatch: true }],

      // Prettier integration
      'prettier/prettier': 'error',
    },

    files: ['**/*.js', '**/*.mjs'],
  },

  // Content script specific configuration
  {
    files: ['**/content/**/*.js', '**/content.js', 'src/scripts/content.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        chrome: 'readonly',
        document: 'readonly',
        window: 'readonly',
        StorageManager: 'readonly',
      },
    },
    rules: {
      // Content scripts can use DOM APIs
      'no-global-assign': 'error',
      'no-implicit-globals': 'error',
    },
  },

  // Background script specific configuration
  {
    files: [
      '**/background/**/*.js',
      '**/background.js',
      '**/service-worker.js',
    ],
    languageOptions: {
      globals: {
        ...globals.webextensions,
        chrome: 'readonly',
        self: 'readonly', // For service workers
        importScripts: 'readonly',
      },
    },
    rules: {
      // Background scripts shouldn't use DOM
      'no-restricted-globals': ['error', 'window', 'document'],
    },
  },

  // Popup and UI scripts configuration
  {
    files: ['**/ui/**/*.js', '**/popup/**/*.js', 'src/ui/popup.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        chrome: 'readonly',
        document: 'readonly',
        window: 'readonly',
        StorageManager: 'readonly',
      },
    },
  },

  // Node.js scripts configuration
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'commonjs', // Use CommonJS for Node.js scripts
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off', // Allow console in Node.js scripts
      'security/detect-object-injection': 'off', // Too strict for build scripts
    },
  },
];
