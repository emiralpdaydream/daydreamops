import { handleGoogleAuthRedirect } from '../_lib/googleAuthHandlers.js'
import { setOAuthStateCookie } from '../_lib/tokenCookie.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Yalnızca GET desteklenir.' })
  }

  const result = handleGoogleAuthRedirect()
  if (result.setStateCookie) {
    setOAuthStateCookie(res, result.setStateCookie)
  }
  if (result.redirect) {
    res.setHeader('Location', result.redirect)
    return res.status(result.status).end()
  }
  return res.status(result.status).json(result.body)
}
