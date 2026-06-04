import { useCallback, useMemo, useState } from 'react'
import { PAYMENT_STATUS } from './constants'
import { todayKey } from './dates'
import { OpsContext } from './opsContext'
import { generateProposalText } from './proposalGenerator'
import {
  archiveClient as archiveClientData,
  clearBriefHistory,
  clearPayments,
  clearProposals,
  countClientPayments,
  createEmptyBrand,
  createEmptyBrandProject,
  createEmptyClient,
  createEmptyFutureProject,
  createEmptyProposal,
  deleteClient as deleteClientData,
  deleteClientPayments,
  deletePayment as deletePaymentData,
  deleteProposal as deleteProposalData,
  exportAllData,
  loadData,
  purgeArchivedClients,
  resetAllData,
  resetDemoData,
  restoreClient as restoreClientData,
  saveData,
  syncPaymentStatuses,
  updateClient as updateClientData,
  updatePayment as updatePaymentData,
} from './storage'
import { createId } from './id'
import {
  clearAccountingDemo,
  deferPayable,
  deleteExpense,
  deletePayable,
  deleteReceivable,
  markPayablePaid,
  markReceivableReceived,
  markReceivableReminderSent,
  upsertExpense,
  upsertPayable,
  upsertReceivable,
} from './accountingStorage'
import {
  addBriefTask as addBriefTaskData,
  appendBriefNote as appendBriefNoteData,
  deleteBriefTask as deleteBriefTaskData,
  deleteCollectedNote as deleteCollectedNoteData,
  setBriefNotes as setBriefNotesData,
  toggleBriefTask as toggleBriefTaskData,
  updateBriefTask as updateBriefTaskData,
  updateCollectedNote as updateCollectedNoteData,
} from './briefStorage'
import {
  deleteIntegrationNote,
  deleteInvoice,
  deleteVaultAccount,
  deleteWhatsAppDraft,
  markInvoicePaid,
  prepareInvoiceParasut,
  upsertIntegrationNote,
  upsertInvoice,
  upsertVaultAccount,
  upsertWhatsAppDraft,
} from './appDataStorage'

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

  const addBriefTask = useCallback(
    (text) => persist(addBriefTaskData(data, text)),
    [data, persist],
  )

  const toggleBriefTask = useCallback(
    (taskId) => persist(toggleBriefTaskData(data, taskId)),
    [data, persist],
  )

  const deleteBriefTask = useCallback(
    (taskId) => persist(deleteBriefTaskData(data, taskId)),
    [data, persist],
  )

  const updateBriefTask = useCallback(
    (taskId, text) => persist(updateBriefTaskData(data, taskId, text)),
    [data, persist],
  )

  const setBriefNotes = useCallback(
    (notes) => persist(setBriefNotesData(data, notes)),
    [data, persist],
  )

  const appendBriefNote = useCallback(
    (text) => persist(appendBriefNoteData(data, text)),
    [data, persist],
  )

  const deleteCollectedNote = useCallback(
    (noteId) => persist(deleteCollectedNoteData(data, noteId)),
    [data, persist],
  )

  const updateCollectedNote = useCallback(
    (noteId, text) => persist(updateCollectedNoteData(data, noteId, text)),
    [data, persist],
  )

  const saveReceivable = useCallback(
    (input, id) => persist(upsertReceivable(data, input, id)),
    [data, persist],
  )
  const removeReceivable = useCallback(
    (id) => persist(deleteReceivable(data, id)),
    [data, persist],
  )
  const savePayable = useCallback(
    (input, id) => persist(upsertPayable(data, input, id)),
    [data, persist],
  )
  const removePayable = useCallback(
    (id) => persist(deletePayable(data, id)),
    [data, persist],
  )
  const saveExpense = useCallback(
    (input, id) => persist(upsertExpense(data, input, id)),
    [data, persist],
  )
  const removeExpense = useCallback(
    (id) => persist(deleteExpense(data, id)),
    [data, persist],
  )
  const receiveReceivable = useCallback(
    (id, partial) => persist(markReceivableReceived(data, id, partial)),
    [data, persist],
  )
  const payPayable = useCallback(
    (id) => persist(markPayablePaid(data, id)),
    [data, persist],
  )
  const deferPayableRecord = useCallback(
    (id) => persist(deferPayable(data, id)),
    [data, persist],
  )
  const sendReceivableReminder = useCallback(
    (id) => persist(markReceivableReminderSent(data, id)),
    [data, persist],
  )

  const upsertClient = useCallback(
    (client) => {
      const next = { ...data }
      const normalized = {
        ...client,
        monthly_fee: Number(client.monthly_fee) || 0,
        agreed_price: Number(client.agreed_price ?? client.monthly_fee) || 0,
        email: client.email || client.contact || '',
        isDemo: client.isDemo ?? false,
      }
      const idx = next.clients.findIndex((c) => c.id === normalized.id)
      if (idx >= 0) {
        next.clients[idx] = normalized
        const pay = next.payments.find((p) => p.client_id === normalized.id)
        if (pay) {
          pay.amount = normalized.monthly_fee
          pay.due_date = normalized.due_date
        }
      } else {
        next.clients.push(normalized)
        next.payments.push({
          id: createId('pay'),
          client_id: normalized.id,
          amount: normalized.monthly_fee,
          due_date: normalized.due_date,
          paid_date: null,
          status: normalized.payment_status || PAYMENT_STATUS.PENDING,
          reminder_sent: false,
          label: 'Ödeme',
          isDemo: false,
        })
      }
      return persist(next)
    },
    [data, persist],
  )

  const updateClient = useCallback(
    (id, patch) => persist(updateClientData(data, id, patch)),
    [data, persist],
  )

  const archiveClient = useCallback(
    (clientId) => persist(archiveClientData(data, clientId)),
    [data, persist],
  )

  const restoreClient = useCallback(
    (clientId) => persist(restoreClientData(data, clientId)),
    [data, persist],
  )

  const deleteClient = useCallback(
    (clientId) => {
      let next = deleteClientData(data, clientId)
      next = deleteClientPayments(next, clientId)
      return persist(next)
    },
    [data, persist],
  )

  const deleteClientOnly = useCallback(
    (clientId) => persist(deleteClientData(data, clientId)),
    [data, persist],
  )

  const getClientPaymentCount = useCallback(
    (clientId) => countClientPayments(data, clientId),
    [data],
  )

  const upsertBrand = useCallback(
    (brand) => {
      const next = { ...data }
      const idx = next.brands.findIndex((b) => b.id === brand.id)
      if (idx >= 0) next.brands[idx] = brand
      else next.brands.unshift(brand)
      return persist(next)
    },
    [data, persist],
  )

  const deleteBrand = useCallback(
    (brandId) => {
      const next = { ...data }
      next.brands = next.brands.filter((b) => b.id !== brandId)
      return persist(next)
    },
    [data, persist],
  )

  const upsertFutureProject = useCallback(
    (project) => {
      const next = { ...data }
      const idx = next.future_projects.findIndex((p) => p.id === project.id)
      if (idx >= 0) next.future_projects[idx] = project
      else next.future_projects.unshift(project)
      return persist(next)
    },
    [data, persist],
  )

  const deleteFutureProject = useCallback(
    (projectId) => {
      const next = { ...data }
      next.future_projects = next.future_projects.filter((p) => p.id !== projectId)
      return persist(next)
    },
    [data, persist],
  )

  const updatePayment = useCallback(
    (id, patch) => persist(updatePaymentData(data, id, patch)),
    [data, persist],
  )

  const deletePayment = useCallback(
    (paymentId) => persist(deletePaymentData(data, paymentId)),
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
      const generated_text = form.generated_text?.trim()
        ? form.generated_text.trim()
        : generateProposalText(form)
      const entry = {
        ...form,
        id: form.id || createId('proposal'),
        generated_text,
        isDemo: form.isDemo ?? false,
        created_at: form.created_at || new Date().toISOString(),
      }
      const idx = next.proposals.findIndex((p) => p.id === entry.id)
      if (idx >= 0) next.proposals[idx] = entry
      else next.proposals.unshift(entry)
      return persist(next)
    },
    [data, persist],
  )

  const removeProposal = useCallback(
    (id) => persist(deleteProposalData(data, id)),
    [data, persist],
  )

  const saveVaultAccount = useCallback(
    (input, id) => persist(upsertVaultAccount(data, input, id)),
    [data, persist],
  )
  const removeVaultAccount = useCallback(
    (id) => persist(deleteVaultAccount(data, id)),
    [data, persist],
  )
  const saveInvoice = useCallback(
    (input, id) => persist(upsertInvoice(data, input, id)),
    [data, persist],
  )
  const removeInvoice = useCallback(
    (id) => persist(deleteInvoice(data, id)),
    [data, persist],
  )
  const markInvoicePaidRecord = useCallback(
    (id) => persist(markInvoicePaid(data, id)),
    [data, persist],
  )
  const prepareInvoiceParasutRecord = useCallback(
    (id) => persist(prepareInvoiceParasut(data, id)),
    [data, persist],
  )
  const saveWhatsAppDraft = useCallback(
    (input, id) => persist(upsertWhatsAppDraft(data, input, id)),
    [data, persist],
  )
  const removeWhatsAppDraft = useCallback(
    (id) => persist(deleteWhatsAppDraft(data, id)),
    [data, persist],
  )
  const saveIntegrationNote = useCallback(
    (input, id) => persist(upsertIntegrationNote(data, input, id)),
    [data, persist],
  )
  const removeIntegrationNote = useCallback(
    (id) => persist(deleteIntegrationNote(data, id)),
    [data, persist],
  )

  const exportJson = useCallback(() => exportAllData(), [])

  const resetAll = useCallback(() => {
    const seed = resetAllData()
    setData(prepare(seed))
    return seed
  }, [])

  const resetDemo = useCallback(() => {
    return persist(clearAccountingDemo(resetDemoData(data)))
  }, [data, persist])

  const clearPaymentsOnly = useCallback(() => {
    return persist(clearPayments(data))
  }, [data, persist])

  const clearProposalsOnly = useCallback(() => {
    return persist(clearProposals(data))
  }, [data, persist])

  const clearBriefsOnly = useCallback(() => {
    return persist(clearBriefHistory(data))
  }, [data, persist])

  const value = useMemo(
    () => ({
      data,
      refresh,
      addBriefTask,
      toggleBriefTask,
      deleteBriefTask,
      updateBriefTask,
      setBriefNotes,
      appendBriefNote,
      deleteCollectedNote,
      updateCollectedNote,
      saveReceivable,
      removeReceivable,
      savePayable,
      removePayable,
      saveExpense,
      removeExpense,
      receiveReceivable,
      payPayable,
      deferPayableRecord,
      sendReceivableReminder,
      upsertClient,
      updateClient,
      archiveClient,
      restoreClient,
      deleteClient,
      deleteClientOnly,
      getClientPaymentCount,
      upsertBrand,
      deleteBrand,
      upsertFutureProject,
      deleteFutureProject,
      updatePayment,
      deletePayment,
      markPaymentPaid,
      markReminderSent,
      saveProposal,
      removeProposal,
      saveVaultAccount,
      removeVaultAccount,
      saveInvoice,
      removeInvoice,
      markInvoicePaidRecord,
      prepareInvoiceParasutRecord,
      saveWhatsAppDraft,
      removeWhatsAppDraft,
      saveIntegrationNote,
      removeIntegrationNote,
      exportJson,
      resetAll,
      resetDemo,
      clearPaymentsOnly,
      clearProposalsOnly,
      clearBriefsOnly,
      createEmptyClient,
      createEmptyProposal,
      createEmptyBrand,
      createEmptyBrandProject,
      createEmptyFutureProject,
    }),
    [
      data,
      refresh,
      addBriefTask,
      toggleBriefTask,
      deleteBriefTask,
      updateBriefTask,
      setBriefNotes,
      appendBriefNote,
      deleteCollectedNote,
      updateCollectedNote,
      saveReceivable,
      removeReceivable,
      savePayable,
      removePayable,
      saveExpense,
      removeExpense,
      receiveReceivable,
      payPayable,
      deferPayableRecord,
      sendReceivableReminder,
      upsertClient,
      updateClient,
      archiveClient,
      restoreClient,
      deleteClient,
      deleteClientOnly,
      getClientPaymentCount,
      upsertBrand,
      deleteBrand,
      upsertFutureProject,
      deleteFutureProject,
      updatePayment,
      deletePayment,
      markPaymentPaid,
      markReminderSent,
      saveProposal,
      removeProposal,
      saveVaultAccount,
      removeVaultAccount,
      saveInvoice,
      removeInvoice,
      markInvoicePaidRecord,
      prepareInvoiceParasutRecord,
      saveWhatsAppDraft,
      removeWhatsAppDraft,
      saveIntegrationNote,
      removeIntegrationNote,
      exportJson,
      resetAll,
      resetDemo,
      clearPaymentsOnly,
      clearProposalsOnly,
      clearBriefsOnly,
    ],
  )

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>
}
