import { BRAND_ASSETS } from '../lib/brandAssets'

/** Boş durumlarda sinema dokusu — küçük crop, dekor değil */
export default function EmptyStateAtmosphere({ variant = 'cinematic' }) {
  const src =
    variant === 'vision' ? BRAND_ASSETS.vision : BRAND_ASSETS.cinematic

  return (
    <div
      className="empty-state-atmosphere"
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden="true"
    />
  )
}
