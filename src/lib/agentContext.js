import { formatTry } from './format'
import { getTodayBriefRecord, getOpenBriefTasks } from './briefSelectors'
import { getDashboardStats, getOverduePayments } from './selectors'
import { todayKey } from './dates'

/** Agent'a gönderilecek operasyon özeti (PII minimal, localStorage verisi) */
export function buildOpsContextForAgent(data) {
  const stats = getDashboardStats(data)
  const overdue = getOverduePayments(data, 5)
  const brief = getTodayBriefRecord(data)
  const note = brief.notes?.trim() || '—'
  const openTasks = getOpenBriefTasks(brief)
  const priorities =
    openTasks.map((t) => t.text).join(' · ') || '—'

  const overdueLines =
    overdue.length > 0
      ? overdue
          .map((o) => `${o.client}: ${formatTry(o.amount)}, ${o.daysLate} gün gecikmiş`)
          .join('\n')
      : '—'

  return [
    `Tarih: ${todayKey()}`,
    `Günlük not: ${note.slice(0, 600)}`,
    `Açık görevler: ${priorities}`,
    `Brief: ${stats.briefSummary}`,
    `Aktif müşteri: ${stats.activeClients}`,
    `Gecikmiş toplam: ${formatTry(stats.overdueAmount)}`,
    `Bekleyen toplam: ${formatTry(stats.pendingAmount)}`,
    `Görevler: ${stats.briefDone}/${stats.briefTotal} tamamlandı, ${stats.briefOpen} açık`,
    `Gecikmiş kalemler:\n${overdueLines}`,
  ].join('\n')
}
