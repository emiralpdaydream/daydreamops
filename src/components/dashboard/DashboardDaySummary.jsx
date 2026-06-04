import { formatTry } from '../../lib/format'
import { useOps } from '../../lib/useOps'
import { getCeoDaySummary } from '../../lib/dashboardCeoSelectors'

function MetricTile({ label, value, hint }) {
  return (
    <div className="ceo-metric">
      <span className="ceo-metric__label">{label}</span>
      <span className="ceo-metric__value">{value}</span>
      {hint && <span className="ceo-metric__hint">{hint}</span>}
    </div>
  )
}

export default function DashboardDaySummary() {
  const { data } = useOps()
  const s = getCeoDaySummary(data)

  return (
    <section className="ceo-panel panel-premium">
      <h2 className="ceo-panel__title label-premium">Günün özeti</h2>
      <div className="ceo-metrics-grid">
        <MetricTile label="Açık görev" value={String(s.openTaskCount)} />
        <MetricTile
          label="Geciken alacak"
          value={String(s.overdueReceivableCount)}
          hint={s.overdueReceivableCount > 0 ? 'Muhasebe' : undefined}
        />
        <MetricTile
          label="Bu hafta çekim"
          value={s.shootsLabel}
          hint="Takvim verisi yok"
        />
        <MetricTile label="Bekleyen teklif" value={String(s.pendingProposalCount)} />
      </div>

      <div className="ceo-invoices-block">
        <p className="ceo-invoices-block__label label-premium">Son faturalar</p>
        {s.recentInvoices.length === 0 ? (
          <p className="ceo-empty">Henüz fatura kaydı yok.</p>
        ) : (
          <ul className="ceo-invoices-list">
            {s.recentInvoices.map((inv) => (
              <li key={inv.id} className="ceo-invoices-list__item">
                <span className="ceo-invoices-list__party">{inv.partyName}</span>
                <span className="ceo-invoices-list__meta">
                  {formatTry(inv.totalAmount)} · {inv.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
