import { PAYMENT_STATUS_LABELS } from '../lib/constants'

const styles = {
  paid: 'text-dim',
  pending: 'text-muted',
  overdue: 'signal-wine',
  partial: 'text-dim',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`text-[10px] font-medium uppercase tracking-luxury ${styles[status] ?? styles.pending}`}
    >
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </span>
  )
}
