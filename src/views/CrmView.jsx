import { useMemo, useState } from 'react'
import { PAYMENT_STATUS } from '../lib/constants'
import { formatTry } from '../lib/format'
import { useOps } from '../lib/useOps'
import { useToast } from '../lib/useToast'
import { getActiveClients } from '../lib/selectors'
import ClientModal from '../components/ClientModal'
import ClientDeleteConfirmModal from '../components/ClientDeleteConfirmModal'
import ClientDeleteModal from '../components/ClientDeleteModal'
import EmptyStateBlock from '../components/EmptyStateBlock'
import PageHeader from '../components/PageHeader'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import StatusBadge from '../components/StatusBadge'

function ClientActions({ onEdit, onDelete }) {
  return (
    <div className="action-row mt-4">
      <button type="button" onClick={onEdit} className="action-chip">
        Düzenle
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="action-chip action-chip--danger"
      >
        Sil
      </button>
    </div>
  )
}

export default function CrmView() {
  const {
    data,
    upsertClient,
    archiveClient,
    deleteClient,
    getClientPaymentCount,
    createEmptyClient,
  } = useOps()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalClient, setModalClient] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [confirmFullDelete, setConfirmFullDelete] = useState(false)

  const clients = useMemo(() => {
    let list = getActiveClients(data.clients)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.notes?.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') {
      list = list.filter((c) => c.payment_status === statusFilter)
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
  }, [data.clients, search, statusFilter])

  function handleSave(client) {
    upsertClient(client)
    setModalClient(null)
    showToast('Veriler güncellendi.')
  }

  function handleArchive() {
    if (!deleteTarget) return
    archiveClient(deleteTarget.id)
    setDeleteTarget(null)
    showToast('Müşteri arşive alındı.')
  }

  function handleFullDelete() {
    if (!deleteTarget) return
    setConfirmFullDelete(true)
  }

  function executeFullDelete() {
    if (!deleteTarget) return
    deleteClient(deleteTarget.id)
    setDeleteTarget(null)
    setConfirmFullDelete(false)
    showToast('Müşteri ve bağlı kayıtlar silindi.')
  }

  const paymentCount = deleteTarget
    ? getClientPaymentCount(deleteTarget.id)
    : 0

  return (
    <main className="page-main">
      <PageHeader {...SCREEN_INTRO.crm} />

      <div className="section-gap flex max-w-wide flex-col gap-4 sm:flex-row sm:items-center">
        <input
          className="input-premium min-w-0 flex-1"
          placeholder="Ara…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-premium min-w-0 sm:w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tüm durumlar</option>
          <option value={PAYMENT_STATUS.OVERDUE}>Gecikmiş</option>
          <option value={PAYMENT_STATUS.PENDING}>Bekliyor</option>
          <option value={PAYMENT_STATUS.PAID}>Ödendi</option>
          <option value={PAYMENT_STATUS.PARTIAL}>Kısmi</option>
        </select>
        <button
          type="button"
          onClick={() => setModalClient(createEmptyClient())}
          className="btn-primary btn-primary-inline shrink-0"
        >
          Yeni müşteri
        </button>
      </div>

      <ul className="crm-mobile-list mt-6 space-y-3">
        {clients.length === 0 ? (
          <li>
            <EmptyStateBlock message="Henüz müşteri yok" variant="cinematic" />
          </li>
        ) : (
          clients.map((c) => (
            <li key={c.id} className="panel-premium p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-text">{c.name}</p>
                  <p className="mt-1 text-xs text-dim">{c.service_type}</p>
                  <p className="mt-2 font-display text-lg font-semibold text-text">
                    {formatTry(c.monthly_fee)}
                  </p>
                </div>
                <StatusBadge status={c.payment_status} />
              </div>
              <ClientActions
                onEdit={() => setModalClient({ ...c })}
                onDelete={() => setDeleteTarget(c)}
              />
            </li>
          ))
        )}
      </ul>

      <div className="crm-web-table surface-card section-gap">
        <div className="overflow-x-auto p-4 md:p-6">
          <table className="table-premium w-full min-w-0">
            <thead>
              <tr>
                <th className="pr-4">İsim</th>
                <th className="pr-4">Servis</th>
                <th className="pr-4">Ücret</th>
                <th className="pr-4">Durum</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8">
                    <EmptyStateBlock
                      message="Henüz müşteri yok"
                      variant="cinematic"
                    />
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id}>
                    <td className="pr-4">
                      <p className="font-medium text-text">{c.name}</p>
                      {c.notes && (
                        <p className="mt-0.5 max-w-xs truncate text-xs text-muted">
                          {c.notes}
                        </p>
                      )}
                    </td>
                    <td className="pr-4">{c.service_type}</td>
                    <td className="pr-4 font-mono text-text">
                      {formatTry(c.monthly_fee)}
                    </td>
                    <td className="pr-4">
                      <StatusBadge status={c.payment_status} />
                    </td>
                    <td className="text-right">
                      <div className="action-row action-row--inline justify-end">
                        <button
                          type="button"
                          onClick={() => setModalClient({ ...c })}
                          className="action-chip"
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          className="action-chip action-chip--danger"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalClient && (
        <ClientModal
          client={modalClient}
          onSave={handleSave}
          onClose={() => setModalClient(null)}
        />
      )}

      <ClientDeleteModal
        open={Boolean(deleteTarget) && !confirmFullDelete}
        clientName={deleteTarget?.name}
        paymentCount={paymentCount}
        onArchive={handleArchive}
        onDeleteAll={handleFullDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ClientDeleteConfirmModal
        open={confirmFullDelete}
        clientName={deleteTarget?.name}
        paymentCount={paymentCount}
        onConfirm={executeFullDelete}
        onCancel={() => setConfirmFullDelete(false)}
      />
    </main>
  )
}
