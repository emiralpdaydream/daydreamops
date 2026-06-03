/**
 * Google client_secret*.json → .env.local (commit edilmez).
 * Kullanım: node scripts/sync-google-oauth.mjs
 */
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(root, '.env.local')

function findClientSecretFile() {
  const exact = path.join(
    root,
    'client_secret_103455701101-hj2cfa6ls1l4nscjdfn2lhbsmmnktiu4.apps.googleusercontent.com.json',
  )
  if (fs.existsSync(exact)) return exact
  const files = fs.readdirSync(root).filter((f) => f.startsWith('client_secret_') && f.endsWith('.json'))
  return files[0] ? path.join(root, files[0]) : null
}

function parseEnvFile(text) {
  const map = new Map()
  for (const line of text.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx < 0) continue
    map.set(line.slice(0, idx).trim(), line.slice(idx + 1))
  }
  return map
}

function serializeEnv(map, comments = []) {
  const lines = [...comments, '']
  const order = [
    'OPENAI_API_KEY',
    'OPENAI_MODEL',
    'VITE_OPENAI_ENABLED',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'GOOGLE_TOKEN_SECRET',
    'APP_URL',
    'GOOGLE_API_KEY',
    'GEMINI_MODEL',
  ]
  const written = new Set()
  for (const key of order) {
    if (map.has(key)) {
      lines.push(`${key}=${map.get(key)}`)
      written.add(key)
    }
  }
  for (const [key, val] of map) {
    if (!written.has(key)) lines.push(`${key}=${val}`)
  }
  return `${lines.join('\n').trim()}\n`
}

const jsonPath = findClientSecretFile()
if (!jsonPath) {
  console.error('client_secret_*.json bulunamadı — proje köküne koyun.')
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
const web = raw.web || raw.installed
if (!web?.client_id || !web?.client_secret) {
  console.error('JSON içinde web.client_id / client_secret yok.')
  process.exit(1)
}

const prodHost = process.env.DAYDREAM_APP_HOST || 'daydreamops.vercel.app'
const useProd = process.argv.includes('--prod')
const appUrl = useProd ? `https://${prodHost}` : 'http://localhost:5173'
const redirectUri = `${appUrl}/api/google/callback`

let map = new Map()
if (fs.existsSync(envPath)) {
  map = parseEnvFile(fs.readFileSync(envPath, 'utf8'))
}

map.set('GOOGLE_CLIENT_ID', web.client_id)
map.set('GOOGLE_CLIENT_SECRET', web.client_secret)
map.set('GOOGLE_REDIRECT_URI', redirectUri)
map.set('APP_URL', appUrl)
if (!map.get('GOOGLE_TOKEN_SECRET')?.trim()) {
  map.set('GOOGLE_TOKEN_SECRET', crypto.randomBytes(32).toString('hex'))
}

const comments = [
  '# Daydream Ops — yerel ortam (Git\'e gitmez)',
  `# Google OAuth — ${path.basename(jsonPath)} dosyasından senkron`,
  `# Canlı için: node scripts/sync-google-oauth.mjs --prod`,
]
if (!useProd) {
  comments.push(
    '# Google Console → Authorized redirect URIs:',
    '#   http://localhost:5173/api/google/callback',
    `#   https://${prodHost}/api/google/callback`,
  )
}

fs.writeFileSync(envPath, serializeEnv(map, comments), 'utf8')
console.log(`Tamam: ${envPath}`)
console.log(`  GOOGLE_CLIENT_ID=${web.client_id.slice(0, 12)}…`)
console.log(`  GOOGLE_REDIRECT_URI=${redirectUri}`)
console.log('  npm run dev → Ayarlar → Bağlantılar → Gmail Bağla')
