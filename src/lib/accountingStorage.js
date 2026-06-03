import { createId } from './id'
import { todayKey } from './dates'
import { PAYMENT_STATUS } from './constants'
import {
  EXPENSE_CATEGORIES,
  MONEY_ACCOUNTS,
  PAYABLE_STATUS,
  RECEIVABLE_STATUS,
} from './accountingConstants'

function isoNow() {
  return new Date().toISOString()
}

export function emptyAccountingShape() {
  return {
    receivables: [],
    payables: [],
    expenses: [],
    accounts: [],
    debts: [],
  }
}

function mapPaymentStatusToReceivable(status, dueDate) {
  const today = todayKey()
  if (status === PAYMENT_STATUS.PAID) return RECEIVABLE_STATUS.RECEIVED
  if (status === PAYMENT_STATUS.PARTIAL) return RECEIVABLE_STATUS.PARTIAL
  if (status === PAYMENT_STATUS.OVERDUE || (dueDate && dueDate < today)) {
    return RECEIVABLE_STATUS.OVERDUE
  }
  return RECEIVABLE_STATUS.WAITING
}

function paymentToReceivable(payment, clients) {
  const client = (clients ?? []).find((c) => c.id === payment.client_id)
  const now = isoNow()
  return {
    id: payment.id?.startsWith('recv_') ? payment.id : `recv_${payment.id}`,
    fromName: client?.name || payment.label || 'Müşteri',
    amount: Number(payment.amount) || 0,
    currency: 'TRY',
    dueDate: payment.due_date || todayKey(),
    status: mapPaymentStatusToReceivable(payment.status, payment.due_date),
    targetAccount: MONEY_ACCOUNTS.COMPANY,
    category: payment.label || 'Genel',
    note: payment.notes || '',
    reminderSent: Boolean(payment.reminder_sent),
    partialAmount: payment.status === PAYMENT_STATUS.PARTIAL ? Number(payment.amount) * 0.5 : 0,
    createdAt: payment.createdAt || now,
    updatedAt: now,
    isDemo: Boolean(payment.isDemo),
    legacyPaymentId: payment.id,
  }
}

/** Eski payments[] → accounting.receivables (bir kez) */
export function migratePaymentsToAccounting(data) {
  const next = { ...data }
  const accounting = {
    ...emptyAccountingShape(),
    ...(next.accounting || {}),
  }

  if (accounting._migratedFromPayments) {
    next.accounting = accounting
    return next
  }

  const existingIds = new Set(accounting.receivables.map((r) => r.legacyPaymentId || r.id))
  const fromPayments = (next.payments ?? [])
    .filter((p) => !existingIds.has(p.id))
    .map((p) => paymentToReceivable(p, next.clients))

  accounting.receivables = [...accounting.receivables, ...fromPayments]
  accounting._migratedFromPayments = true
  next.accounting = accounting
  return next
}

export function ensureAccountingData(data) {
  let next = { ...data }
  next.accounting = {
    ...emptyAccountingShape(),
    ...(next.accounting || {}),
  }
  next = migratePaymentsToAccounting(next)
  return next
}

function touch(record, patch) {
  return { ...record, ...patch, updatedAt: isoNow() }
}

function normalizeReceivable(input, existing) {
  const now = isoNow()
  return touch(
    {
      id: existing?.id || createId('recv'),
      fromName: String(input.fromName ?? '').trim(),
      amount: Number(input.amount) || 0,
      currency: input.currency || 'TRY',
      dueDate: input.dueDate || todayKey(),
      status: input.status || RECEIVABLE_STATUS.WAITING,
      targetAccount: input.targetAccount || MONEY_ACCOUNTS.COMPANY,
      category: String(input.category ?? '').trim() || 'Genel',
      note: String(input.note ?? '').trim(),
      reminderSent: Boolean(input.reminderSent),
      partialAmount: Number(input.partialAmount) || 0,
      createdAt: existing?.createdAt || now,
      isDemo: Boolean(input.isDemo),
      legacyPaymentId: existing?.legacyPaymentId,
    },
    {},
  )
}

function normalizePayable(input, existing) {
  const now = isoNow()
  return touch(
    {
      id: existing?.id || createId('payable'),
      toName: String(input.toName ?? '').trim(),
      amount: Number(input.amount) || 0,
      currency: input.currency || 'TRY',
      dueDate: input.dueDate || todayKey(),
      status: input.status || PAYABLE_STATUS.WAITING,
      sourceAccount: input.sourceAccount || MONEY_ACCOUNTS.COMPANY,
      category: String(input.category ?? '').trim() || 'Genel',
      note: String(input.note ?? '').trim(),
      hasInvoice: Boolean(input.hasInvoice),
      createdAt: existing?.createdAt || now,
      isDemo: Boolean(input.isDemo),
    },
    {},
  )
}

