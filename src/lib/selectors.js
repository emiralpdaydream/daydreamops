import { PAYMENT_STATUS } from './constants'
import { daysFromToday, todayKey } from './dates'

export function getActiveClients(clients) {
  return clients.filter((c) => !c.archived)
}

export function getTodayBrief(briefs) {
  const key = todayKey()
  return briefs.find((b) => b.date === key) ?? null
}

export function getDashboardStats(data) {
  const clients = getActiveClients(data.clients)
  const openPayments = data.payments.filter((p) => p.status !== PAYMENT_STATUS.PAID)

  const overdueAmount = openPayments
    .filter((p) => p.status === PAYMENT_STATUS.OVERDUE)
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const pendingAmount = openPayments
    .filter((p) => p.status !== PAYMENT_STATUS.OVERDUE)
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const brief = getTodayBrief(data.briefs)
  const priorities = brief?.priorities?.filter((p) => p?.trim()) ?? []
  const briefDone = priorities.length
  const briefTotal = 3

  return {
    activeClients: clients.length,
    overdueAmount,
    pendingAmount,
    briefDone,
    briefTotal,
    todayPriorities: priorities.map((text, i) => ({
      id: `p-${i}`,
      text,
    })),
  }
}

export function getOverduePayments(data, limit = 3) {
  return data.payments
    .filter((p) => p.status === PAYMENT_STATUS.OVERDUE)
    .map((p) => {
      const client = data.clients.find((c) => c.id === p.client_id)
      return {
        id: p.id,
        client: client?.name ?? 'Müşteri',
        label: p.label || 'Ödeme',
        daysLate: Math.abs(daysFromToday(p.due_date)),
        amount: p.amount,
        payment: p,
        clientRecord: client,
      }
    })
    .sort((a, b) => b.daysLate - a.daysLate)
    .slice(0, limit)
}

export function getTahsilatGroups(data) {
  const open = data.payments.filter((p) => p.status !== PAYMENT_STATUS.PAID)

  const overdue = []
  const dueSoon = []
  const pending = []

  open.forEach((p) => {
    const client = data.clients.find((c) => c.id === p.client_id)
    const item = {
      payment: p,
      client: client?.name ?? 'Müşteri',
      service: client?.service_type ?? '',
      days: daysFromToday(p.due_date),
    }
    if (p.status === PAYMENT_STATUS.OVERDUE) overdue.push(item)
    else if (item.days >= 0 && item.days <= 7) dueSoon.push(item)
    else pending.push(item)
  })

  return { overdue, dueSoon, pending }
}

export function getTahsilatStatTotals(data) {
  const open = data.payments.filter((p) => p.status !== PAYMENT_STATUS.PAID)
  const overdue = open
    .filter((p) => p.status === PAYMENT_STATUS.OVERDUE)
    .reduce((s, p) => s + p.amount, 0)
  const pending = open
    .filter((p) => p.status !== PAYMENT_STATUS.OVERDUE)
    .reduce((s, p) => s + p.amount, 0)
  const weekDue = open
    .filter((p) => {
      const d = daysFromToday(p.due_date)
      return d >= 0 && d <= 7 && p.status !== PAYMENT_STATUS.OVERDUE
    })
    .reduce((s, p) => s + p.amount, 0)
  return { overdue, pending, weekDue }
}
