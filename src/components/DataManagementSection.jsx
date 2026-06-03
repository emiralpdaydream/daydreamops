import { useMemo, useState } from 'react'
import { useOps } from '../lib/useOps'
import { useToast } from '../lib/useToast'
import ConfirmModal from './ConfirmModal'

function downloadJson(json, filename) {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function DataManagementSection() {
  const {
    data,
    exportJson,
    resetAll,
    resetDemo,
    clearPaymentsOnly,
    clearProposalsOnly,
    clearBriefsOnly,
    restoreClient,
  } = useOps()
  const { showToast } = useToast()
  const [confirm, setConfirm] = useState(null)

  const archived = useMemo(
    () =>
      (data.clients ?? [])
        .filter((c) => c.archived)
        .sort((a, b) => a.name.localeCompare(b.name, 'tr')),
    [data.clients],
  )

  function handleExport() {
    downloadJson(
      exportJson(),
      `daydream-ops-export-${new Date().toISOString().slice(0, 10)}.json`,
    )
    showToast('Veriler dışa aktarıldı.')
  }

  function runConfirmAction() {
    if (!confirm) return
    const { type } = confirm
    setConfirm(null)
    switch (type) {
      case 'resetAll':
        resetAll()
        showToast('Tüm veriler sıfırlandı.')
        break
      case 'clearPayments':
        clearPaymentsOnly()
        showToast('Tahsilat kayıtları temizlendi.')
        break
      case 'clearProposals':
        clearProposalsOnly()
        showToast('Teklifler temizlendi.')
        break
      case 'clearBriefs':
        clearBriefsOnly()
        showToast('Brief geçmişi temizlendi.')
        break
      case 'resetDemo':
        resetDemo()
        showToast('Demo veriler temizlendi.')
        break
      default:
        break
    }
  }

  const confirmCopy = {
    resetAll: {
      title: 'Tüm veriyi sıfırla',
      message:
        'Tüm müşteri, tahsilat, teklif ve brief verileri silinip örnek veriye dönülecek. Emin misin?',
      confirmLabel: 'Sıfırla',
    },
    clearPayments: {
      title: 'Tahsilatları temizle',
      message: 'Tüm tahsilat kayıtları kalıcı olarak silinecek. Emin misin?',
      confirmLabel: 'Temizle',
    },
    clearProposals: {
      title: 'Teklifleri temizle',
      message: 'Tüm teklif kayıtları kalıcı olarak silinecek. Emin misin?',
      confirmLabel: 'Temizle',
    },
    clearBriefs: {
      title: 'Brief geçmişini temizle',
      message: 'Tüm brief geçmişi kalıcı olarak silinecek. Emin misin?',
      confirmLabel: 'Temizle',
    },
    resetDemo: {
      title: 'Demo verileri temizle',
      message:
        'isDemo ile işaretli örnek müşteri, tahsilat ve demo teklifler silinecek. Emin misin?',
      confirmLabel: 'Demo temizle',
    },
  }

  const activeConfirm = confirm ? confirmCopy[confirm.type] : null

  return (
    <section className="settings-section panel-premium max-w-content p-6 md:p-8">
      <h2 className="settings-section__title">Veri yönetimi</h2>
      <ul className="data-mgmt-list mt-6">
        <li>
          <button type="button" onClick={handleExport} className="data-mgmt-btn">
            Tüm veriyi dışa aktar
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setConfirm({ type: 'resetAll' })}
            className="data-mgmt-btn data-mgmt-btn--danger"
          >
            Tüm veriyi sıfırla
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setConfirm({ type: 'clearPayments' })}
            className="data-mgmt-btn"
          >
            Sadece tahsilatları temizle
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setConfirm({ type: 'clearProposals' })}
            className="data-mgmt-btn"
          >
            Sadece teklifleri temizle
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setConfirm({ type: 'clearBriefs' })}
            className="data-mgmt-btn"
          >
            Sadece brief geçmişini temizle
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setConfirm({ type: 'resetDemo' })}
            className="data-mgmt-btn"
          >
            Demo verileri temizle
          </button>
        </li>
      </ul>

      <div className="mt-10 border-t border-border pt-8">
        <h3 className="label-premium">Arşivlenmiş müşteriler</h3>
        {archived.length === 0 ? (
          <p className="mt-4 font-sans text-sm text-dim">Arşiv boş.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {archived.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-text">{c.name}</p>
                  <p className="text-xs text-muted">{c.service_type}</p>
                </div>
                <button
                  type="button"
                  className="btn-ghost shrink-0 text-xs"
                  onClick={() => {
                    restoreClient(c.id)
                    showToast('Müşteri arşivden geri alındı.')
                  }}
                >
                  Geri al
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmModal
        open={Boolean(confirm && activeConfirm)}
        title={activeConfirm?.title}
        message={activeConfirm?.message}
        confirmLabel={activeConfirm?.confirmLabel}
        danger
        onConfirm={runConfirmAction}
        onCancel={() => setConfirm(null)}
      />
    </section>
  )
}
