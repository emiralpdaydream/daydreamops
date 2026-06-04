import { SCREENS } from '../lib/constants'
import { ACCOUNTING_TABS } from '../lib/accountingConstants'
import { setAccountingNavigation } from '../lib/accountingNavigation'
import { getAccountingSummary } from '../lib/accountingSelectors'
import { formatTry } from '../lib/format'
import { useOps } from '../lib/useOps'

export default function DashboardAccountingCard({ onNavigate, onAccountingAction }) {
  const { data } = useOps()
  const s = getAccountingSummary(data)

  function go(tab, openModal) {
    if (onAccountingAction) {
      onAccountingAction(tab, openModal)
    } else {
      setAccountingNavigation({ tab, openModal })
      onNavigate(SCREENS.MUHASEBE)
    }
  }

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
        <button
          type="button"
          className="dashboard-accounting-card__cell dashboard-accounting-card__cell--link"
          onClick={() => go(ACCOUNTING_TABS.RECEIVABLES)}
        >
          <span className="dashboard-accounting-card__label">Alınacaklar</span>
          <span className="dashboard-accounting-card__value">{formatTry(s.pendingReceivables)}</span>
        </button>
        <button
          type="button"
          className="dashboard-accounting-card__cell dashboard-accounting-card__cell--link"
          onClick={() => go(ACCOUNTING_TABS.PAYABLES)}
        >
          <span className="dashboard-accounting-card__label">Ödenecekler</span>
          <span className="dashboard-accounting-card__value">{formatTry(s.pendingPayables)}</span>
        </button>
        <button
          type="button"
          className="dashboard-accounting-card__cell dashboard-accounting-card__cell--link"
          onClick={() => go(ACCOUNTING_TABS.EXPENSES)}
        >
          <span className="dashboard-accounting-card__label">Harcamalar</span>
          <span className="dashboard-accounting-card__value">{formatTry(s.expensesTotal)}</span>
        </button>
        <button
          type="button"
          className="dashboard-accounting-card__cell dashboard-accounting-card__cell--link dashboard-accounting-card__cell--net"
          onClick={() => go(ACCOUNTING_TABS.ACCOUNTS)}
        >
          <span className="dashboard-accounting-card__label">Net nakit akışı</span>
          <span className="dashboard-accounting-card__value">{formatTry(s.netCashFlow)}</span>
        </button>
      </div>
      <div className="dashboard-accounting-card__quick">
        <button
          type="button"
          className="btn-outline dashboard-accounting-card__quick-btn"
          onClick={() => go(ACCOUNTING_TABS.RECEIVABLES, 'receivable')}
        >
          Yeni Alacak
        </button>
        <button
          type="button"
          className="btn-outline dashboard-accounting-card__quick-btn"
          onClick={() => go(ACCOUNTING_TABS.PAYABLES, 'payable')}
        >
          Yeni Ödeme
        </button>
        <button
          type="button"
          className="btn-outline dashboard-accounting-card__quick-btn"
          onClick={() => go(ACCOUNTING_TABS.EXPENSES, 'expense')}
        >
          Yeni Harcama
        </button>
        <button
          type="button"
          className="btn-outline dashboard-accounting-card__quick-btn"
          onClick={() => go(ACCOUNTING_TABS.INVOICES, 'invoice')}
        >
          Yeni Fatura
        </button>
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
