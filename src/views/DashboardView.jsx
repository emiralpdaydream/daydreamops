import { SCREENS } from '../lib/constants'
import { useOps } from '../lib/useOps'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import { setAccountingNavigation } from '../lib/accountingNavigation'
import { getBriefStats } from '../lib/briefSelectors'
import { sortBriefTasks, getTodayTasks } from '../lib/briefSelectors'
import DashboardAccountingCard from '../components/DashboardAccountingCard'
import DashboardDaySummary from '../components/dashboard/DashboardDaySummary'
import DashboardRecentActivity from '../components/dashboard/DashboardRecentActivity'
import PageHeader from '../components/PageHeader'
import BrandBackdrop from '../components/BrandBackdrop'
import OperatorDashboardCard from '../components/OperatorDashboardCard'
import BriefTaskList from '../components/BriefTaskList'

const intro = SCREEN_INTRO.dashboard

export default function DashboardView({ onNavigate }) {
  const {
    data,
    addBriefTask,
    toggleBriefTask,
    updateBriefTask,
    deleteBriefTask,
  } = useOps()
  const tasks = sortBriefTasks(getTodayTasks(data))
  const briefStats = getBriefStats({ tasks })

  const dateLabel = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  function goAccounting(tab, openModal) {
    setAccountingNavigation({ tab, openModal })
    onNavigate(SCREENS.MUHASEBE)
  }

  return (
    <main className="page-main page-main--dashboard page-main--dashboard-ceo">
      <BrandBackdrop variant="dashboard" className="dashboard-hero-glow" />
      <PageHeader
        chapter={`${intro.chapter} · ${dateLabel}`}
        title={intro.title}
        purpose="Operasyon özeti — yalnızca kayıtlı veriler."
      />

      <div className="dashboard-stagger section-gap">
        <DashboardDaySummary />

        <section className="ceo-panel panel-premium ceo-tasks-panel">
          <h2 className="ceo-panel__title label-premium">Bugünün görevleri</h2>
          <p className="ceo-tasks-panel__meta text-sm text-dim">
            {briefStats.total === 0
              ? 'Henüz görev yok'
              : `${briefStats.open} açık · ${briefStats.done}/${briefStats.total} tamam`}
          </p>
          <div className="mt-4">
            <BriefTaskList
              tasks={tasks}
              onToggle={toggleBriefTask}
              onEdit={updateBriefTask}
              onDelete={deleteBriefTask}
              showAdd
              onAdd={addBriefTask}
              addPlaceholder="Bugün ne yapılacak?"
              taskActionStyle="ceo"
            />
          </div>
          {briefStats.total > 0 && (
            <button
              type="button"
              onClick={() => onNavigate(SCREENS.TODAY)}
              className="btn-ghost mt-4"
            >
              Brief notları →
            </button>
          )}
        </section>

        <DashboardAccountingCard
          onNavigate={onNavigate}
          onAccountingAction={goAccounting}
        />

        <DashboardRecentActivity />

        <OperatorDashboardCard />
      </div>
    </main>
  )
}
