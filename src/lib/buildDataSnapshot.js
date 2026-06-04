import { todayKey } from './dates'
import { formatTry } from './format'
import { getAccounting, getAccountingSummary } from './accountingSelectors'
import { getTodayBriefRecord, getOpenBriefTasks } from './briefSelectors'
import { getExecutiveReport } from './reportSelectors'
import { getActiveClients } from './selectors'
import { maskPasswordNote } from './maskSensitive'
import { INVOICE_STATUS_LABELS, INVOICE_TYPE_LABELS } from './invoiceConstants'
import { buildOperatorInsights } from './operatorSnapshotInsights'

function vaultSummary(accounts) {
  const now = todayKey()
  const month = now.slice(0, 7)
  return (accounts ?? []).slice(0, 30).map((v) => ({
    serviceName: v.serviceName,
    email: v.email,
    username: v.username,
    passwordNote: maskPasswordNote(v.passwordNote),
    subscriptionType: v.subscriptionType,
    feeAmount: v.feeAmount,
    feeCurrency: v.feeCurrency,
    renewalDate: v.renewalDate,
    renewsThisMonth: Boolean(
      v.renewalDate && v.renewalDate.startsWith(month),
    ),
  }))
}

function invoiceSummary(invoices) {
  return (invoices ?? []).slice(0, 20).map((inv) => ({
    type: INVOICE_TYPE_LABELS[inv.invoiceType] || inv.invoiceType,
    party: inv.partyName,
    invoiceNo: inv.invoiceNo,
    total: inv.totalAmount,
    status: INVOICE_STATUS_LABELS[inv.status] || inv.status,
    dueDate: inv.dueDate,
    parasutStatus: inv.parasutStatus,
  }))
}

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
  const vault = data?.vaultAccounts ?? []
  const invoices = data?.invoices ?? []
  const waDrafts = data?.whatsappDrafts ?? []
  const intNotes = data?.integrationNotes ?? []
  const monthKey = key.slice(0, 7)
  const expensesThisMonth = accounting.expenses
    .filter((e) => e.date && String(e.date).startsWith(monthKey))
    .reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const insights = buildOperatorInsights(data)

  return {
    date: key,
    insights,
    clients: clients.slice(0, 24).map((c) => ({
      name: c.name,
      service: c.service_type,
      paymentStatus: c.payment_status,
      dueDate: c.due_date,
      fee: c.monthly_fee || c.agreed_price || 0,
      phone: c.phone || '',
      email: c.email || c.contact || '',
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
        expensesThisMonth,
        expensesThisMonthLabel: formatTry(expensesThisMonth),
        netCashFlow: accSummary.netCashFlow,
        attentionCount: accSummary.attentionCount,
        overdueReceivableCount: accSummary.overdueReceivables.length,
        overduePayableCount: accSummary.overduePayables.length,
        pendingReceivablesLabel: formatTry(accSummary.pendingReceivables),
        pendingPayablesLabel: formatTry(accSummary.pendingPayables),
        expensesTotalLabel: formatTry(accSummary.expensesTotal),
        netCashFlowLabel: formatTry(accSummary.netCashFlow),
        invoiceCount: invoices.length,
      },
      overdueReceivables: accSummary.overdueReceivables.slice(0, 10).map((r) => ({
        from: r.fromName,
        amount: r.amount,
        dueDate: r.dueDate,
      })),
    },
    vaultAccounts: vaultSummary(vault),
    invoices: invoiceSummary(invoices),
    whatsappDrafts: waDrafts.slice(0, 8).map((d) => ({
      purpose: d.purpose,
      clientName: d.clientName,
      preview: d.text.slice(0, 120),
    })),
    integrationNotes: intNotes.slice(0, 12).map((n) => ({
      serviceId: n.serviceId,
      title: n.title,
      body: n.body.slice(0, 200),
    })),
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
      note: 'Bağlantı durumları Ayarlar > Bağlantılar Merkezi. Şifre notları kasada maskelidir; ham şifre paylaşılmaz.',
      vaultServiceCount: vault.length,
      parasutReady: invoices.some((i) => i.parasutStatus === 'matched'),
    },
    securityNote:
      'passwordNote alanları yalnızca maskeli (••••••). Kullanıcı şifre isterse hassas bilgi uyarısı ver; ham değer yok.',
  }
}
