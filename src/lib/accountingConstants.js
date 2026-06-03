/** Muhasebe — durum, hesap ve kategori sabitleri */

export const ACCOUNTING_TABS = {
  RECEIVABLES: 'receivables',
  PAYABLES: 'payables',
  EXPENSES: 'expenses',
  ACCOUNTS: 'accounts',
}

export const RECEIVABLE_STATUS = {
  WAITING: 'waiting',
  RECEIVED: 'received',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
  CANCELLED: 'cancelled',
}

export const RECEIVABLE_STATUS_LABELS = {
  waiting: 'Bekliyor',
  received: 'Alındı',
  overdue: 'Gecikti',
  partial: 'Kısmi Alındı',
  cancelled: 'İptal',
}

export const PAYABLE_STATUS = {
  WAITING: 'waiting',
  PAID: 'paid',
  OVERDUE: 'overdue',
  DEFERRED: 'deferred',
  CANCELLED: 'cancelled',
}

export const PAYABLE_STATUS_LABELS = {
  waiting: 'Bekliyor',
  paid: 'Ödendi',
  overdue: 'Gecikti',
  deferred: 'Ertelendi',
  cancelled: 'İptal',
}

export const MONEY_ACCOUNTS = {
  COMPANY: 'company_account',
  PERSONAL: 'personal_account',
  COMPANY_CARD: 'company_card',
  PERSONAL_CARD: 'personal_card',
  CASH: 'cash',
  DEBT_BORROWED: 'debt_borrowed',
  FAMILY_SUPPORT: 'family_support',
  OTHER: 'other',
}

export const MONEY_ACCOUNT_LABELS = {
  company_account: 'Şirket Hesabı',
  personal_account: 'Şahsi Hesap',
  company_card: 'Şirket Kredi Kartı',
  personal_card: 'Şahsi Kart',
  cash: 'Nakit',
  debt_borrowed: 'Borç Alındı',
  family_support: 'Ortak / Aile Desteği',
  other: 'Diğer',
}

/** Alınacaklar — hedef hesap */
export const RECEIVABLE_ACCOUNT_OPTIONS = [
  MONEY_ACCOUNTS.COMPANY,
  MONEY_ACCOUNTS.PERSONAL,
  MONEY_ACCOUNTS.COMPANY_CARD,
  MONEY_ACCOUNTS.PERSONAL_CARD,
  MONEY_ACCOUNTS.CASH,
  MONEY_ACCOUNTS.OTHER,
]

/** Ödenecekler / harcamalar — kaynak hesap */
export const PAYABLE_SOURCE_OPTIONS = [
  MONEY_ACCOUNTS.COMPANY,
  MONEY_ACCOUNTS.COMPANY_CARD,
  MONEY_ACCOUNTS.PERSONAL_CARD,
  MONEY_ACCOUNTS.CASH,
  MONEY_ACCOUNTS.DEBT_BORROWED,
  MONEY_ACCOUNTS.FAMILY_SUPPORT,
  MONEY_ACCOUNTS.OTHER,
]

export const EXPENSE_CATEGORIES = {
  OFFICE: 'office',
  TEAM: 'team',
  PRODUCTION: 'production',
  TRANSPORT: 'transport',
  FOOD: 'food',
  EQUIPMENT: 'equipment',
  SOFTWARE: 'software',
  TAX: 'tax',
  OTHER: 'other',
}

export const EXPENSE_CATEGORY_LABELS = {
  office: 'Ofis',
  team: 'Ekip',
  production: 'Prodüksiyon',
  transport: 'Ulaşım',
  food: 'Yemek',
  equipment: 'Ekipman',
  software: 'Yazılım',
  tax: 'Vergi / Muhasebe',
  other: 'Diğer',
}

export const CURRENCIES = ['TRY', 'USD', 'EUR']
