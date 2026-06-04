/** Bağlantılar Merkezi — env kontrol endpoint'leri */

export async function testOpenAiEnv() {
  try {
    const res = await fetch('/api/openai-test', { method: 'GET' })
    const body = await res.json().catch(() => ({}))
    return {
      ok: Boolean(body.ok),
      message: body.message || 'OpenAI durumu alınamadı.',
    }
  } catch {
    return { ok: false, message: 'OpenAI testi yapılamadı.' }
  }
}

export async function testGoogleEnv() {
  try {
    const res = await fetch('/api/google-env-test', { method: 'GET' })
    const body = await res.json().catch(() => ({}))
    return {
      ok: Boolean(body.ok),
      oauthReady: Boolean(body.oauthReady),
      geminiKeyReady: Boolean(body.geminiKeyReady),
      missing: Array.isArray(body.missing) ? body.missing : [],
      message: body.message || 'Google OAuth durumu alınamadı.',
    }
  } catch {
    return {
      ok: false,
      oauthReady: false,
      geminiKeyReady: false,
      message: 'Google ortam testi yapılamadı.',
    }
  }
}
