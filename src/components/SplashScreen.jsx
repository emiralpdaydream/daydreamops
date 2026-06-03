import { useEffect } from 'react'
import { BRAND_ASSETS } from '../lib/brandAssets'

const SPLASH_MS = 1000

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, SPLASH_MS)
    return () => window.clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="splash-screen" role="presentation" aria-hidden="true">
      <div
        className="splash-screen__banner"
        style={{ backgroundImage: `url(${BRAND_ASSETS.vision})` }}
      />
      <img
        src={BRAND_ASSETS.logo}
        alt=""
        className="splash-screen__logo"
        draggable={false}
      />
    </div>
  )
}
