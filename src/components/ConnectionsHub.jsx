import { useCallback, useEffect, useState } from 'react'
import { testGoogleEnv, testOpenAiEnv } from '../lib/connectionsClient'
import { CONNECTION_SERVICES } from '../lib/connectionsHubData'
import { INTEGRATION_STATUS } from '../lib/constants'
import { useToast } from '../lib/useToast'
import HubStatusBadge from './connections/HubStatusBadge'

function resolveServiceStatus(serviceId, { openai, googleEnv }) {
  if (serviceId === 'openai') {
    if (openai === null) return INTEGRATION_STATUS.DISCONNECTED
    return openai.ok
      ? INTEGRATION_STATUS.CONNECTED
      : INTEGRATION_STATUS.DISCONNECTED
  }
  if (serviceId === 'google') {
    if (!googleEnv) return INTEGRATION_STATUS.PREPARING
    return googleEnv.oauthReady
      ? INTEGRATION_STATUS.READY
      : INTEGRATION_STATUS.PREPARING
  }
  return INTEGRATION_STATUS.PREPARING
}

function statusHint(serviceId, { openai, googleEnv }) {
  if (serviceId === 'openai' && openai?.message) return openai.message
  if (serviceId === 'google' && googleEnv?.message) {
    const missing =
      googleEnv.missing?.length > 0
        ? ` Eksik: ${googleEnv.missing.join(', ')}.`
        : ''
    return `${googleEnv.message}${missing}`
  }
  return null
}

export default function ConnectionsHub() {
  const { showToast } = useToast()
  const [openai, setOpenai] = useState(null)
  const [googleEnv, setGoogleEnv] = useState(null)
  const [testingOpenai, setTestingOpenai] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([testOpenAiEnv(), testGoogleEnv()]).then(([o, g]) => {
      if (cancelled) return
      setOpenai(o)
      setGoogleEnv(g)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const runOpenAiTest = useCallback(async () => {
    setTestingOpenai(true)
    const r = await testOpenAiEnv()
    setOpenai(r)
    setTestingOpenai(false)
    showToast(r.message)
  }, [showToast])

  const ctx = { openai, googleEnv }

  return (
    <section className="settings-section max-w-content connections-hub">
      <h2 className="settings-section__title">Bağlantılar Merkezi</h2>
      <p className="connections-hub__intro mt-2">
        Servis durumları — gerçek bağlantı adımları sonraki sürümlerde. OpenAI
        anahtarı buradan test edilir.
      </p>

      <ul className="connections-status-list mt-5" role="list">
        {CONNECTION_SERVICES.map((svc) => {
          const status = resolveServiceStatus(svc.id, ctx)
          const hint = statusHint(svc.id, ctx)

          return (
            <li key={svc.id} className="connections-status-row">
              <div className="connections-status-row__main">
                <span className="integration-glyph" aria-hidden>
                  {svc.glyph}
                </span>
                <div className="connections-status-row__text min-w-0">
                  <p className="connections-status-row__title">{svc.title}</p>
                  <p className="connections-status-row__purpose">{svc.purpose}</p>
                  {hint && (
                    <p className="connections-status-row__hint" role="status">
                      {hint}
                    </p>
                  )}
                </div>
                <HubStatusBadge status={status} />
              </div>
              {svc.testable && (
                <button
                  type="button"
                  className="btn-outline connections-status-row__test"
                  disabled={testingOpenai}
                  onClick={runOpenAiTest}
                >
                  {testingOpenai ? 'Test ediliyor…' : 'Test et'}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
