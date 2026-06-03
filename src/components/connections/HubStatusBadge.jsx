import { badgeClassForStatus } from '../../lib/integrationBadge'

export default function HubStatusBadge({ status }) {
  return (
    <span className={`integration-badge ${badgeClassForStatus(status)}`}>
      {status}
    </span>
  )
}
