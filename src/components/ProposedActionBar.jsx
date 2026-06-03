import { useOps } from '../lib/useOps'
import { useMailDraft } from '../lib/useMailDraft'
import { saveGmailDraft, testGmailConnection } from '../lib/gmailClient'
import { useToast } from '../lib/useToast'

function whatsAppUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export default function ProposedActionBar({ action, onDone }) {
  const { addBriefTask, appendBriefNote, saveProposal, createEmptyProposal } =
    useOps()
  const { openPreview } = useMailDraft()
  const { showToast } = useToast()

  if (!action?.type || action.type === 'info') return null

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text)
      showToast('Panoya kopyalandı')
      onDone?.()
    } catch {
      showToast('Kopyalama başarısız')
    }
  }

  if (action.type === 'mailDraft') {
    const openMail = (edit = false) => {
      openPreview(
        {
          subject: action.subject,
          body: action.body,
          clientName: action.clientName,
          tone: action.tone,
          summary: action.summary,
          to: '',
          cc: '',
        },
        edit,
      )
    }

    return (
      <div className="operator-action-bar">
        <p className="operator-action-preview">
          {action.summary || action.subject || 'Mail taslağı hazır.'}
        </p>
        <div className="operator-action-buttons">
          <button
            type="button"
            className="btn-outline"
            onClick={() => openMail(false)}
          >
            Önizle
          </button>
          <button type="button" className="btn-outline" onClick={() => openMail(true)}>
            Düzenle
          </button>
          <button
            type="button"
            className="btn-primary btn-primary-inline"
            onClick={() => openMail(true)}
          >
            Gmail ile Gönder
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={async () => {
              const gmail = await testGmailConnection()
              if (!gmail.ok) {
                showToast(
                  'Gmail bağlantısı aktif değil. Ayarlar > Bağlantılar Merkezi üzerinden bağlayın.',
                )
                openMail(true)
                return
              }
              const r = await saveGmailDraft({
                to: '',
                cc: '',
                subject: action.subject,
                body: action.body,
              })
              if (!r.ok) {
                showToast(r.message)
                openMail(true)
                return
              }
              showToast(r.message)
              onDone?.()
            }}
          >
            Taslak Kaydet
          </button>
          <button type="button" className="btn-ghost" onClick={onDone}>
            Vazgeç
          </button>
        </div>
      </div>
    )
  }

  if (action.type === 'message') {
    return (
      <div className="operator-action-bar">
        <p className="operator-action-preview">{action.text}</p>
        <div className="operator-action-buttons">
          <button
            type="button"
            className="btn-outline"
            onClick={() => copyText(action.text)}
          >
            Kopyala
          </button>
          <a
            href={whatsAppUrl(action.text)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            WhatsApp&apos;a aktar
          </a>
          <button type="button" className="btn-ghost" onClick={onDone}>
            Vazgeç
          </button>
        </div>
      </div>
    )
  }

  if (action.type === 'addNote') {
    return (
      <div className="operator-action-bar">
        <p className="operator-action-preview">
          Alınan notlara eklenecek: {action.text}
        </p>
        <div className="operator-action-buttons">
          <button
            type="button"
            className="btn-primary btn-primary-inline operator-action-confirm"
            onClick={() => {
              appendBriefNote(action.text)
              showToast('Not kaydedildi.')
              onDone?.()
            }}
          >
            Notu Kaydet
          </button>
          <button type="button" className="btn-ghost" onClick={onDone}>
            Vazgeç
          </button>
        </div>
      </div>
    )
  }

  if (action.type === 'addTask') {
    return (
      <div className="operator-action-bar">
        <p className="operator-action-preview">Brief&apos;e eklenecek: {action.text}</p>
        <div className="operator-action-buttons">
          <button
            type="button"
            className="btn-primary btn-primary-inline operator-action-confirm"
            onClick={() => {
              addBriefTask(action.text)
              showToast('Görev eklendi.')
              onDone?.()
            }}
          >
            Ekle
          </button>
          <button type="button" className="btn-ghost" onClick={onDone}>
            Vazgeç
          </button>
        </div>
      </div>
    )
  }

  if (action.type === 'proposalDraft') {
    return (
      <div className="operator-action-bar">
        <p className="operator-action-preview">{action.title}</p>
        <div className="operator-action-buttons">
          <button
            type="button"
            className="btn-outline"
            onClick={() => copyText(action.body)}
          >
            Kopyala
          </button>
          <button
            type="button"
            className="btn-primary btn-primary-inline"
            onClick={() => {
              const base = createEmptyProposal()
              saveProposal({
                ...base,
                client_name: action.clientName || base.client_name,
                budget: action.budget || base.budget,
                generated_text: action.body,
                notes: action.title,
              })
              showToast('Teklif kaydedildi')
              onDone?.()
            }}
          >
            Teklif olarak kaydet
          </button>
          <button type="button" className="btn-ghost" onClick={onDone}>
            Vazgeç
          </button>
        </div>
      </div>
    )
  }

  return null
}
