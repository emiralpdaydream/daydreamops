/** Linear — yoğun ama sakin metrik hücresi */
export default function DataCell({ label, value, hint, urgent = false }) {
  return (
    <div className="data-cell">
      <p className="data-cell-label">{label}</p>
      <p
        className={`data-cell-value ${urgent ? 'signal-wine' : ''}`}
      >
        {value}
      </p>
      {hint && <p className="data-cell-hint">{hint}</p>}
    </div>
  )
}
