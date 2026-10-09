const { fixupConfigRules } = require('@eslint/compat');
const reactNative = require('@react-native/eslint-config/flat');

module.exports = [
  {
    ignores: ['**/build/**', '**/Pods/**', 'vendor/**', 'coverage/**', '**/.*'],
  },
  // Preserve rules from plugins that still use the ESLint 8 rule API.
  ...fixupConfigRules(reactNative),
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
