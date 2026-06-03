import { todayKey } from './dates'
import { formatTry } from './format'
import { getTodayBriefRecord, getOpenBriefTasks } from './briefSelectors'
import { getExecutiveReport } from './reportSelectors'
import { getActiveClients, getOverduePayments } from './selectors'

/** Operatöre giden kırpılmış özet — ham localStorage değil */
export function buildDataSnapshot(data) {
  const key = todayKey()
  const clients = getActiveClients(data?.clients ?? [])
  const brief = getTodayBriefRecord(data)
  const openTasks = getOpenBriefTasks(brief)
  const overdue = getOverduePayments(data, 8)
  const proposals = (data?.proposals ?? []).slice(-6)
  const report = getExecutiveReport(data)

  return {
    date: key,
    clients: clients.slice(0, 24).map((c) => ({
      name: c.name,
      service: c.service_type,
      paymentStatus: c.payment_status,
      dueDate: c.due_date,
      fee: c.monthly_fee || c.agreed_price || 0,
    })),
    overduePayments: overdue.map((o) => ({
      client: o.client,
      amount: o.amount,
      daysLate: o.daysLate,
      label: o.label,
    })),
    openTasks: openTasks.slice(0, 20).map((t) => ({
      id: t.id,
      text: t.text,
    })),
    brief: {
      openCount: openTasks.length,
      totalCount: (brief.tasks ?? []).length,
      doneCount: (brief.tasks ?? []).filter((t) => t.done).length,
      notes: (brief.notes ?? '').slice(0, 600),
      tasks: (brief.tasks ?? []).slice(0, 15).map((t) => ({
        text: t.text,
        done: t.done,
      })),
    },
    proposals: proposals.map((p) => ({
      client: p.client_name,
      type: p.project_type,
      date: p.date,
      budget: p.budget,
      hasText: Boolean(p.generated_text?.trim()),
    })),
    report: {
      activeClients: report.ops.activeClients,
      openProposals: report.ops.openProposals,
      pendingTasks: report.ops.pendingTasks,
      overdueTotal: report.finance.overdueTotal,
      pendingTotal: report.finance.pendingTotal,
      collectedTotal: report.finance.collectedTotal,
      riskPayments: report.ops.riskPayments,
      overdueTotalLabel: formatTry(report.finance.overdueTotal),
      pendingTotalLabel: formatTry(report.finance.pendingTotal),
    },
  }
}
