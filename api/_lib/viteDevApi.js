import { handleGoogleEnvTest } from './googleEnvTest.js'
import { handleOpenAiTest } from './openaiTest.js'
import { handleOperatorRequest } from './operatorCore.js'
import {
  createDevReq,
  createDevRes,
  withDevEnv,
} from './devApiBridge.js'

const GET_HANDLERS = {
  '/api/openai-test': async () => handleOpenAiTest(),
  '/api/google-env-test': async () => handleGoogleEnvTest(),
  '/api/google/auth': async (req, res) => {
    const mod = await import('../google/auth.js')
    await mod.default(req, res)
  },
  '/api/google/callback': async (req, res) => {
    const mod = await import('../google/callback.js')
    await mod.default(req, res)
  },
  '/api/gmail/test': async (req, res) => {
    const mod = await import('../gmail/test.js')
    await mod.default(req, res)
  },
}

const POST_HANDLERS = {
  '/api/operator': async (body) => handleOperatorRequest(body),
  '/api/google/disconnect': async (req, res) => {
    const mod = await import('../google/disconnect.js')
    await mod.default(req, res)
  },
  '/api/gmail/draft': async (req, res) => {
    const mod = await import('../gmail/draft.js')
    await mod.default(req, res)
  },
  '/api/gmail/send': async (req, res) => {
    const mod = await import('../gmail/send.js')
    await mod.default(req, res)
  },
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString()
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('invalid_json'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export function attachViteDevApi(server, getEnv) {
  server.middlewares.use((incoming, res, next) => {
    const fullUrl = incoming.url || '/'
    const pathOnly = fullUrl.split('?')[0]

    if (incoming.method === 'OPTIONS' && pathOnly.startsWith('/api/')) {
      res.statusCode = 204
      res.setHeader('Allow', 'GET, POST, OPTIONS')
      res.end()
      return
    }

    const env = getEnv()

    if (incoming.method === 'GET' && GET_HANDLERS[pathOnly]) {
      withDevEnv(env, async () => {
        try {
          const handler = GET_HANDLERS[pathOnly]
          if (pathOnly === '/api/openai-test' || pathOnly === '/api/google-env-test') {
            const result = await handler()
            sendJson(res, result.status, result.body)
            return
          }
          const req = createDevReq(incoming, fullUrl)
          const devRes = createDevRes(res)
          await handler(req, devRes)
        } catch {
          sendJson(res, 500, { error: 'Sunucu hatası.' })
        }
      })
      return
    }

    if (incoming.method === 'POST' && POST_HANDLERS[pathOnly]) {
      withDevEnv(env, async () => {
        try {
          if (pathOnly === '/api/operator') {
            const body = await readBody(incoming)
            const result = await POST_HANDLERS[pathOnly](body)
            sendJson(res, result.status, result.body)
            return
          }
          const body = await readBody(incoming)
          const req = createDevReq(incoming, fullUrl)
          req.body = body
          const devRes = createDevRes(res)
          await POST_HANDLERS[pathOnly](req, devRes)
        } catch {
          sendJson(res, 500, { ok: false, message: 'Sunucu hatası.' })
        }
      })
      return
    }

    next()
  })
}
