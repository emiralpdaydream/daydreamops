import { handleOperatorRequest } from './_lib/operatorCore.js'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('invalid_json'))
      }
    })
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnızca POST desteklenir.' })
  }

  try {
    const body =
      req.body && typeof req.body === 'object'
        ? req.body
        : await readJsonBody(req)

    const result = await handleOperatorRequest(body)
    return res.status(result.status).json(result.body)
  } catch (err) {
    if (err?.message === 'invalid_json') {
      return res.status(400).json({ error: 'Geçersiz istek gövdesi.' })
    }
    return res.status(500).json({ error: 'Sunucu hatası.' })
  }
}
