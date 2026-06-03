export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function parseDate(value) {
  if (!value) return null
  const d = new Date(`${value}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function daysFromToday(dateStr) {
  const d = parseDate(dateStr)
  if (!d) return 0
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Math.round((d - today) / (1000 * 60 * 60 * 24))
}

export function formatDateTr(dateStr) {
  const d = parseDate(dateStr)
  if (!d) return '—'
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
