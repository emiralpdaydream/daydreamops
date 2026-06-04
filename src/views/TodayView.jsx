import { useOps } from '../lib/useOps'
import { getTodayBriefRecord, getTodayTasks, sortBriefTasks } from '../lib/briefSelectors'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import PageHeader from '../components/PageHeader'
import CollectedNotesSection from '../components/CollectedNotesSection'
import BriefTaskList from '../components/BriefTaskList'

export default function TodayView() {
  const {
    data,
    addBriefTask,
    toggleBriefTask,
    updateBriefTask,
    deleteBriefTask,
    setBriefNotes,
    appendBriefNote,
    deleteCollectedNote,
    updateCollectedNote,
  } = useOps()
  const brief = getTodayBriefRecord(data)
  const tasks = sortBriefTasks(getTodayTasks(data))

  return (
    <main className="page-main">
      <PageHeader {...SCREEN_INTRO.today} />

      <section className="panel-premium max-w-editorial p-6 md:p-8">
        <h2 className="label-premium">Günlük görevler</h2>
        <p className="mt-2 text-sm text-dim">
          Bugünkü işler — Dashboard ile aynı liste; tamamla, düzenle veya sil.
        </p>
        <div className="mt-6">
          <BriefTaskList
            tasks={tasks}
            onToggle={toggleBriefTask}
            onEdit={updateBriefTask}
            onDelete={deleteBriefTask}
            showAdd
            onAdd={addBriefTask}
          />
        </div>
      </section>

      <section className="panel-premium section-gap max-w-editorial p-6 md:p-8 collected-notes-panel">
        <h2 className="label-premium">Alınan notlar</h2>
        <p className="mt-2 text-sm text-dim">
          Toplantı, plan ve hatırlatmalar — AI Asistan da onayınızla buraya
          ekleyebilir. Otomatik kaydedilir.
        </p>
        <div className="mt-6">
          <CollectedNotesSection
            notes={brief.notes ?? ''}
            onSaveNotes={setBriefNotes}
            onAppendNote={appendBriefNote}
            onDeleteNote={deleteCollectedNote}
            onUpdateNote={updateCollectedNote}
          />
        </div>
      </section>
    </main>
  )
}