function normalizeExpense(input, existing) {
  const now = isoNow()
  return touch(
    {
      id: existing?.id || createId('exp'),
      title: String(input.title ?? input.name ?? '').trim(),
      amount: Number(input.amount) || 0,
      currency: input.currency || 'TRY',
      date: input.date || todayKey(),
      sourceAccount: input.sourceAccount || MONEY_ACCOUNTS.COMPANY,
      category: input.category || EXPENSE_CATEGORIES.OTHER,
      isCompanyExpense: Boolean(input.isCompanyExpense),
      hasReceipt: Boolean(input.hasReceipt),
      note: String(input.note ?? '').trim(),
      createdAt: existing?.createdAt || now,
      isDemo: Boolean(input.isDemo),
    },
    {},
  )
}

export function upsertReceivable(data, input, id) {
  const next = ensureAccountingData({ ...data })
  const list = [...next.accounting.receivables]
  const idx = id ? list.findIndex((r) => r.id === id) : -1
  const record = normalizeReceivable(input, idx >= 0 ? list[idx] : null)
  if (!record.fromName) return next
  if (idx >= 0) list[idx] = record
  else list.push(record)
  next.accounting = { ...next.accounting, receivables: list }
  return next
}

export function deleteReceivable(data, id) {
  const next = ensureAccountingData({ ...data })
  next.accounting = {
    ...next.accounting,
    receivables: next.accounting.receivables.filter((r) => r.id !== id),
  }
  return next
}

export function upsertPayable(data, input, id) {
  const next = ensureAccountingData({ ...data })
  const list = [...next.accounting.payables]
  const idx = id ? list.findIndex((r) => r.id === id) : -1
  const record = normalizePayable(input, idx >= 0 ? list[idx] : null)
  if (!record.toName) return next
  if (idx >= 0) list[idx] = record
  else list.push(record)
  next.accounting = { ...next.accounting, payables: list }
  return next
}

export function deletePayable(data, id) {
  const next = ensureAccountingData({ ...data })
  next.accounting = {
    ...next.accounting,
    payables: next.accounting.payables.filter((r) => r.id !== id),
  }
  return next
}

export function upsertExpense(data, input, id) {
  const next = ensureAccountingData({ ...data })
  const list = [...next.accounting.expenses]
  const idx = id ? list.findIndex((r) => r.id === id) : -1
  const record = normalizeExpense(input, idx >= 0 ? list[idx] : null)
  if (!record.title) return next
  if (idx >= 0) list[idx] = record
  else list.push(record)
  next.accounting = { ...next.accounting, expenses: list }
  return next
}

export function deleteExpense(data, id) {
  const next = ensureAccountingData({ ...data })
  next.accounting = {
    ...next.accounting,
    expenses: next.accounting.expenses.filter((r) => r.id !== id),
  }
  return next
}

export function markReceivableReceived(data, id, partialAmount) {
  const rec = data.accounting?.receivables?.find((r) => r.id === id)
  if (!rec) return data
  const isPartial = partialAmount != null && partialAmount > 0 && partialAmount < rec.amount
  return upsertReceivable(data, {
    ...rec,
    status: isPartial ? RECEIVABLE_STATUS.PARTIAL : RECEIVABLE_STATUS.RECEIVED,
    partialAmount: isPartial ? partialAmount : rec.amount,
  }, id)
}

export function markPayablePaid(data, id) {
  const rec = data.accounting?.payables?.find((r) => r.id === id)
  if (!rec) return data
  return upsertPayable(data, { ...rec, status: PAYABLE_STATUS.PAID }, id)
}

export function deferPayable(data, id) {
  const rec = data.accounting?.payables?.find((r) => r.id === id)
  if (!rec) return data
  return upsertPayable(data, { ...rec, status: PAYABLE_STATUS.DEFERRED }, id)
}

export function markReceivableReminderSent(data, id) {
  const rec = data.accounting?.receivables?.find((r) => r.id === id)
  if (!rec) return data
  return upsertReceivable(data, { ...rec, reminderSent: true }, id)
}

export function clearAccountingDemo(data) {
  const next = ensureAccountingData({ ...data })
  const strip = (arr) => arr.filter((r) => !r.isDemo)
  next.accounting = {
    ...next.accounting,
    receivables: strip(next.accounting.receivables),
    payables: strip(next.accounting.payables),
    expenses: strip(next.accounting.expenses),
  }
  return next
}
