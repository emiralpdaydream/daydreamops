import { SCREENS } from './constants'

/** Arc / Linear — gruplu, sakin navigasyon */
export const NAV_GROUPS = [
  {
    label: 'Operasyon',
    items: [
      { id: SCREENS.DASHBOARD, label: 'Bugün' },
      { id: SCREENS.BRIEF, label: 'Brief' },
      { id: SCREENS.CRM, label: 'Müşteriler' },
      { id: SCREENS.TAHSILAT, label: 'Tahsilat' },
    ],
  },
  {
    label: 'Büyüme',
    items: [{ id: SCREENS.TEKLIF, label: 'Teklif' }],
  },
  {
    label: 'Sistem',
    items: [{ id: SCREENS.SETTINGS, label: 'Ayarlar' }],
  },
]
