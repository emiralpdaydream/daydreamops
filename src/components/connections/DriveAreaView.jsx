import { DRIVE_AREA_SECTIONS } from '../../lib/connectionsHubData'
import { INTEGRATION_STATUS } from '../../lib/constants'
import HubStatusBadge from './HubStatusBadge'

export default function DriveAreaView({ onBack }) {
  return (
    <div className="hub-subview animate-rise">
      <button type="button" className="hub-back-link" onClick={onBack}>
        ← Bağlantılar Merkezi
      </button>
      <h2 className="hub-subview__title">Drive Alanı</h2>
      <p className="hub-subview__lead">
        Teklifler, sözleşmeler, call sheet&apos;ler ve müşteri dosyaları burada
        organize edilecek.
      </p>
      <ul className="hub-placeholder-grid mt-6">
        {DRIVE_AREA_SECTIONS.map((section) => (
          <li key={section.id} className="hub-placeholder-card">
            <div className="hub-placeholder-card__head">
              <p className="hub-placeholder-card__title">{section.title}</p>
              <HubStatusBadge status={INTEGRATION_STATUS.PREPARING} />
            </div>
            <p className="hub-placeholder-card__folder">{section.folderKey}/</p>
            <p className="hub-placeholder-card__desc">{section.description}</p>
            <button type="button" className="btn-outline btn-outline--muted mt-3" disabled>
              Bağlandığında Açılacak
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
