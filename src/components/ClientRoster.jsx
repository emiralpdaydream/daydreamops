import { CLIENT_ROSTER } from '../lib/visualReferences'

/** Monocle / Daydream — portföy fısıltısı, logo duvarı değil */
export default function ClientRoster({ className = '' }) {
  return (
    <p className={`client-roster ${className}`}>
      {CLIENT_ROSTER.join(' · ')}
    </p>
  )
}
