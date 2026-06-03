import { CALENDAR_AREA_SECTIONS } from '../../lib/connectionsHubData'

export default function CalendarAreaView({ onBack }) {
  return (
    <div className="hub-subview animate-rise">
      <button type="button" className="hub-back-link" onClick={onBack}>
        ← Bağlantılar Merkezi
      </button>
      <h2 className="hub-subview__title">Takvim Alanı</h2>
      <ul className="hub-calendar-sections mt-6">
        {CALENDAR_AREA_SECTIONS.map((section) => (
          <li key={section.id} className="hub-calendar-row">
            <span className="hub-calendar-row__label">{section.title}</span>
            <span className="hub-calendar-row__state">—</span>
          </li>
        ))}
      </ul>
      <div className="hub-empty-state mt-8">
        <p>
          Google Calendar bağlandığında toplantı ve çekim tarihleri burada
          görünecek.
        </p>
      </div>
    </div>
  )
}
