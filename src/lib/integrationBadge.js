import { INTEGRATION_STATUS } from './constants'

export function badgeClassForStatus(status) {
  if (status === INTEGRATION_STATUS.CONNECTED) return 'integration-badge--on'
  if (
    status === INTEGRATION_STATUS.PREPARING ||
    status === INTEGRATION_STATUS.NEXT_PHASE ||
    status === INTEGRATION_STATUS.PENDING_AUTH
  ) {
    return 'integration-badge--prep'
  }
  if (status === INTEGRATION_STATUS.ERROR) {
    return 'integration-badge--error'
  }
  if (status === INTEGRATION_STATUS.READY) return 'integration-badge--ready'
  return ''
}
