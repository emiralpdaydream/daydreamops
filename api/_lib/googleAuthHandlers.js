import { GMAIL_SCOPES, getAppOrigin, getGoogleOAuthConfig } from './googleConfig.js'
import { exchangeCodeForTokens } from './gmailApi.js'
import {
  clearOAuthStateCookie,
  clearTokenCookie,
  readOAuthState,
  setTokenCookie,
} from './tokenCookie.js'
import { randomState } from './vercelRequest.js'

export function handleGoogleAuthRedirect() {
  const cfg = getGoogleOAuthConfig()
  if (!cfg.ready) {
    return {
      status: 503,
      body: {
        ok: false,
        message: `Google OAuth yapılandırması eksik: ${cfg.missing.join(', ')}`,
      },
    }
  }

  const state = randomState()
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: 'code',
    scope: GMAIL_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

  return {
    status: 302,
    redirect: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    setStateCookie: state,
  }
}

export async function handleGoogleCallback(req, res) {
  const cfg = getGoogleOAuthConfig()
  if (!cfg.ready) {
    return redirectSettings(req, 'error', 'oauth_config')
  }

  const url = new URL(req.url || '/', getAppOrigin(req))
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const savedState = readOAuthState(req)

  clearOAuthStateCookie(res)

  if (!code || !state || !savedState || state !== savedState) {
    return redirectSettings(req, 'error', 'invalid_state')
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    setTokenCookie(res, tokens, cfg.tokenSecret)
    return redirectSettings(req, 'connected')
  } catch {
    return redirectSettings(req, 'error', 'token_exchange')
  }
}

function redirectSettings(req, status, code) {
  const origin = getAppOrigin(req)
  const q = new URLSearchParams({ gmail: status })
  if (code) q.set('gmail_error', code)
  return {
    status: 302,
    redirect: `${origin}/?${q.toString()}`,
  }
}

export function handleGoogleDisconnect(res) {
  clearTokenCookie(res)
  return {
    status: 200,
    body: { ok: true, message: 'Gmail yetkisi kaldırıldı.' },
  }
}
