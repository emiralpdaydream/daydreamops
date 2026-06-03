import { useOps } from '../lib/useOps'
import { getAccountingSummary } from '../lib/accountingSelectors'
import { buildDataSnapshot } from '../lib/buildDataSnapshot'
import { useOperator } from '../lib/useOperator'
import { getDashboardStats } from '../lib/selectors'

function buildLocalSummary(data) {
  const stats = getDashboardStats(data)
  const snap = buildDataSnapshot(data)
  const parts = []

  if (stats.briefOpen > 0) {
    parts.push(`${stats.briefOpen} açık görev`)
  }
  if (stats.briefDone > 0 && stats.briefTotal > 0) {
    parts.push(`${stats.briefDone} tamamlandı`)
  }
  const acc = getAccountingSummary(data)
  if (acc.attentionCount > 0) {
    parts.push(`${acc.attentionCount} muhasebe uyarısı`)
  }
  const draftCount = (snap.proposals ?? []).filter((p) => !p.hasText).length
  if (draftCount > 0) {
    parts.push(`${draftCount} teklif taslağı`)
  }

  if (parts.length === 0) {
    return 'Operasyon sakin — AI sekmesinden analiz başlatın.'
  }
  return parts.join(' · ')
}

export default function OperatorDashboardCard() {
  const { data } = useOps()
  const { setOpen, sendMessage } = useOperator()

  return (
    <section className="operator-dashboard-card animate-rise">
      <div className="operator-dashboard-card__head">
        <p className="operator-dashboard-card__eyebrow">AI Asistan</p>
        <h2 className="operator-dashboard-card__title">
          Operasyon asistanınız
        </h2>
        <p className="operator-dashboard-card__line">
          Bugünkü işleri, tahsilatı, teklifleri ve müşteri durumunu analiz
          eder.
        </p>
        <p className="operator-dashboard-card__stat">{buildLocalSummary(data)}</p>
      </div>
      <div className="operator-dashboard-card__actions">
        <button
          type="button"
          className="btn-primary btn-primary-inline operator-dashboard-card__cta"
          onClick={() => setOpen(true)}
        >
          AI Asistanı Aç
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            setOpen(true)
            sendMessage('Bugünkü durumu özetle')
          }}
        >
          Bugünü Analiz Et
        </button>
      </div>
    </section>
  )
}
