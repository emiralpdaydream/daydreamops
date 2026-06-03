import ConfirmModal from '../ConfirmModal'

export default function GmailSendConfirmModal({ open, to, subject, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <ConfirmModal
      title="Gmail ile gönder"
      message={
        <>
          Bu mail Gmail üzerinden gönderilecek. Onaylıyor musunuz?
          <br />
          <br />
          <strong>Kime:</strong> {to || '—'}
          <br />
          <strong>Konu:</strong> {subject || '—'}
        </>
      }
      confirmLabel="Gönder"
      cancelLabel="Vazgeç"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
