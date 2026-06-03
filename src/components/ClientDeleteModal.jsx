export default function ClientDeleteModal({
  open,
  clientName,
  paymentCount,
  onArchive,
  onDeleteAll,
  onCancel,
}) {
  if (!open) return null

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-delete-title"
    >
      <div className="modal-panel">
        <h2
          id="client-delete-title"
          className="font-sans text-lg font-medium text-text"
        >
          {clientName}
        </h2>
        <p className="mt-3 font-sans text-sm leading-relaxed text-dim">
          Bu müşteriyi arşive almak mı istiyorsun, tamamen silmek mi?
        </p>
        {paymentCount > 0 && (
          <p className="mt-2 font-sans text-xs text-muted">
            Tamamen silersen bu müşteriye bağlı {paymentCount} tahsilat kaydı da
            silinir.
          </p>
        )}
        <div className="modal-actions modal-actions--stack">
          <button type="button" onClick={onArchive} className="btn-outline w-full">
            Arşive al
          </button>
          <button type="button" onClick={onDeleteAll} className="btn-danger w-full">
            Tamamen sil
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost w-full">
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  )
}
