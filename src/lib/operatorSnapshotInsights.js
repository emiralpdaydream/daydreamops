import { todayKey } from './dates'
import { formatTry } from './format'
import { getAccounting, getAccountingSummary } from './accountingSelectors'
import {
  PAYABLE_STATUS,
  RECEIVABLE_STATUS,
  RECEIVABLE_STATUS_LABELS,
} from './accountingConstants'
import { getTodayBriefRecord, getOpenBriefTasks } from './briefSelectors'
import { INVOICE_STATUS } from './invoiceConstants'
import { getActiveClients } from './selectors'

function isOpenReceivable(r) {
  return [
    RECEIVABLE_STATUS.WAITING,
    RECEIVABLE_STATUS.OVERDUE,
    RECEIVABLE_STATUS.PARTIAL,
  ].includes(r.status)
}

function daysFromToday(dateStr) {
  if (!dateStr) return null
  const today = new Date(`${todayKey()}T12:00:00`)
  const due = new Date(`${dateStr}T12:00:00`)
  if (Number.isNaN(due.getTime())) return null
  return Math.floor((today - due) / 86400000)
}

function sumExpensesInMonth(expenses, monthKey) {
  return (expenses ?? [])
    .filter((e) => e.date && String(e.date).startsWith(monthKey))
    .reduce((s, e) => s + (Number(e.amount) || 0), 0)
}

function countBrandProjectsThisWeek(data) {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const items = []
  for (const brand of data?.brands ?? []) {
    for (const p of brand.projects ?? []) {
      if (!p.date) continue
      const d = new Date(`${p.date}T12:00:00`)
      if (!Number.isNaN(d.getTime()) && d >= today && d <= weekEnd) {
        items.push({
          brand: brand.name,
          title: p.title,
          date: p.date,
        })
      }
    }
  }
  return items
}

function payablesDueWithinDays(payables, days) {
  const today = todayKey()
  const end = new Date(`${today}T12:00:00`)
  end.setDate(end.getDate() + days)
  const endKey = end.toISOString().slice(0, 10)
  return (payables ?? []).filter((p) => {
    if (p.status === PAYABLE_STATUS.PAID || p.status === PAYABLE_STATUS.CANCELLED) {
      return false
    }
    return p.dueDate && p.dueDate >= today && p.dueDate <= endKey
  })
}

/**
 * AI için önceden hesaplanmış yorum blokları — uydurma yerine gerçek sayılar.
 */
