/** @format */

import js from '@eslint/js';
import { rules as prettierRules } from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // Ignore build artifacts
  {
    ignores: ['**/build/**', '**/dist/**', '**/node_modules/**'],
  },

  // Base JavaScript config
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.browser,
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
    rules: {
      ...prettierRules,
    },
  },

  // TypeScript base config
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    // Include both basic and type-checked rules
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked, // assumes tsconfig.json is present
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    rules: {
      ...prettierRules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);
