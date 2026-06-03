import { useCallback, useEffect, useState } from 'react'
import { MAIL_TONES } from '../../lib/mailDraftData'
import { useMailDraft } from '../../lib/useMailDraft'
import {
  saveGmailDraft,
  sendGmailMail,
  testGmailConnection,
} from '../../lib/gmailClient'
import { useOps } from '../../lib/useOps'
import { buildDataSnapshot } from '../../lib/buildDataSnapshot'
import { callOperator } from '../../lib/operatorClient'
import { useToast } from '../../lib/useToast'
import GmailSendConfirmModal from './GmailSendConfirmModal'

const TONE_PROMPTS = {
  nazik: 'Bu maili daha nazik ve sıcak bir tonda yeniden yaz.',
  direkt: 'Bu maili daha direkt ve net bir tonda yeniden yaz.',
  premium: 'Bu maili daha premium ve kurumsal bir tonda yeniden yaz.',
  kisa: 'Bu maili daha kısa ve öz bir tonda yeniden yaz.',
  resmi: 'Bu maili daha resmi bir tonda yeniden yaz.',
}

export default function MailPreviewView() {
  const { previewOpen } = useMailDraft()
  if (!previewOpen) return null
  return <MailPreviewPanel />
}

function MailPreviewPanel() {
  const { showToast } = useToast()
  const { data } = useOps()
  const { editing, draft, setEditing, closePreview, updateDraft } = useMailDraft()

  const [gmailStatus, setGmailStatus] = useState(null)
  const [confirmSend, setConfirmSend] = useState(false)
  const [busy, setBusy] = useState(false)

  const refreshGmail = useCallback(async () => {
    const r = await testGmailConnection()
    setGmailStatus(r)
    return r
  }, [])

  useEffect(() => {
    let active = true
    testGmailConnection().then((r) => {
      if (active) setGmailStatus(r)
    })
    return () => {
      active = false
    }
  }, [])

  async function handleToneChange(toneId) {
    updateDraft({ tone: toneId })
    const prompt = TONE_PROMPTS[toneId]
    if (!prompt || !draft.body) return
    setBusy(true)
    try {
      const { reply, proposedAction } = await callOperator({
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nMevcut konu: ${draft.subject}\n\nMevcut metin:\n${draft.body}`,
          },
        ],
        dataSnapshot: buildDataSnapshot(data),
        voiceReply: false,
      })
      if (proposedAction?.type === 'mailDraft') {
        updateDraft({
          subject: proposedAction.subject || draft.subject,
          body: proposedAction.body || draft.body,
          tone: toneId,
        })
      } else if (reply) {
        updateDraft({ body: reply })
      }
      showToast('Mail metni güncellendi.')
    } catch {
      showToast('Ton güncellenemedi.')
    }
    setBusy(false)
  }

  async function handleSaveDraft() {
    if (!status?.ok) {
      showToast(
        'Gmail bağlantısı aktif değil. Ayarlar > Bağlantılar Merkezi üzerinden bağlayın.',
      )
      return
    }
    setBusy(true)
    const r = await saveGmailDraft({
      to: draft.to,
      cc: draft.cc,
      subject: draft.subject,
      body: draft.body,
    })
    setBusy(false)
    showToast(r.message)
    if (r.ok) closePreview()
  }

  async function handleSendClick() {
    if (!draft.to?.trim()) {
      showToast('Kime alanına geçerli bir e-posta adresi girin.')
      setEditing(true)
      return
    }
    const status = gmailStatus || (await refreshGmail())
    if (!status?.ok) {
      showToast(
        'Gmail bağlantısı aktif değil. Ayarlar > Bağlantılar Merkezi üzerinden bağlayın.',
      )
      return
    }
    setConfirmSend(true)
  }

  async function handleConfirmSend() {
    setConfirmSend(false)
    setBusy(true)
    const r = await sendGmailMail({
      to: draft.to,
      cc: draft.cc,
      subject: draft.subject,
      body: draft.body,
    })
    setBusy(false)
    showToast(r.message)
    if (r.ok) closePreview()
  }

  const fieldsDisabled = !editing || busy

  return (
    <>
      <div className="mail-preview-overlay" role="dialog" aria-label="Mail önizleme">
        <button
          type="button"
          className="mail-preview-overlay__backdrop"
          aria-label="Kapat"
          onClick={closePreview}
        />
        <div className="mail-preview-panel animate-rise">
          <header className="mail-preview-panel__head">
            <h2 className="mail-preview-panel__title">Mail önizleme</h2>
            <button type="button" className="btn-ghost" onClick={closePreview}>
              Kapat
            </button>
          </header>

          {draft.summary && (
            <p className="mail-preview-summary">{draft.summary}</p>
          )}

          {draft.clientName && !draft.to && (
            <p className="mail-preview-hint">
              Alıcı: {draft.clientName} — e-posta adresini siz girin (AI adres uydurmaz).
            </p>
          )}

          <div className="mail-preview-fields">
            <label className="mail-field">
              <span className="label-premium">Kime</span>
              <input
                type="email"
                className="input-premium"
                value={draft.to}
                onChange={(e) => updateDraft({ to: e.target.value })}
                disabled={fieldsDisabled}
                placeholder="ornek@musteri.com"
                autoComplete="off"
              />
            </label>
            <label className="mail-field">
              <span className="label-premium">CC</span>
              <input
                type="text"
                className="input-premium"
                value={draft.cc}
                onChange={(e) => updateDraft({ cc: e.target.value })}
                disabled={fieldsDisabled}
                placeholder="İsteğe bağlı"
              />
            </label>
            <label className="mail-field">
              <span className="label-premium">Konu</span>
              <input
                type="text"
                className="input-premium"
                value={draft.subject}
                onChange={(e) => updateDraft({ subject: e.target.value })}
                disabled={fieldsDisabled}
              />
            </label>
            <label className="mail-field">
              <span className="label-premium">Ton</span>
              <select
                className="input-premium mail-tone-select"
                value={draft.tone}
                onChange={(e) => handleToneChange(e.target.value)}
                disabled={busy}
              >
                {MAIL_TONES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mail-field">
              <span className="label-premium">Mail metni</span>
              <textarea
                className="input-premium mail-body-input"
                value={draft.body}
                onChange={(e) => updateDraft({ body: e.target.value })}
                disabled={fieldsDisabled}
                rows={10}
              />
            </label>
          </div>

          <div className="mail-preview-actions">
            <button
              type="button"
              className="btn-primary btn-primary-inline"
              disabled={busy}
              onClick={handleSendClick}
            >
              Gönder
            </button>
            <button
              type="button"
              className="btn-outline"
              disabled={busy}
              onClick={handleSaveDraft}
            >
              Taslak olarak kaydet
            </button>
            <button
              type="button"
              className="btn-outline"
              disabled={busy}
              onClick={() => setEditing(true)}
            >
              Düzenle
            </button>
            <button type="button" className="btn-ghost" onClick={closePreview}>
              Vazgeç
            </button>
          </div>

          <p className="mail-preview-foot">
            Gmail:{' '}
            {gmailStatus?.ok
              ? gmailStatus.email || 'Bağlı'
              : gmailStatus?.message || 'Bağlı değil'}
          </p>
        </div>
      </div>

      <GmailSendConfirmModal
        open={confirmSend}
        to={draft.to}
        subject={draft.subject}
        onConfirm={handleConfirmSend}
        onCancel={() => setConfirmSend(false)}
      />
    </>
  )
}
