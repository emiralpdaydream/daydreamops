import { RECEIVABLE_STATUS } from './accountingConstants'
import { getAccounting } from './accountingSelectors'
import { getOpenBriefTasks, getTodayTasks } from './briefSelectors'
import { INVOICE_STATUS_LABELS } from './invoiceConstants'
import { getActiveClients } from './selectors'
import { formatDateTr } from './dates'

function parseTs(value) {
  if (!value) return 0
  const t = new Date(value).getTime()
  return Number.isNaN(t) ? 0 : t
}

/** Takvim/çekim modülü yok — yalnızca marka projelerinde bu hafta tarihi varsa say */
function countBrandDatesThisWeek(data) {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)
  let count = 0
  let hasAnyDate = false
  for (const brand of data.brands ?? []) {
    for (const p of brand.projects ?? []) {
      if (!p.date) continue
      hasAnyDate = true
      const d = new Date(`${p.date}T12:00:00`)
      if (!Number.isNaN(d.getTime()) && d >= today && d <= weekEnd) {
        count += 1
      }
    }
  }
  return { count, hasShootCalendar: false, hasBrandWeekDates: hasAnyDate }
}

export function getCeoDaySummary(data) {
  const openTasks = getOpenBriefTasks({ tasks: getTodayTasks(data) })
  const accounting = getAccounting(data)
  const overdueReceivableCount = accounting.receivables.filter(
    (r) => r.status === RECEIVABLE_STATUS.OVERDUE,
  ).length
  const pendingProposals = (data.proposals ?? []).length
  const shootInfo = countBrandDatesThisWeek(data)

  return {
    openTaskCount: openTasks.length,
    overdueReceivableCount,
    shootsThisWeek: shootInfo.hasShootCalendar
      ? shootInfo.count
      : null,
    shootsLabel: shootInfo.hasShootCalendar
      ? String(shootInfo.count)
      : '—',
    pendingProposalCount: pendingProposals,
    recentInvoices: getRecentInvoices(data, 3),
  }
}

export function getRecentInvoices(data, limit = 3) {
  return [...(data.invoices ?? [])]
    .sort((a, b) => parseTs(b.createdAt) - parseTs(a.createdAt))
    .slice(0, limit)
    .map((inv) => ({
      id: inv.id,
      partyName: inv.partyName,
      totalAmount: inv.totalAmount,
      status: INVOICE_STATUS_LABELS[inv.status] || inv.status,
      issueDate: inv.issueDate,
    }))
}

const ACTIVITY_LABELS = {
  task: 'Yeni görev',
  expense: 'Yeni harcama',
  client: 'Yeni müşteri',
  invoice: 'Yeni fatura',
}

export function getRecentActivities(data, limit = 8) {
  const items = []

  const tasks = getTodayTasks(data)
  for (let i = tasks.length - 1; i >= 0 && items.filter((x) => x.type === 'task').length < 3; i--) {
    const t = tasks[i]
    items.push({
      id: `task-${t.id}`,
      type: 'task',
      label: ACTIVITY_LABELS.task,
      detail: t.text,
      at: null,
      sortKey: i,
    })
  }

  for (const e of data.accounting?.expenses ?? []) {
    items.push({
      id: `exp-${e.id}`,
      type: 'expense',
      label: ACTIVITY_LABELS.expense,
      detail: e.title,
      at: e.createdAt || e.date,
      sortKey: 0,
    })
  }

  for (const c of getActiveClients(data.clients ?? [])) {
    items.push({
      id: `cli-${c.id}`,
      type: 'client',
      label: ACTIVITY_LABELS.client,
      detail: c.name,
      at: c.created_at,
      sortKey: 0,
    })
  }

  for (const inv of data.invoices ?? []) {
    items.push({
      id: `inv-${inv.id}`,
      type: 'invoice',
      label: ACTIVITY_LABELS.invoice,
      detail: `${inv.partyName} · ${INVOICE_STATUS_LABELS[inv.status] || inv.status}`,
      at: inv.createdAt || inv.issueDate,
      sortKey: 0,
    })
  }

  return items
    .sort((a, b) => {
      const ta = parseTs(a.at)
      const tb = parseTs(b.at)
      if (ta && tb) return tb - ta
      if (ta) return -1
      if (tb) return 1
      return (b.sortKey ?? 0) - (a.sortKey ?? 0)
    })
    .slice(0, limit)
    .map((item) => ({
      ...item,
      timeLabel: item.at ? formatDateTr(String(item.at).slice(0, 10)) : 'Bugün',
    }))
}
