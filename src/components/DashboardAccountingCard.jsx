import { SCREENS } from '../lib/constants'
import { getAccountingSummary } from '../lib/accountingSelectors'
import { formatTry } from '../lib/format'
import { useOps } from '../lib/useOps'

export default function DashboardAccountingCard({ onNavigate }) {
  const { data } = useOps()
  const s = getAccountingSummary(data)

  return (
    <section className="dashboard-accounting-card panel-premium">
      <div className="dashboard-accounting-card__head">
        <p className="label-premium">Muhasebe Özeti</p>
        {s.attentionCount > 0 && (
          <p className="dashboard-accounting-card__alert">
            {s.attentionCount} kayıt dikkat bekliyor.
          </p>
        )}
      </div>
      <div className="dashboard-accounting-card__grid">
        <div className="dashboard-accounting-card__cell">
          <span className="dashboard-accounting-card__label">Alınacaklar</span>
          <span className="dashboard-accounting-card__value">{formatTry(s.pendingReceivables)}</span>
        </div>
        <div className="dashboard-accounting-card__cell">
          <span className="dashboard-accounting-card__label">Ödenecekler</span>
          <span className="dashboard-accounting-card__value">{formatTry(s.pendingPayables)}</span>
        </div>
        <div className="dashboard-accounting-card__cell">
          <span className="dashboard-accounting-card__label">Harcamalar</span>
          <span className="dashboard-accounting-card__value">{formatTry(s.expensesTotal)}</span>
        </div>
        <div className="dashboard-accounting-card__cell dashboard-accounting-card__cell--net">
          <span className="dashboard-accounting-card__label">Net nakit akışı</span>
          <span className="dashboard-accounting-card__value">{formatTry(s.netCashFlow)}</span>
        </div>
      </div>
      <button
        type="button"
        className="btn-outline dashboard-accounting-card__cta"
        onClick={() => onNavigate(SCREENS.MUHASEBE)}
      >
        Muhasebeye git →
      </button>
    </section>
  )
}
