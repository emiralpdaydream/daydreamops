/** Linear — odak alanı: tek iş, net çerçeve */
export default function FocusCard({ title, meta, children, className = '' }) {
  return (
    <section className={`focus-card ${className}`}>
      {(title || meta) && (
        <header className="focus-card-head">
          {title && <h2 className="focus-card-title">{title}</h2>}
          {meta && <p className="focus-card-meta">{meta}</p>}
        </header>
      )}
      <div className="focus-card-body">{children}</div>
    </section>
  )
}
