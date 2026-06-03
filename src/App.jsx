import { useState } from 'react'
import AppShell from './components/AppShell'
import Login from './components/Login'
import SplashScreen from './components/SplashScreen'
import { SCREENS } from './lib/constants'
import { SESSION_KEYS } from './lib/storageKeys'
import { OperatorProvider } from './lib/operatorContext'
import { OpsProvider } from './lib/opsStore'
import { useOps } from './lib/useOps'
import { ToastProvider } from './lib/toast'
import { ThemeProvider } from './lib/ThemeProvider'
import { ViewModeProvider } from './lib/ViewModeProvider'
import DaydreamOperatorPanel from './components/DaydreamOperatorPanel'
import MailPreviewView from './components/mail/MailPreviewView'
import { MailDraftProvider } from './lib/mailDraftContext'
import BrandsView from './views/BrandsView'
import CrmView from './views/CrmView'
import DashboardView from './views/DashboardView'
import FutureProjectsView from './views/FutureProjectsView'
import ReportsView from './views/ReportsView'
import SettingsView from './views/SettingsView'
import TahsilatView from './views/TahsilatView'
import TeklifView from './views/TeklifView'
import TodayView from './views/TodayView'

function AppMain({ onLogout }) {
  const [screen, setScreen] = useState(SCREENS.DASHBOARD)
  const { data } = useOps()

  return (
    <OperatorProvider data={data}>
      <MailDraftProvider>
      <AppShell screen={screen} onNavigate={setScreen} onLogout={onLogout}>
        {screen === SCREENS.DASHBOARD && (
          <DashboardView onNavigate={setScreen} />
        )}
        {screen === SCREENS.TODAY && <TodayView />}
        {screen === SCREENS.CRM && <CrmView />}
        {screen === SCREENS.BRANDS && <BrandsView />}
        {screen === SCREENS.FUTURE && <FutureProjectsView />}
        {screen === SCREENS.TAHSILAT && <TahsilatView />}
        {screen === SCREENS.REPORTS && <ReportsView />}
        {screen === SCREENS.TEKLIF && <TeklifView />}
        {screen === SCREENS.SETTINGS && (
          <SettingsView onNavigate={setScreen} />
        )}
      </AppShell>
      <DaydreamOperatorPanel />
      <MailPreviewView />
      </MailDraftProvider>
    </OperatorProvider>
  )
}

function App() {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem(SESSION_KEYS.SPLASH) === '1',
  )
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEYS.AUTH) === '1',
  )

  function handleSplashComplete() {
    sessionStorage.setItem(SESSION_KEYS.SPLASH, '1')
    setSplashDone(true)
  }

  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

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
    <ViewModeProvider>
      <ThemeProvider>
        <ToastProvider>
          <OpsProvider>
            <AppMain onLogout={handleLogout} />
          </OpsProvider>
        </ToastProvider>
      </ThemeProvider>
    </ViewModeProvider>
  )
}

export default App
