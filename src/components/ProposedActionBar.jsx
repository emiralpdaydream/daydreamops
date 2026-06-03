import { useOps } from '../lib/useOps'
import { useToast } from '../lib/useToast'

function whatsAppUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export default function ProposedActionBar({ action, onDone }) {
  const { addBriefTask, saveProposal, createEmptyProposal } = useOps()
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

  if (action.type === 'addTask') {
    return (
      <div className="operator-action-bar">
        <p className="operator-action-preview">Brief&apos;e eklenecek: {action.text}</p>
        <div className="operator-action-buttons">
          <button
            type="button"
            className="btn-primary btn-primary-inline"
            onClick={() => {
              addBriefTask(action.text)
              showToast('Görev eklendi')
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
