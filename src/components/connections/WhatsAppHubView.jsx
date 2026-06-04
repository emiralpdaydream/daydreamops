import { useState } from 'react'
import { useOps } from '../../lib/useOps'
import { useToast } from '../../lib/useToast'
import { buildWhatsAppUrl } from '../../lib/whatsappUtils'
import WhatsAppMessageCard from '../WhatsAppMessageCard'

const TEMPLATES = [
  {
    id: 'odeme',
    title: 'Ödeme hatırlatma',
    text: 'Merhaba, ödemeniz için nazik bir hatırlatma paylaşmak istedik. Uygun olduğunuzda bilgi verir misiniz?',
  },
  {
    id: 'teklif',
    title: 'Teklif takibi',
    text: 'Merhaba, gönderdiğimiz teklif hakkında görüşlerinizi öğrenmek isteriz.',
  },
  {
    id: 'toplanti',
    title: 'Toplantı hatırlatma',
    text: 'Merhaba, planlanan toplantımız için kısa bir hatırlatma. Uygunsa aynı saatte görüşelim.',
  },
  {
    id: 'revize',
    title: 'Revize hatırlatma',
    text: 'Merhaba, revize süreci için kısa bir hatırlatma — uygun olduğunuzda dönüşünüzü rica ederiz.',
  },
  {
    id: 'bilgi',
    title: 'Müşteri bilgilendirme',
    text: 'Merhaba, proje durumu hakkında kısa bilgilendirme paylaşmak istedik.',
  },
]

export default function WhatsAppHubView({ onBack }) {
  const { data, saveWhatsAppDraft } = useOps()
  const { showToast } = useToast()
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState(TEMPLATES[0].text)
  const [preview, setPreview] = useState(false)

  const clientPhones = (data.clients ?? [])
    .filter((c) => c.phone && !c.archived)
    .slice(0, 8)

  function handleSaveDraft(text) {
    saveWhatsAppDraft({
      text,
      phone,
      purpose: 'hub',
      clientName: '',
    })
    showToast('WhatsApp taslağı kaydedildi.')
  }

  return (
    <div className="connections-subview whatsapp-hub">
      <button type="button" className="btn-ghost mb-4" onClick={onBack}>
        ← Bağlantılar
      </button>
      <h2 className="settings-section__title">WhatsApp</h2>
      <p className="mt-2 text-sm text-dim">
        Deep link ile mesaj hazırlayın — WhatsApp Business API bu aşamada yok.
      </p>

      <label className="block mt-6">
        <span className="label-premium">Telefon (opsiyonel)</span>
        <input
          className="input-premium mt-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="5XX XXX XX XX"
          inputMode="tel"
        />
      </label>
      {clientPhones.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {clientPhones.map((c) => (
            <button
              key={c.id}
              type="button"
              className="btn-ghost text-xs"
              onClick={() => setPhone(c.phone)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            className="btn-outline text-sm"
            onClick={() => setMessage(t.text)}
          >
            {t.title}
          </button>
        ))}
      </div>

      <label className="block mt-6">
        <span className="label-premium">Mesaj</span>
        <textarea
          className="input-premium mt-2 min-h-[140px] w-full"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary btn-primary-inline"
          onClick={() => setPreview(true)}
        >
          Önizle
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => window.open(buildWhatsAppUrl(message, phone), '_blank')}
        >
          WhatsApp&apos;ta Aç
        </button>
      </div>

      {preview && (
        <div className="mt-6">
          <WhatsAppMessageCard
            text={message}
            phone={phone}
            onDismiss={() => setPreview(false)}
            onSaveDraft={handleSaveDraft}
          />
        </div>
      )}

      {(data.whatsappDrafts ?? []).length > 0 && (
        <section className="mt-8">
          <h3 className="label-premium">Son taslaklar</h3>
          <ul className="mt-3 space-y-2">
            {data.whatsappDrafts.slice(0, 5).map((d) => (
              <li key={d.id} className="text-sm text-dim">
                {d.text.slice(0, 80)}
                {d.text.length > 80 ? '…' : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
