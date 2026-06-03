import crypto from 'crypto'

const COOKIE_NAME = 'dd_gmail_oauth'
const STATE_COOKIE = 'dd_oauth_state'

function deriveKey(secret) {
  return crypto.createHash('sha256').update(String(secret)).digest()
}

export function encryptTokens(payload, secret) {
  const key = deriveKey(secret)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const json = JSON.stringify(payload)
  const enc = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64url')
}

export function decryptTokens(blob, secret) {
  try {
    const key = deriveKey(secret)
    const buf = Buffer.from(blob, 'base64url')
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const enc = buf.subarray(28)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    const json = Buffer.concat([decipher.update(enc), decipher.final()]).toString(
      'utf8',
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

function cookieSecure() {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)
}

export function setOAuthStateCookie(res, state) {
  const secure = cookieSecure()
  res.setHeader(
    'Set-Cookie',
    `${STATE_COOKIE}=${encodeURIComponent(state)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure ? '; Secure' : ''}`,
  )
}

export function clearOAuthStateCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  )
}

export function readOAuthState(req) {
  const header = req.headers?.cookie || ''
  const match = header.match(new RegExp(`${STATE_COOKIE}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function setTokenCookie(res, tokens, secret) {
  const secure = cookieSecure()
  const value = encryptTokens(tokens, secret)
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure ? '; Secure' : ''}`,
  )
}

export function clearTokenCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  )
}

export function readTokenCookie(req, secret) {
  const header = req.headers?.cookie || ''
  const match = header.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  return decryptTokens(decodeURIComponent(match[1]), secret)
}
