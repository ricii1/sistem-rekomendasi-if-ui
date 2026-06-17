import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/auth': { target: 'http://127.0.0.1:8001', changeOrigin: true },
      '/generate': { target: 'http://127.0.0.1:8001', changeOrigin: true },
      '/conversations': { target: 'http://127.0.0.1:8001', changeOrigin: true },
      '/upload_transcript': { target: 'http://127.0.0.1:8001', changeOrigin: true },
    }
  }
})
