import { useState } from 'react'
import { useOps } from '../lib/useOps'
import { getTodayBrief } from '../lib/selectors'
import { formatDateTr } from '../lib/dates'
import PageHeader from '../components/PageHeader'
import { SCREEN_INTRO } from '../lib/screenManifesto'

const ROMAN = ['I', 'II', 'III']

export default function BriefView() {
  const { data, saveTodayBrief } = useOps()
  const existing = getTodayBrief(data.briefs)
  const [priorities, setPriorities] = useState(() =>
    existing?.priorities?.length
      ? [...existing.priorities, '', '', ''].slice(0, 3)
      : ['', '', ''],
  )
  const [note, setNote] = useState(existing?.note ?? '')
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')

  const history = data.briefs
    .filter((b) => b.date !== existing?.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30)

  const filteredHistory = search.trim()
    ? history.filter(
        (b) =>
          b.note?.toLowerCase().includes(search.toLowerCase()) ||
          b.priorities?.some((p) =>
            p?.toLowerCase().includes(search.toLowerCase()),
          ),
      )
    : history

  function handleSave(e) {
    e.preventDefault()
    saveTodayBrief({ priorities, note })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <main className="page-main">
      <PageHeader {...SCREEN_INTRO.brief} />

      <form onSubmit={handleSave} className="panel-premium section-gap max-w-editorial p-8 md:p-10">
        {priorities.map((value, index) => (
          <label key={ROMAN[index]} className={index > 0 ? 'mt-5 block' : 'block'}>
            <span className="label-premium">{ROMAN[index]}</span>
            <input
              className="input-premium mt-2"
              value={value}
              onChange={(e) => {
                const next = [...priorities]
                next[index] = e.target.value
                setPriorities(next)
              }}
              placeholder="Öncelik"
            />
          </label>
        ))}

        <label className="mt-6 block">
          <span className="label-premium">Notlar</span>
          <textarea
            className="input-premium mt-2 min-h-[120px] resize-y leading-relaxed"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Serbest format"
          />
        </label>

        <button type="submit" className="btn-primary mt-8">
          {saved ? 'Kaydedildi' : 'Bugünün brief\'ini kaydet'}
        </button>
      </form>

      <section className="section-gap-lg max-w-editorial">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="label-premium">Geçmiş</h2>
          <input
            className="input-premium sm:max-w-xs"
            placeholder="Kelime ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ul className="mt-6 space-y-3">
          {filteredHistory.length === 0 ? (
            <li className="text-sm text-muted">Kayıt yok.</li>
          ) : (
            filteredHistory.map((b) => (
              <li key={b.id} className="panel-premium p-4">
                <p className="text-xs font-medium uppercase tracking-luxury text-muted">
                  {formatDateTr(b.date)}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-dim">
                  {b.priorities
                    ?.filter(Boolean)
                    .map((p, i) => (
                      <li key={i}>
                        <span className="priority-index inline not-italic">
                          {ROMAN[i]}{' '}
                        </span>
                        {p}
                      </li>
                    ))}
                </ul>
                {b.note && (
                  <p className="mt-2 text-sm text-muted">{b.note}</p>
                )}
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  )
}
