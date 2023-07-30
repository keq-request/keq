require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:@typescript-eslint/recommended',
    '@buka/eslint-config/typescript/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  globals: {
    globalThis: true,
  },
  ignorePatterns: ['./dist/**'],
  rules: {
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-redundant-type-constituents': 'warn',
  },
}
