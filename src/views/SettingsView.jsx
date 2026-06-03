import { useState } from 'react'
import {
  hasPassword,
  MIN_PASSWORD_LENGTH,
  setPassword,
  verifyPassword,
} from '../lib/auth'
import { INTEGRATIONS } from '../lib/constants'
import { useOps } from '../lib/useOps'
import PageHeader from '../components/PageHeader'
import { SCREEN_INTRO } from '../lib/screenManifesto'

export default function SettingsView() {
  const { exportJson, resetAll } = useOps()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')

  async function handlePasswordChange(e) {
    e.preventDefault()
    setMsg('')
    if (hasPassword()) {
      const ok = await verifyPassword(current)
      if (!ok) {
        setMsg('Mevcut şifre hatalı.')
        return
      }
    }
    if (next.length < MIN_PASSWORD_LENGTH) {
      setMsg(`Yeni şifre en az ${MIN_PASSWORD_LENGTH} karakter.`)
      return
    }
    if (next !== confirm) {
      setMsg('Yeni şifreler eşleşmiyor.')
      return
    }
    await setPassword(next)
    setMsg('Şifre güncellendi.')
    setCurrent('')
    setNext('')
    setConfirm('')
  }

  function handleExport() {
    const json = exportJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daydream-ops-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleReset() {
    if (
      confirm(
        'Tüm müşteri, brief, teklif ve ödeme verileri silinip örnek veriye dönülecek. Emin misiniz?',
      )
    ) {
      resetAll()
      setMsg('Veriler sıfırlandı.')
    }
  }

  return (
    <main className="page-main">
      <PageHeader {...SCREEN_INTRO.settings} />

      <section className="panel-premium section-gap max-w-editorial p-8 md:p-10">
        <h2 className="label-premium">Şifre</h2>
        <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
          {hasPassword() && (
            <label className="block">
              <span className="label-premium">Mevcut şifre</span>
              <input
                type="password"
                className="input-premium mt-2"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </label>
          )}
          <label className="block">
            <span className="label-premium">Yeni şifre</span>
            <input
              type="password"
              className="input-premium mt-2"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Yeni şifre tekrar</span>
            <input
              type="password"
              className="input-premium mt-2"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          {msg && <p className="text-sm text-dim">{msg}</p>}
          <button type="submit" className="btn-primary">
            Şifreyi güncelle
          </button>
        </form>
      </section>

      <section className="panel-premium mt-6 max-w-lg p-6 md:p-8">
        <h2 className="font-display text-lg font-semibold text-text">Veri</h2>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={handleExport} className="btn-ghost w-full text-left">
            Tüm veriyi JSON olarak indir
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-ghost w-full border-wine/30 text-left text-brand"
          >
            Tüm veriyi sıfırla (örnek veriye dön)
          </button>
        </div>
      </section>

      <section className="mt-10 max-w-lg">
        <h2 className="font-display text-lg font-semibold text-text">
          Entegrasyonlar
        </h2>
        <ul className="mt-4 space-y-2">
          {Object.values(INTEGRATIONS).map((item) => (
            <li key={item.label} className="integration-chip flex justify-between">
              <span>{item.label}</span>
              <span className="text-dim">{item.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
