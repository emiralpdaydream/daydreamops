import { useCallback, useEffect, useState } from 'react'
import { testGoogleEnv, testOpenAiEnv } from '../lib/connectionsClient'
import {
  disconnectGmail,
  startGmailOAuth,
  testGmailConnection,
} from '../lib/gmailClient'
import {
  GEMINI_HUB_NOTE,
  HUB_MODULES,
} from '../lib/connectionsHubData'
import { INTEGRATION_STATUS, SCREENS } from '../lib/constants'
import { useToast } from '../lib/useToast'
import CalendarAreaView from './connections/CalendarAreaView'
import DriveAreaView from './connections/DriveAreaView'
import HubStatusBadge from './connections/HubStatusBadge'
import MailDraftsView from './connections/MailDraftsView'
import SupabasePlanView from './connections/SupabasePlanView'

const HUB_VIEWS = {
  HUB: 'hub',
  DRIVE: 'drive',
  MAIL: 'mail',
  CALENDAR: 'calendar',
  DB_PLAN: 'db-plan',
}

function googleServiceStatus(mod, googleEnv) {
  if (!mod.googleOAuth) return mod.staticStatus
  if (!googleEnv) return INTEGRATION_STATUS.PREPARING
  if (googleEnv.oauthReady) return INTEGRATION_STATUS.READY
  return INTEGRATION_STATUS.PREPARING
}

function resolveGmailStatus(gmailState, googleEnv) {
  if (!googleEnv?.oauthReady) return INTEGRATION_STATUS.PREPARING
  if (!gmailState) return INTEGRATION_STATUS.PENDING_AUTH
  if (gmailState.status === 'connected' && gmailState.ok) {
    return INTEGRATION_STATUS.CONNECTED
  }
  if (gmailState.status === 'error') return INTEGRATION_STATUS.ERROR
  return INTEGRATION_STATUS.DISCONNECTED
}

function resolveModuleStatus(mod, { openai, googleEnv, gmail }) {
  if (mod.id === 'gmail') return resolveGmailStatus(gmail, googleEnv)
  if (mod.staticStatus) return mod.staticStatus
  if (mod.id === 'openai') {
    if (openai === null) return INTEGRATION_STATUS.DISCONNECTED
    return openai.ok
      ? INTEGRATION_STATUS.CONNECTED
      : INTEGRATION_STATUS.DISCONNECTED
  }
  if (mod.id === 'gemini') {
    if (googleEnv?.geminiKeyReady) return INTEGRATION_STATUS.READY
    return INTEGRATION_STATUS.PREPARING
  }
  if (mod.googleOAuth) return googleServiceStatus(mod, googleEnv)
  return INTEGRATION_STATUS.PREPARING
}

