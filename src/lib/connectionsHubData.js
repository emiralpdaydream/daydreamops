import { INTEGRATION_STATUS } from './constants'

/** Bağlantılar Merkezi kartları */
export const HUB_MODULES = [
  {
    id: 'openai',
    title: 'OpenAI',
    glyph: 'AI',
    purpose:
      'Daydream Operator, teklif metni, rapor özeti, ödeme hatırlatma dili',
    action: 'test-openai',
    actionLabel: 'Bağlantıyı Test Et',
    staticStatus: null,
  },
  {
    id: 'drive',
    title: 'Google Drive',
    glyph: 'DR',
    purpose: "Teklif PDF'leri, call sheet dosyaları, müşteri klasörleri",
    action: 'open-drive',
    actionLabel: 'Drive Alanını Aç',
    googleOAuth: true,
  },
  {
    id: 'gmail',
    title: 'Gmail',
    glyph: 'GM',
    purpose:
      'Teklif mail taslakları, ödeme hatırlatma mailleri, müşteri iletişimi',
    action: 'open-mail',
    actionLabel: 'Mail Taslakları',
    googleOAuth: true,
  },
  {
    id: 'calendar',
    title: 'Google Calendar',
    glyph: 'CL',
    purpose: 'Çekimler, toplantılar, teslim tarihleri',
    action: 'open-calendar',
    actionLabel: 'Takvim Alanı',
    googleOAuth: true,
  },
  {
    id: 'sheets',
    title: 'Google Sheets',
    glyph: 'SH',
    purpose: 'Dış rapor, finans tablosu, müşteri listesi yedekleme',
    action: 'open-reports',
    actionLabel: 'Sheets Senkron',
    googleOAuth: true,
    staticStatus: INTEGRATION_STATUS.PREPARING,
  },
  {
    id: 'gemini',
    title: 'Gemini',
    glyph: 'GE',
    purpose: 'Alternatif Google AI analizi / veri yorumlama',
    action: 'test-gemini',
    actionLabel: 'Gemini Test',
    staticStatus: INTEGRATION_STATUS.PREPARING,
  },
  {
    id: 'supabase',
    title: 'Supabase',
    glyph: 'DB',
    purpose: 'localStorage yerine kalıcı bulut veritabanı',
    action: 'open-db-plan',
    actionLabel: 'Veri Tabanı Planı',
    staticStatus: INTEGRATION_STATUS.NEXT_PHASE,
  },
]

/** Drive Alanı — ileride Drive klasör ID'leri bağlanacak */
export const DRIVE_AREA_SECTIONS = [
  {
    id: 'teklifler',
    folderKey: 'proposals',
    title: 'Teklifler',
    description: 'PDF teklifler ve revizyon dosyaları',
  },
  {
    id: 'sozlesmeler',
    folderKey: 'contracts',
    title: 'Sözleşmeler',
    description: 'İmzalı sözleşme ve ek protokoller',
  },
  {
    id: 'call-sheet',
    folderKey: 'call_sheets',
    title: 'Call Sheet',
    description: 'Çekim günü planları ve ekip listeleri',
  },
  {
    id: 'musteri',
    folderKey: 'client_folders',
    title: 'Müşteri Klasörleri',
    description: 'Marka bazlı ana klasörler',
  },
  {
    id: 'faturalar',
    folderKey: 'invoices',
    title: 'Faturalar',
    description: 'Kesilen faturalar ve ödeme belgeleri',
  },
  {
    id: 'marka',
    folderKey: 'brand_assets',
    title: 'Marka Dosyaları',
    description: 'Logo, font ve marka kılavuzu arşivi',
  },
]

/** Mail Taslakları */
export const MAIL_DRAFT_SECTIONS = [
  {
    id: 'odeme',
    title: 'Ödeme Hatırlatma',
    description: 'Geciken veya yaklaşan tahsilat için nazik hatırlatma metni.',
  },
  {
    id: 'teklif',
    title: 'Teklif Gönderimi',
    description: 'Teklif PDF eki ile birlikte gönderim taslağı.',
  },
  {
    id: 'toplanti',
    title: 'Toplantı Takibi',
    description: 'Toplantı sonrası özet ve sonraki adımlar.',
  },
  {
    id: 'revize',
    title: 'Revize Hatırlatma',
    description: 'Bekleyen revizyon veya onay için kısa takip maili.',
  },
]

/** Takvim Alanı bölümleri */
export const CALENDAR_AREA_SECTIONS = [
  { id: 'today', title: 'Bugünkü toplantılar' },
  { id: 'shoots', title: 'Yaklaşan çekimler' },
  { id: 'deliveries', title: 'Teslim tarihleri' },
  { id: 'reminders', title: 'Hatırlatmalar' },
]

export const GEMINI_HUB_NOTE =
  'Gemini API, Google ekosistemi içindeki alternatif analiz motoru olarak hazırlanıyor. Ana operatör OpenAI üzerinden çalışır.'

export const SUPABASE_PLAN_NOTE =
  'Kalıcı bulut veritabanı hazırlandığında müşteri, tahsilat, brief ve teklif verileri cihazlar arası senkronlanacak. Şimdilik veriler yalnızca bu cihazda (localStorage).'
