/** Bağlantılar Merkezi — durum listesi (entegrasyon yok, yalnızca gösterim) */

export const CONNECTION_SERVICES = [
  {
    id: 'openai',
    title: 'OpenAI',
    glyph: 'AI',
    purpose: 'Daydream Operator ve metin üretimi',
    testable: true,
  },
  {
    id: 'google',
    title: 'Google',
    glyph: 'GO',
    purpose: 'OAuth ve Workspace ortam değişkenleri',
  },
  {
    id: 'drive',
    title: 'Drive',
    glyph: 'DR',
    purpose: 'Teklif PDF, call sheet, müşteri klasörleri',
  },
  {
    id: 'gmail',
    title: 'Gmail',
    glyph: 'GM',
    purpose: 'Teklif ve tahsilat mail taslakları',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    glyph: 'CL',
    purpose: 'Çekim, toplantı ve teslim tarihleri',
  },
  {
    id: 'sheets',
    title: 'Sheets',
    glyph: 'SH',
    purpose: 'Rapor ve finans tablosu yedekleme',
  },
  {
    id: 'gemini',
    title: 'Gemini',
    glyph: 'GE',
    purpose: 'Alternatif Google AI analizi',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    glyph: 'WA',
    purpose: 'Hatırlatma ve takip (deep link — ileride)',
  },
  {
    id: 'parasut',
    title: 'Paraşüt',
    glyph: 'PR',
    purpose: 'Fatura ve muhasebe eşleştirme',
  },
]

/** @deprecated alt ekranlar — ileride kullanılabilir */
export const HUB_MODULES = CONNECTION_SERVICES

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

export const CALENDAR_AREA_SECTIONS = [
  { id: 'today', title: 'Bugünkü toplantılar' },
  { id: 'shoots', title: 'Yaklaşan çekimler' },
  { id: 'deliveries', title: 'Teslim tarihleri' },
  { id: 'reminders', title: 'Hatırlatmalar' },
]

export const SUPABASE_PLAN_NOTE =
  'Kalıcı bulut veritabanı hazırlandığında müşteri, tahsilat, brief ve teklif verileri cihazlar arası senkronlanacak. Şimdilik veriler yalnızca bu cihazda (localStorage).'
