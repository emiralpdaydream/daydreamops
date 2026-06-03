import EmptyStateAtmosphere from './EmptyStateAtmosphere'

/** Boş liste — metin + hafif sinema dokusu */
export default function EmptyStateBlock({
  message,
  variant = 'cinematic',
  className = '',
}) {
  return (
    <div className={`empty-state-block ${className}`}>
      <p className="font-sans text-sm text-dim">{message}</p>
      <EmptyStateAtmosphere variant={variant} />
    </div>
  )
}
