import { todayKey } from './dates'
import { formatTry } from './format'
import { getAccounting, getAccountingSummary } from './accountingSelectors'
import { getTodayBriefRecord, getOpenBriefTasks } from './briefSelectors'
import { getExecutiveReport } from './reportSelectors'
import { getActiveClients } from './selectors'

/** AI Asistan — kırpılmış operasyon özeti */
export function buildDataSnapshot(data) {
  const key = todayKey()
  const clients = getActiveClients(data?.clients ?? [])
  const brief = getTodayBriefRecord(data)
  const openTasks = getOpenBriefTasks(brief)
  const doneTasks = (brief.tasks ?? []).filter((t) => t.done)
  const accounting = getAccounting(data)
  const accSummary = getAccountingSummary(data)
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
    openTasks: openTasks.slice(0, 20).map((t) => ({
      id: t.id,
      text: t.text,
    })),
    completedTasks: doneTasks.slice(0, 15).map((t) => ({
      text: t.text,
    })),
    brief: {
      openCount: openTasks.length,
      totalCount: (brief.tasks ?? []).length,
      doneCount: doneTasks.length,
      notes: (brief.notes ?? '').slice(0, 600),
      tasks: (brief.tasks ?? []).slice(0, 15).map((t) => ({
        text: t.text,
        done: t.done,
      })),
    },
    accounting: {
      receivables: accounting.receivables.slice(0, 20).map((r) => ({
        from: r.fromName,
        amount: r.amount,
        currency: r.currency,
        dueDate: r.dueDate,
        status: r.status,
        account: r.targetAccount,
      })),
      payables: accounting.payables.slice(0, 20).map((p) => ({
        to: p.toName,
        amount: p.amount,
        dueDate: p.dueDate,
        status: p.status,
        account: p.sourceAccount,
      })),
      expenses: accounting.expenses.slice(0, 15).map((e) => ({
        title: e.title,
        amount: e.amount,
        date: e.date,
        category: e.category,
        source: e.sourceAccount,
      })),
      summary: {
        pendingReceivables: accSummary.pendingReceivables,
        pendingPayables: accSummary.pendingPayables,
        expensesTotal: accSummary.expensesTotal,
        netCashFlow: accSummary.netCashFlow,
        attentionCount: accSummary.attentionCount,
        pendingReceivablesLabel: formatTry(accSummary.pendingReceivables),
        pendingPayablesLabel: formatTry(accSummary.pendingPayables),
        netCashFlowLabel: formatTry(accSummary.netCashFlow),
      },
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
      riskPayments: report.ops.riskPayments,
    },
    integrations: {
      note: 'Bağlantı durumları Ayarlar > Bağlantılar Merkezi üzerinden; OpenAI ve Gmail ayrı test edilir.',
    },
  }
}
