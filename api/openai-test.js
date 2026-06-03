import { handleOpenAiTest } from './_lib/openaiTest.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, OPTIONS')
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Yalnızca GET desteklenir.' })
  }

  const result = handleOpenAiTest()
  return res.status(result.status).json(result.body)
}
