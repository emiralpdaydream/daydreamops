export const MAIL_TONES = [
  { id: 'nazik', label: 'Nazik' },
  { id: 'direkt', label: 'Direkt' },
  { id: 'premium', label: 'Premium' },
  { id: 'kisa', label: 'Kısa' },
  { id: 'resmi', label: 'Resmi' },
]

export function emptyMailDraft() {
  return {
    to: '',
    cc: '',
    subject: '',
    body: '',
    tone: 'nazik',
    clientName: '',
    summary: '',
  }
}
