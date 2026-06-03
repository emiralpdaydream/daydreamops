/**
 * Model JSON'da proposedAction eksik kalsa bile onay sorulan yanıtlardan aksiyon çıkarır.
 */

function extractQuoted(text) {
  const m = String(text).match(/[«""']([^«""']+)[»""']/)
  if (m?.[1]) return m[1].trim().slice(0, 500)
  const m2 = String(text).match(/:\s*([^.?!]+(?:dosyası|görevi|projesi)[^.?!]*)/i)
  if (m2?.[1]) return m2[1].trim().slice(0, 500)
  return ''
}

function extractTaskFromUser(userText) {
  const t = String(userText ?? '')
  const forClient = t.match(
    /(?:için|–|-)\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9][^.?!]{4,120})/i,
  )
  if (forClient?.[1]) return forClient[1].trim().slice(0, 500)
  return t.trim().slice(0, 500)
}

export function inferProposedAction(reply, proposedAction, lastUserMessage) {
  if (proposedAction?.type && proposedAction.type !== 'info') {
    return proposedAction
  }

  const text = String(reply ?? '')
  const lower = text.toLowerCase()
  const asksApproval =
    /onaylıyor|onaylar mısın|onaylıyor musun|onaylıyor musunuz|ekleyelim|ekleyeyim|eklememi|uygun mu\?|ister misiniz/i.test(
      lower,
    )

  if (!asksApproval) return proposedAction ?? null

  if (
    /mail|e-posta|eposta|hatırlatma mail|teklif mail|teşekkür|tanıtım mail|revize/i.test(
      lower,
    ) &&
    /yaz|hazırla|taslak|gönder/i.test(lower)
  ) {
    return {
      type: 'mailDraft',
      subject: 'Daydream Production',
      body: text.slice(0, 12000),
      clientName: extractTaskFromUser(lastUserMessage).slice(0, 120),
      tone: 'nazik',
      summary: text.slice(0, 200),
    }
  }

  if (
    /brief|görev|listeye|yapılacaklar|bugünkü|ekleyelim|eklememi/i.test(lower)
  ) {
    const taskText =
      extractQuoted(text) ||
      extractTaskFromUser(lastUserMessage) ||
      'Operatör önerisi'
    return { type: 'addTask', text: taskText }
  }

  if (/hatırlatma|mesaj|whatsapp|mail|yazı|metin/i.test(lower)) {
    const msg =
      extractQuoted(text) ||
      text.replace(/\s*onaylıyor musunuz\??\s*$/i, '').trim().slice(0, 2000)
    return { type: 'message', text: msg, tone: 'nazik' }
  }

  return proposedAction ?? null
}
