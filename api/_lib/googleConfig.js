export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/userinfo.email',
]

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim()
  const tokenSecret =
    process.env.GOOGLE_TOKEN_SECRET?.trim() ||
    process.env.GOOGLE_CLIENT_SECRET?.trim()

  const missing = []
  if (!clientId) missing.push('GOOGLE_CLIENT_ID')
  if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET')
  if (!redirectUri) missing.push('GOOGLE_REDIRECT_URI')
  if (!tokenSecret) missing.push('GOOGLE_TOKEN_SECRET')

  return {
    clientId,
    clientSecret,
    redirectUri,
    tokenSecret,
    ready: missing.length === 0,
    missing,
  }
}

export function getAppOrigin(req) {
  const fromEnv = process.env.APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host
  const proto = req.headers?.['x-forwarded-proto'] || 'https'
  if (host) return `${proto}://${host}`
  return 'http://localhost:5173'
}
