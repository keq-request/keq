require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: ['@buka/eslint-config/typescript/recommended'],
  parserOptions: {
    sourceType: 'module',
    project: true,
  },
  env: {
    node: true,
  },
  ignorePatterns: ['src/api/**'],
}
