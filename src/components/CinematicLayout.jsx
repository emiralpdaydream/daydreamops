export default function CinematicLayout({ children, className = '' }) {
  return (
    <div className={`cinematic-scene overflow-x-clip ${className}`}>
      <div className="cinematic-content w-full min-w-0 max-w-full overflow-x-clip">
        {children}
      </div>
    </div>
  )
}
