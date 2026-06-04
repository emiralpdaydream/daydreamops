/** AI snapshot — şifre notu asla ham gitmez */
export const MASKED_PASSWORD_NOTE = '••••••'

export function maskPasswordNote(value) {
  const t = String(value ?? '').trim()
  if (!t) return ''
  return MASKED_PASSWORD_NOTE
}
