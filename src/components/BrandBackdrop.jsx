import { BRAND_ASSETS } from '../lib/brandAssets'

const VARIANTS = {
  login: { src: BRAND_ASSETS.cinematic, className: 'brand-backdrop--login' },
  dashboard: { src: BRAND_ASSETS.cinematic, className: 'brand-backdrop--dashboard' },
  reports: { src: BRAND_ASSETS.vision, className: 'brand-backdrop--reports' },
  vision: { src: BRAND_ASSETS.vision, className: 'brand-backdrop--vision' },
  cinematic: { src: BRAND_ASSETS.cinematic, className: 'brand-backdrop--cinematic' },
}

/**
 * Sinema / vizyon dokusu — düşük opacity, blur, vignette.
 * Fotoğraf değil; atmosfer hissi.
 */
export default function BrandBackdrop({ variant = 'cinematic', className = '' }) {
  const config = VARIANTS[variant] ?? VARIANTS.cinematic

  return (
    <div
      className={`brand-backdrop ${config.className} ${className}`}
      aria-hidden="true"
    >
      <div
        className="brand-backdrop__image"
        style={{ backgroundImage: `url(${config.src})` }}
      />
      <div className="brand-backdrop__vignette" />
      <div className="brand-backdrop__grain" />
    </div>
  )
}
