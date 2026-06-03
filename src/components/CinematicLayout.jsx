export default function CinematicLayout({ children, className = '' }) {
  return (
    <div className={`cinematic-scene ${className}`}>
      <div className="cinematic-content">{children}</div>
    </div>
  )
}
