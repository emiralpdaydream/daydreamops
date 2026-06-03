import { SCREENS } from '../lib/constants'
import { MOBILE_NAV, NAV_ACTION_OPERATOR } from '../lib/mobileNav'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import { useOperator } from '../lib/useOperator'
import AppSidebar from './AppSidebar'
import BrandMark from './BrandMark'
import CinematicLayout from './CinematicLayout'

const screenIntroMap = {
  [SCREENS.DASHBOARD]: SCREEN_INTRO.dashboard,
  [SCREENS.TODAY]: SCREEN_INTRO.today,
  [SCREENS.CRM]: SCREEN_INTRO.crm,
  [SCREENS.BRANDS]: SCREEN_INTRO.brands,
  [SCREENS.FUTURE]: SCREEN_INTRO.future,
  [SCREENS.TAHSILAT]: SCREEN_INTRO.tahsilat,
  [SCREENS.TEKLIF]: SCREEN_INTRO.teklif,
  [SCREENS.REPORTS]: SCREEN_INTRO.reports,
  [SCREENS.SETTINGS]: SCREEN_INTRO.settings,
}

export default function AppShell({
  screen,
  onNavigate,
  onLogout,
  children,
}) {
  const intro = screenIntroMap[screen]
  const { open: operatorOpen, setOpen } = useOperator()

  function handleNav(item) {
    if (item.action === NAV_ACTION_OPERATOR) {
      setOpen(true)
      return
    }
    setOpen(false)
    onNavigate(item.id)
  }

  function isNavActive(item) {
    if (item.action === NAV_ACTION_OPERATOR) return operatorOpen
    return screen === item.id && !operatorOpen
  }

  return (
    <CinematicLayout className="app-root flex min-h-0 min-h-dvh w-full max-w-full overflow-x-clip">
      <AppSidebar screen={screen} onNavigate={onNavigate} onOpenOperator={() => setOpen(true)} />

      <div className="workspace flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-x-clip">
        <header className="nav-topbar">
          <BrandMark />
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="btn-outline operator-topbar-btn"
              onClick={() => setOpen(true)}
            >
              AI
            </button>
            <button type="button" onClick={onLogout} className="btn-ghost">
              Çıkış
            </button>
          </div>
        </header>

        <header className="workspace-bar">
          <div className="min-w-0">
            <p className="workspace-chapter">{intro?.chapter}</p>
            <p className="workspace-purpose">{intro?.purpose}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="btn-outline operator-topbar-btn"
              onClick={() => setOpen(true)}
            >
              Operator
            </button>
            <button type="button" onClick={onLogout} className="btn-ghost">
              Çıkış
            </button>
          </div>
        </header>

        <div className="workspace-main min-h-0 min-w-0 w-full max-w-full flex-1 overflow-x-clip">
          <div className="page-layout-inner w-full min-w-0">{children}</div>
        </div>

        <nav className="mobile-nav" aria-label="Ana menü">
          {MOBILE_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item)}
              className={
                isNavActive(item)
                  ? 'mobile-nav-item is-active'
                  : 'mobile-nav-item'
              }
            >
              <span className="mobile-nav-glyph" aria-hidden>
                {item.glyph}
              </span>
              <span className="mobile-nav-label">{item.short}</span>
            </button>
          ))}
        </nav>
      </div>
    </CinematicLayout>
  )
}
