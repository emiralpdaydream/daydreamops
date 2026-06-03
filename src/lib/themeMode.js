export const THEME_MODE_KEY = 'daydream_ops_theme_mode'

export const THEME_MODE = {
  AUTO: 'auto',
  DAY: 'day',
  NIGHT: 'night',
}

const VALID = new Set(Object.values(THEME_MODE))

export function getThemePreference() {
  try {
    const v = localStorage.getItem(THEME_MODE_KEY)
    return VALID.has(v) ? v : THEME_MODE.AUTO
  } catch {
    return THEME_MODE.AUTO
  }
}

export function setThemePreference(mode) {
  const next = VALID.has(mode) ? mode : THEME_MODE.AUTO
  try {
    localStorage.setItem(THEME_MODE_KEY, next)
  } catch {
    /* ignore */
  }
  return next
}

export function prefersDarkScheme() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** @param {'auto'|'day'|'night'} preference */
export function computeEffectiveTheme(preference) {
  if (preference === THEME_MODE.NIGHT) return 'night'
  if (preference === THEME_MODE.DAY) return 'day'
  return prefersDarkScheme() ? 'night' : 'day'
}

export function themeColorFor(effective) {
  return effective === 'night' ? '#141312' : '#ebe8e2'
}
