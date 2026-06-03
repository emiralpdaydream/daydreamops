import { useState } from 'react'
import {
  hasPassword,
  MIN_PASSWORD_LENGTH,
  setPassword,
  verifyPassword,
} from '../lib/auth'
import { AGENT_LABEL, BRAND_TAGLINE } from '../lib/visualReferences'
import BrandBackdrop from './BrandBackdrop'
import Logo from './Logo'
import CinematicLayout from './CinematicLayout'

export default function Login({ onSuccess }) {
  const [isSetup] = useState(() => !hasPassword())
  const [password, setPasswordValue] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı.`)
      return
    }

    setLoading(true)

    try {
      if (isSetup) {
        if (password !== confirmPassword) {
          setError('Şifreler eşleşmiyor.')
          return
        }
        await setPassword(password)
        onSuccess()
        return
      }

      const ok = await verifyPassword(password)
      if (!ok) {
        setError('Şifre hatalı.')
        return
      }
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  return (
    <CinematicLayout className="login-scene">
      <BrandBackdrop variant="login" />
      <div className="login-frame animate-fade-in">
        <div className="login-mark">
          <Logo variant="login" />
        </div>

        <div className="login-editorial">
          <p className="screen-chapter login-chapter">Luxury Creative Operating System</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-luxury text-muted">
            {AGENT_LABEL}
          </p>
          <h1 className="screen-title mt-4">Operasyon merkezi</h1>
          <p className="brand-whisper mt-6 text-center">{BRAND_TAGLINE}</p>
          <p className="mx-auto mt-6 max-w-xs font-sans text-sm leading-relaxed text-dim">
            Daydream Production operasyon merkezi.
          </p>
          <p className="member-copy mx-auto mt-4 max-w-xs text-center">
            Yalnızca kurucu erişimi · Internal system
          </p>
        </div>

        <div className="login-form-wrap">
          <form onSubmit={handleSubmit}>
            <label className="block">
              <span className="label-premium">
                {isSetup ? 'Şifre belirle' : 'Giriş'}
              </span>
              <input
                type="password"
                autoComplete={isSetup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPasswordValue(e.target.value)}
                className="input-premium"
                placeholder="••••"
                disabled={loading}
              />
            </label>

            {isSetup && (
              <label className="mt-8 block">
                <span className="label-premium">Tekrar</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-premium"
                  placeholder="••••"
                  disabled={loading}
                />
              </label>
            )}

            {error && (
              <p className="mt-4 text-sm signal-wine" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-10 disabled:opacity-50"
            >
              {loading ? '…' : isSetup ? 'Merkeze gir' : 'Giriş'}
            </button>
          </form>

          <p className="mt-12 text-center text-[10px] tracking-luxury text-muted uppercase">
            Yalnızca bu cihaz · Seçilmiş erişim
          </p>
        </div>
      </div>
    </CinematicLayout>
  )
}
