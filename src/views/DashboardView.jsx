import { useState } from 'react'
import { SCREENS } from '../lib/constants'
import { formatTry } from '../lib/format'
import { useOps } from '../lib/useOps'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import {
  getDashboardStats,
  getOverduePayments,
} from '../lib/selectors'
import ClientRoster from '../components/ClientRoster'
import DataCell from '../components/DataCell'
import FocusCard from '../components/FocusCard'
import PageHeader from '../components/PageHeader'
import ReminderModal from '../components/ReminderModal'

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
    <main className="page-main">
      <PageHeader
        chapter={`${intro.chapter} · ${dateLabel}`}
        title={intro.title}
        purpose={intro.purpose}
      />

      <ClientRoster className="mt-2" />

      <div className="dashboard-grid section-gap">
        <FocusCard
          title="Öncelik"
          meta="Bugünün üç odak noktası"
          className="dashboard-focus"
        >
          {stats.todayPriorities.length === 0 ? (
            <div>
              <p className="font-display text-2xl font-medium italic text-dim">
                Brief henüz yazılmadı.
              </p>
              <button
                type="button"
                onClick={() => onNavigate(SCREENS.BRIEF)}
                className="btn-ghost mt-8"
              >
                Brief&apos;e git →
              </button>
            </div>
          ) : (
            <ol>
              {stats.todayPriorities.map((item, i) => (
                <li key={item.id} className="priority-line">
                  <span className="priority-index">
                    {['I', 'II', 'III'][i]}
                  </span>
                  <span className="text-[15px] leading-relaxed text-text">
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
                    <div className="flex items-center gap-5">
                      <p className="font-display text-lg font-medium tabular-nums">
                        {formatTry(item.amount)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setReminder(item)}
                        className="btn-ghost"
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
                value={`${stats.briefDone}/${stats.briefTotal}`}
                hint={stats.briefDone === 0 ? 'Yazılmadı' : 'Tamam'}
              />
            </div>
          </div>
        </div>
      </div>

      <p className="integration-chip">
        Faz 2 — sesli asistan. Merkez şimdilik sessiz ve odaklı kalır.
      </p>

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
