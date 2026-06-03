import { useEffect, useState } from 'react'
import { useOps } from '../lib/useOps'
import { getTodayBriefRecord, sortBriefTasks } from '../lib/briefSelectors'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import PageHeader from '../components/PageHeader'

const NOTES_DEBOUNCE_MS = 400

export default function TodayView() {
  const { data, addBriefTask, toggleBriefTask, deleteBriefTask, setBriefNotes } =
    useOps()
  const brief = getTodayBriefRecord(data)
  const tasks = sortBriefTasks(brief.tasks)

  const [newTask, setNewTask] = useState('')
  const [notes, setNotes] = useState(() => brief.notes ?? '')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (notes !== (brief.notes ?? '')) {
        setBriefNotes(notes)
      }
    }, NOTES_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [notes, brief.notes, setBriefNotes])

  function handleAddTask(e) {
    e.preventDefault()
    const trimmed = newTask.trim()
    if (!trimmed) return
    addBriefTask(trimmed)
    setNewTask('')
  }

  return (
    <main className="page-main">
      <PageHeader {...SCREEN_INTRO.today} />

      <section className="panel-premium max-w-editorial p-6 md:p-8">
        <h2 className="label-premium">Günlük görevler</h2>
        <p className="mt-2 text-sm text-dim">
          Bugünkü işler — tamamla, sil veya yeniden aç.
        </p>

        <form
          onSubmit={handleAddTask}
          className="brief-add-form mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <input
            className="input-premium min-w-0 flex-1"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Bugün ne yapılacak?"
            aria-label="Yeni görev"
          />
          <button
            type="submit"
            className="btn-primary btn-primary-inline shrink-0"
          >
            Ekle
          </button>
        </form>

        {tasks.length === 0 ? (
          <p className="mt-8 font-display text-xl italic text-dim">
            Henüz görev yok — yukarıdan ekleyin.
          </p>
        ) : (
          <ul className="brief-task-list mt-6" role="list">
            {tasks.map((task, index) => (
              <li key={task.id} className="task-row">
                <input
                  type="checkbox"
                  className="task-row__check"
                  checked={task.done}
                  onChange={() => toggleBriefTask(task.id)}
                  aria-label={`Görev ${index + 1}: ${task.text}`}
                />
                <span className="task-row__num" aria-hidden>
                  {index + 1}.
                </span>
                <span
                  className={`task-row__text${task.done ? ' is-done' : ''}`}
                >
                  {task.text}
                </span>
                <button
                  type="button"
                  className="task-row__delete btn-ghost"
                  onClick={() => deleteBriefTask(task.id)}
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel-premium section-gap max-w-editorial p-6 md:p-8">
        <h2 className="label-premium">Serbest notlar</h2>
        <p className="mt-2 text-sm text-dim">
          Toplantı notları, hatırlatmalar — otomatik kaydedilir.
        </p>
        <textarea
          className="input-premium mt-6 min-h-[120px] w-full max-w-full"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Bugün veya yarın için notlarınız…"
          aria-label="Serbest notlar"
        />
      </section>
    </main>
  )
}
