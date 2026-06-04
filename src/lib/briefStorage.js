import { createId } from './id'
import { todayKey } from './dates'
import {
  deleteNoteById,
  updateNoteById,
} from './collectedNotesUtils'
import {
  normalizeTask,
  peekTodayNotes,
  peekTodayTasks,
  applyTodayTasksSync,
} from './taskStorage'

function isoNow() {
  return new Date().toISOString()
}

export { normalizeTask }

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

/** Gün değişimi, legacy migration, tek görev listesi (data.tasks + brief.tasks) */
export function ensureBriefData(data) {
  const key = todayKey()
  let next = { ...data }
  next.briefs = (next.briefs ?? [])
    .map(normalizeArchivedBrief)
    .filter(Boolean)

  let notes = peekTodayNotes(next)
  let todayTasks = peekTodayTasks(next)
  const brief = next.brief

  if (!brief || !brief.date) {
    notes = peekTodayNotes(next) || notes
    if (!todayTasks.length) todayTasks = peekTodayTasks(next)
  } else if (brief.date !== key) {
    next = archiveBriefIfNeeded(next, {
      date: brief.date,
      tasks: (brief.tasks ?? []).map(normalizeTask),
      notes: String(brief.notes ?? ''),
    })
    const restored = next.briefs.find((b) => b.date === key)
    if (restored) {
      todayTasks = (restored.tasks ?? []).map(normalizeTask)
      notes = restored.notes ?? ''
    } else if (!todayTasks.length) {
      todayTasks = []
      notes = notes || ''
    }
  } else {
    notes = String(brief.notes ?? notes)
    if (!todayTasks.length) {
      todayTasks = (brief.tasks ?? []).map(normalizeTask)
    }
  }

  return applyTodayTasksSync(next, todayTasks, notes, key)
}

function withTodayTasks(mutator) {
  return (data, ...args) => {
    const next = ensureBriefData({ ...data })
    const tasks = mutator(next.tasks ?? [], ...args)
    return applyTodayTasksSync(next, tasks, next.brief?.notes ?? '', todayKey())
  }
}

export function addBriefTask(data, text) {
  const trimmed = text?.trim()
  if (!trimmed) return ensureBriefData({ ...data })
  return withTodayTasks((tasks, t) => [
    ...tasks,
    { id: createId('task'), text: t, done: false },
  ])(data, trimmed)
}

export const toggleBriefTask = withTodayTasks((tasks, taskId) =>
  tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
)

export const deleteBriefTask = withTodayTasks((tasks, taskId) =>
  tasks.filter((t) => t.id !== taskId),
)

export const updateBriefTask = withTodayTasks((tasks, taskId, text) => {
  const trimmed = text?.trim()
  if (!trimmed) return tasks
  return tasks.map((t) => (t.id === taskId ? { ...t, text: trimmed } : t))
})

export function setBriefNotes(data, notes) {
  const next = ensureBriefData({ ...data })
  return applyTodayTasksSync(
    next,
    next.tasks ?? [],
    notes ?? '',
    todayKey(),
  )
}

/** Alınan notlara zaman damgalı satır ekler */
export function deleteCollectedNote(data, noteId) {
  const next = ensureBriefData({ ...data })
  const notes = deleteNoteById(next.brief?.notes ?? '', noteId)
  return applyTodayTasksSync(next, next.tasks ?? [], notes, todayKey())
}

export function updateCollectedNote(data, noteId, text) {
  const next = ensureBriefData({ ...data })
  const notes = updateNoteById(next.brief?.notes ?? '', noteId, text)
  return applyTodayTasksSync(next, next.tasks ?? [], notes, todayKey())
}

export function appendBriefNote(data, text) {
  const t = String(text ?? '').trim()
  if (!t) return ensureBriefData({ ...data })
  const next = ensureBriefData({ ...data })
  const stamp = new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const line = `• ${stamp} — ${t}`
  const prev = String(next.brief?.notes ?? '').trim()
  const notes = prev ? `${prev}\n${line}` : line
  return applyTodayTasksSync(next, next.tasks ?? [], notes, todayKey())
}
