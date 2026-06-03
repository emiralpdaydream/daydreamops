import { useState } from 'react'
import { SCREENS } from '../lib/constants'
import { formatTry } from '../lib/format'
import { useOps } from '../lib/useOps'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import {
  getDashboardStats,
  getOverduePayments,
} from '../lib/selectors'
import DataCell from '../components/DataCell'
import FocusCard from '../components/FocusCard'
import PageHeader from '../components/PageHeader'
import ReminderModal from '../components/ReminderModal'
import BrandBackdrop from '../components/BrandBackdrop'
import OperatorDashboardCard from '../components/OperatorDashboardCard'

const intro = SCREEN_INTRO.dashboard

export default function DashboardView({ onNavigate }) {
  const { data, markReminderSent } = useOps()
  const stats = getDashboardStats(data)
  const overdue = getOverduePayments(data)
  const [reminder, setReminder] = useState(null)

  const dateLabel = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <main className="page-main page-main--dashboard">
      <BrandBackdrop variant="dashboard" className="dashboard-hero-glow" />
      <PageHeader
        chapter={`${intro.chapter} · ${dateLabel}`}
        title={intro.title}
        purpose={intro.purpose}
      />

      <div className="dashboard-stagger section-gap">
      <OperatorDashboardCard />
      <div className="dashboard-grid">
        <FocusCard
          title="Bugünkü görevler"
          meta={
            stats.briefTotal === 0
              ? 'Brief boş'
              : stats.briefOpen > 0
                ? `${stats.briefOpen} açık · ${stats.briefSummary}`
                : stats.briefSummary
          }
          className="dashboard-focus"
        >
          {stats.briefTotal === 0 ? (
            <div>
              <p className="font-display text-2xl font-medium italic text-dim">
                Henüz görev eklenmedi.
              </p>
              <button
                type="button"
                onClick={() => onNavigate(SCREENS.TODAY)}
                className="btn-ghost mt-8"
              >
                Brief →
              </button>
            </div>
          ) : stats.todayBriefOpen.length === 0 ? (
            <div>
              <p className="font-display text-2xl font-medium text-text">
                Tüm görevler tamamlandı
              </p>
              <p className="mt-2 text-sm text-dim">{stats.briefSummary}</p>
              <button
                type="button"
                onClick={() => onNavigate(SCREENS.TODAY)}
                className="btn-ghost mt-8"
              >
                Brief →
              </button>
            </div>
          ) : (
            <ol>
              {stats.todayBriefOpen.map((item, i) => (
                <li key={item.id} className="priority-line">
                  <span className="priority-index">{i + 1}.</span>
                  <span className="min-w-0 flex-1 text-[15px] leading-relaxed text-text">
                    {item.text}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </FocusCard>

        <div className="dashboard-aside space-y-8">
          {overdue.length > 0 && (
            <FocusCard title="Tahsilat" meta="Acil dikkat">
              <ul>
                {overdue.slice(0, 3).map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-2 border-b border-border py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-text">
                        {item.client}
                      </p>
                      <p className="mt-1 text-xs signal-wine">
                        {item.daysLate} gün gecikmiş
                      </p>
                    </div>
                    <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-4">
                      <p className="font-display text-lg font-medium tabular-nums">
                        {formatTry(item.amount)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setReminder(item)}
                        className="btn-ghost shrink-0"
                      >
                        Hatırlat
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onNavigate(SCREENS.TAHSILAT)}
                className="btn-ghost mt-4"
              >
                Tüm tahsilat →
              </button>
            </FocusCard>
          )}

          <div>
            <p className="label-premium mb-4">Özet</p>
            <div className="data-grid">
              <DataCell
                label="Aktif müşteri"
                value={String(stats.activeClients)}
              />
              <DataCell
                label="Gecikmiş"
                value={formatTry(stats.overdueAmount)}
                urgent={stats.overdueAmount > 0}
              />
              <DataCell
                label="Bekleyen"
                value={formatTry(stats.pendingAmount)}
              />
          <DataCell
            label="Brief"
            value={
              stats.briefTotal > 0
                ? `${stats.briefDone}/${stats.briefTotal}`
                : '—'
            }
            hint={
              stats.briefTotal > 0 ? stats.briefSummary : 'Görev ekleyin'
            }
          />
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button
          type="button"
          onClick={() => onNavigate(SCREENS.TEKLIF)}
          className="btn-outline"
        >
          Teklif
        </button>
        <button
          type="button"
          onClick={() => onNavigate(SCREENS.REPORTS)}
          className="btn-outline"
        >
          Raporlar
        </button>
      </div>

      </div>

      {reminder && (
        <ReminderModal
          payment={reminder.payment}
          clientName={reminder.client}
          onClose={() => setReminder(null)}
          onSent={() => markReminderSent(reminder.payment.id)}
        />
      )}
    </main>
  )
}
