import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import {
  computeEffectiveViewMode,
  getViewModePreference,
  setViewModePreference,
  VIEW_MODE,
} from './viewMode'
import { ViewModeContext } from './viewModeContextCore'

function applyDomAttributes(preference, effective) {
  const root = document.documentElement
  root.dataset.viewPreference = preference
  root.dataset.effectiveView = effective
}

export function ViewModeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() =>
    getViewModePreference(),
  )
  const [autoTick, setAutoTick] = useState(0)

  const effective = useMemo(() => {
    void autoTick
    return computeEffectiveViewMode(preference)
  }, [preference, autoTick])

  useLayoutEffect(() => {
    applyDomAttributes(preference, effective)
  }, [preference, effective])

  useEffect(() => {
    if (preference !== VIEW_MODE.AUTO) return undefined
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => setAutoTick((t) => t + 1)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  const setPreference = useCallback((mode) => {
    setPreferenceState(setViewModePreference(mode))
  }, [])

  const value = useMemo(
    () => ({
      preference,
      effective,
      setPreference,
      isMobile: effective === 'mobile',
      isWeb: effective === 'web',
    }),
    [preference, effective, setPreference],
  )

  return (
    <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>
  )
}
