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

      <p className="mt-2 max-w-editorial font-sans text-sm text-dim">
        Briefing masası — formu doldurun, sağda teklif belgesi önizlemesi oluşur.
      </p>

      {savedMsg && (
        <p className="section-gap font-sans text-sm text-dim" role="status">
          {savedMsg}
        </p>
      )}

      <div className="section-gap grid w-full max-w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <form
          className="panel-premium min-w-0 space-y-4 p-5 md:p-7"
          onSubmit={(e) => e.preventDefault()}
        >
          <h2 className="label-premium">Briefing</h2>
          <label className="block">
            <span className="label-premium">Müşteri</span>
            <input
              className="input-premium mt-2"
              value={form.client_name}
              onChange={(e) => update('client_name', e.target.value)}
              placeholder="Müşteri veya proje adı"
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
            <span className="label-premium">Teslimatlar</span>
            <textarea
              className="input-premium mt-2 min-h-[100px]"
              value={form.deliverables}
              onChange={(e) => update('deliverables', e.target.value)}
              placeholder="Her satır bir teslimat"
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
            <button
              type="button"
              onClick={handlePreview}
              className="btn-primary btn-primary-inline flex-1"
            >
              Önizle
            </button>
            <button type="button" onClick={handleSave} className="btn-outline flex-1">
              Kaydet
            </button>
          </div>
          <div className="disabled-action-card">
            PDF ve e-posta gönderimi Faz 2&apos;de açılacak. Drive&apos;a kayıt
            Ayarlar &gt; Bağlantılar üzerinden gelecek.
          </div>
        </form>

        <div className="panel-premium flex min-w-0 flex-col p-5 md:p-7">
          <h2 className="label-premium">Belge önizleme</h2>
          <pre className="proposal-preview mt-4 flex-1">
            {preview || 'Önizle ile belgeyi oluşturun.'}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!preview}
            className="btn-primary btn-primary-inline mt-6 disabled:opacity-40"
          >
            {copied ? 'Kopyalandı' : 'Metni kopyala'}
          </button>
        </div>
      </div>
    </main>
  )
}
