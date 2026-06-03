const SYSTEM_PROMPT = `Sen Daydream Ops içindeki operasyon asistanısın. Daydream Production'ın kurucusuna yardımcı oluyorsun. Görevin müşteri, tahsilat, brief, teklif ve rapor verilerini analiz etmek; kısa, net, profesyonel cevaplar vermek; kritik aksiyonlarda kullanıcı onayı istemek; asla API anahtarı, gizli bilgi veya sistem içi teknik detayları ifşa etmemek. Türkçe, kısa, net, abartısız, kurucu asistanı tonunda konuş.

Yanıtını YALNIZCA geçerli JSON olarak ver (markdown yok):
{
  "reply": "kullanıcıya görünen metin",
  "proposedAction": null veya { "type": "...", ... }
}

proposedAction türleri:
- "info" — sadece analiz, ek alan gerekmez
- "message" — { "type":"message", "text":"hatırlatma metni", "tone":"nazik|direkt|kisa" }
- "addTask" — { "type":"addTask", "text":"görev metni" }
- "proposalDraft" — { "type":"proposalDraft", "title":"", "body":"", "clientName":"", "budget":0 }

Silme, ödeme işaretleme, arşivleme önerme — kullanıcıya yalnızca metinle uyar, proposedAction üretme.
Kritik işlemlerde proposedAction kullan; kullanıcı onayı olmadan veri değişikliği yokmuş gibi davran.`

const ALLOWED_ACTION_TYPES = new Set([
  'info',
  'message',
  'addTask',
  'proposalDraft',
])

function safeErrorMessage(status, apiMessage) {
  if (status === 401) return 'OpenAI bağlantısı kurulamadı. Anahtar geçersiz olabilir.'
  if (status === 429) return 'İstek limiti aşıldı. Biraz sonra tekrar deneyin.'
  if (status >= 500) return 'OpenAI geçici olarak yanıt vermiyor.'
  if (apiMessage && !/key|sk-|bearer|authorization/i.test(apiMessage)) {
    return 'İstek tamamlanamadı. Lütfen tekrar deneyin.'
  }
  return 'Operatör yanıt veremedi. Lütfen tekrar deneyin.'
}

function sanitizeProposedAction(action) {
  if (!action || typeof action !== 'object') return undefined
  const type = action.type
  if (!ALLOWED_ACTION_TYPES.has(type)) return undefined

  if (type === 'info') return { type: 'info' }
  if (type === 'message') {
    const text = String(action.text ?? '').trim().slice(0, 2000)
    if (!text) return undefined
    const tone = ['nazik', 'direkt', 'kisa'].includes(action.tone)
      ? action.tone
      : 'nazik'
    return { type: 'message', text, tone }
  }
  if (type === 'addTask') {
    const text = String(action.text ?? '').trim().slice(0, 500)
    if (!text) return undefined
    return { type: 'addTask', text }
  }
  if (type === 'proposalDraft') {
    const body = String(action.body ?? '').trim().slice(0, 8000)
    if (!body) return undefined
    return {
      type: 'proposalDraft',
      title: String(action.title ?? 'Teklif taslağı').slice(0, 200),
      body,
      clientName: String(action.clientName ?? '').slice(0, 120),
      budget: Number(action.budget) || 0,
    }
  }
  return undefined
}

function parseModelJson(raw) {
  const trimmed = String(raw ?? '').trim()
  const jsonStart = trimmed.indexOf('{')
  const jsonEnd = trimmed.lastIndexOf('}')
  const slice =
    jsonStart >= 0 && jsonEnd > jsonStart
      ? trimmed.slice(jsonStart, jsonEnd + 1)
      : trimmed
  try {
    const parsed = JSON.parse(slice)
    const reply = String(parsed.reply ?? '').trim()
    if (!reply) return null
    return {
      reply,
      proposedAction: sanitizeProposedAction(parsed.proposedAction),
    }
  } catch {
    return { reply: trimmed.slice(0, 4000), proposedAction: undefined }
  }
}

function buildContextMessage(dataSnapshot) {
  if (!dataSnapshot || typeof dataSnapshot !== 'object') {
    return 'Operasyon verisi: (boş)'
  }
  return `Operasyon özeti (JSON):\n${JSON.stringify(dataSnapshot)}`
}

/**
 * @param {{ messages?: unknown[], dataSnapshot?: object, voiceReply?: boolean, test?: boolean }} input
 */
export async function handleOperatorRequest(input) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey?.trim()) {
    return {
      status: 503,
      body: {
        error:
          'OpenAI yapılandırılmadı. Vercel ortam değişkeninde OPENAI_API_KEY tanımlayın.',
      },
    }
  }

  if (input?.test === true) {
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) {
        return {
          status: res.status === 401 ? 503 : 502,
          body: {
            ok: false,
            error: safeErrorMessage(res.status),
          },
        }
      }
      return {
        status: 200,
        body: { ok: true, reply: 'OpenAI bağlantısı aktif.' },
      }
    } catch {
      return {
        status: 502,
        body: { ok: false, error: 'OpenAI bağlantısı kurulamadı.' },
      }
    }
  }

  const userMessages = Array.isArray(input?.messages)
    ? input.messages
        .filter(
          (m) =>
            m &&
            typeof m === 'object' &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string',
        )
        .slice(-20)
        .map((m) => ({
          role: m.role,
          content: String(m.content).slice(0, 4000),
        }))
    : []

  if (userMessages.length === 0) {
    return {
      status: 400,
      body: { error: 'En az bir mesaj gerekli.' },
    }
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const contextNote = buildContextMessage(input.dataSnapshot)
  const voiceHint = input.voiceReply
    ? '\nKullanıcı sesli yanıt açık; cevabı kısa ve okunabilir tut.'
    : ''

  const openaiMessages = [
    { role: 'system', content: SYSTEM_PROMPT + voiceHint },
    { role: 'system', content: contextNote },
    ...userMessages,
  ]

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        max_tokens: 900,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const apiMsg = data?.error?.message
      return {
        status: res.status >= 500 ? 502 : 400,
        body: { error: safeErrorMessage(res.status, apiMsg) },
      }
    }

    const raw = data?.choices?.[0]?.message?.content ?? ''
    const parsed = parseModelJson(raw)
    if (!parsed?.reply) {
      return {
        status: 502,
        body: { error: 'Operatör yanıtı işlenemedi.' },
      }
    }

    return {
      status: 200,
      body: {
        reply: parsed.reply,
        proposedAction: parsed.proposedAction,
      },
    }
  } catch {
    return {
      status: 502,
      body: { error: 'OpenAI bağlantısı kurulamadı.' },
    }
  }
}
