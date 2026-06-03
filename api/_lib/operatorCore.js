import {
  chatWithAi,
  resolveAiProvider,
  testAiConnection,
} from './aiProvider.js'

const ALLOWED_ACTION_TYPES = new Set([
  'info',
  'message',
  'addTask',
  'addNote',
  'proposalDraft',
  'mailDraft',
])

function safeErrorMessage(err, providerId) {
  const msg = String(err?.message ?? '')
  const label = providerId === 'gemini' ? 'Google Gemini' : 'OpenAI'
  if (msg === 'not_configured') {
    return 'AI yapılandırılmadı. Vercel’de OPENAI_API_KEY veya GEMINI_API_KEY / GOOGLE_API_KEY tanımlayın.'
  }
  if (msg === 'no_messages') return 'En az bir mesaj gerekli.'
  if (/401|403|invalid|api key/i.test(msg)) {
    return `${label} bağlantısı kurulamadı. Anahtar geçersiz olabilir.`
  }
  if (/429|quota|rate/i.test(msg)) {
    return 'İstek limiti aşıldı. Biraz sonra tekrar deneyin.'
  }
  if (/key|sk-|bearer|authorization/i.test(msg)) {
    return 'Operatör yanıt veremedi. Lütfen tekrar deneyin.'
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
  if (type === 'addNote') {
    const text = String(action.text ?? '').trim().slice(0, 2000)
    if (!text) return undefined
    return { type: 'addNote', text }
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
  if (type === 'mailDraft') {
    const body = String(action.body ?? '').trim().slice(0, 12000)
    if (!body) return undefined
    const tone = ['nazik', 'direkt', 'premium', 'kisa', 'resmi'].includes(
      action.tone,
    )
      ? action.tone
      : 'nazik'
    return {
      type: 'mailDraft',
      subject: String(action.subject ?? 'Daydream Production').slice(0, 300),
      body,
      clientName: String(action.clientName ?? '').slice(0, 120),
      tone,
      summary: String(action.summary ?? '').slice(0, 500),
    }
  }
  return undefined
}

/**
 * @param {{ messages?: unknown[], dataSnapshot?: object, voiceReply?: boolean, test?: boolean }} input
 */
export async function handleOperatorRequest(input) {
  if (input?.test === true) {
    const result = await testAiConnection()
    if (!result.ok) {
      return {
        status: 503,
        body: {
          ok: false,
          provider: result.provider ?? null,
          error: result.error,
        },
      }
    }
    return {
      status: 200,
      body: {
        ok: true,
        provider: result.provider,
        reply: result.reply,
      },
    }
  }

  const provider = resolveAiProvider()
  if (!provider) {
    return {
      status: 503,
      body: {
        error:
          'AI yapılandırılmadı. Vercel’de OPENAI_API_KEY veya GEMINI_API_KEY / GOOGLE_API_KEY ekleyin.',
      },
    }
  }

  try {
    const parsed = await chatWithAi({
      messages: input?.messages,
      dataSnapshot: input?.dataSnapshot,
      voiceReply: input?.voiceReply,
    })
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
        proposedAction: sanitizeProposedAction(parsed.proposedAction),
        provider: provider.id,
      },
    }
  } catch (err) {
    if (err?.message === 'no_messages') {
      return { status: 400, body: { error: 'En az bir mesaj gerekli.' } }
    }
    if (err?.message === 'not_configured') {
      return {
        status: 503,
        body: {
          error:
            'AI yapılandırılmadı. Vercel’de OPENAI_API_KEY veya GEMINI_API_KEY / GOOGLE_API_KEY ekleyin.',
        },
      }
    }
    return {
      status: 502,
      body: { error: safeErrorMessage(err, provider.id) },
    }
  }
}
