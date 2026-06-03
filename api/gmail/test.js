import { getGoogleOAuthConfig } from '../_lib/googleConfig.js'
import { getValidTokens, testGmailConnection } from '../_lib/gmailApi.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Yalnızca GET desteklenir.' })
  }

  const cfg = getGoogleOAuthConfig()
  if (!cfg.ready) {
    return res.status(200).json({
      ok: false,
      status: 'error',
      message: 'Google OAuth yapılandırması eksik.',
    })
  }

  const { error, tokens } = await getValidTokens(req, res)
  if (error === 'not_connected') {
    return res.status(200).json({
      ok: false,
      status: 'disconnected',
      message: 'Gmail bağlı değil.',
    })
  }
  if (error === 'oauth_not_configured') {
    return res.status(200).json({
      ok: false,
      status: 'error',
      message: 'OAuth yapılandırması eksik.',
    })
  }
  if (!tokens?.access_token) {
    return res.status(200).json({
      ok: false,
      status: 'error',
      message: 'Gmail oturumu geçersiz. Yeniden bağlayın.',
    })
  }

  const test = await testGmailConnection(tokens.access_token)
  return res.status(200).json({
    ok: test.ok,
    status: test.ok ? 'connected' : 'error',
    message: test.message,
    email: test.email || undefined,
  })
}
