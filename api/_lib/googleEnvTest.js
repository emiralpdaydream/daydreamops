/** Google OAuth env varlık kontrolü — değerler asla dönmez. */
export function handleGoogleEnvTest() {
  const hasId = Boolean(process.env.GOOGLE_CLIENT_ID?.trim())
  const hasSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim())
  const oauthReady = hasId && hasSecret
  const geminiKeyReady = Boolean(
    process.env.GOOGLE_API_KEY?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim(),
  )

  return {
    status: 200,
    body: {
      ok: oauthReady,
      oauthReady,
      message: oauthReady ? 'Google OAuth hazır' : 'Google OAuth eksik',
      geminiKeyReady,
    },
  }
}
