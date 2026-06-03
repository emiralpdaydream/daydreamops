import { useCallback, useMemo, useState } from 'react'
import { emptyMailDraft } from './mailDraftData'
import { MailDraftContext } from './mailDraftContextCore'

export function MailDraftProvider({ children }) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(emptyMailDraft)

  const openPreview = useCallback((partial = {}, startEditing = false) => {
    setDraft({ ...emptyMailDraft(), ...partial })
    setEditing(startEditing)
    setPreviewOpen(true)
  }, [])

  const closePreview = useCallback(() => {
    setPreviewOpen(false)
    setEditing(false)
  }, [])

  const updateDraft = useCallback((patch) => {
    setDraft((d) => ({ ...d, ...patch }))
  }, [])

  const value = useMemo(
    () => ({
      previewOpen,
      editing,
      draft,
      setEditing,
      openPreview,
      closePreview,
      updateDraft,
    }),
    [previewOpen, editing, draft, openPreview, closePreview, updateDraft],
  )

  return (
    <MailDraftContext.Provider value={value}>{children}</MailDraftContext.Provider>
  )
}
