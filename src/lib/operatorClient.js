/**
 * Daydream Operator — tüm OpenAI çağrıları /api/operator üzerinden.
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
    throw new Error(body.error || 'Operatör yanıt veremedi.')
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
      return { ok: true, code: 'connected', message: body.reply }
    }
    return {
      ok: false,
      code: res.status === 503 ? 'not_configured' : 'error',
      message: body.error || 'OpenAI bağlantısı kurulamadı.',
    }
  } catch {
    return {
      ok: false,
      code: 'network',
      message: 'OpenAI bağlantısı kurulamadı.',
    }
  }
}

export function isOperatorAvailable() {
  return typeof fetch !== 'undefined'
}