export default function ConnectionsHub({ onNavigate }) {
  const { showToast } = useToast()
  const [view, setView] = useState(HUB_VIEWS.HUB)
  const [openai, setOpenai] = useState(null)
  const [googleEnv, setGoogleEnv] = useState(null)
  const [openaiMsg, setOpenaiMsg] = useState('')
  const [testingOpenai, setTestingOpenai] = useState(false)
  const [testingGemini, setTestingGemini] = useState(false)
  const [gmail, setGmail] = useState(null)
  const [gmailBusy, setGmailBusy] = useState(false)

  const refreshGmail = useCallback(async () => {
    const r = await testGmailConnection()
    setGmail(r)
    return r
  }, [])

  const loadGoogleEnv = useCallback(async () => {
    const r = await testGoogleEnv()
    setGoogleEnv(r)
    return r
  }, [])

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams(window.location.search)
    const gmailParam = params.get('gmail')

    Promise.all([testOpenAiEnv(), testGoogleEnv(), testGmailConnection()]).then(
      ([o, g, gm]) => {
        if (cancelled) return
        setOpenai(o)
        setOpenaiMsg(o.message)
        setGoogleEnv(g)
        setGmail(gm)
        if (gmailParam === 'connected') {
          showToast(gm.ok ? 'Gmail bağlandı.' : 'Gmail bağlantısı tamamlanamadı.')
        } else if (gmailParam === 'error') {
          showToast('Gmail bağlantısı başarısız. Tekrar deneyin.')
        }
        if (gmailParam) {
          params.delete('gmail')
          params.delete('gmail_error')
          const q = params.toString()
          window.history.replaceState(
            {},
            '',
            q ? `${window.location.pathname}?${q}` : window.location.pathname,
          )
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [showToast])

  const runOpenAiTest = useCallback(async () => {
    setTestingOpenai(true)
    const r = await testOpenAiEnv()
    setOpenai(r)
    setOpenaiMsg(r.message)
    setTestingOpenai(false)
    showToast(r.message)
  }, [showToast])

  const runGeminiTest = useCallback(async () => {
    setTestingGemini(true)
    const g = await loadGoogleEnv()
    setTestingGemini(false)
    if (g.geminiKeyReady) {
      showToast('Gemini API anahtarı Vercel ortamında tanımlı (hazırlık).')
    } else {
      showToast(
        'Gemini anahtarı henüz yok. Vercel: GOOGLE_API_KEY veya GEMINI_API_KEY.',
      )
    }
  }, [loadGoogleEnv, showToast])

  const runGmailTest = useCallback(async () => {
    setGmailBusy(true)
    const r = await refreshGmail()
    setGmailBusy(false)
    showToast(r.message)
  }, [refreshGmail, showToast])

  const runGmailDisconnect = useCallback(async () => {
    setGmailBusy(true)
    await disconnectGmail()
    const r = await refreshGmail()
    setGmailBusy(false)
    showToast(r.ok ? 'Yetki kaldırıldı.' : r.message || 'Gmail bağlı değil.')
  }, [refreshGmail, showToast])

  const handleAction = useCallback(
    (mod) => {
      switch (mod.action) {
        case 'test-openai':
          runOpenAiTest()
          break
        case 'open-drive':
          setView(HUB_VIEWS.DRIVE)
          break
        case 'open-mail':
          setView(HUB_VIEWS.MAIL)
          break
        case 'open-calendar':
          setView(HUB_VIEWS.CALENDAR)
          break
        case 'open-reports':
          onNavigate?.(SCREENS.REPORTS)
          showToast('Raporlar ekranında Sheets Yedekleme bölümüne gidin.')
          break
        case 'test-gemini':
          runGeminiTest()
          break
        case 'open-db-plan':
          setView(HUB_VIEWS.DB_PLAN)
          break
        default:
          break
      }
    },
    [onNavigate, runGeminiTest, runOpenAiTest, showToast],
  )

  const backToHub = () => setView(HUB_VIEWS.HUB)

  if (view === HUB_VIEWS.DRIVE) {
    return (
      <section className="settings-section max-w-content">
        <DriveAreaView onBack={backToHub} />
      </section>
    )
  }
  if (view === HUB_VIEWS.MAIL) {
    return (
      <section className="settings-section max-w-content">
        <MailDraftsView onBack={backToHub} />
      </section>
    )
  }
  if (view === HUB_VIEWS.CALENDAR) {
    return (
      <section className="settings-section max-w-content">
        <CalendarAreaView onBack={backToHub} />
      </section>
    )
  }
  if (view === HUB_VIEWS.DB_PLAN) {
    return (
      <section className="settings-section max-w-content">
        <SupabasePlanView onBack={backToHub} />
      </section>
    )
  }

  return (
    <section className="settings-section max-w-content connections-hub">
      <h2 className="settings-section__title">Bağlantılar Merkezi</h2>
      <p className="connections-hub__intro mt-2">
        Daydream Ops&apos;un Google, AI ve veri servisleriyle bağlantı durumu.
      </p>

      {openaiMsg && (
        <p
          className={`connections-hub__status-line mt-3 ${openai?.ok ? 'connections-hub__status-line--ok' : ''}`}
          role="status"
        >
          {openaiMsg}
        </p>
      )}
      {googleEnv?.message && (
        <p className="connections-hub__status-line mt-1" role="status">
          {googleEnv.message}
        </p>
      )}

      <ul className="integration-grid mt-5">
        {HUB_MODULES.map((mod) => {
          const status = resolveModuleStatus(mod, { openai, googleEnv, gmail })
          const isOpenai = mod.id === 'openai'
          const isGemini = mod.id === 'gemini'
          const isGmail = mod.id === 'gmail'
          const loading =
            (isOpenai && testingOpenai) ||
            (isGemini && testingGemini) ||
            (isGmail && gmailBusy)

          return (
            <li key={mod.id} className="integration-card">
              <div className="integration-card__head">
                <div className="integration-card__title-row">
                  <span className="integration-glyph" aria-hidden>
                    {mod.glyph}
                  </span>
                  <p className="integration-card__title">{mod.title}</p>
                </div>
                <HubStatusBadge status={status} />
              </div>
              <p className="integration-card__desc">{mod.purpose}</p>
              {isGmail ? (
                <div className="integration-card__actions mt-3">
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={loading || !googleEnv?.oauthReady}
                    onClick={startGmailOAuth}
                  >
                    Gmail Bağla
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={loading}
                    onClick={runGmailTest}
                  >
                    {loading ? '…' : 'Bağlantıyı Test Et'}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    disabled={loading}
                    onClick={runGmailDisconnect}
                  >
                    Yetkiyi Kaldır
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={loading}
                    onClick={() => setView(HUB_VIEWS.MAIL)}
                  >
                    Mail Taslakları
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-outline mt-3"
                  disabled={loading}
                  onClick={() => handleAction(mod)}
                >
                  {loading ? 'Test ediliyor…' : mod.actionLabel}
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <aside className="connections-hub__gemini-note mt-6">
        <p className="connections-hub__gemini-note-label">Gemini</p>
        <p className="connections-hub__gemini-note-text">{GEMINI_HUB_NOTE}</p>
      </aside>
    </section>
  )
}
