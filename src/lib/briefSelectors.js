import { todayKey } from './dates'
import { peekTodayNotes, peekTodayTasks } from './taskStorage'

/** Bugünün brief kaydı — görevler tek kaynak (data.tasks, brief ile senkron) */
export function getTodayBriefRecord(data) {
  const key = todayKey()
  return {
    date: key,
    tasks: peekTodayTasks(data),
    notes: peekTodayNotes(data),
  }
}

export function getTodayTasks(data) {
  return peekTodayTasks(data)
}

export function sortBriefTasks(tasks) {
  return [...(tasks ?? [])]
}

export function getBriefStats(brief) {
  const tasks = brief?.tasks ?? []
  const total = tasks.length
  const done = tasks.filter((t) => t.done).length
  const open = total - done

  let summaryLabel = 'Görev yok'
  if (total > 0) {
    if (open === 0) {
      summaryLabel = `${done}/${total} tamamlandı`
    } else {
      summaryLabel = `${done}/${total} tamamlandı · ${open} açık`
    }
  }

  return { total, done, open, summaryLabel }
}

export function getOpenBriefTasks(brief, limit) {
  const open = sortBriefTasks(brief?.tasks).filter((t) => !t.done)
  return limit ? open.slice(0, limit) : open
}
