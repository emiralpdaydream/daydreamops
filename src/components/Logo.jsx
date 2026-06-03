import { BRAND_ASSETS } from '../lib/brandAssets'

/** Logo — imza; beyaz kutu multiply ile kaybolur */
export default function Logo({ variant = 'sm', className = '' }) {
  const sizes = {
    xs: 'h-7 w-auto max-w-[5rem]',
    sm: 'h-8 w-auto max-w-[5.5rem]',
    sidebar: 'h-9 w-auto max-w-[6rem]',
    login: 'h-11 w-auto max-w-[7.5rem]',
    avatar: 'h-full w-full object-contain',
  }

  const sizeClass = sizes[variant] ?? sizes.sm
  const onDark = variant === 'avatar'

  return (
    <div
      className={`logo-mark inline-flex shrink-0 items-center${onDark ? ' logo-mark--on-dark' : ''}${variant === 'avatar' ? ' logo-mark--avatar' : ''} ${className}`}
    >
      <img
        src={BRAND_ASSETS.logo}
        alt="Daydream"
        className={`logo-mark__img ${sizeClass}${onDark ? ' logo-mark__img--on-dark' : ''}`}
        draggable={false}
      />
    </div>
  )
}
