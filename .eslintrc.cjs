module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    // 未使用変数の警告を緩和（_から始まる変数は警告しない）
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],

    // Vue3固有の設定
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': ['warn', { 'ignorePattern': '^_' }]
  }
}
