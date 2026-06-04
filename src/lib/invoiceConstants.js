export const ACCOUNTING_TABS_INVOICES = 'invoices'

export const INVOICE_TYPES = {
  SALES: 'sales',
  EXPENSE: 'expense',
  FREELANCE: 'freelance',
  PROFORMA: 'proforma',
  OTHER: 'other',
}

export const INVOICE_TYPE_LABELS = {
  sales: 'Satış faturası',
  expense: 'Gider faturası',
  freelance: 'Serbest meslek makbuzu',
  proforma: 'Proforma',
  other: 'Diğer',
}

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
}

export const INVOICE_STATUS_LABELS = {
  draft: 'Taslak',
  issued: 'Kesildi',
  sent: 'Gönderildi',
  paid: 'Ödendi',
  overdue: 'Gecikti',
  cancelled: 'İptal',
}

export const PARASUT_STATUS = {
  UNMATCHED: 'unmatched',
  PREPARING: 'preparing',
  MATCHED: 'matched',
  ERROR: 'error',
}

export const PARASUT_STATUS_LABELS = {
  unmatched: 'Eşleşmedi',
  preparing: 'Hazırlanıyor',
  matched: 'Eşleşti',
  error: 'Hata',
}

export const VAT_RATES = [0, 1, 10, 20]

/**
 * matrah × (oran / 100), 2 ondalık; toplam = matrah + KDV
 * Örnek: 10.000 × %20 → KDV 2.000 → toplam 12.000
 */
export function calcInvoiceVat(amount, vatRate) {
  const base = Math.round((Number(amount) || 0) * 100) / 100
  const rate = Number(vatRate) || 0
  const vatAmount = Math.round(base * (rate / 100) * 100) / 100
  const total = Math.round((base + vatAmount) * 100) / 100
  return { amount: base, vatAmount, total }
}
