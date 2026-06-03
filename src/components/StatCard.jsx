export default function StatCard({ label, value, hint, accent = 'default' }) {
  const valueClass =
    accent === 'wine' ? 'signal-wine' : accent === 'muted' ? 'text-dim' : 'text-text'

  return (
    <div className="metric-quiet">
      <p className="label-premium">{label}</p>
      <p
        className={`mt-2 font-display text-2xl font-medium tracking-tight md:text-3xl ${valueClass}`}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-xs leading-relaxed text-muted">{hint}</p>
      )}
    </div>
  )
}
