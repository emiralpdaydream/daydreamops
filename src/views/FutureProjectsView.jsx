import { useState } from 'react'
import ConfirmModal from '../components/ConfirmModal'
import { useOps } from '../lib/useOps'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import { DELETE_CONFIRM_MESSAGE } from '../lib/confirmMessages'
import PageHeader from '../components/PageHeader'

export default function FutureProjectsView() {
  const { data, upsertFutureProject, deleteFutureProject, createEmptyFutureProject } =
    useOps()
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  function save(e) {
    e.preventDefault()
    if (!editing.title.trim()) return
    upsertFutureProject(editing)
    setEditing(null)
  }

  return (
    <main className="page-main">
      <PageHeader {...SCREEN_INTRO.future} />

      <button
        type="button"
        onClick={() => setEditing(createEmptyFutureProject())}
        className="btn-primary btn-primary-inline section-gap"
      >
        Yeni proje
      </button>

      {editing && (
        <form
          onSubmit={save}
          className="panel-premium max-w-editorial p-8 md:p-10"
        >
          <label className="block">
            <span className="label-premium">Proje</span>
            <input
              className="input-premium mt-2"
              value={editing.title}
              onChange={(e) =>
                setEditing((p) => ({ ...p, title: e.target.value }))
              }
              required
            />
          </label>
          <label className="mt-4 block">
            <span className="label-premium">Marka (isteğe bağlı)</span>
            <input
              className="input-premium mt-2"
              value={editing.brand_name}
              onChange={(e) =>
                setEditing((p) => ({ ...p, brand_name: e.target.value }))
              }
            />
          </label>
          <label className="mt-4 block">
            <span className="label-premium">Not</span>
            <textarea
              className="input-premium mt-2 min-h-[100px]"
              value={editing.notes}
              onChange={(e) =>
                setEditing((p) => ({ ...p, notes: e.target.value }))
              }
            />
          </label>
          <div className="mt-6 flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="btn-ghost"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      <ul className="section-gap-lg max-w-content space-y-4">
        {(data.future_projects ?? []).length === 0 ? (
          <li className="text-dim">Pipeline boş.</li>
        ) : (
          data.future_projects.map((p) => (
            <li key={p.id} className="panel-premium p-6">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-display text-xl text-text">{p.title}</p>
                  {p.brand_name && (
                    <p className="mt-1 text-xs text-muted">{p.brand_name}</p>
                  )}
                  {p.notes && (
                    <p className="mt-2 text-sm text-dim">{p.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing({ ...p })}
                    className="btn-ghost"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete({ id: p.id, title: p.title })}
                    className="btn-ghost"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title="Projeyi sil"
        message={DELETE_CONFIRM_MESSAGE}
        confirmLabel="Sil"
        danger
        onConfirm={() => {
          deleteFutureProject(confirmDelete.id)
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </main>
  )
}
