import { createId } from './id'
import { todayKey } from './dates'

/** Görev şeması — numara saklanmaz, UI index üretir */
export function normalizeTask(t) {
  return {
    id: t?.id ?? createId('task'),
    text: String(t?.text ?? '').trim(),
    done: !!t?.done,
  }
}

function sortLegacyTodos(todos) {
  return [...(todos ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )
}

function tasksFromLegacyTodos(data) {
  return sortLegacyTodos(data.todos).map((t) =>
    normalizeTask({ id: t.id, text: t.text, done: t.done }),
  )
}

function dedupeTasks(list) {
  const seen = new Set()
  const out = []
  for (const t of list.map(normalizeTask)) {
    if (!t.text || seen.has(t.id)) continue
    seen.add(t.id)
    out.push(t)
  }
  return out
}

/**
 * Bugünün görevleri — salt okuma (ensureBriefData çalışmadan önce UI için).
 * Öncelik: data.tasks → brief (bugün) → briefs[bugün] → legacy todos
 */
export function peekTodayTasks(data) {
  const key = todayKey()
  const candidates = []

  if (Array.isArray(data?.tasks) && data.tasks.length > 0) {
    candidates.push(...data.tasks)
  }

  if (data?.brief?.date === key && Array.isArray(data.brief.tasks)) {
    candidates.push(...data.brief.tasks)
  }

  const archived = (data?.briefs ?? []).find((b) => b.date === key)
  if (archived?.tasks?.length) {
    candidates.push(...archived.tasks)
  }

  if ((data?.todos?.length ?? 0) > 0) {
    candidates.push(...tasksFromLegacyTodos(data))
  }

  if (data?.brief?.date && data.brief.date !== key && Array.isArray(data.brief.tasks)) {
    candidates.push(...data.brief.tasks)
  }

  return dedupeTasks(candidates)
}

export function peekTodayNotes(data) {
  const key = todayKey()
  if (data?.brief?.date === key) {
    return String(data.brief.notes ?? '')
  }
  const archived = (data?.briefs ?? []).find((b) => b.date === key)
  if (archived?.notes) return String(archived.notes)
  const noteDate = data?.daily_note?.date
  if (noteDate === key) return String(data.daily_note?.text ?? '')
  return ''
}

/** brief + tasks senkron — ensureBriefData sonunda çağrılır */
export function applyTodayTasksSync(next, tasks, notes, date = todayKey()) {
  const normalized = dedupeTasks(tasks)
  next.tasks = normalized
  next.brief = {
    date,
    tasks: normalized,
    notes: notes ?? '',
  }
  return next
}
