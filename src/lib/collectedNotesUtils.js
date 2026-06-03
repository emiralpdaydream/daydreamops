/** Brief not metnini satır listesine çevirir */
export function parseCollectedNotes(notesText) {
  const raw = String(notesText ?? '').trim()
  if (!raw) return []
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: `note-${index}`,
      text: line.replace(/^•\s*/, ''),
    }))
}

export function formatNoteLine(text) {
  const t = String(text ?? '').trim()
  if (!t) return ''
  const stamp = new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `• ${stamp} — ${t}`
}
