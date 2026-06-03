import heroRef from '../assets/liqsquare-hero-ref.png'

/** Şablondaki metalik 3D kurdele — tam sayfa referansından kırpılmış */
export default function HeroVisual({ className = '' }) {
  return (
    <div className={`hero-visual ${className}`} aria-hidden="true">
      <img src={heroRef} alt="" draggable={false} />
    </div>
  )
}
