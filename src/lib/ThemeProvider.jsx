import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import {
  computeEffectiveTheme,
  getThemePreference,
  setThemePreference,
  themeColorFor,
  THEME_MODE,
} from './themeMode'
import { ThemeContext } from './themeContextCore'

function applyThemeDom(preference, effective) {
  const root = document.documentElement
  root.dataset.themePreference = preference
  root.dataset.theme = effective
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', themeColorFor(effective))
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => getThemePreference())
  const [autoTick, setAutoTick] = useState(0)

  const effective = useMemo(() => {
    void autoTick
    return computeEffectiveTheme(preference)
  }, [preference, autoTick])

  useLayoutEffect(() => {
    applyThemeDom(preference, effective)
  }, [preference, effective])

  useEffect(() => {
    if (preference !== THEME_MODE.AUTO) return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setAutoTick((t) => t + 1)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  const setPreference = useCallback((mode) => {
    setPreferenceState(setThemePreference(mode))
  }, [])

  const value = useMemo(
    () => ({
      preference,
      effective,
      setPreference,
      isNight: effective === 'night',
      isDay: effective === 'day',
    }),
    [preference, effective, setPreference],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}
