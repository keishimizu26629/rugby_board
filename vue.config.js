module.exports = {
  devServer: {
    port: 5527,
    host: '0.0.0.0',
    allowedHosts: 'all',
    hot: true,
    watchFiles: {
      paths: ['src/**/*'],
      options: {
        usePolling: true,
        interval: 1000
      }
    }
  },

  transpileDependencies: [
    'vuetify'
  ],
  lintOnSave: false
}
