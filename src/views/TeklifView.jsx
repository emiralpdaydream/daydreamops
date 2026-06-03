import { useState } from 'react'
import { generateProposalText } from '../lib/proposalGenerator'
import { useOps } from '../lib/useOps'
import PageHeader from '../components/PageHeader'
import { SCREEN_INTRO } from '../lib/screenManifesto'

export default function TeklifView() {
  const { saveProposal, createEmptyProposal } = useOps()
  const [form, setForm] = useState(() => {
    const p = createEmptyProposal()
    return {
      ...p,
      deliverables: '',
    }
  })
  const [preview, setPreview] = useState('')
  const [copied, setCopied] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handlePreview() {
    setPreview(
      generateProposalText({
        ...form,
        deliverables: form.deliverables,
      }),
    )
  }

  function handleSave() {
    const text = generateProposalText({
      ...form,
      deliverables: form.deliverables,
    })
    saveProposal({
      ...form,
      deliverables: form.deliverables.split('\n').filter(Boolean),
      generated_text: text,
    })
    setPreview(text)
    setSavedMsg('Teklif kaydedildi.')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  async function handleCopy() {
    const text = preview || generateProposalText(form)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="page-main">
      <PageHeader {...SCREEN_INTRO.teklif} />

      {savedMsg && (
        <p className="section-gap text-sm text-dim" role="status">
          {savedMsg}
        </p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <form
          className="panel-premium space-y-4 p-6 md:p-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="block">
            <span className="label-premium">Müşteri</span>
            <input
              className="input-premium mt-2"
              value={form.client_name}
              onChange={(e) => update('client_name', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Proje tipi</span>
            <input
              className="input-premium mt-2"
              value={form.project_type}
              onChange={(e) => update('project_type', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Tarih</span>
            <input
              type="date"
              className="input-premium mt-2"
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Bütçe (₺)</span>
            <input
              type="number"
              className="input-premium mt-2"
              value={form.budget}
              onChange={(e) => update('budget', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Teslimatlar (satır satır)</span>
            <textarea
              className="input-premium mt-2 min-h-[100px]"
              value={form.deliverables}
              onChange={(e) => update('deliverables', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Notlar</span>
            <textarea
              className="input-premium mt-2 min-h-[80px]"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </label>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <button type="button" onClick={handlePreview} className="btn-primary flex-1">
              Önizle
            </button>
            <button type="button" onClick={handleSave} className="btn-ghost flex-1">
              Kaydet
            </button>
          </div>
          <p className="integration-chip text-center">
            PDF indir · E-posta gönder — placeholder (Faz 2)
          </p>
        </form>

        <div className="panel-premium flex flex-col p-6 md:p-8">
          <h2 className="font-display text-lg font-semibold text-text">Önizleme</h2>
          <pre className="mt-4 flex-1 whitespace-pre-wrap font-sans text-sm leading-relaxed text-dim">
            {preview || 'Önizle butonuna basın.'}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!preview}
            className="btn-primary mt-6 disabled:opacity-40"
          >
            {copied ? 'Kopyalandı' : 'Metni kopyala'}
          </button>
        </div>
      </div>
    </main>
  )
}
