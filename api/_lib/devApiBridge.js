/** Vite dev sunucusunda /api/* için process.env enjeksiyonu + mock res */

const ENV_KEYS = [
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'GOOGLE_TOKEN_SECRET',
  'APP_URL',
  'GOOGLE_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'GEMINI_MODEL',
]

export function withDevEnv(env, fn) {
  const prev = {}
  for (const key of ENV_KEYS) {
    prev[key] = process.env[key]
    if (env[key]) process.env[key] = env[key]
    else if (env[key] === '') delete process.env[key]
  }
  try {
    return fn()
  } finally {
    for (const key of ENV_KEYS) {
      if (prev[key] === undefined) delete process.env[key]
      else process.env[key] = prev[key]
    }
  }
}

export function createDevReq(incoming, pathWithQuery) {
  return {
    method: incoming.method,
    url: pathWithQuery,
    headers: incoming.headers,
  }
}

export function createDevRes(serverRes) {
  let code = 200
  return {
    setHeader(name, value) {
      if (Array.isArray(value)) {
        for (const v of value) serverRes.setHeader(name, v)
      } else {
        serverRes.setHeader(name, value)
      }
    },
    status(c) {
      code = c
      serverRes.statusCode = c
      return this
    },
    json(body) {
      serverRes.statusCode = code
      if (!serverRes.getHeader('Content-Type')) {
        serverRes.setHeader('Content-Type', 'application/json; charset=utf-8')
      }
      serverRes.end(JSON.stringify(body))
    },
    end() {
      serverRes.statusCode = code
      serverRes.end()
    },
  }
}

export async function runDevHandler(handler, req, res) {
  const result = await handler(req, res)
  if (result?.redirect) {
    res.setHeader('Location', result.redirect)
    res.status(result.status).end()
  }
}
