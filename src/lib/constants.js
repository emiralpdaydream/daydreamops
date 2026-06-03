export const SERVICE_TYPES = [
  'Sosyal Medya Retainer',
  'İçerik Üretimi',
  'Marka Filmi',
  'Aylık İçerik Paketi',
  'Lansman Projesi',
  'Growth System',
]

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
}

export const PAYMENT_STATUS_LABELS = {
  paid: 'Ödendi',
  pending: 'Bekliyor',
  overdue: 'Gecikmiş',
  partial: 'Kısmi',
}

export const SCREENS = {
  DASHBOARD: 'dashboard',
  TODAY: 'today',
  CRM: 'crm',
  BRANDS: 'brands',
  FUTURE: 'future',
  TAHSILAT: 'tahsilat',
  TEKLIF: 'teklif',
  REPORTS: 'reports',
  SETTINGS: 'settings',
}

/** Entegrasyon durumları — Bağlantılar Merkezi */
export const INTEGRATION_STATUS = {
  CONNECTED: 'Bağlı',
  DISCONNECTED: 'Bağlı değil',
  PREPARING: 'Hazırlanıyor',
  READY: 'Hazır',
  NEXT_PHASE: 'Sıradaki veri altyapısı',
  PENDING_AUTH: 'Yetki bekliyor',
  ERROR: 'Hata',
}
