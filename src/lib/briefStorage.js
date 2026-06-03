import { createId } from './id'
import { todayKey } from './dates'

function isoNow() {
  return new Date().toISOString()
}

function emptyBrief(date = todayKey()) {
  return { date, tasks: [], notes: '' }
}

function normalizeTask(t) {
  return {
    id: t?.id ?? createId('task'),
    text: String(t?.text ?? '').trim(),
    done: !!t?.done,
  }
}

export function normalizeArchivedBrief(b) {
  if (!b?.date) return null
  const tasks = Array.isArray(b.tasks)
    ? b.tasks.map(normalizeTask)
    : []
  const notes =
    typeof b.notes === 'string'
      ? b.notes
      : typeof b.text === 'string'
        ? b.text
        : typeof b.summary === 'string'
          ? b.summary
          : ''
  return {
    date: b.date,
    tasks,
    notes,
    archived_at: b.archived_at ?? null,
    isDemo: b.isDemo ?? false,
  }
}

function sortLegacyTodos(todos) {
  return [...(todos ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )
}

function buildBriefFromLegacy(data, date = todayKey()) {
  const tasks = sortLegacyTodos(data.todos).map((t) =>
    normalizeTask({
      id: t.id,
      text: t.text,
      done: t.done,
    }),
  )
  const noteDate = data.daily_note?.date
  const notes =
    noteDate === date ? String(data.daily_note?.text ?? '') : ''
  return { date, tasks, notes }
}

function briefHasContent(brief) {
  return (brief?.tasks?.length ?? 0) > 0 || Boolean(brief?.notes?.trim())
}

function archiveBriefIfNeeded(data, brief) {
  if (!brief?.date || !briefHasContent(brief)) return data
  const briefs = [...(data.briefs ?? [])]
  const idx = briefs.findIndex((b) => b.date === brief.date)
  const entry = {
    ...normalizeArchivedBrief(brief),
    archived_at: isoNow(),
  }
  if (idx >= 0) {
    briefs[idx] = entry
  } else {
    briefs.push(entry)
  }
  return { ...data, briefs }
}

/** Gün değişimi, legacy migration, brief şeması */
export function ensureBriefData(data) {
  const key = todayKey()
  let next = { ...data }
  next.briefs = (next.briefs ?? [])
    .map(normalizeArchivedBrief)
    .filter(Boolean)

  let brief = next.brief

  if (!brief || !brief.date) {
    brief = buildBriefFromLegacy(next, key)
  } else {
    brief = {
      date: brief.date,
      tasks: (brief.tasks ?? []).map(normalizeTask),
      notes: String(brief.notes ?? ''),
    }
  }

  if (brief.date !== key) {
    next = archiveBriefIfNeeded(next, brief)
    const restored = next.briefs.find((b) => b.date === key)
    brief = restored
      ? {
          date: key,
          tasks: (restored.tasks ?? []).map(normalizeTask),
          notes: restored.notes ?? '',
        }
      : emptyBrief(key)
  }

  next.brief = brief
  return next
}

export function addBriefTask(data, text) {
  const trimmed = text?.trim()
  if (!trimmed) return data
  const next = ensureBriefData({ ...data })
  next.brief = {
    ...next.brief,
    tasks: [
      ...next.brief.tasks,
      { id: createId('task'), text: trimmed, done: false },
    ],
  }
  return next
}

export function toggleBriefTask(data, taskId) {
  const next = ensureBriefData({ ...data })
  const tasks = next.brief.tasks.map((t) =>
    t.id === taskId ? { ...t, done: !t.done } : t,
  )
  next.brief = { ...next.brief, tasks }
  return next
}

export function deleteBriefTask(data, taskId) {
  const next = ensureBriefData({ ...data })
  next.brief = {
    ...next.brief,
    tasks: next.brief.tasks.filter((t) => t.id !== taskId),
  }
  return next
}

export function setBriefNotes(data, notes) {
  const next = ensureBriefData({ ...data })
  next.brief = { ...next.brief, notes: notes ?? '' }
  return next
}

/** Alınan notlara zaman damgalı satır ekler */
export function appendBriefNote(data, text) {
  const t = String(text ?? '').trim()
  if (!t) return ensureBriefData({ ...data })
  const next = ensureBriefData({ ...data })
  const stamp = new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const line = `• ${stamp} — ${t}`
  const prev = String(next.brief.notes ?? '').trim()
  const notes = prev ? `${prev}\n${line}` : line
  next.brief = { ...next.brief, notes }
  return next
}
