import { handleGoogleDisconnect } from '../_lib/googleAuthHandlers.js'
import { readJsonBody } from '../_lib/vercelRequest.js'

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
    if (req.body === undefined) await readJsonBody(req)
    const result = handleGoogleDisconnect(res)
    return res.status(result.status).json(result.body)
  } catch {
    return res.status(500).json({ ok: false, message: 'Sunucu hatası.' })
  }
}
