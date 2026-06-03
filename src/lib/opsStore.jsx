import { useCallback, useMemo, useState } from 'react'
import { PAYMENT_STATUS } from './constants'
import { todayKey } from './dates'
import { OpsContext } from './opsContext'
import { generateProposalText } from './proposalGenerator'
import {
  createEmptyClient,
  createEmptyProposal,
  exportDataJson,
  loadData,
  purgeArchivedClients,
  resetData,
  saveData,
  syncPaymentStatuses,
} from './storage'
import { createId } from './id'

function prepare(data) {
  return syncPaymentStatuses(purgeArchivedClients({ ...data }))
}

export function OpsProvider({ children }) {
  const [data, setData] = useState(() => prepare(loadData()))

  const persist = useCallback((next) => {
    const prepared = prepare(next)
    saveData(prepared)
    setData(prepared)
    return prepared
  }, [])

  const refresh = useCallback(() => {
    setData(prepare(loadData()))
  }, [])

  const saveTodayBrief = useCallback(
    ({ priorities, note }) => {
      const date = todayKey()
      const next = { ...data }
      const existing = next.briefs.findIndex((b) => b.date === date)
      const entry = {
        id: existing >= 0 ? next.briefs[existing].id : createId('brief'),
        date,
        priorities: priorities.slice(0, 3),
        note: note ?? '',
        created_at: new Date().toISOString(),
      }
      if (existing >= 0) next.briefs[existing] = entry
      else next.briefs.unshift(entry)
      return persist(next)
    },
    [data, persist],
  )

  const upsertClient = useCallback(
    (client) => {
      const next = { ...data }
      const idx = next.clients.findIndex((c) => c.id === client.id)
      if (idx >= 0) {
        next.clients[idx] = client
        const pay = next.payments.find((p) => p.client_id === client.id)
        if (pay) {
          pay.amount = client.monthly_fee
          pay.due_date = client.due_date
        }
      } else {
        next.clients.push(client)
        next.payments.push({
          id: createId('pay'),
          client_id: client.id,
          amount: client.monthly_fee,
          due_date: client.due_date,
          paid_date: null,
          status: client.payment_status || PAYMENT_STATUS.PENDING,
          reminder_sent: false,
          label: 'Ödeme',
        })
      }
      return persist(next)
    },
    [data, persist],
  )

  const archiveClient = useCallback(
    (clientId) => {
      const next = { ...data }
      const c = next.clients.find((x) => x.id === clientId)
      if (c) {
        c.archived = true
        c.archived_at = new Date().toISOString()
      }
      return persist(next)
    },
    [data, persist],
  )

  const markPaymentPaid = useCallback(
    (paymentId) => {
      const next = { ...data }
      const p = next.payments.find((x) => x.id === paymentId)
      if (p) {
        p.status = PAYMENT_STATUS.PAID
        p.paid_date = todayKey()
      }
      return persist(next)
    },
    [data, persist],
  )

  const markReminderSent = useCallback(
    (paymentId) => {
      const next = { ...data }
      const p = next.payments.find((x) => x.id === paymentId)
      if (p) p.reminder_sent = true
      return persist(next)
    },
    [data, persist],
  )

  const saveProposal = useCallback(
    (form) => {
      const next = { ...data }
      const generated_text = generateProposalText(form)
      const entry = {
        ...form,
        id: form.id || createId('proposal'),
        generated_text,
        created_at: form.created_at || new Date().toISOString(),
      }
      next.proposals.unshift(entry)
      return persist(next)
    },
    [data, persist],
  )

  const exportJson = useCallback(() => exportDataJson(), [])

  const resetAll = useCallback(() => {
    const seed = resetData()
    setData(prepare(seed))
  }, [])

  const value = useMemo(
    () => ({
      data,
      refresh,
      saveTodayBrief,
      upsertClient,
      archiveClient,
      markPaymentPaid,
      markReminderSent,
      saveProposal,
      exportJson,
      resetAll,
      createEmptyClient,
      createEmptyProposal,
    }),
    [
      data,
      refresh,
      saveTodayBrief,
      upsertClient,
      archiveClient,
      markPaymentPaid,
      markReminderSent,
      saveProposal,
      exportJson,
      resetAll,
    ],
  )

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>
}