export function buildOperatorInsights(data) {
  const key = todayKey()
  const monthKey = key.slice(0, 7)
  const accounting = getAccounting(data)
  const accSummary = getAccountingSummary(data)
  const brief = getTodayBriefRecord(data)
  const openTasks = getOpenBriefTasks(brief)

  const openReceivables = accounting.receivables
    .filter(isOpenReceivable)
    .map((r) => {
      const daysLate = daysFromToday(r.dueDate)
      return {
        from: r.fromName,
        amount: r.amount,
        currency: r.currency || 'TRY',
        dueDate: r.dueDate,
        status: r.status,
        statusLabel: RECEIVABLE_STATUS_LABELS[r.status] || r.status,
        daysLate: daysLate != null && daysLate > 0 ? daysLate : 0,
        isOverdue: r.status === RECEIVABLE_STATUS.OVERDUE,
      }
    })
    .sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1
      return (b.daysLate || 0) - (a.daysLate || 0)
    })

  const collectTotal = openReceivables.reduce((s, r) => s + (Number(r.amount) || 0), 0)

  const expensesThisMonth = sumExpensesInMonth(accounting.expenses, monthKey)
  const expenseItemsThisMonth = (accounting.expenses ?? [])
    .filter((e) => e.date && String(e.date).startsWith(monthKey))
    .slice(0, 12)
    .map((e) => ({
      title: e.title,
      amount: e.amount,
      date: e.date,
      category: e.category,
    }))

  const overduePayables = accSummary.overduePayables.map((p) => ({
    to: p.toName,
    amount: p.amount,
    dueDate: p.dueDate,
    daysLate: daysFromToday(p.dueDate) || 0,
  }))

  const weekBrandProjects = countBrandProjectsThisWeek(data)

  const overdueInvoices = (data?.invoices ?? []).filter(
    (inv) => inv.status === INVOICE_STATUS.OVERDUE || inv.status === 'overdue',
  )

  const weeklyRisk = []

  for (const r of openReceivables.filter((x) => x.isOverdue).slice(0, 8)) {
    weeklyRisk.push({
      kind: 'overdue_receivable',
      summary: `Geciken alacak: ${r.from} ${formatTry(r.amount)} (${r.daysLate} gün)`,
      from: r.from,
      amount: r.amount,
      dueDate: r.dueDate,
    })
  }

  for (const p of overduePayables.slice(0, 5)) {
    weeklyRisk.push({
      kind: 'overdue_payable',
      summary: `Geciken ödeme: ${p.to} ${formatTry(p.amount)}`,
      to: p.to,
      amount: p.amount,
      dueDate: p.dueDate,
    })
  }

  if (openTasks.length >= 5) {
    weeklyRisk.push({
      kind: 'many_open_tasks',
      summary: `${openTasks.length} açık görev — odak dağınık olabilir`,
      count: openTasks.length,
    })
  }

  for (const bp of weekBrandProjects.slice(0, 4)) {
    weeklyRisk.push({
      kind: 'brand_delivery',
      summary: `Bu hafta teslim: ${bp.brand} — ${bp.title} (${bp.date})`,
      ...bp,
    })
  }

  for (const inv of overdueInvoices.slice(0, 3)) {
    weeklyRisk.push({
      kind: 'overdue_invoice',
      summary: `Geciken fatura: ${inv.partyName} ${formatTry(inv.totalAmount)}`,
      party: inv.partyName,
      amount: inv.totalAmount,
    })
  }

  const dueSoonPayables = payablesDueWithinDays(accounting.payables, 7)
  for (const p of dueSoonPayables.slice(0, 3)) {
    weeklyRisk.push({
      kind: 'payable_due_soon',
      summary: `Yaklaşan ödeme: ${p.toName} ${formatTry(p.amount)} (vade ${p.dueDate})`,
      to: p.toName,
      amount: p.amount,
      dueDate: p.dueDate,
    })
  }

  const todayFocusItems = []

  for (const r of openReceivables.filter((x) => x.isOverdue).slice(0, 3)) {
    todayFocusItems.push({
      priority: 1,
      type: 'tahsilat',
      text: `${r.from}: ${formatTry(r.amount)} tahsil et (${r.daysLate} gün gecikmiş)`,
    })
  }

  for (const t of openTasks.slice(0, 5)) {
    todayFocusItems.push({
      priority: 2,
      type: 'gorev',
      text: t.text,
      taskId: t.id,
    })
  }

  for (const r of openReceivables.filter((x) => !x.isOverdue).slice(0, 2)) {
    todayFocusItems.push({
      priority: 3,
      type: 'tahsilat',
      text: `${r.from}: ${formatTry(r.amount)} (vade ${r.dueDate || '—'})`,
    })
  }

  const focusSummary =
    todayFocusItems.length > 0
      ? todayFocusItems.map((i) => i.text).join('; ')
      : 'bu konuda kayıt yok — açık görev ve acil alacak yok'

  return {
    weeklyRisk,
    weeklyRiskSummary:
      weeklyRisk.length > 0
        ? weeklyRisk.map((r) => r.summary).join(' · ')
        : 'bu konuda kayıt yok',
    collectFrom: {
      totalCount: openReceivables.length,
      totalAmount: collectTotal,
      totalAmountLabel: formatTry(collectTotal),
      items: openReceivables.slice(0, 15),
      summary:
        openReceivables.length > 0
          ? openReceivables
              .slice(0, 6)
              .map((r) => `${r.from} ${formatTry(r.amount)} (${r.statusLabel})`)
              .join(' · ')
          : 'bu konuda kayıt yok',
    },
    spending: {
      month: monthKey,
      expensesThisMonth,
      expensesThisMonthLabel: formatTry(expensesThisMonth),
      expenseCountThisMonth: expenseItemsThisMonth.length,
      expensesAllTime: accSummary.expensesTotal,
      expensesAllTimeLabel: formatTry(accSummary.expensesTotal),
      topThisMonth: expenseItemsThisMonth,
      summary: `${monthKey} ayında ${formatTry(expensesThisMonth)} harcama (${expenseItemsThisMonth.length} kayıt)`,
    },
    todayFocus: {
      items: todayFocusItems,
      openTaskCount: openTasks.length,
      overdueReceivableCount: openReceivables.filter((x) => x.isOverdue).length,
      summary: focusSummary,
    },
    counts: {
      activeClients: getActiveClients(data?.clients ?? []).length,
      openProposals: (data?.proposals ?? []).length,
      openReceivables: openReceivables.length,
      overdueReceivables: openReceivables.filter((x) => x.isOverdue).length,
    },
  }
}
