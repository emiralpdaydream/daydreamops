import { useState } from 'react'
import { formatTry } from '../lib/format'
import { useOps } from '../lib/useOps'
import { useToast } from '../lib/useToast'
import {
  getTahsilatGroups,
  getTahsilatStatTotals,
} from '../lib/selectors'
import { formatDateTr } from '../lib/dates'
import ConfirmModal from '../components/ConfirmModal'
import EmptyStateBlock from '../components/EmptyStateBlock'
import PageHeader from '../components/PageHeader'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import ReminderModal from '../components/ReminderModal'
import StatCard from '../components/StatCard'

function PaymentSection({ title, hint, items, onRemind, onPaid, onDelete }) {
  if (items.length === 0) return null

  return (
    <section className="mt-8">
      <h2 className="label-premium">{title}</h2>
      <p className="mt-2 text-sm text-muted">{hint}</p>
      <ul className="mt-8 space-y-3">
        {items.map(({ payment, client, service, days }) => (
          <li key={payment.id} className="panel-premium p-4 md:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p className="font-medium text-text">{client}</p>
                <p className="mt-1 text-xs text-dim">
                  {service} · Vade {formatDateTr(payment.due_date)}
                </p>
                <p
                  className={`mt-2 text-xs ${days < 0 ? 'signal-wine' : 'text-muted'}`}
                >
                  {days < 0
                    ? `${Math.abs(days)} gün geçti`
                    : `${days} gün kaldı`}
                </p>
              </div>
              <p className="shrink-0 font-display text-lg font-semibold">
                {formatTry(payment.amount)}
              </p>
            </div>
            <div className="action-row mt-4">
              <button
                type="button"
                onClick={() => onPaid(payment.id)}
                className="action-chip"
              >
                Ödendi
              </button>
              <button
                type="button"
                onClick={() => onRemind({ payment, client })}
                className="action-chip"
              >
                Hatırlat
              </button>
              <button
                type="button"
                onClick={() => onDelete(payment.id)}
                className="action-chip action-chip--danger"
              >
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function TahsilatView() {
  const { data, markPaymentPaid, markReminderSent, deletePayment } = useOps()
  const { showToast } = useToast()
  const groups = getTahsilatGroups(data)
  const totals = getTahsilatStatTotals(data)
  const [reminder, setReminder] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  function confirmDelete() {
    if (!deleteId) return
    deletePayment(deleteId)
    setDeleteId(null)
    showToast('Tahsilat kaydı silindi.')
  }

  return (
    <main className="page-main finance-layout-wide">
      <PageHeader {...SCREEN_INTRO.tahsilat} />

      <section className="section-gap grid max-w-wide grid-cols-1 gap-10 border-t border-border pt-10 sm:grid-cols-3 sm:gap-12">
        <StatCard
          label="Gecikmiş toplam"
          value={formatTry(totals.overdue)}
          accent="wine"
        />
        <StatCard label="Bekleyen toplam" value={formatTry(totals.pending)} />
        <StatCard
          label="Bu hafta vadesi"
          value={formatTry(totals.weekDue)}
          accent="muted"
        />
      </section>

      <PaymentSection
        title="Gecikmiş"
        hint="En üst öncelik"
        items={groups.overdue}
        onRemind={setReminder}
        onPaid={markPaymentPaid}
        onDelete={setDeleteId}
      />
      <PaymentSection
        title="Vadesi 7 gün içinde"
        hint="Yaklaşan tahsilat"
        items={groups.dueSoon}
        onRemind={setReminder}
        onPaid={markPaymentPaid}
        onDelete={setDeleteId}
      />
      <PaymentSection
        title="Bekleyen"
        hint="Diğer açık kalemler"
        items={groups.pending}
        onRemind={setReminder}
        onPaid={markPaymentPaid}
        onDelete={setDeleteId}
      />

      {groups.overdue.length === 0 &&
        groups.dueSoon.length === 0 &&
        groups.pending.length === 0 && (
          <EmptyStateBlock
            className="mt-10"
            message="Takip edilecek ödeme yok"
            variant="cinematic"
          />
        )}

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Tahsilatı sil"
        message="Bu tahsilat kaydını silmek istediğine emin misin?"
        confirmLabel="Sil"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

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
