import { useState } from 'react'
import {
  buildReminderMessage,
  REMINDER_TONES,
} from '../lib/reminderTemplates'
import { formatTry } from '../lib/format'

export default function ReminderModal({ payment, clientName, onClose, onSent }) {
  const [tone, setTone] = useState('nazik')
  const [message, setMessage] = useState(() =>
    buildReminderMessage({
      clientName,
      amount: payment.amount,
      label: payment.label,
      tone: 'nazik',
    }),
  )
  const [copied, setCopied] = useState(false)

  function handleToneChange(id) {
    setTone(id)
    setMessage(
      buildReminderMessage({
        clientName,
        amount: payment.amount,
        label: payment.label,
        tone: id,
      }),
    )
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    onSent?.()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex w-full items-end justify-center overflow-hidden bg-black/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="panel-premium max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-text">
              Hatırlatma
            </h2>
            <p className="mt-1 text-sm text-dim">
              {clientName} · {formatTry(payment.amount)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost text-xs">
            Kapat
          </button>
        </div>

        <div className="mt-6 flex max-w-full flex-wrap gap-2">
          {REMINDER_TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleToneChange(t.id)}
              className={`rounded-btn px-3 py-1.5 text-xs font-medium transition-colors ${
                tone === t.id
                  ? 'bg-elevated text-text'
                  : 'text-dim hover:text-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          className="input-premium mt-4 resize-y font-sans leading-relaxed"
        />

        <p className="mt-4 font-sans text-xs text-muted">
          WhatsApp&apos;a aktarım Faz 2&apos;de. Şimdilik metni kopyalayın.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={handleCopy} className="btn-primary sm:flex-1">
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </button>
          <button
            type="button"
            disabled
            className="btn-outline flex-1 cursor-not-allowed opacity-50"
          >
            WhatsApp — hazırlık
          </button>
        </div>
      </div>
    </div>
  )
}
