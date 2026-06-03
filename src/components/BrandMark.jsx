import Logo from './Logo'

export default function BrandMark({ className = '' }) {
  return (
    <div className={`brand-mark flex min-w-0 items-center gap-2 ${className}`}>
      <Logo variant="xs" />
      <p className="brand-mark-label text-[10px] font-medium uppercase tracking-luxury text-muted">
        Daydream Ops
      </p>
    </div>
  )
}
