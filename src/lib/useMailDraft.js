import { useContext } from 'react'
import { MailDraftContext } from './mailDraftContextCore'

export function useMailDraft() {
  const ctx = useContext(MailDraftContext)
  if (!ctx) {
    throw new Error('useMailDraft must be used within MailDraftProvider')
  }
  return ctx
}
