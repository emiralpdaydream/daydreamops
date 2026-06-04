const NAV_KEY = 'daydream_accounting_nav'

/** Dashboard → Muhasebe sekme / modal yönlendirmesi */
export function setAccountingNavigation({ tab, openModal }) {
  try {
    sessionStorage.setItem(
      NAV_KEY,
      JSON.stringify({ tab, openModal: openModal || null, ts: Date.now() }),
    )
  } catch {
    /* ignore */
  }
}

export function consumeAccountingNavigation() {
  try {
    const raw = sessionStorage.getItem(NAV_KEY)
    if (!raw) return null
    sessionStorage.removeItem(NAV_KEY)
    return JSON.parse(raw)
  } catch {
    return null
  }
}
