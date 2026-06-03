import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { attachViteDevApi } from './api/_lib/viteDevApi.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'daydream-dev-api',
        configureServer(server) {
          attachViteDevApi(server, () => env)
        },
      },
    ],
    server: {
      port: 5173,
      strictPort: false,
      open: true,
    },
  }
})
