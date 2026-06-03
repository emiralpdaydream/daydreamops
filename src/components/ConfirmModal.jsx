export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Onayla',
  cancelLabel = 'Vazgeç',
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!open) return null

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="modal-panel">
        <h2 id="confirm-modal-title" className="font-sans text-lg font-medium text-text">
          {title}
        </h2>
        {message && (
          <p className="mt-3 font-sans text-sm leading-relaxed text-dim">{message}</p>
        )}
        <div className="modal-actions">
          <button type="button" onClick={onCancel} className="btn-outline">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={danger ? 'btn-danger' : 'btn-primary btn-primary-inline'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
