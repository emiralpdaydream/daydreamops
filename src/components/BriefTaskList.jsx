import { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import { DELETE_CONFIRM_MESSAGE } from '../lib/confirmMessages'

function taskStatusLabel(done) {
  return done ? 'Tamamlandı' : 'Açık'
}

export default function BriefTaskList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  showAdd = false,
  onAdd,
  addPlaceholder = 'Bugün ne yapılacak?',
  compact = false,
  taskActionStyle = 'default',
}) {
  const [newTask, setNewTask] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  function handleAdd(e) {
    e.preventDefault()
    const t = newTask.trim()
    if (!t) return
    onAdd?.(t)
    setNewTask('')
  }

  function startEdit(task) {
    setEditingId(task.id)
    setEditText(task.text)
  }

  function commitEdit(taskId) {
    const t = editText.trim()
    if (t) onEdit?.(taskId, t)
    setEditingId(null)
    setEditText('')
  }

  return (
    <div className={`brief-task-panel${compact ? ' brief-task-panel--compact' : ''}`}>
      {showAdd && onAdd && (
        <form
          onSubmit={handleAdd}
          className="brief-add-form flex flex-col gap-3 sm:flex-row"
        >
          <input
            className="input-premium min-w-0 flex-1"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder={addPlaceholder}
            aria-label="Yeni görev"
          />
          <button type="submit" className="btn-primary btn-primary-inline shrink-0">
            Ekle
          </button>
        </form>
      )}

      {tasks.length === 0 ? (
        <p className="brief-task-panel__empty font-display text-xl italic text-dim">
          Henüz görev yok — yukarıdan ekleyin.
        </p>
      ) : (
        <ul className="brief-task-list" role="list">
          {tasks.map((task, index) => (
            <li key={task.id} className="task-row">
              <label className="task-row__complete-wrap">
                <input
                  type="checkbox"
                  className="task-row__check"
                  checked={task.done}
                  onChange={() => onToggle(task.id)}
                  aria-label={`Tamamla: ${task.text}`}
                />
                {taskActionStyle === 'ceo' && (
                  <span className="task-row__complete-label">Tamamla</span>
                )}
              </label>
              {taskActionStyle !== 'ceo' && (
                <span className="task-row__num" aria-hidden>
                  {index + 1}.
                </span>
              )}
              {editingId === task.id ? (
                <input
                  className="input-premium task-row__edit-input min-w-0 flex-1"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => commitEdit(task.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      commitEdit(task.id)
                    }
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  autoFocus
                  aria-label="Görevi düzenle"
                />
              ) : (
                <span
                  className={`task-row__text min-w-0 flex-1${task.done ? ' is-done' : ''}`}
                >
                  {task.text}
                </span>
              )}
              <span className="task-row__status" aria-label="Durum">
                {taskStatusLabel(task.done)}
              </span>
              <div className="task-row__actions">
                <button
                  type="button"
                  className="task-row__action btn-ghost"
                  onClick={() => startEdit(task)}
                >
                  {taskActionStyle === 'ceo' ? '✏ Düzenle' : 'Düzenle'}
                </button>
                <button
                  type="button"
                  className="task-row__action btn-ghost"
                  onClick={() => setConfirmDelete({ taskId: task.id })}
                >
                  {taskActionStyle === 'ceo' ? '🗑 Sil' : 'Sil'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title={confirmDelete?.title ?? 'Görevi sil'}
        message={confirmDelete?.message ?? DELETE_CONFIRM_MESSAGE}
        confirmLabel="Sil"
        danger
        onConfirm={() => {
          onDelete?.(confirmDelete.taskId)
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
