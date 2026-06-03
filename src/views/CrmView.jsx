import { useMemo, useState } from 'react'
import { PAYMENT_STATUS } from '../lib/constants'
import { formatTry } from '../lib/format'
import { useOps } from '../lib/useOps'
import { getActiveClients } from '../lib/selectors'
import ClientModal from '../components/ClientModal'
import PageHeader from '../components/PageHeader'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import StatusBadge from '../components/StatusBadge'

export default function CrmView() {
  const { data, upsertClient, archiveClient, createEmptyClient } = useOps()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalClient, setModalClient] = useState(null)

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
  }

  return (
    <main className="page-main">
      <PageHeader {...SCREEN_INTRO.crm} />

      <div className="section-gap flex max-w-wide flex-col gap-4 sm:flex-row sm:items-center">
        <input
          className="input-premium flex-1"
          placeholder="Ara…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-premium sm:w-44"
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

      <ul className="mt-6 space-y-3 md:hidden">
        {clients.length === 0 ? (
          <li className="text-sm text-muted">Müşteri bulunamadı.</li>
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
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalClient({ ...c })}
                  className="btn-ghost flex-1 text-xs"
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`${c.name} arşive alınsın mı?`)) {
                      archiveClient(c.id)
                    }
                  }}
                  className="btn-ghost text-xs text-muted"
                >
                  Sil
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="surface-card section-gap hidden overflow-x-auto p-6 md:block">
        <table className="table-premium min-w-[640px]">
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
                <td colSpan={5} className="py-8 text-center text-muted">
                  Müşteri bulunamadı.
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
                    <button
                      type="button"
                      onClick={() => setModalClient({ ...c })}
                      className="btn-ghost text-xs"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`${c.name} arşive alınsın mı?`)) {
                          archiveClient(c.id)
                        }
                      }}
                      className="btn-ghost ml-1 text-xs text-muted"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalClient && (
        <ClientModal
          client={modalClient}
          onSave={handleSave}
          onClose={() => setModalClient(null)}
        />
      )}
    </main>
  )
}
