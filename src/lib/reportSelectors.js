import { PAYMENT_STATUS } from './constants'
import { getTodayBriefRecord } from './briefSelectors'
import { getActiveClients } from './selectors'

export function getExecutiveReport(data) {
  const clients = getActiveClients(data.clients ?? [])
  const payments = data.payments ?? []
  const proposals = data.proposals ?? []
  const brief = getTodayBriefRecord(data)
  const tasks = brief.tasks ?? []

  const open = payments.filter((p) => p.status !== PAYMENT_STATUS.PAID)
  const overdue = open.filter((p) => p.status === PAYMENT_STATUS.OVERDUE)
  const collected = payments.filter((p) => p.status === PAYMENT_STATUS.PAID)

  const pendingTotal = open
    .filter((p) => p.status !== PAYMENT_STATUS.OVERDUE)
    .reduce((s, p) => s + (p.amount || 0), 0)
  const overdueTotal = overdue.reduce((s, p) => s + (p.amount || 0), 0)
  const collectedTotal = collected.reduce((s, p) => s + (p.amount || 0), 0)

  const fees = clients.map((c) => c.agreed_price || c.monthly_fee || 0).filter(Boolean)
  const avgClient =
    fees.length > 0 ? Math.round(fees.reduce((a, b) => a + b, 0) / fees.length) : 0

  const openProposals = proposals.length
  const doneTodos = tasks.filter((t) => t.done).length
  const pendingTodos = tasks.filter((t) => !t.done).length

  const hasData =
    clients.length > 0 ||
    payments.length > 0 ||
    proposals.length > 0 ||
    tasks.length > 0 ||
    Boolean(brief.notes?.trim())

  return {
    hasData,
    finance: {
      pendingTotal,
      collectedTotal,
      overdueTotal,
      avgClient,
    },
    ops: {
      activeClients: clients.length,
      openProposals,
      completedTasks: doneTodos,
      pendingTasks: pendingTodos,
      riskPayments: overdue.length,
    },
  }
}
