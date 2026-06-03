import logo from '../assets/daydream-logo.png'

/**
 * Premium logo — sessiz, küçük, bol boşluk.
 * Drop shadow, glow, 3D veya animasyon yok.
 */
export default function Logo({ variant = 'sm', className = '' }) {
  const variants = {
    xs: { shell: 'h-7 w-7 p-1', halo: false },
    sm: { shell: 'h-8 w-8 p-1.5', halo: false },
    sidebar: { shell: 'h-9 w-9 p-1.5', halo: false },
    login: { shell: 'h-14 w-14 p-2.5', halo: true },
  }

  const v = variants[variant] ?? variants.sm

  const mark = (
    <div
      className={`logo-shell inline-flex shrink-0 items-center justify-center ${v.shell}`}
    >
      <img
        src={logo}
        alt="Daydream"
        className="h-full w-full object-contain"
        draggable={false}
      />
    </div>
  )

  if (v.halo) {
    return (
      <div className={`logo-halo inline-flex ${className}`}>{mark}</div>
    )
  }

  return <div className={`inline-flex ${className}`}>{mark}</div>
}
