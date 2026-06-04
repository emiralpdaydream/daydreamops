/** Brief / rapor not metnini satır listesine çevirir */
export function parseCollectedNotes(notesText) {
  const raw = String(notesText ?? '').trim()
  if (!raw) return []
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: `note-${index}`,
      text: line.replace(/^•\s*/, '').replace(/^\d{1,2}:\d{2}\s*—\s*/, '').trim(),
      raw: line,
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

export function entriesToNotesText(entries) {
  return (entries ?? [])
    .map((e) => {
      if (e.raw && !e._edited) return e.raw
      return formatNoteLine(e.text)
    })
    .filter(Boolean)
    .join('\n')
}

export function noteIndexFromId(noteId) {
  const m = String(noteId).match(/^note-(\d+)$/)
  return m ? Number(m[1]) : -1
}

export function deleteNoteById(notesText, noteId) {
  const entries = parseCollectedNotes(notesText)
  const idx = noteIndexFromId(noteId)
  if (idx < 0 || idx >= entries.length) return notesText
  entries.splice(idx, 1)
  return entriesToNotesText(entries)
}

export function updateNoteById(notesText, noteId, newText) {
  const trimmed = String(newText ?? '').trim()
  if (!trimmed) return notesText
  const entries = parseCollectedNotes(notesText)
  const idx = noteIndexFromId(noteId)
  if (idx < 0 || idx >= entries.length) return notesText
  entries[idx] = { id: noteId, text: trimmed, raw: formatNoteLine(trimmed), _edited: true }
  return entriesToNotesText(entries)
}
