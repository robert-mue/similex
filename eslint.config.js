import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.test.js', 'vitest.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Keep ESLint out of formatting concerns; Prettier owns those.
  prettier,
];
