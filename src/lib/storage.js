import { createId } from './id'
import { PAYMENT_STATUS } from './constants'
import { daysFromToday, todayKey } from './dates'

import { STORAGE_KEYS } from './storageKeys'

const DATA_KEY = STORAGE_KEYS.DATA
const ARCHIVE_DAYS = 30

function seedData() {
  const hyperpower = {
    id: 'client_hyperpower',
    name: 'Hyperpower',
    service_type: 'Content Production',
    monthly_fee: 47000,
    due_date: daysAgo(12),
    payment_status: PAYMENT_STATUS.OVERDUE,
    notes: 'Mart ödemesi gecikmiş',
    contact: '',
    archived: false,
    created_at: isoNow(),
  }

  const roberto = {
    id: 'client_roberto',
    name: 'Roberto Bravo',
    service_type: 'Content Production',
    monthly_fee: 85000,
    due_date: daysAhead(24),
    payment_status: PAYMENT_STATUS.PAID,
    notes: 'Nisan tahsilatı tamamlandı',
    contact: '',
    archived: false,
    created_at: isoNow(),
  }

  const eleventy = {
    id: 'client_eleventy',
    name: 'Eleventy',
    service_type: 'Social Management',
    monthly_fee: 32000,
    due_date: daysAhead(5),
    payment_status: PAYMENT_STATUS.PENDING,
    notes: 'Teklif bekleniyor',
    contact: '',
    archived: false,
    created_at: isoNow(),
  }

  const parkHyatt = {
    id: 'client_parkhyatt',
    name: 'Park Hyatt',
    service_type: 'Tek Seferlik',
    monthly_fee: 120000,
    due_date: daysAhead(14),
    payment_status: PAYMENT_STATUS.PENDING,
    notes: '3 günlük çekim teklifi',
    contact: '',
    archived: false,
    created_at: isoNow(),
  }

  const clients = [hyperpower, roberto, eleventy, parkHyatt]

  const payments = [
    {
      id: 'pay_hyper_mart',
      client_id: hyperpower.id,
      amount: 47000,
      due_date: hyperpower.due_date,
      paid_date: null,
      status: PAYMENT_STATUS.OVERDUE,
      reminder_sent: false,
      label: 'Mart ödemesi',
    },
    {
      id: 'pay_roberto_apr',
      client_id: roberto.id,
      amount: 85000,
      due_date: daysAgo(5),
      paid_date: daysAgo(5),
      status: PAYMENT_STATUS.PAID,
      reminder_sent: false,
      label: 'Nisan ödemesi',
    },
    {
      id: 'pay_eleventy',
      client_id: eleventy.id,
      amount: 32000,
      due_date: eleventy.due_date,
      paid_date: null,
      status: PAYMENT_STATUS.PENDING,
      reminder_sent: false,
      label: 'Nisan ödemesi',
    },
    {
      id: 'pay_parkhyatt',
      client_id: parkHyatt.id,
      amount: 120000,
      due_date: parkHyatt.due_date,
      paid_date: null,
      status: PAYMENT_STATUS.PENDING,
      reminder_sent: false,
      label: 'Proje avansı',
    },
  ]

  return {
    clients,
    briefs: [],
    proposals: [],
    payments,
    version: 1,
  }
}

function isoNow() {
  return new Date().toISOString()
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function daysAhead(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function isValidData(parsed) {
  return (
    parsed &&
    typeof parsed === 'object' &&
    Array.isArray(parsed.clients) &&
    Array.isArray(parsed.briefs) &&
    Array.isArray(parsed.proposals) &&
    Array.isArray(parsed.payments)
  )
}

export function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (!raw) {
      const seed = seedData()
      saveData(seed)
      return seed
    }
    const parsed = JSON.parse(raw)
    if (!isValidData(parsed)) {
      const seed = seedData()
      saveData(seed)
      return seed
    }
    return parsed
  } catch {
    const seed = seedData()
    saveData(seed)
    return seed
  }
}

export function saveData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

export function resetData() {
  const seed = seedData()
  saveData(seed)
  return seed
}

export function exportDataJson() {
  return JSON.stringify(loadData(), null, 2)
}

export function syncPaymentStatuses(data) {
  data.payments.forEach((p) => {
    if (p.status === PAYMENT_STATUS.PAID) return
    if (p.paid_date) {
      p.status = PAYMENT_STATUS.PAID
      return
    }
    const diff = daysFromToday(p.due_date)
    if (diff < 0) p.status = PAYMENT_STATUS.OVERDUE
    else if (p.status === PAYMENT_STATUS.OVERDUE && diff >= 0) {
      p.status = PAYMENT_STATUS.PENDING
    }
  })
  data.clients.forEach((c) => {
    if (c.archived) return
    const clientPayments = data.payments.filter((p) => p.client_id === c.id)
    const open = clientPayments.filter((p) => p.status !== PAYMENT_STATUS.PAID)
    if (open.some((p) => p.status === PAYMENT_STATUS.OVERDUE)) {
      c.payment_status = PAYMENT_STATUS.OVERDUE
    } else if (open.length) {
      c.payment_status = open[0].status
    } else {
      c.payment_status = PAYMENT_STATUS.PAID
    }
    const latest = open.sort((a, b) => a.due_date.localeCompare(b.due_date))[0]
    if (latest) c.due_date = latest.due_date
  })
  return data
}

export function purgeArchivedClients(data) {
  const cutoff = Date.now() - ARCHIVE_DAYS * 24 * 60 * 60 * 1000
  data.clients = data.clients.filter((c) => {
    if (!c.archived) return true
    const archivedAt = c.archived_at ? new Date(c.archived_at).getTime() : 0
    return archivedAt > cutoff
  })
  return data
}

export function createEmptyClient() {
  return {
    id: createId('client'),
    name: '',
    service_type: 'Content Production',
    monthly_fee: 0,
    due_date: todayKey(),
    payment_status: PAYMENT_STATUS.PENDING,
    notes: '',
    contact: '',
    archived: false,
    created_at: isoNow(),
  }
}

export function createEmptyProposal() {
  return {
    id: createId('proposal'),
    client_name: '',
    project_type: 'Marka filmi',
    date: todayKey(),
    budget: 0,
    deliverables: [],
    notes: '',
    generated_text: '',
    created_at: isoNow(),
  }
}
