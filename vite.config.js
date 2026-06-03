import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleOperatorRequest } from './api/_lib/operatorCore.js'

function operatorDevApiPlugin(getEnv) {
  return {
    name: 'daydream-operator-dev-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathOnly = req.url?.split('?')[0]
        if (pathOnly !== '/api/operator') return next()

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.setHeader('Allow', 'POST, OPTIONS')
          res.end()
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: 'Yalnızca POST desteklenir.' }))
          return
        }

        const chunks = []
        req.on('data', (chunk) => chunks.push(chunk))
        req.on('end', async () => {
          try {
            const raw = Buffer.concat(chunks).toString()
            const parsed = raw ? JSON.parse(raw) : {}
            const env = getEnv()
            const prevKey = process.env.OPENAI_API_KEY
            const prevModel = process.env.OPENAI_MODEL
            if (env.OPENAI_API_KEY) {
              process.env.OPENAI_API_KEY = env.OPENAI_API_KEY
            }
            if (env.OPENAI_MODEL) {
              process.env.OPENAI_MODEL = env.OPENAI_MODEL
            }
            const result = await handleOperatorRequest(parsed)
            if (prevKey !== undefined) process.env.OPENAI_API_KEY = prevKey
            else delete process.env.OPENAI_API_KEY
            if (prevModel !== undefined) process.env.OPENAI_MODEL = prevModel
            else delete process.env.OPENAI_MODEL
            res.statusCode = result.status
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(result.body))
          } catch {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'Sunucu hatası.' }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), operatorDevApiPlugin(() => env)],
    server: {
      port: 5173,
      strictPort: false,
      open: true,
    },
  }
})
