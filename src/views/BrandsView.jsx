import { useState } from 'react'
import { useOps } from '../lib/useOps'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import { formatDateTr } from '../lib/dates'
import PageHeader from '../components/PageHeader'

export default function BrandsView() {
  const {
    data,
    upsertBrand,
    deleteBrand,
    createEmptyBrand,
    createEmptyBrandProject,
  } = useOps()
  const [editing, setEditing] = useState(null)

  function startNew() {
    setEditing(createEmptyBrand())
  }

  function saveBrand(e) {
    e.preventDefault()
    if (!editing.name.trim()) return
    upsertBrand(editing)
    setEditing(null)
  }

  function addProject() {
    setEditing((b) => ({
      ...b,
      projects: [...(b.projects ?? []), createEmptyBrandProject()],
    }))
  }

  function updateProject(index, field, value) {
    setEditing((b) => {
      const projects = [...b.projects]
      projects[index] = { ...projects[index], [field]: value }
      return { ...b, projects }
    })
  }

  return (
    <main className="page-main">
      <PageHeader {...SCREEN_INTRO.brands} />

      <div className="section-gap flex max-w-wide flex-wrap gap-3">
        <button type="button" onClick={startNew} className="btn-primary btn-primary-inline">
          Yeni marka
        </button>
      </div>

      {editing && (
        <form
          onSubmit={saveBrand}
          className="panel-premium section-gap max-w-content p-8 md:p-10"
        >
          <h2 className="label-premium">
            {editing.id && data.brands.some((b) => b.id === editing.id)
              ? 'Marka düzenle'
              : 'Yeni marka'}
          </h2>
          <label className="mt-6 block">
            <span className="label-premium">Marka adı</span>
            <input
              className="input-premium mt-2"
              value={editing.name}
              onChange={(e) =>
                setEditing((b) => ({ ...b, name: e.target.value }))
              }
              required
            />
          </label>
          <label className="mt-4 block">
            <span className="label-premium">Notlar</span>
            <textarea
              className="input-premium mt-2 min-h-[80px]"
              value={editing.notes}
              onChange={(e) =>
                setEditing((b) => ({ ...b, notes: e.target.value }))
              }
            />
          </label>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="label-premium">Projeler / yüklemeler</p>
              <button type="button" onClick={addProject} className="btn-ghost">
                + Kayıt
              </button>
            </div>
            {(editing.projects ?? []).map((p, i) => (
              <div key={p.id} className="mt-4 border-t border-border pt-4">
                <input
                  className="input-premium"
                  placeholder="Başlık"
                  value={p.title}
                  onChange={(e) => updateProject(i, 'title', e.target.value)}
                />
                <textarea
                  className="input-premium mt-3 min-h-[60px]"
                  placeholder="Ne yaptık?"
                  value={p.description}
                  onChange={(e) =>
                    updateProject(i, 'description', e.target.value)
                  }
                />
                <input
                  type="date"
                  className="input-premium mt-3"
                  value={p.date}
                  onChange={(e) => updateProject(i, 'date', e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-2">
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

      <ul className="section-gap max-w-content space-y-4">
        {(data.brands ?? []).length === 0 ? (
          <li className="text-dim">Henüz marka kaydı yok.</li>
        ) : (
          data.brands.map((brand) => (
            <li key={brand.id} className="panel-premium p-6 md:p-8">
              <div className="flex justify-between gap-4">
                <h3 className="font-display text-2xl font-medium text-text">
                  {brand.name}
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing({ ...brand })}
                    className="btn-ghost"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`${brand.name} silinsin mi?`)) {
                        deleteBrand(brand.id)
                      }
                    }}
                    className="btn-ghost"
                  >
                    Sil
                  </button>
                </div>
              </div>
              {brand.notes && (
                <p className="mt-3 text-sm text-dim">{brand.notes}</p>
              )}
              {(brand.projects ?? []).length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-border pt-4">
                  {brand.projects.map((p) => (
                    <li key={p.id} className="text-sm">
                      <p className="font-medium text-text">{p.title}</p>
                      <p className="text-muted">{formatDateTr(p.date)}</p>
                      {p.description && (
                        <p className="mt-1 text-dim">{p.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))
        )}
      </ul>
    </main>
  )
}
