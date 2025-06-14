import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { fileURLToPath, URL } from 'node:url'
import type { PluginOption } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use('/api', (req, res, next) => {
          next()
        })

        server.middlewares.use((req, res, next) => {
          const { url } = req
          // API calls や asset files はそのまま通す
          if (url.startsWith('/api') || url.includes('.') || url.startsWith('/@') || url.startsWith('/src/')) {
            return next()
          }

          // SPAのページルートは全て index.html を返す
          req.url = '/index.html'
          next()
        })
      }
    } as PluginOption
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5527,
    hmr: {
      host: 'localhost'
    }
  },
  build: {
    outDir: 'dist',
  },
  appType: 'spa',
  preview: {
    host: '0.0.0.0',
    port: 5527
  }
})
