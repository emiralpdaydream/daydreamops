import { useOps } from '../../lib/useOps'
import { getRecentActivities } from '../../lib/dashboardCeoSelectors'

export default function DashboardRecentActivity() {
  const { data } = useOps()
  const activities = getRecentActivities(data)

  return (
    <section className="ceo-panel panel-premium">
      <h2 className="ceo-panel__title label-premium">Son aktiviteler</h2>
      {activities.length === 0 ? (
        <p className="ceo-empty">
          Henüz kayıt yok. Görev, harcama, müşteri veya fatura ekledikçe burada
          görünür.
        </p>
      ) : (
        <ul className="ceo-activity-list">
          {activities.map((item) => (
            <li key={item.id} className="ceo-activity-list__item">
              <div className="ceo-activity-list__head">
                <span className="ceo-activity-list__type">{item.label}</span>
                <span className="ceo-activity-list__time">{item.timeLabel}</span>
              </div>
              <p className="ceo-activity-list__detail">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
