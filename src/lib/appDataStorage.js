import { createId } from './id'
import { calcInvoiceVat } from './invoiceConstants'
import { todayKey } from './dates'

function isoNow() {
  return new Date().toISOString()
}

function touch(record, patch) {
  return { ...record, ...patch, updatedAt: isoNow() }
}

export function ensureAppData(data) {
  const next = { ...data }
  next.vaultAccounts = Array.isArray(next.vaultAccounts) ? next.vaultAccounts : []
  next.invoices = Array.isArray(next.invoices) ? next.invoices : []
  next.whatsappDrafts = Array.isArray(next.whatsappDrafts)
    ? next.whatsappDrafts
    : []
  next.integrationNotes = Array.isArray(next.integrationNotes)
    ? next.integrationNotes
    : []
  return next
}

function normalizeVault(input, existing) {
  const now = isoNow()
  return touch(
    {
      id: existing?.id || createId('vault'),
      serviceName: String(input.serviceName ?? '').trim(),
      email: String(input.email ?? '').trim(),
      username: String(input.username ?? '').trim(),
      passwordNote: String(input.passwordNote ?? '').trim(),
      subscriptionType: input.subscriptionType || 'monthly',
      feeAmount: Number(input.feeAmount) || 0,
      feeCurrency: input.feeCurrency || 'TRY',
      paymentMethod: String(input.paymentMethod ?? '').trim(),
      renewalDate: input.renewalDate || '',
      linkUrl: String(input.linkUrl ?? '').trim(),
      notes: String(input.notes ?? '').trim(),
      createdAt: existing?.createdAt || now,
      isDemo: Boolean(input.isDemo),
    },
    {},
  )
}

function normalizeInvoice(input, existing) {
  const now = isoNow()
  const vatRate = Number(input.vatRate ?? existing?.vatRate ?? 20)
  const { amount, vatAmount, total } = calcInvoiceVat(
    input.amount ?? existing?.amount,
    vatRate,
  )
  return touch(
    {
      id: existing?.id || createId('inv'),
      invoiceType: input.invoiceType || 'sales',
      partyName: String(input.partyName ?? '').trim(),
      invoiceNo: String(input.invoiceNo ?? '').trim(),
      amount,
      vatRate,
      vatAmount,
      totalAmount: total,
      issueDate: input.issueDate || todayKey(),
      dueDate: input.dueDate || '',
      status: input.status || 'draft',
      parasutStatus: input.parasutStatus || 'unmatched',
      pdfUrl: String(input.pdfUrl ?? '').trim(),
      note: String(input.note ?? '').trim(),
      createdAt: existing?.createdAt || now,
      isDemo: Boolean(input.isDemo),
    },
    {},
  )
}

function normalizeWhatsAppDraft(input, existing) {
  const now = isoNow()
  return touch(
    {
      id: existing?.id || createId('wa'),
      text: String(input.text ?? '').trim(),
      phone: String(input.phone ?? '').trim(),
      clientName: String(input.clientName ?? '').trim(),
      purpose: String(input.purpose ?? '').trim(),
      createdAt: existing?.createdAt || now,
    },
    {},
  )
}

function normalizeIntegrationNote(input, existing) {
  const now = isoNow()
  return touch(
    {
      id: existing?.id || createId('int'),
      serviceId: String(input.serviceId ?? '').trim(),
      title: String(input.title ?? '').trim(),
      body: String(input.body ?? '').trim(),
      createdAt: existing?.createdAt || now,
    },
    {},
  )
}

export function upsertVaultAccount(data, input, id) {
  const next = ensureAppData({ ...data })
  const idx = id ? next.vaultAccounts.findIndex((v) => v.id === id) : -1
  const existing = idx >= 0 ? next.vaultAccounts[idx] : null
  const record = normalizeVault(input, existing)
  if (idx >= 0) next.vaultAccounts[idx] = record
  else next.vaultAccounts.unshift(record)
  return next
}

export function deleteVaultAccount(data, id) {
  const next = ensureAppData({ ...data })
  next.vaultAccounts = next.vaultAccounts.filter((v) => v.id !== id)
  return next
}

export function upsertInvoice(data, input, id) {
  const next = ensureAppData({ ...data })
  const idx = id ? next.invoices.findIndex((v) => v.id === id) : -1
  const existing = idx >= 0 ? next.invoices[idx] : null
  const record = normalizeInvoice(input, existing)
  if (idx >= 0) next.invoices[idx] = record
  else next.invoices.unshift(record)
  return next
}

export function deleteInvoice(data, id) {
  const next = ensureAppData({ ...data })
  next.invoices = next.invoices.filter((v) => v.id !== id)
  return next
}

export function markInvoicePaid(data, id) {
  const next = ensureAppData({ ...data })
  next.invoices = next.invoices.map((inv) =>
    inv.id === id
      ? touch(inv, { status: 'paid', parasutStatus: inv.parasutStatus })
      : inv,
  )
  return next
}

/** Paraşüt entegrasyonu yok — yalnızca durumu "Hazırlanıyor" yapar */
export function prepareInvoiceParasut(data, id) {
  const next = ensureAppData({ ...data })
  next.invoices = next.invoices.map((inv) =>
    inv.id === id ? touch(inv, { parasutStatus: 'preparing' }) : inv,
  )
  return next
}

export function upsertWhatsAppDraft(data, input, id) {
  const next = ensureAppData({ ...data })
  const idx = id ? next.whatsappDrafts.findIndex((v) => v.id === id) : -1
  const existing = idx >= 0 ? next.whatsappDrafts[idx] : null
  const record = normalizeWhatsAppDraft(input, existing)
  if (idx >= 0) next.whatsappDrafts[idx] = record
  else next.whatsappDrafts.unshift(record)
  return next
}

export function deleteWhatsAppDraft(data, id) {
  const next = ensureAppData({ ...data })
  next.whatsappDrafts = next.whatsappDrafts.filter((v) => v.id !== id)
  return next
}

export function upsertIntegrationNote(data, input, id) {
  const next = ensureAppData({ ...data })
  const idx = id ? next.integrationNotes.findIndex((v) => v.id === id) : -1
  const existing = idx >= 0 ? next.integrationNotes[idx] : null
  const record = normalizeIntegrationNote(input, existing)
  if (idx >= 0) next.integrationNotes[idx] = record
  else next.integrationNotes.unshift(record)
  return next
}

export function deleteIntegrationNote(data, id) {
  const next = ensureAppData({ ...data })
  next.integrationNotes = next.integrationNotes.filter((n) => n.id !== id)
  return next
}
