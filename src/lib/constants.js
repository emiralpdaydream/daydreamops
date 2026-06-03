export const SERVICE_TYPES = [
  'Social Management',
  'Content Production',
  'Growth System',
  'Tek Seferlik',
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
  BRIEF: 'brief',
  CRM: 'crm',
  TAHSILAT: 'tahsilat',
  TEKLIF: 'teklif',
  SETTINGS: 'settings',
}

export const INTEGRATIONS = {
  whatsapp: { label: 'WhatsApp', status: 'placeholder', note: 'Faz 2 — deep link' },
  supabase: { label: 'Supabase', status: 'placeholder', note: 'Faz 2 — cloud sync' },
  voice: { label: 'Sesli asistan', status: 'placeholder', note: 'Faz 2 — OpenAI Realtime' },
  vercel: { label: 'Deploy', status: 'placeholder', note: 'Vercel + domain' },
}
