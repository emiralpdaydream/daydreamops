import {
  getValidTokens,
  sendGmailMessage,
  validateMailPayload,
} from '../_lib/gmailApi.js'
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
    const body =
      req.body && typeof req.body === 'object'
        ? req.body
        : await readJsonBody(req)

    const validated = validateMailPayload(body)
    if (!validated.ok) {
      return res.status(400).json({ ok: false, message: validated.message })
    }

    const { error, tokens } = await getValidTokens(req, res)
    if (error === 'not_connected') {
      return res.status(401).json({
        ok: false,
        message:
          'Gmail bağlantısı aktif değil. Ayarlar > Bağlantılar Merkezi üzerinden bağlayın.',
      })
    }
    if (!tokens?.access_token) {
      return res.status(401).json({
        ok: false,
        message: 'Gmail oturumu geçersiz. Yeniden bağlayın.',
      })
    }

    const result = await sendGmailMessage(tokens.access_token, validated.payload)
    return res.status(result.ok ? 200 : 502).json(result)
  } catch {
    return res.status(500).json({ ok: false, message: 'Sunucu hatası.' })
  }
}
