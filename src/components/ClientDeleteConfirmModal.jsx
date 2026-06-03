import ConfirmModal from './ConfirmModal'

/** Tam silme — ikinci onay */
export default function ClientDeleteConfirmModal({
  open,
  clientName,
  paymentCount,
  onConfirm,
  onCancel,
}) {
  return (
    <ConfirmModal
      open={open}
      title="Tamamen sil"
      message={`${clientName} ve bağlı ${paymentCount} tahsilat kaydı kalıcı olarak silinecek. Emin misin?`}
      confirmLabel="Sil"
      cancelLabel="Vazgeç"
      danger
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
