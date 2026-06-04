/**
 * Ortam kontrolü — yerel .env.local + isteğe bağlı canlı URL
 * node scripts/check-env.mjs
 * node scripts/check-env.mjs --url https://daydreamops.vercel.app
 */
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(root, '.env.local')

function loadEnv(file) {
  const out = {}
  if (!file) return out
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i > 0) out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
}

function check(env, label) {
  const keys = [
    'OPENAI_API_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'GOOGLE_TOKEN_SECRET',
    'APP_URL',
  ]
  console.log(`\n=== ${label} ===`)
  for (const k of keys) {
    const v = env[k]
    const ok = Boolean(v?.trim())
    const hide = k.includes('SECRET') || k.includes('KEY')
    console.log(`  ${ok ? '✓' : '✗'} ${k}${ok ? (hide ? ' (dolu)' : ` = ${v}`) : ''}`)
  }
}

const local = loadEnv(envPath)
check(local, 'Yerel (.env.local)')

const urlArg = process.argv.find((a) => a.startsWith('--url='))?.slice(6)
  || (process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : null)
  || 'https://daydreamops.vercel.app'

try {
  const g = await fetch(`${urlArg.replace(/\/$/, '')}/api/google-env-test`)
  const o = await fetch(`${urlArg.replace(/\/$/, '')}/api/openai-test`)
  const gj = await g.json()
  const oj = await o.json()
  console.log(`\n=== Canlı (${urlArg}) ===`)
  console.log(`  Google: ${gj.message}${gj.missing?.length ? ` [${gj.missing.join(', ')}]` : ''}`)
  console.log(`  OpenAI: ${oj.message || (oj.ok ? 'OK' : 'Hata')}`)
} catch (e) {
  console.log('\n=== Canlı ===')
  console.log('  Ulaşılamadı:', e.message)
}
