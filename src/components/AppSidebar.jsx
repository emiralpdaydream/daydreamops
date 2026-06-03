import { NAV_GROUPS } from '../lib/navStructure'
import { BRAND_TAGLINE } from '../lib/visualReferences'
import Logo from './Logo'

export default function AppSidebar({ screen, onNavigate, onOpenOperator }) {
  return (
    <aside className="sidebar-premium">
      <div className="sidebar-brand">
        <Logo variant="sidebar" />
        <p className="brand-whisper mt-6">{BRAND_TAGLINE}</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          <p className="nav-group-label">Operatör</p>
          <button
            type="button"
            onClick={onOpenOperator}
            className="nav-link nav-link-operator"
          >
            Daydream Operator
          </button>
        </div>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="nav-group">
            <p className="nav-group-label">{group.label}</p>
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={
                  screen === item.id
                    ? 'nav-link nav-link-active'
                    : 'nav-link'
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <footer className="sidebar-member">
        <p className="member-badge">Founder access</p>
        <p className="member-copy">
          Luxury Creative
          <br />
          Operating System
        </p>
      </footer>
    </aside>
  )
}
