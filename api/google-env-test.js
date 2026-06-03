import { handleGoogleEnvTest } from './_lib/googleEnvTest.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, OPTIONS')
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Yalnızca GET desteklenir.' })
  }

  const result = handleGoogleEnvTest()
  return res.status(result.status).json(result.body)
}
