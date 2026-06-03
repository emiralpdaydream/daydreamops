import { useState } from 'react'
import {
  hasPassword,
  MIN_PASSWORD_LENGTH,
  setPassword,
  verifyPassword,
} from '../lib/auth'
import AppearanceSettings from '../components/AppearanceSettings'
import ConnectionsHub from '../components/ConnectionsHub'
import DataManagementSection from '../components/DataManagementSection'
import PageHeader from '../components/PageHeader'
import { SCREEN_INTRO } from '../lib/screenManifesto'

export default function SettingsView({ onNavigate }) {
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

  return (
    <main className="page-main page-main--settings">
      <PageHeader {...SCREEN_INTRO.settings} />

      <section className="settings-section panel-premium max-w-content p-6 md:p-8">
        <h2 className="settings-section__title">Şifre ve güvenlik</h2>
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
          {msg && <p className="font-sans text-sm text-dim">{msg}</p>}
          <button type="submit" className="btn-primary btn-primary-inline">
            Şifreyi güncelle
          </button>
        </form>
      </section>

      <AppearanceSettings />

      <DataManagementSection />

      <ConnectionsHub onNavigate={onNavigate} />

      <section className="settings-section max-w-content">
        <h2 className="settings-section__title">Uygulama bilgisi</h2>
        <p className="mt-4 font-sans text-sm leading-relaxed text-dim">
          Daydream Production operasyon merkezi. Veriler yalnızca bu cihazda
          saklanır.
        </p>
        <p className="member-copy mt-4">From Dream to Scene · v1</p>
      </section>
    </main>
  )
}
