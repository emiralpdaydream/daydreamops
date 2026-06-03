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

/** Entegrasyon durumları */
export const INTEGRATION_STATUS = {
  CONNECTED: 'Bağlı',
  DISCONNECTED: 'Bağlı değil',
  PREPARING: 'Hazırlanıyor',
}

/** Ayarlar > Bağlantılar */
export const CONNECTION_MODULES = [
  {
    id: 'openai',
    title: 'OpenAI',
    status: INTEGRATION_STATUS.DISCONNECTED,
    description:
      'Daydream Operator — tahsilat, brief, teklif ve rapor analizi.',
  },
  {
    id: 'drive',
    title: 'Google Drive',
    status: INTEGRATION_STATUS.PREPARING,
    description: 'Teklif PDF’leri ve müşteri klasörleri.',
  },
  {
    id: 'gmail',
    title: 'Gmail',
    status: INTEGRATION_STATUS.PREPARING,
    description: 'Teklif ve tahsilat e-posta taslakları.',
  },
  {
    id: 'calendar',
    title: 'Google Calendar',
    status: INTEGRATION_STATUS.PREPARING,
    description: 'Toplantı ve teslim tarihleri.',
  },
  {
    id: 'supabase',
    title: 'Supabase',
    status: INTEGRATION_STATUS.DISCONNECTED,
    description: 'Bulut senkron ve yedek (planlanan).',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    status: INTEGRATION_STATUS.PREPARING,
    description: 'Hatırlatma mesajlarını hızlı aktarım.',
  },
]
