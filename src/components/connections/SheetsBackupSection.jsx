export default function SheetsBackupSection() {
  return (
    <section className="report-section hub-sheets-section">
      <h2 className="label-premium">Sheets Yedekleme</h2>
      <p className="mt-2 max-w-editorial font-sans text-sm leading-relaxed text-dim">
        Finans, müşteri ve tahsilat raporları ileride Google Sheets&apos;e
        aktarılabilecek.
      </p>
      <button
        type="button"
        className="btn-outline btn-outline--muted mt-4"
        disabled
      >
        Sheets&apos;e Aktar — Hazırlanıyor
      </button>
    </section>
  )
}
