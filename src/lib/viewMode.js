export const VIEW_MODE_KEY = 'daydream_ops_view_mode'

export const VIEW_MODE = {
  AUTO: 'auto',
  MOBILE: 'mobile',
  WEB: 'web',
}

const VALID = new Set(Object.values(VIEW_MODE))

export function getViewModePreference() {
  try {
    const v = localStorage.getItem(VIEW_MODE_KEY)
    return VALID.has(v) ? v : VIEW_MODE.AUTO
  } catch {
    return VIEW_MODE.AUTO
  }
}

export function setViewModePreference(mode) {
  const next = VALID.has(mode) ? mode : VIEW_MODE.AUTO
  try {
    localStorage.setItem(VIEW_MODE_KEY, next)
  } catch {
    /* ignore */
  }
  return next
}

/** @param {'auto'|'mobile'|'web'} preference */
export function computeEffectiveViewMode(preference) {
  if (preference === VIEW_MODE.MOBILE) return 'mobile'
  if (preference === VIEW_MODE.WEB) return 'web'
  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
    return 'web'
  }
  return 'mobile'
}
