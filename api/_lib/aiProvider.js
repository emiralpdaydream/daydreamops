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
- "addNote" — { "type":"addNote", "text":"alınan not metni" } (toplantı, hatırlatma, yarın planı)
- "proposalDraft" — { "type":"proposalDraft", "title":"", "body":"", "clientName":"", "budget":0 }
- "mailDraft" — { "type":"mailDraft", "subject":"konu", "body":"mail metni", "clientName":"müşteri adı (opsiyonel)", "tone":"nazik|direkt|premium|kisa|resmi", "summary":"kısa özet" }
  ÖNEMLİ mailDraft: ASLA to/cc/e-posta adresi uydurma. Alıcı e-postası kullanıcı tarafından girilecek.

Silme, ödeme işaretleme, arşivleme önerme — kullanıcıya yalnızca metinle uyar, proposedAction üretme.
Mail/teklif/hatırlatma isteklerinde uygun türde mailDraft veya message üret.
Görev veya brief ekleme önerirken MUTLAKA proposedAction: { "type":"addTask", "text":"..." } üret; yalnızca metinle onay sorma.
Kullanıcı not kaydetmek, hatırlatmak veya "yarın ne yapacağım" için bilgi biriktirmek istediğinde MUTLAKA proposedAction: { "type":"addNote", "text":"..." } üret.
Hatırlatma metni önerirken MUTLAKA proposedAction: { "type":"message", "text":"...", "tone":"nazik" } üret.
Kullanıcı onayı olmadan veri değişikliği yokmuş gibi davran.`

export function resolveAiProvider() {
  if (process.env.OPENAI_API_KEY?.trim()) {
    return {
      id: 'openai',
      label: 'OpenAI',
      model: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
    }
  }
  const geminiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  if (geminiKey) {
    return {
      id: 'gemini',
      label: 'Google Gemini',
      model: process.env.GEMINI_MODEL?.trim() || 'gemini-1.5-flash',
      apiKey: geminiKey,
    }
  }
  return null
}

function buildContextMessage(dataSnapshot) {
  if (!dataSnapshot || typeof dataSnapshot !== 'object') {
    return 'Operasyon verisi: (boş)'
  }
  return `Operasyon özeti (JSON):\n${JSON.stringify(dataSnapshot)}`
}

function sanitizeUserMessages(messages) {
  return Array.isArray(messages)
    ? messages
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
}

export async function testAiConnection() {
  const provider = resolveAiProvider()
  if (!provider) {
    return {
      ok: false,
      provider: null,
      error:
        'AI anahtarı yok. Vercel’de OPENAI_API_KEY veya GEMINI_API_KEY / GOOGLE_API_KEY ekleyin.',
    }
  }

  try {
    if (provider.id === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      })
      if (!res.ok) {
        return {
          ok: false,
          provider: 'openai',
          error: 'OpenAI anahtarı geçersiz veya erişim yok.',
        }
      }
      return {
        ok: true,
        provider: 'openai',
        reply: 'OpenAI bağlantısı aktif.',
      }
    }

    const key = provider.apiKey
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
    )
    if (!res.ok) {
      return {
        ok: false,
        provider: 'gemini',
        error:
          'Google Gemini anahtarı geçersiz veya Generative Language API etkin değil.',
      }
    }
    return {
      ok: true,
      provider: 'gemini',
      reply: 'Google Gemini bağlantısı aktif.',
    }
  } catch {
    return {
      ok: false,
      provider: provider.id,
      error: 'AI bağlantısı kurulamadı.',
    }
  }
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
    return { reply, proposedAction: parsed.proposedAction }
  } catch {
    return { reply: trimmed.slice(0, 4000), proposedAction: undefined }
  }
}

async function chatOpenAI({ userMessages, dataSnapshot, voiceReply }) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const voiceHint = voiceReply
    ? '\nKullanıcı sesli yanıt açık; cevabı kısa ve okunabilir tut.'
    : ''

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + voiceHint },
        { role: 'system', content: buildContextMessage(dataSnapshot) },
        ...userMessages,
      ],
      max_tokens: 900,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message || 'openai_error')
  }
  const raw = data?.choices?.[0]?.message?.content ?? ''
  return parseModelJson(raw)
}

async function chatGemini({ userMessages, dataSnapshot, voiceReply, provider }) {
  const voiceHint = voiceReply
    ? ' Kullanıcı sesli yanıt açık; cevabı kısa tut.'
    : ''

  const contents = userMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${encodeURIComponent(provider.apiKey)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text:
              SYSTEM_PROMPT +
              voiceHint +
              '\n\n' +
              buildContextMessage(dataSnapshot),
          },
        ],
      },
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 900,
        responseMimeType: 'application/json',
      },
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error?.message || 'gemini_error'
    throw new Error(msg)
  }

  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return parseModelJson(raw)
}

export async function chatWithAi({ messages, dataSnapshot, voiceReply }) {
  const provider = resolveAiProvider()
  if (!provider) {
    throw new Error('not_configured')
  }

  const userMessages = sanitizeUserMessages(messages)
  if (userMessages.length === 0) {
    throw new Error('no_messages')
  }

  if (provider.id === 'openai') {
    return chatOpenAI({ userMessages, dataSnapshot, voiceReply })
  }
  return chatGemini({ userMessages, dataSnapshot, voiceReply, provider })
}
