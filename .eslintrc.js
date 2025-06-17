module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
    jest: true  // テスト環境のグローバル変数を有効化
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  plugins: ['@typescript-eslint'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  ignorePatterns: [
    'dist/',
    'coverage/',
    'node_modules/'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': 'warn',  // エラーではなく警告にする
    '@typescript-eslint/no-unused-vars': 'warn'
  }
}
