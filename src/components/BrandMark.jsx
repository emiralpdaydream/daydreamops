import Logo from './Logo'

export default function BrandMark({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo variant="xs" />
      <p className="text-[10px] font-medium uppercase tracking-luxury text-muted">
        Daydream Ops
      </p>
    </div>
  )
}
