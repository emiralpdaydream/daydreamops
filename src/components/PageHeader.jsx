export default function PageHeader({ chapter, title, purpose, children }) {
  return (
    <header className="screen-intro">
      {chapter && <p className="screen-chapter">{chapter}</p>}
      <h1 className="screen-title">{title}</h1>
      {purpose && <p className="screen-purpose">{purpose}</p>}
      <div className="screen-rule" aria-hidden="true" />
      {children}
    </header>
  )
}
