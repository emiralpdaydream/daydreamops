/** WhatsApp deep link — API yok */

export function normalizeTrPhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('90') && digits.length >= 12) return digits
  if (digits.startsWith('0') && digits.length >= 10) return `90${digits.slice(1)}`
  if (digits.length === 10) return `90${digits}`
  if (digits.length >= 11) return digits.startsWith('90') ? digits : `90${digits}`
  return digits
}

export function buildWhatsAppUrl(text, phone) {
  const encoded = encodeURIComponent(String(text ?? '').trim())
  const normalized = normalizeTrPhone(phone)
  if (normalized) {
    return `https://wa.me/${normalized}?text=${encoded}`
  }
  return `https://wa.me/?text=${encoded}`
}
