import { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import RecordActionBar from './RecordActionBar'
import { DELETE_CONFIRM_MESSAGE } from '../lib/confirmMessages'
import { parseCollectedNotes } from '../lib/collectedNotesUtils'

/**
 * Alınan notlar — Brief ile aynı veri (brief.notes).
 */
export default function CollectedNotesSection({
  notes,
  onSaveNotes,
  onAppendNote,
  onDeleteNote,
  onUpdateNote,
  compact = false,
  showEditor = true,
}) {
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const entries = parseCollectedNotes(notes)

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return
    if (onAppendNote) {
      onAppendNote(trimmed)
    } else {
      const prev = String(notes ?? '').trim()
      const stamp = new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      })
      const line = `• ${stamp} — ${trimmed}`
      onSaveNotes?.(prev ? `${prev}\n${line}` : line)
    }
    setDraft('')
  }

  function startEdit(entry) {
    setEditingId(entry.id)
    setEditText(entry.text)
  }

  function commitEdit(noteId) {
    const t = editText.trim()
    if (t && onUpdateNote) onUpdateNote(noteId, t)
    setEditingId(null)
    setEditText('')
  }

  return (
    <div className={`collected-notes${compact ? ' collected-notes--compact' : ''}`}>
      <div className="collected-notes__list">
        {entries.length === 0 ? (
          <p className="collected-notes__empty">
            Henüz not yok. AI Asistan veya aşağıdan not ekleyin; otomatik
            kaydedilir.
          </p>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="collected-notes__item">
              {editingId === entry.id ? (
                <input
                  className="input-premium collected-notes__edit-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => commitEdit(entry.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      commitEdit(entry.id)
                    }
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  autoFocus
                  aria-label="Notu düzenle"
                />
              ) : (
                <p className="collected-notes__item-text">{entry.text}</p>
              )}
              {(onUpdateNote || onDeleteNote) && editingId !== entry.id && (
                <RecordActionBar
                  onEdit={onUpdateNote ? () => startEdit(entry) : undefined}
                  onDelete={
                    onDeleteNote
                      ? () =>
                          setConfirmDelete({
                            id: entry.id,
                            preview: entry.text,
                          })
                      : undefined
                  }
                />
              )}
            </article>
          ))
        )}
      </div>

      {showEditor && (
        <form className="ai-chat-compose collected-notes__compose" onSubmit={handleAdd}>
          <textarea
            rows={compact ? 1 : 2}
            className="ai-chat-compose__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Not ekle…"
            aria-label="Yeni not"
          />
          <button
            type="submit"
            className="ai-chat-compose__send"
            disabled={!draft.trim()}
            aria-label="Notu kaydet"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      )}

      {!compact && showEditor && (
        <details className="collected-notes__details">
          <summary>Tüm metni düzenle</summary>
          <textarea
            key={notes}
            className="collected-notes__full"
            defaultValue={notes ?? ''}
            onBlur={(e) => {
              const next = e.target.value
              if (next !== (notes ?? '')) onSaveNotes?.(next)
            }}
            rows={6}
            aria-label="Tüm notlar"
          />
        </details>
      )}

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title="Notu sil"
        message={DELETE_CONFIRM_MESSAGE}
        confirmLabel="Sil"
        danger
        onConfirm={() => {
          onDeleteNote?.(confirmDelete.id)
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
