import { AGENT_SYSTEM_PROMPT } from './agentPrompt'
import { buildOpsContextForAgent } from './agentContext'
import { OPENAI_ENABLED, OPENAI_MODEL } from './env'

/**
 * Eski dev proxy — artık /api/operator kullanılır.
 * Anahtar .env.local içinde kalır; tarayıcı bundle'ına girmez.
 */
export async function chatCompletion({ messages, model = OPENAI_MODEL }) {
  if (!OPENAI_ENABLED) {
    throw new Error(
      'OpenAI kapalı. .env.local dosyasında VITE_OPENAI_ENABLED=true yapın ve npm run dev yeniden başlatın.',
    )
  }

  const res = await fetch('/api/openai/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, max_tokens: 800 }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(err || `OpenAI isteği başarısız (${res.status})`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export function isOpenAIConfigured() {
  return OPENAI_ENABLED
}

/** Anahtar + proxy testi (anahtar içeriği dönmez) */
export async function checkOpenAIConnection() {
  if (!OPENAI_ENABLED) {
    return { ok: false, code: 'disabled' }
  }

  try {
    const res = await fetch('/api/openai/models', { method: 'GET' })
    if (res.ok) return { ok: true, code: 'connected' }
    if (res.status === 401) return { ok: false, code: 'invalid_key' }
    return { ok: false, code: 'error', status: res.status }
  } catch {
    return { ok: false, code: 'network' }
  }
}

/** Silent Operator — operasyon verisi + soru */
export async function askSilentOperator({ question, data }) {
  const context = buildOpsContextForAgent(data)
  const userMessage = `Operasyon özeti:\n${context}\n\nKullanıcı sorusu: ${question}`

  return chatCompletion({
    messages: [
      { role: 'system', content: AGENT_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  })
}
