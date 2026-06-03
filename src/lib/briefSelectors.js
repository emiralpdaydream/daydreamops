import { todayKey } from './dates'

export function getTodayBriefRecord(data) {
  const key = todayKey()
  if (data?.brief?.date === key) return data.brief
  return { date: key, tasks: [], notes: '' }
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
