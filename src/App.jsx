import { useState } from 'react'
import AppShell from './components/AppShell'
import Login from './components/Login'
import { SCREENS } from './lib/constants'
import { SESSION_KEYS } from './lib/storageKeys'
import { OpsProvider } from './lib/opsStore'
import BriefView from './views/BriefView'
import CrmView from './views/CrmView'
import DashboardView from './views/DashboardView'
import SettingsView from './views/SettingsView'
import TahsilatView from './views/TahsilatView'
import TeklifView from './views/TeklifView'

function AppMain({ onLogout }) {
  const [screen, setScreen] = useState(SCREENS.DASHBOARD)

  return (
    <AppShell screen={screen} onNavigate={setScreen} onLogout={onLogout}>
      {screen === SCREENS.DASHBOARD && (
        <DashboardView onNavigate={setScreen} />
      )}
      {screen === SCREENS.BRIEF && <BriefView />}
      {screen === SCREENS.CRM && <CrmView />}
      {screen === SCREENS.TAHSILAT && <TahsilatView />}
      {screen === SCREENS.TEKLIF && <TeklifView />}
      {screen === SCREENS.SETTINGS && <SettingsView />}
    </AppShell>
  )
}

function App() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEYS.AUTH) === '1',
  )

  function handleLoginSuccess() {
    sessionStorage.setItem(SESSION_KEYS.AUTH, '1')
    setAuthed(true)
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEYS.AUTH)
    setAuthed(false)
  }

  if (!authed) {
    return <Login onSuccess={handleLoginSuccess} />
  }

  return (
    <OpsProvider>
      <AppMain onLogout={handleLogout} />
    </OpsProvider>
  )
}

export default App
