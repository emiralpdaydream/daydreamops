import { useOps } from '../lib/useOps'
import { formatTry } from '../lib/format'
import { getExecutiveReport } from '../lib/reportSelectors'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import BrandBackdrop from '../components/BrandBackdrop'
import PageHeader from '../components/PageHeader'
import SheetsBackupSection from '../components/connections/SheetsBackupSection'

function MetricBlock({ label, value, urgent }) {
  return (
    <div className="report-metric">
      <p className="report-metric-label">{label}</p>
      <p className={`report-metric-value ${urgent ? 'signal-wine' : ''}`}>
        {value}
      </p>
    </div>
  )
}

function BarRow({ label, pct }) {
  return (
    <div className="report-bar-row">
      <div className="flex justify-between text-xs text-dim">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="report-bar-track">
        <div className="report-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ReportsView() {
  const { data } = useOps()
  const report = getExecutiveReport(data)

  if (!report.hasData) {
    return (
      <main className="page-main page-main--reports reports-layout-wide">
        <div className="reports-hero-strip">
          <BrandBackdrop variant="reports" />
        </div>
        <PageHeader {...SCREEN_INTRO.reports} />
        <p className="mt-8 max-w-editorial font-sans text-sm leading-relaxed text-dim">
          Henüz rapor oluşturacak veri yok. Müşteri, tahsilat ve brief kayıtları
          oluştukça burada özet görünür.
        </p>
        <SheetsBackupSection />
      </main>
    )
  }

  const totalFlow =
    report.finance.collectedTotal +
    report.finance.pendingTotal +
    report.finance.overdueTotal
  const collectedPct = totalFlow
    ? Math.round((report.finance.collectedTotal / totalFlow) * 100)
    : 0
  const overduePct = totalFlow
    ? Math.round((report.finance.overdueTotal / totalFlow) * 100)
    : 0

  return (
    <main className="page-main page-main--reports reports-layout-wide">
      <div className="reports-hero-strip">
        <BrandBackdrop variant="reports" />
      </div>
      <PageHeader {...SCREEN_INTRO.reports} />

      <section className="report-section">
        <h2 className="label-premium">Aylık gelir özeti</h2>
        <div className="report-grid mt-4">
          <MetricBlock label="Bekleyen" value={formatTry(report.finance.pendingTotal)} />
          <MetricBlock
            label="Tahsil edilen"
            value={formatTry(report.finance.collectedTotal)}
          />
          <MetricBlock
            label="Gecikmiş"
            value={formatTry(report.finance.overdueTotal)}
            urgent={report.finance.overdueTotal > 0}
          />
          <MetricBlock
            label="Ort. müşteri değeri"
            value={formatTry(report.finance.avgClient)}
          />
        </div>
        <div className="report-bars mt-6">
          <BarRow label="Tahsil edilen pay" pct={collectedPct} />
          <BarRow label="Gecikmiş pay" pct={overduePct} />
        </div>
      </section>

      <section className="report-section">
        <h2 className="label-premium">Operasyon özeti</h2>
        <div className="report-grid mt-4">
          <MetricBlock
            label="Aktif müşteri"
            value={String(report.ops.activeClients)}
          />
          <MetricBlock
            label="Açık teklif"
            value={String(report.ops.openProposals)}
          />
          <MetricBlock
            label="Tamamlanan iş"
            value={String(report.ops.completedTasks)}
          />
          <MetricBlock
            label="Riskli ödeme"
            value={String(report.ops.riskPayments)}
            urgent={report.ops.riskPayments > 0}
          />
        </div>
      </section>

      <SheetsBackupSection />
    </main>
  )
}
