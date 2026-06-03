import { useCallback, useEffect, useState } from 'react'
import {
  CONNECTION_MODULES,
  INTEGRATION_STATUS,
} from '../lib/constants'
import { checkOperatorConnection } from '../lib/operatorClient'
import { useToast } from '../lib/useToast'

function statusBadgeClass(status) {
  if (status === INTEGRATION_STATUS.CONNECTED) return 'integration-badge--on'
  if (status === INTEGRATION_STATUS.PREPARING) {
    return 'integration-badge--prep'
  }
  return ''
}

function moduleStatus(mod, openai) {
  if (mod.id === 'openai') {
    if (!openai) return INTEGRATION_STATUS.DISCONNECTED
    return openai.ok
      ? INTEGRATION_STATUS.CONNECTED
      : INTEGRATION_STATUS.DISCONNECTED
  }
  return mod.status
}

export default function ConnectionsPanel() {
  const { showToast } = useToast()
  const [openai, setOpenai] = useState(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    let cancelled = false
    checkOperatorConnection().then((r) => {
      if (!cancelled) setOpenai(r)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const runTest = useCallback(async () => {
    setTesting(true)
    const r = await checkOperatorConnection()
    setOpenai(r)
    setTesting(false)
    if (r.ok) {
      showToast('OpenAI bağlantısı aktif.')
    } else {
      showToast('OpenAI bağlantısı kurulamadı.')
    }
  }, [showToast])

  return (
    <section className="settings-section max-w-content">
      <h2 className="label-premium">Entegrasyonlar</h2>
      <ul className="integration-grid mt-4">
        {CONNECTION_MODULES.map((mod) => {
          const isOpenAI = mod.id === 'openai'
          const status = moduleStatus(mod, openai)

          return (
            <li key={mod.id} className="integration-card">
              <div className="integration-card__head">
                <p className="integration-card__title">{mod.title}</p>
                <span
                  className={`integration-badge ${statusBadgeClass(status)}`}
                >
                  {status}
                </span>
              </div>
              <p className="integration-card__desc">{mod.description}</p>
              {isOpenAI && (
                <button
                  type="button"
                  className="btn-outline mt-3"
                  disabled={testing}
                  onClick={runTest}
                >
                  {testing ? 'Test ediliyor…' : 'OpenAI bağlantısını test et'}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
