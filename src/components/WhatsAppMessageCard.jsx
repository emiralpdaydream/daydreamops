import { useState } from 'react'
import { buildWhatsAppUrl } from '../lib/whatsappUtils'
import { useToast } from '../lib/useToast'

export default function WhatsAppMessageCard({
  text,
  phone,
  onEdit,
  onDismiss,
  onSaveDraft,
}) {
  const { showToast } = useToast()
  const [localText, setLocalText] = useState(text)
  const [editing, setEditing] = useState(false)

  async function copyMsg() {
    try {
      await navigator.clipboard.writeText(localText)
      showToast('Mesaj kopyalandı')
    } catch {
      showToast('Kopyalama başarısız')
    }
  }

  function openWa() {
    window.open(buildWhatsAppUrl(localText, phone), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="whatsapp-preview-card">
      <p className="label-premium">WhatsApp mesaj önizleme</p>
      {editing ? (
        <textarea
          className="input-premium mt-3 min-h-[120px] w-full"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
        />
      ) : (
        <p className="whatsapp-preview-card__body mt-3 whitespace-pre-wrap text-sm text-text">
          {localText}
        </p>
      )}
      <div className="whatsapp-preview-card__actions mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-primary btn-primary-inline" onClick={openWa}>
          WhatsApp&apos;ta Aç
        </button>
        <button type="button" className="btn-outline" onClick={copyMsg}>
          Kopyala
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            if (editing) {
              onEdit?.(localText)
              setEditing(false)
            } else {
              setEditing(true)
            }
          }}
        >
          {editing ? 'Kaydet' : 'Düzenle'}
        </button>
        {onSaveDraft && (
          <button
            type="button"
            className="btn-outline"
            onClick={() => onSaveDraft(localText)}
          >
            Taslağa kaydet
          </button>
        )}
        {onDismiss && (
          <button type="button" className="btn-ghost" onClick={onDismiss}>
            Vazgeç
          </button>
        )}
      </div>
    </div>
  )
}
