import { createId } from './id'
import { PAYMENT_STATUS } from './constants'
import { daysFromToday, todayKey } from './dates'
import { ensureAccountingData } from './accountingStorage'
import { ensureBriefData } from './briefStorage'
import {
  applyLegacyClientName,
  isLegacyDemoClientId,
} from './legacyClientNames'
import { STORAGE_KEYS } from './storageKeys'

const DATA_KEY = STORAGE_KEYS.DATA
const ARCHIVE_DAYS = 30
const DATA_VERSION = 6

/** Seed kayıtları — isDemo bayrağı ile temizlenir */
const DEMO_CLIENT_IDS = new Set([
  'client_a',
  'client_b',
  'client_c',
  'client_d',
])

const DEMO_PAYMENT_IDS = new Set(['pay_a', 'pay_b', 'pay_c', 'pay_d'])

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

function enrichClient(c) {
  return {
    responsible: '',
    accounting_contact: '',
    creative_contact: '',
    contact_person: '',
    phone: '',
    email: '',
    agreed_price: c.monthly_fee ?? 0,
    pitch_deck_notes: '',
    archived: false,
    archived_at: null,
    isDemo: false,
    ...c,
    contact: c.contact ?? c.email ?? '',
  }
}

function markDemoEntity(entity, idSet) {
  if (entity.isDemo === true) return entity
  if (idSet.has(entity.id) || isLegacyDemoClientId(entity.id)) {
    return { ...entity, isDemo: true }
  }
  return entity
}

function emptyDataShape() {
  const key = todayKey()
  return {
    clients: [],
    payments: [],
    proposals: [],
    briefs: [],
    brief: { date: key, tasks: [], notes: '' },
    todos: [],
    daily_note: { date: key, text: '' },
    brands: [],
    future_projects: [],
    settings: {},
    accounting: {
      receivables: [],
      payables: [],
      expenses: [],
      accounts: [],
      debts: [],
    },
    version: DATA_VERSION,
  }
}

function normalizeData(parsed) {
  const base = { ...emptyDataShape(), ...parsed }
  base.clients = (base.clients ?? []).map((c) => {
    const enriched = enrichClient(c)
    enriched.name = applyLegacyClientName(enriched.name)
    return markDemoEntity(enriched, DEMO_CLIENT_IDS)
  })
  base.payments = (base.payments ?? []).map((p) =>
    markDemoEntity(
      {
        isDemo: false,
        reminder_sent: false,
        label: 'Ödeme',
        ...p,
      },
      DEMO_PAYMENT_IDS,
    ),
  )
  base.proposals = (base.proposals ?? []).map((p) => ({
    isDemo: false,
    ...p,
  }))
  base.briefs = (base.briefs ?? []).map((b) => ({
    isDemo: false,
    ...b,
  }))
  base.todos = base.todos ?? []
  base.brands = base.brands ?? []
  base.future_projects = base.future_projects ?? []
  base.daily_note = base.daily_note ?? { date: todayKey(), text: '' }
  base.settings = base.settings ?? {}
  base.version = DATA_VERSION
  return ensureAccountingData(ensureBriefData(base))
}

function migrateData(parsed) {
  return normalizeData(parsed)
}

function seedData() {
  const clientA = enrichClient({
    id: 'client_a',
    name: 'Müşteri A',
    service_type: 'İçerik Üretimi',
    monthly_fee: 47000,
    agreed_price: 47000,
    due_date: daysAgo(12),
    payment_status: PAYMENT_STATUS.OVERDUE,
    notes: 'Açık kalem — gecikmiş ödeme',
    isDemo: true,
    created_at: isoNow(),
  })

  const clientB = enrichClient({
    id: 'client_b',
    name: 'Retainer Müşteri',
    service_type: 'Marka Filmi',
    monthly_fee: 85000,
    agreed_price: 85000,
    due_date: daysAgo(5),
    paid_date: daysAgo(5),
    payment_status: PAYMENT_STATUS.PAID,
    notes: 'Tahsilat tamamlandı',
    isDemo: true,
    created_at: isoNow(),
  })

  const clientC = enrichClient({
    id: 'client_c',
    name: 'Müşteri C',
    service_type: 'Sosyal Medya Retainer',
    monthly_fee: 32000,
    agreed_price: 32000,
    due_date: daysAhead(5),
    payment_status: PAYMENT_STATUS.PENDING,
    notes: 'Bekleyen ödeme',
    isDemo: true,
    created_at: isoNow(),
  })

  const clientD = enrichClient({
    id: 'client_d',
    name: 'Müşteri D',
    service_type: 'Lansman Projesi',
    monthly_fee: 120000,
    agreed_price: 120000,
    due_date: daysAhead(14),
    payment_status: PAYMENT_STATUS.PENDING,
    notes: 'Yeni teklif aşaması',
    isDemo: true,
    created_at: isoNow(),
  })

  const clients = [clientA, clientB, clientC, clientD]

  const payments = [
    {
      id: 'pay_a',
      client_id: clientA.id,
      amount: 47000,
      due_date: clientA.due_date,
      paid_date: null,
      status: PAYMENT_STATUS.OVERDUE,
      reminder_sent: false,
      label: 'Açık kalem',
      isDemo: true,
    },
    {
      id: 'pay_b',
      client_id: clientB.id,
      amount: 85000,
      due_date: daysAgo(5),
      paid_date: daysAgo(5),
      status: PAYMENT_STATUS.PAID,
      reminder_sent: false,
      label: 'Tahsil edildi',
      isDemo: true,
    },
    {
      id: 'pay_c',
      client_id: clientC.id,
      amount: 32000,
      due_date: clientC.due_date,
      paid_date: null,
      status: PAYMENT_STATUS.PENDING,
      reminder_sent: false,
      label: 'Bekleyen Tahsilat',
      isDemo: true,
    },
    {
      id: 'pay_d',
      client_id: clientD.id,
      amount: 120000,
      due_date: clientD.due_date,
      paid_date: null,
      status: PAYMENT_STATUS.PENDING,
      reminder_sent: false,
      label: 'Proje avansı',
      isDemo: true,
    },
  ]

  const key = todayKey()
  return normalizeData({
    clients,
    briefs: [],
    brief: { date: key, tasks: [], notes: '' },
    proposals: [],
    payments,
    todos: [],
    daily_note: { date: key, text: '' },
    brands: [],
    future_projects: [],
    settings: {},
  })
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

/** Tüm state — tek giriş noktası (ileride async API) */
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
    const migrated = migrateData(parsed)
    const needsSave =
      migrated.version !== parsed.version ||
      (parsed.clients ?? []).some(
        (c, i) =>
          c.name !== migrated.clients[i]?.name ||
          c.isDemo !== migrated.clients[i]?.isDemo,
      )
    if (needsSave) {
      saveData(migrated)
    }
    return migrated
  } catch {
    const seed = seedData()
    saveData(seed)
    return seed
  }
}

