import { todayKey } from './dates'
import {
  MONEY_ACCOUNT_LABELS,
  MONEY_ACCOUNTS,
  PAYABLE_STATUS,
  RECEIVABLE_STATUS,
} from './accountingConstants'

function sumAmount(items, filterFn) {
  return items.filter(filterFn).reduce((s, r) => s + (Number(r.amount) || 0), 0)
}

function isOpenReceivable(r) {
  return [RECEIVABLE_STATUS.WAITING, RECEIVABLE_STATUS.OVERDUE, RECEIVABLE_STATUS.PARTIAL].includes(
    r.status,
  )
}

function isOpenPayable(p) {
  return [PAYABLE_STATUS.WAITING, PAYABLE_STATUS.OVERDUE, PAYABLE_STATUS.DEFERRED].includes(
    p.status,
  )
}

function syncReceivableOverdue(receivables) {
  const today = todayKey()
  return receivables.map((r) => {
    if (
      r.status === RECEIVABLE_STATUS.WAITING &&
      r.dueDate &&
      r.dueDate < today
    ) {
      return { ...r, status: RECEIVABLE_STATUS.OVERDUE }
    }
    return r
  })
}

export function getAccounting(data) {
  const raw = data?.accounting ?? {}
  return {
    receivables: syncReceivableOverdue(raw.receivables ?? []),
    payables: raw.payables ?? [],
    expenses: raw.expenses ?? [],
    accounts: raw.accounts ?? [],
    debts: raw.debts ?? [],
  }
}

export function getAccountingSummary(data) {
  const { receivables, payables, expenses } = getAccounting(data)

  const pendingReceivables = sumAmount(receivables, isOpenReceivable)
  const pendingPayables = sumAmount(payables, isOpenPayable)
  const expensesTotal = sumAmount(expenses, () => true)
  const netCashFlow = pendingReceivables - pendingPayables - expensesTotal

  const overdueReceivables = receivables.filter(
    (r) => r.status === RECEIVABLE_STATUS.OVERDUE,
  )
  const overduePayables = payables.filter((p) => p.status === PAYABLE_STATUS.OVERDUE)
  const attentionCount = overdueReceivables.length + overduePayables.length

  return {
    pendingReceivables,
    pendingPayables,
    expensesTotal,
    netCashFlow,
    attentionCount,
    overdueReceivables,
    overduePayables,
    receivablesCount: receivables.length,
    payablesCount: payables.length,
    expensesCount: expenses.length,
  }
}

/** Hesaplar sekmesi — kaynak bazlı harcama özeti */
export function getAccountSourceTotals(data) {
  const { receivables, payables, expenses } = getAccounting(data)
  const totals = {}

  const add = (key, amount) => {
    if (!key) return
    totals[key] = (totals[key] || 0) + (Number(amount) || 0)
  }

  for (const e of expenses) {
    add(e.sourceAccount, e.amount)
  }
  for (const p of payables) {
    if (p.status === PAYABLE_STATUS.PAID) add(p.sourceAccount, p.amount)
  }

  const companySpent =
    (totals[MONEY_ACCOUNTS.COMPANY] || 0) +
    (totals[MONEY_ACCOUNTS.COMPANY_CARD] || 0)
  const personalSpent =
    (totals[MONEY_ACCOUNTS.PERSONAL_CARD] || 0) +
    (totals[MONEY_ACCOUNTS.CASH] || 0) +
    (totals[MONEY_ACCOUNTS.PERSONAL] || 0)
  const debtBorrowed = totals[MONEY_ACCOUNTS.DEBT_BORROWED] || 0
  const familySupport = totals[MONEY_ACCOUNTS.FAMILY_SUPPORT] || 0

  const debtLent = sumAmount(
    receivables,
    (r) => r.status === RECEIVABLE_STATUS.RECEIVED,
  )

  const summary = getAccountingSummary(data)

  const sourceList = Object.keys(MONEY_ACCOUNT_LABELS).map((key) => ({
    id: key,
    label: MONEY_ACCOUNT_LABELS[key],
    total: totals[key] || 0,
  }))

  return {
    companyAccountSpent: totals[MONEY_ACCOUNTS.COMPANY] || 0,
    companyCardSpent: totals[MONEY_ACCOUNTS.COMPANY_CARD] || 0,
    personalCardSpent: totals[MONEY_ACCOUNTS.PERSONAL_CARD] || 0,
    personalCashSpent:
      (totals[MONEY_ACCOUNTS.CASH] || 0) + (totals[MONEY_ACCOUNTS.PERSONAL] || 0),
    debtBorrowedTotal: debtBorrowed,
    debtLentTotal: debtLent,
    pendingReceivables: summary.pendingReceivables,
    pendingPayables: summary.pendingPayables,
    netCashFlow: summary.netCashFlow,
    companySpent,
    personalSpent,
    familySupport,
    sourceList: sourceList.filter((s) => s.total > 0 || s.id !== MONEY_ACCOUNTS.OTHER),
    allSources: sourceList,
  }
}
