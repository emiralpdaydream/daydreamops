/** Kart kayıtları — Düzenle · Sil (premium, ≥44px dokunma) */
export default function RecordActionBar({ onEdit, onDelete, className = '' }) {
  return (
    <div className={`record-action-bar${className ? ` ${className}` : ''}`}>
      {onEdit && (
        <button
          type="button"
          className="record-action-bar__btn record-action-bar__btn--edit"
          onClick={onEdit}
        >
          Düzenle
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="record-action-bar__btn record-action-bar__btn--delete"
          onClick={onDelete}
        >
          Sil
        </button>
      )}
    </div>
  )
}
