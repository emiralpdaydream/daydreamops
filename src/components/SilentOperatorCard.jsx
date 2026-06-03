import { useEffect, useState } from 'react'
import { useOps } from '../lib/useOps'
import {
  askSilentOperator,
  checkOpenAIConnection,
  isOpenAIConfigured,
} from '../lib/openaiClient'
import BrandBackdrop from './BrandBackdrop'

const PRESETS = [
  { id: 'today', label: 'Bugün ne yapmalıyım?' },
  { id: 'priority', label: 'Öncelik sırası' },
  { id: 'cash', label: 'Tahsilat özeti' },
]

export default function SilentOperatorCard() {
  const { data } = useOps()
  const enabled = isOpenAIConfigured()
  const [conn, setConn] = useState(() =>
    enabled ? null : { ok: false, code: 'disabled' },
  )
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    checkOpenAIConnection().then((r) => {
      if (!cancelled) setConn(r)
    })
    return () => {
      cancelled = true
    }
  }, [enabled])

  async function handleAsk(presetText) {
    const q = (presetText ?? question).trim()
    if (!q) return
    setError('')
    setLoading(true)
    setAnswer('')
    try {
      const text = await askSilentOperator({ question: q, data })
      setAnswer(text)
      if (presetText) setQuestion(presetText)
    } catch (e) {
      setError(e.message || 'Yanıt alınamadı.')
    } finally {
      setLoading(false)
    }
  }

  const statusLabel =
    conn?.ok === true
      ? 'Bağlı'
      : conn?.code === 'disabled'
        ? 'Yapılandırma gerekli'
        : conn?.code === 'invalid_key'
          ? 'Anahtar hatalı'
          : conn === null
            ? 'Kontrol ediliyor…'
            : 'Bağlı değil'

  return (
    <aside className="silent-operator">
      <BrandBackdrop variant="vision" className="silent-operator__backdrop" />
      <div className="silent-operator__content">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="silent-operator-title">Silent Operator</p>
          <span
            className={`silent-operator-badge ${conn?.ok ? 'is-on' : ''}`}
          >
            {statusLabel}
          </span>
        </div>

        {!enabled ? (
          <p className="silent-operator-copy">
            AI agent için proje kökünde <strong>.env.local</strong> oluşturun:
            OPENAI_API_KEY ve VITE_OPENAI_ENABLED=true. Sonra{' '}
            <strong>npm run dev</strong> yeniden başlatın. Anahtarı sohbete
            yazmayın.
          </p>
        ) : (
          <>
            <p className="silent-operator-copy">
              Daydream operasyon verinize göre özet ve öneri. Sesli mod sonra
              eklenecek.
            </p>

            <div className="silent-operator-presets">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="btn-outline silent-operator-preset"
                  disabled={loading || !conn?.ok}
                  onClick={() => handleAsk(p.label)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <label className="silent-operator-field">
              <span className="label-premium">Sorunuz</span>
              <textarea
                className="input-premium mt-2 min-h-[4.5rem] resize-y"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Örn. Bu hafta tahsilata nasıl odaklanmalıyım?"
                disabled={loading || !conn?.ok}
              />
            </label>

            <button
              type="button"
              className="btn-primary btn-primary-inline mt-4"
              disabled={loading || !conn?.ok || !question.trim()}
              onClick={() => handleAsk()}
            >
              {loading ? 'Düşünüyor…' : 'Agent\'a sor'}
            </button>

            {error && (
              <p className="mt-3 font-sans text-sm signal-wine" role="alert">
                {error}
              </p>
            )}

            {answer && (
              <div className="silent-operator-response mt-4">
                <p className="label-premium">Yanıt</p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-text whitespace-pre-wrap">
                  {answer}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
