import { SCREENS } from './constants'

export const NAV_ACTION_OPERATOR = 'operator'

/** Mobil alt menü — 6 eşit sekme, scroll yok */
export const MOBILE_NAV = [
  { id: SCREENS.DASHBOARD, label: 'Bugün', short: 'Bugün', glyph: '●' },
  {
    id: NAV_ACTION_OPERATOR,
    label: 'AI Asistan',
    short: 'Asistan',
    glyph: '◆',
    action: NAV_ACTION_OPERATOR,
  },
  { id: SCREENS.TODAY, label: 'Brief', short: 'Brief', glyph: '☰' },
  { id: SCREENS.CRM, label: 'CRM', short: 'CRM', glyph: '○' },
  { id: SCREENS.TAHSILAT, label: 'Finans', short: 'Finans', glyph: '₺' },
  { id: SCREENS.SETTINGS, label: 'Ayarlar', short: 'Ayarlar', glyph: '⚙' },
]
