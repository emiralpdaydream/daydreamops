import { getGoogleOAuthConfig } from './googleConfig.js'
import { readTokenCookie, setTokenCookie } from './tokenCookie.js'

async function postForm(url, params) {
  const body = new URLSearchParams(params)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json().catch(() => ({}))
  return { res, data }
}

export async function exchangeCodeForTokens(code) {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig()
  const { res, data } = await postForm('https://oauth2.googleapis.com/token', {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'token_exchange_failed')
  }
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: Date.now() + (data.expires_in || 3600) * 1000,
    scope: data.scope,
  }
}

export async function refreshAccessToken(refreshToken) {
  const { clientId, clientSecret } = getGoogleOAuthConfig()
  const { res, data } = await postForm('https://oauth2.googleapis.com/token', {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'token_refresh_failed')
  }
  return {
    access_token: data.access_token,
    expiry_date: Date.now() + (data.expires_in || 3600) * 1000,
  }
}

export async function getValidTokens(req, res) {
  const { tokenSecret, ready } = getGoogleOAuthConfig()
  if (!ready) return { error: 'oauth_not_configured', tokens: null }

  let tokens = readTokenCookie(req, tokenSecret)
  if (!tokens?.refresh_token && !tokens?.access_token) {
    return { error: 'not_connected', tokens: null }
  }

  if (tokens.expiry_date && tokens.expiry_date > Date.now() + 60_000) {
    return { error: null, tokens }
  }

  if (!tokens.refresh_token) {
    return { error: 'token_expired', tokens: null }
  }

  try {
    const refreshed = await refreshAccessToken(tokens.refresh_token)
    tokens = {
      ...tokens,
      access_token: refreshed.access_token,
      expiry_date: refreshed.expiry_date,
    }
    setTokenCookie(res, tokens, tokenSecret)
    return { error: null, tokens }
  } catch {
    return { error: 'token_refresh_failed', tokens: null }
  }
}

function buildRawMessage({ to, cc, subject, body }) {
  const lines = []
  lines.push(`To: ${to}`)
  if (cc?.trim()) lines.push(`Cc: ${cc.trim()}`)
  lines.push(`Subject: ${subject}`)
  lines.push('Content-Type: text/plain; charset=utf-8')
  lines.push('MIME-Version: 1.0')
  lines.push('')
  lines.push(String(body).replace(/\r\n/g, '\n'))
  const raw = lines.join('\r\n')
  return Buffer.from(raw, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function validateMailPayload({ to, cc, subject, body }) {
  const toStr = String(to ?? '').trim()
  const subjectStr = String(subject ?? '').trim()
  const bodyStr = String(body ?? '').trim()
  if (!toStr) return { ok: false, message: 'Alıcı (Kime) gerekli.' }
  if (!subjectStr) return { ok: false, message: 'Konu gerekli.' }
  if (!bodyStr) return { ok: false, message: 'Mail metni gerekli.' }
  if (!toStr.includes('@')) return { ok: false, message: 'Geçerli bir e-posta adresi girin.' }
  return {
    ok: true,
    payload: { to: toStr, cc: String(cc ?? '').trim(), subject: subjectStr, body: bodyStr },
  }
}

export async function gmailApiFetch(accessToken, path, options = {}) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  return { res, data }
}

export async function testGmailConnection(accessToken) {
  const { res, data } = await gmailApiFetch(accessToken, '/users/me/profile')
  if (!res.ok) {
    return { ok: false, message: 'Gmail bağlantısı doğrulanamadı.' }
  }
  return {
    ok: true,
    message: 'Gmail bağlantısı aktif.',
    email: data.emailAddress || null,
  }
}

export async function createGmailDraft(accessToken, mail) {
  const raw = buildRawMessage(mail)
  const { res, data } = await gmailApiFetch(accessToken, '/users/me/drafts', {
    method: 'POST',
    body: JSON.stringify({ message: { raw } }),
  })
  if (!res.ok) {
    return { ok: false, message: 'Taslak oluşturulamadı.' }
  }
  return { ok: true, draftId: data.id }
}

export async function sendGmailMessage(accessToken, mail) {
  const raw = buildRawMessage(mail)
  const { res } = await gmailApiFetch(accessToken, '/users/me/messages/send', {
    method: 'POST',
    body: JSON.stringify({ raw }),
  })
  if (!res.ok) {
    return { ok: false, message: 'Mail gönderilemedi. Gmail bağlantısını kontrol edin.' }
  }
  return { ok: true, message: 'Mail gönderildi.' }
}
