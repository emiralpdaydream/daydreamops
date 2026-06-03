import { useContext } from 'react'
import { OpsContext } from './opsContext'

export function useOps() {
  const ctx = useContext(OpsContext)
  if (!ctx) throw new Error('useOps must be used within OpsProvider')
  return ctx
}
