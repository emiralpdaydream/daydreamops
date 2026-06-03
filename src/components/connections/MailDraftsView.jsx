import { MAIL_DRAFT_SECTIONS } from '../../lib/connectionsHubData'
import { useMailDraft } from '../../lib/useMailDraft'

export default function MailDraftsView({ onBack }) {
  const { openPreview } = useMailDraft()

  return (
    <div className="hub-subview animate-rise">
      <button type="button" className="hub-back-link" onClick={onBack}>
        ← Bağlantılar Merkezi
      </button>
      <h2 className="hub-subview__title">Mail Taslakları</h2>
      <p className="hub-subview__lead">
        Operator ile taslak oluşturun; gönderim yalnızca sizin onayınızla Gmail üzerinden
        yapılır.
      </p>
      <ul className="hub-placeholder-grid mt-6">
        {MAIL_DRAFT_SECTIONS.map((section) => (
          <li key={section.id} className="hub-placeholder-card">
            <p className="hub-placeholder-card__title">{section.title}</p>
            <p className="hub-placeholder-card__desc">{section.description}</p>
            <button
              type="button"
              className="btn-outline mt-3"
              onClick={() =>
                openPreview(
                  {
                    subject: section.title,
                    body: '',
                    summary: `${section.title} taslağı`,
                  },
                  true,
                )
              }
            >
              AI ile taslak hazırla
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
