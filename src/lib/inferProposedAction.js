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
    /not(lar)?|kaydet|kaydedelim|hatırlat|yazalım|alınan|notlarıma|notuma/i.test(
      lower,
    ) &&
    !/mail|e-posta|görev|brief list/i.test(lower)
  ) {
    const noteText =
      extractQuoted(text) ||
      text.replace(/\s*onaylıyor musunuz\??\s*$/i, '').trim().slice(0, 2000)
    return { type: 'addNote', text: noteText }
  }

  if (
    /alacak|alınacak|tahsil|ödeme ekle|harcama ekle|muhasebe kayıt/i.test(lower) &&
    /ekle|kaydet|oluştur/i.test(lower)
  ) {
    if (/harcama|gider/i.test(lower)) {
      return {
        type: 'addExpense',
        title: extractQuoted(text) || extractTaskFromUser(lastUserMessage) || 'Harcama',
        amount: 0,
        note: text.slice(0, 500),
      }
    }
    if (/ödenecek|ödeme|borç/i.test(lower)) {
      return {
        type: 'addPayable',
        toName: extractQuoted(text) || extractTaskFromUser(lastUserMessage) || 'Ödeme',
        amount: 0,
        note: text.slice(0, 500),
      }
    }
    return {
      type: 'addReceivable',
      fromName: extractQuoted(text) || extractTaskFromUser(lastUserMessage) || 'Alacak',
      amount: 0,
      note: text.slice(0, 500),
    }
  }

  if (
    /brief|görev|listeye|yapılacaklar|bugünkü|ekleyelim|eklememi/i.test(lower)
  ) {
    const taskText =
      extractQuoted(text) ||
      extractTaskFromUser(lastUserMessage) ||
      'AI önerisi'
    return { type: 'addTask', text: taskText }
  }

  if (
    /hatırlatma|mesaj|whatsapp|yazı|metin/i.test(lower) &&
    !/mail|e-posta/i.test(lower)
  ) {
    const msg =
      extractQuoted(text) ||
      text.replace(/\s*onaylıyor musunuz\??\s*$/i, '').trim().slice(0, 2000)
    const phoneMatch = String(lastUserMessage ?? '').match(
      /(\+?90[\s-]?)?0?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/,
    )
    return {
      type: 'message',
      text: msg,
      tone: 'nazik',
      purpose: /ödeme|alacak|tahsilat/i.test(lower)
        ? 'odeme'
        : /teklif/i.test(lower)
          ? 'teklif'
          : /revize/i.test(lower)
            ? 'revize'
            : 'genel',
      phone: phoneMatch ? phoneMatch[0].replace(/\D/g, '') : undefined,
    }
  }

  return proposedAction ?? null
}
