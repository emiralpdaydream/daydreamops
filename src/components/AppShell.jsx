import { SCREENS } from '../lib/constants'
import { NAV_GROUPS } from '../lib/navStructure'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import AppSidebar from './AppSidebar'
import BrandMark from './BrandMark'
import CinematicLayout from './CinematicLayout'

const screenIntroMap = {
  [SCREENS.DASHBOARD]: SCREEN_INTRO.dashboard,
  [SCREENS.BRIEF]: SCREEN_INTRO.brief,
  [SCREENS.CRM]: SCREEN_INTRO.crm,
  [SCREENS.TAHSILAT]: SCREEN_INTRO.tahsilat,
  [SCREENS.TEKLIF]: SCREEN_INTRO.teklif,
  [SCREENS.SETTINGS]: SCREEN_INTRO.settings,
}

const mobileNav = NAV_GROUPS.flatMap((g) => g.items)

export default function AppShell({
  screen,
  onNavigate,
  onLogout,
  children,
}) {
  const intro = screenIntroMap[screen]

  return (
    <CinematicLayout className="flex min-h-screen">
      <AppSidebar screen={screen} onNavigate={onNavigate} />

      <div className="workspace flex min-h-screen flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <header className="nav-topbar">
          <BrandMark />
          <button type="button" onClick={onLogout} className="btn-ghost">
            Çıkış
          </button>
        </header>

        <header className="workspace-bar hidden md:flex">
          <div>
            <p className="workspace-chapter">{intro?.chapter}</p>
            <p className="workspace-purpose">{intro?.purpose}</p>
          </div>
          <button type="button" onClick={onLogout} className="btn-ghost">
            Çıkış
          </button>
        </header>

        <div className="workspace-main flex-1">{children}</div>

        <nav className="mobile-nav md:hidden">
          {mobileNav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={
                screen === item.id ? 'mobile-nav-item is-active' : 'mobile-nav-item'
              }
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </CinematicLayout>
  )
}
