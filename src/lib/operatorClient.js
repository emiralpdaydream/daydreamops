/**
 * Daydream Operator — AI çağrıları /api/operator üzerinden (OpenAI veya Gemini).
 * API anahtarı yalnızca sunucu ortam değişkeninde.
 */

export async function callOperator({
  messages,
  dataSnapshot,
  voiceReply = false,
}) {
  const res = await fetch('/api/operator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      dataSnapshot: dataSnapshot ?? {},
      voiceReply: Boolean(voiceReply),
    }),
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(body.error || 'AI Asistan yanıt veremedi.')
  }

  return {
    reply: body.reply ?? '',
    proposedAction: body.proposedAction,
  }
}

/** Bağlantı testi — anahtar içeriği dönmez */
export async function checkOperatorConnection() {
  try {
    const res = await fetch('/api/operator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true }),
    })
    const body = await res.json().catch(() => ({}))
    if (res.ok && body.ok) {
      return {
        ok: true,
        code: 'connected',
        provider: body.provider ?? 'openai',
        message: body.reply,
      }
    }
    return {
      ok: false,
      code: res.status === 503 ? 'not_configured' : 'error',
      provider: body.provider ?? null,
      message: body.error || 'AI bağlantısı kurulamadı.',
    }
  } catch {
    return {
      ok: false,
      code: 'network',
      message: 'AI bağlantısı kurulamadı.',
    }
  }
}

export function isOperatorAvailable() {
  return typeof fetch !== 'undefined'
}
