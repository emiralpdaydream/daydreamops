import { getGoogleOAuthConfig } from './googleConfig.js'

/** Google OAuth env — değerler asla dönmez; eksik alan adları listelenir */
export function handleGoogleEnvTest() {
  const cfg = getGoogleOAuthConfig()
  const hasId = Boolean(process.env.GOOGLE_CLIENT_ID?.trim())
  const hasSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim())
  const oauthReady = cfg.ready && hasId && hasSecret
  const geminiKeyReady = Boolean(
    process.env.GOOGLE_API_KEY?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim(),
  )

  let message = 'Google OAuth hazır'
  if (!oauthReady) {
    if (cfg.missing.length) {
      message = `Eksik: ${cfg.missing.join(', ')}`
    } else if (!hasId || !hasSecret) {
      message = 'GOOGLE_CLIENT_ID veya GOOGLE_CLIENT_SECRET eksik'
    } else {
      message = 'Google OAuth yapılandırması tamamlanmadı'
    }
  }

  return {
    status: 200,
    body: {
      ok: oauthReady,
      oauthReady,
      message,
      missing: cfg.missing,
      hasRedirectUri: Boolean(cfg.redirectUri),
      geminiKeyReady,
    },
  }
}
