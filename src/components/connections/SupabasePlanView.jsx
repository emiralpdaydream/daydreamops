import { SUPABASE_PLAN_NOTE } from '../../lib/connectionsHubData'

export default function SupabasePlanView({ onBack }) {
  return (
    <div className="hub-subview animate-rise">
      <button type="button" className="hub-back-link" onClick={onBack}>
        ← Bağlantılar Merkezi
      </button>
      <h2 className="hub-subview__title">Veri Tabanı Planı</h2>
      <p className="hub-subview__lead">{SUPABASE_PLAN_NOTE}</p>
      <ul className="hub-plan-list mt-6">
        <li>Müşteri ve marka kayıtları</li>
        <li>Tahsilat ve ödeme durumları</li>
        <li>Günlük brief ve görev geçmişi</li>
        <li>Teklif taslakları ve rapor özetleri</li>
      </ul>
    </div>
  )
}