export function saveData(data) {
  const normalized = normalizeData(data)
  localStorage.setItem(DATA_KEY, JSON.stringify(normalized))
  return normalized
}

export function exportAllData() {
  return JSON.stringify(loadData(), null, 2)
}

/** @deprecated use exportAllData */
export function exportDataJson() {
  return exportAllData()
}

export function resetAllData() {
  const seed = seedData()
  saveData(seed)
  return seed
}

/** @deprecated use resetAllData */
export function resetData() {
  return resetAllData()
}

export function resetDemoData(data) {
  const demoClientIds = new Set(
    data.clients.filter((c) => c.isDemo).map((c) => c.id),
  )
  const next = {
    ...data,
    clients: data.clients.filter((c) => !c.isDemo),
    payments: data.payments.filter(
      (p) => !p.isDemo && !demoClientIds.has(p.client_id),
    ),
    proposals: (data.proposals ?? []).filter((p) => !p.isDemo),
    briefs: (data.briefs ?? []).filter((b) => !b.isDemo),
  }
  return next
}

export function clearPayments(data) {
  return { ...data, payments: [] }
}

export function clearProposals(data) {
  return { ...data, proposals: [] }
}

export function clearBriefHistory(data) {
  return { ...data, briefs: [] }
}

export function updateClient(data, id, patch) {
  const next = { ...data }
  const idx = next.clients.findIndex((c) => c.id === id)
  if (idx < 0) return next
  next.clients[idx] = enrichClient({ ...next.clients[idx], ...patch })
  return next
}

export function deleteClient(data, clientId) {
  return {
    ...data,
    clients: data.clients.filter((c) => c.id !== clientId),
  }
}

export function archiveClient(data, clientId) {
  const next = { ...data }
  const c = next.clients.find((x) => x.id === clientId)
  if (c) {
    c.archived = true
    c.archived_at = isoNow()
  }
  return next
}

export function restoreClient(data, clientId) {
  const next = { ...data }
  const c = next.clients.find((x) => x.id === clientId)
  if (c) {
    c.archived = false
    c.archived_at = null
  }
  return next
}

export function deleteClientPayments(data, clientId) {
  return {
    ...data,
    payments: data.payments.filter((p) => p.client_id !== clientId),
  }
}

export function countClientPayments(data, clientId) {
  return data.payments.filter((p) => p.client_id === clientId).length
}

export function updatePayment(data, id, patch) {
  const next = { ...data }
  const idx = next.payments.findIndex((p) => p.id === id)
  if (idx < 0) return next
  next.payments[idx] = { ...next.payments[idx], ...patch }
  return next
}

export function deletePayment(data, paymentId) {
  return {
    ...data,
    payments: data.payments.filter((p) => p.id !== paymentId),
  }
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
    } else if (clientPayments.length) {
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
  return enrichClient({
    id: createId('client'),
    name: '',
    service_type: 'İçerik Üretimi',
    monthly_fee: 0,
    due_date: todayKey(),
    payment_status: PAYMENT_STATUS.PENDING,
    notes: '',
    isDemo: false,
    created_at: isoNow(),
  })
}

export function createEmptyBrand() {
  return {
    id: createId('brand'),
    name: '',
    notes: '',
    projects: [],
    created_at: isoNow(),
  }
}

export function createEmptyBrandProject() {
  return {
    id: createId('bproj'),
    title: '',
    description: '',
    date: todayKey(),
    created_at: isoNow(),
  }
}

export function createEmptyFutureProject() {
  return {
    id: createId('fproj'),
    title: '',
    brand_name: '',
    notes: '',
    status: 'planning',
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
    isDemo: false,
    created_at: isoNow(),
  }
}
