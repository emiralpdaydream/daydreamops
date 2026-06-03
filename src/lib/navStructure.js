import { SCREENS } from './constants'

export const NAV_GROUPS = [
  {
    label: 'Operasyon',
    items: [
      { id: SCREENS.DASHBOARD, label: 'Bugün' },
      { id: SCREENS.TODAY, label: 'Brief' },
      { id: SCREENS.CRM, label: 'CRM' },
      { id: SCREENS.MUHASEBE, label: 'Muhasebe' },
      { id: SCREENS.REPORTS, label: 'Raporlar' },
    ],
  },
  {
    label: 'Marka & pipeline',
    items: [
      { id: SCREENS.BRANDS, label: 'Markalar' },
      { id: SCREENS.FUTURE, label: 'Gelecek projeler' },
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
