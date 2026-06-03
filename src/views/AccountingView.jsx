import { useMemo, useState } from 'react'
import ConfirmModal from '../components/ConfirmModal'
import AccountingRecordModal from '../components/accounting/AccountingRecordModal'
import ReminderModal from '../components/ReminderModal'
import PageHeader from '../components/PageHeader'
import {
  ACCOUNTING_TABS,
  EXPENSE_CATEGORY_LABELS,
  MONEY_ACCOUNT_LABELS,
  PAYABLE_STATUS_LABELS,
  RECEIVABLE_STATUS_LABELS,
} from '../lib/accountingConstants'
import { getAccounting, getAccountSourceTotals } from '../lib/accountingSelectors'
import { formatTry } from '../lib/format'
import { SCREEN_INTRO } from '../lib/screenManifesto'
import { useOps } from '../lib/useOps'
import { useToast } from '../lib/useToast'

function StatusPill({ label, tone }) {
  return <span className={`accounting-pill accounting-pill--${tone}`}>{label}</span>
}

function RecordCard({ children, actions }) {
  return (
    <article className="accounting-card">
      <div className="accounting-card__body">{children}</div>
      {actions?.length > 0 && (
        <div className="accounting-card__actions">{actions}</div>
      )}
    </article>
  )
}

export default function AccountingView() {
  const {
    data,
    saveReceivable,
    removeReceivable,
    savePayable,
    removePayable,
    saveExpense,
    removeExpense,
    receiveReceivable,
    payPayable,
    deferPayableRecord,
    sendReceivableReminder,
  } = useOps()
  const { showToast } = useToast()

  const [tab, setTab] = useState(ACCOUNTING_TABS.RECEIVABLES)
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [reminder, setReminder] = useState(null)

  const accounting = useMemo(() => getAccounting(data), [data])
  const accounts = useMemo(() => getAccountSourceTotals(data), [data])

  function closeModal() {
    setModal(null)
  }

  function handleSave(payload) {
    if (modal?.type === 'receivable') {
      saveReceivable(payload, modal.record?.id)
      showToast(modal.record ? 'Alacak güncellendi.' : 'Alacak eklendi.')
    } else if (modal?.type === 'payable') {
      savePayable(payload, modal.record?.id)
      showToast(modal.record ? 'Ödeme güncellendi.' : 'Ödeme eklendi.')
    } else if (modal?.type === 'expense') {
      saveExpense(payload, modal.record?.id)
      showToast(modal.record ? 'Harcama güncellendi.' : 'Harcama eklendi.')
    }
    closeModal()
  }

  const tabs = [
    { id: ACCOUNTING_TABS.RECEIVABLES, label: 'Alınacaklar' },
    { id: ACCOUNTING_TABS.PAYABLES, label: 'Ödenecekler' },
    { id: ACCOUNTING_TABS.EXPENSES, label: 'Harcamalar' },
    { id: ACCOUNTING_TABS.ACCOUNTS, label: 'Hesaplar' },
  ]

  const addLabels = {
    [ACCOUNTING_TABS.RECEIVABLES]: 'Yeni Alacak Ekle',
    [ACCOUNTING_TABS.PAYABLES]: 'Yeni Ödeme Ekle',
    [ACCOUNTING_TABS.EXPENSES]: 'Yeni Harcama Ekle',
  }

  return (
    <main className="page-main page-main--accounting">
      <PageHeader {...SCREEN_INTRO.muhasebe} />

      <div className="accounting-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`accounting-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== ACCOUNTING_TABS.ACCOUNTS && (
        <button
          type="button"
          className="accounting-add-cta"
          onClick={() => setModal({ type: tab === ACCOUNTING_TABS.EXPENSES ? 'expense' : tab === ACCOUNTING_TABS.PAYABLES ? 'payable' : 'receivable' })}
        >
          {addLabels[tab]}
        </button>
      )}

      {tab === ACCOUNTING_TABS.RECEIVABLES && (
        <section className="accounting-list">
          {accounting.receivables.length === 0 ? (
            <p className="accounting-empty">Henüz alacak kaydı yok.</p>
          ) : (
            accounting.receivables.map((r) => (
              <RecordCard
                key={r.id}
                actions={[
                  r.status !== 'received' && (
                    <button
                      key="recv"
                      type="button"
                      className="btn-primary btn-primary-inline accounting-action-btn"
                      onClick={() => {
                        receiveReceivable(r.id)
                        showToast('Alındı işaretlendi.')
                      }}
                    >
                      Alındı
                    </button>
                  ),
                  r.status !== 'received' && r.status !== 'partial' && (
                    <button
                      key="part"
                      type="button"
                      className="btn-outline accounting-action-btn"
                      onClick={() => {
                        const raw = window.prompt('Kısmi alınan tutar (TL):', String(r.amount * 0.5))
                        if (raw == null) return
                        const n = Number(raw)
                        if (n > 0) {
                          receiveReceivable(r.id, n)
                          showToast('Kısmi alındı işaretlendi.')
                        }
                      }}
                    >
                      Kısmi
                    </button>
                  ),
                  <button
                    key="rem"
                    type="button"
                    className="btn-outline accounting-action-btn"
                    onClick={() =>
                      setReminder({
                        clientName: r.fromName,
                        amount: r.amount,
                        label: r.category,
                        onSent: () => {
                          sendReceivableReminder(r.id)
                          showToast('Hatırlatma gönderildi olarak işaretlendi.')
                        },
                      })
                    }
                  >
                    Hatırlat
                  </button>,
                  <button
                    key="edit"
                    type="button"
                    className="btn-outline accounting-action-btn"
                    onClick={() => setModal({ type: 'receivable', record: r })}
                  >
                    Düzenle
                  </button>,
                  <button
                    key="del"
                    type="button"
                    className="btn-ghost accounting-action-btn"
                    onClick={() =>
                      setConfirm({
                        title: 'Alacağı sil',
                        message: 'Bu alınacak kaydını silmek istediğine emin misin?',
                        onConfirm: () => {
                          removeReceivable(r.id)
                          showToast('Alacak kaydı silindi.')
                          setConfirm(null)
                        },
                      })
                    }
                  >
                    Sil
                  </button>,
                ].filter(Boolean)}
              >
                <div className="accounting-card__top">
                  <h3 className="accounting-card__title">{r.fromName}</h3>
                  <StatusPill
                    label={RECEIVABLE_STATUS_LABELS[r.status] || r.status}
                    tone={r.status === 'overdue' ? 'urgent' : 'default'}
                  />
                </div>
                <p className="accounting-card__amount">{formatTry(r.amount)} · {r.currency}</p>
                <p className="accounting-card__meta">
                  Vade: {r.dueDate} · {MONEY_ACCOUNT_LABELS[r.targetAccount]}
                  {r.reminderSent ? ' · Hatırlatma gönderildi' : ''}
                </p>
                {r.note && <p className="accounting-card__note">{r.note}</p>}
              </RecordCard>
            ))
          )}
        </section>
      )}

      {tab === ACCOUNTING_TABS.PAYABLES && (
        <section className="accounting-list">
          {accounting.payables.length === 0 ? (
            <p className="accounting-empty">Henüz ödeme kaydı yok.</p>
          ) : (
            accounting.payables.map((p) => (
              <RecordCard
                key={p.id}
                actions={[
                  p.status !== 'paid' && (
                    <button
                      key="paid"
                      type="button"
                      className="btn-primary btn-primary-inline accounting-action-btn"
                      onClick={() => {
                        payPayable(p.id)
                        showToast('Ödendi işaretlendi.')
                      }}
                    >
                      Ödendi
                    </button>
                  ),
                  p.status !== 'paid' && (
                    <button
                      key="def"
                      type="button"
                      className="btn-outline accounting-action-btn"
                      onClick={() => {
                        deferPayableRecord(p.id)
                        showToast('Ödeme ertelendi.')
                      }}
                    >
                      Ertele
                    </button>
                  ),
                  <button
                    key="edit"
                    type="button"
                    className="btn-outline accounting-action-btn"
                    onClick={() => setModal({ type: 'payable', record: p })}
                  >
                    Düzenle
                  </button>,
                  <button
                    key="del"
                    type="button"
                    className="btn-ghost accounting-action-btn"
                    onClick={() =>
                      setConfirm({
                        title: 'Ödemeyi sil',
                        message: 'Bu ödeme kaydını silmek istediğine emin misin?',
                        onConfirm: () => {
                          removePayable(p.id)
                          showToast('Ödeme kaydı silindi.')
                          setConfirm(null)
                        },
                      })
                    }
                  >
                    Sil
                  </button>,
                ].filter(Boolean)}
              >
                <div className="accounting-card__top">
                  <h3 className="accounting-card__title">{p.toName}</h3>
                  <StatusPill
                    label={PAYABLE_STATUS_LABELS[p.status] || p.status}
                    tone={p.status === 'overdue' ? 'urgent' : 'default'}
                  />
                </div>
                <p className="accounting-card__amount">{formatTry(p.amount)}</p>
                <p className="accounting-card__meta">
                  Son tarih: {p.dueDate} · {MONEY_ACCOUNT_LABELS[p.sourceAccount]}
                  {p.hasInvoice ? ' · Fatura var' : ''}
                </p>
                {p.note && <p className="accounting-card__note">{p.note}</p>}
              </RecordCard>
            ))
          )}
        </section>
      )}

      {tab === ACCOUNTING_TABS.EXPENSES && (
        <section className="accounting-list">
          {accounting.expenses.length === 0 ? (
            <p className="accounting-empty">Henüz harcama kaydı yok.</p>
          ) : (
            accounting.expenses.map((e) => (
              <RecordCard
                key={e.id}
                actions={[
                  <button
                    key="edit"
                    type="button"
                    className="btn-outline accounting-action-btn"
                    onClick={() => setModal({ type: 'expense', record: e })}
                  >
                    Düzenle
                  </button>,
                  <button
                    key="del"
                    type="button"
                    className="btn-ghost accounting-action-btn"
                    onClick={() =>
                      setConfirm({
                        title: 'Harcamayı sil',
                        message: 'Bu harcama kaydını silmek istediğine emin misin?',
                        onConfirm: () => {
                          removeExpense(e.id)
                          showToast('Harcama kaydı silindi.')
                          setConfirm(null)
                        },
                      })
                    }
                  >
                    Sil
                  </button>,
                ]}
              >
                <div className="accounting-card__top">
                  <h3 className="accounting-card__title">{e.title}</h3>
                  <StatusPill
                    label={EXPENSE_CATEGORY_LABELS[e.category] || e.category}
                    tone="muted"
                  />
                </div>
                <p className="accounting-card__amount">{formatTry(e.amount)}</p>
                <p className="accounting-card__meta">
                  {e.date} · {MONEY_ACCOUNT_LABELS[e.sourceAccount]}
                  {e.isCompanyExpense ? ' · Şirket' : ' · Şahsi'}
                </p>
                {e.note && <p className="accounting-card__note">{e.note}</p>}
              </RecordCard>
            ))
          )}
        </section>
      )}

      {tab === ACCOUNTING_TABS.ACCOUNTS && (
        <section className="accounting-accounts">
          <div className="accounting-summary-grid">
            <div className="accounting-summary-card">
              <span className="accounting-summary-card__label">Şirket hesabı</span>
              <span className="accounting-summary-card__value">{formatTry(accounts.companyAccountSpent)}</span>
            </div>
            <div className="accounting-summary-card">
              <span className="accounting-summary-card__label">Şirket kredi kartı</span>
              <span className="accounting-summary-card__value">{formatTry(accounts.companyCardSpent)}</span>
            </div>
            <div className="accounting-summary-card">
              <span className="accounting-summary-card__label">Şahsi kart</span>
              <span className="accounting-summary-card__value">{formatTry(accounts.personalCardSpent)}</span>
            </div>
            <div className="accounting-summary-card">
              <span className="accounting-summary-card__label">Şahsi nakit</span>
              <span className="accounting-summary-card__value">{formatTry(accounts.personalCashSpent)}</span>
            </div>
            <div className="accounting-summary-card">
              <span className="accounting-summary-card__label">Borç alınan</span>
              <span className="accounting-summary-card__value">{formatTry(accounts.debtBorrowedTotal)}</span>
            </div>
            <div className="accounting-summary-card">
              <span className="accounting-summary-card__label">Borç verilen (tahsil)</span>
              <span className="accounting-summary-card__value">{formatTry(accounts.debtLentTotal)}</span>
            </div>
            <div className="accounting-summary-card">
              <span className="accounting-summary-card__label">Bekleyen alınacak</span>
              <span className="accounting-summary-card__value">{formatTry(accounts.pendingReceivables)}</span>
            </div>
            <div className="accounting-summary-card">
              <span className="accounting-summary-card__label">Bekleyen ödenecek</span>
              <span className="accounting-summary-card__value">{formatTry(accounts.pendingPayables)}</span>
            </div>
            <div className="accounting-summary-card accounting-summary-card--highlight">
              <span className="accounting-summary-card__label">Net nakit akışı</span>
              <span className="accounting-summary-card__value">{formatTry(accounts.netCashFlow)}</span>
            </div>
          </div>
          <h3 className="accounting-accounts__subtitle">Kaynak özeti</h3>
          <ul className="accounting-source-list">
            {accounts.allSources.map((s) => (
              <li key={s.id} className="accounting-source-row">
                <span>{s.label}</span>
                <span>{formatTry(s.total)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AccountingRecordModal
        key={modal?.record?.id ?? modal?.type ?? 'closed'}
        open={Boolean(modal)}
        type={modal?.type}
        record={modal?.record}
        onSave={handleSave}
        onClose={closeModal}
      />

      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel="Sil"
        danger
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />

      {reminder && (
        <ReminderModal
          payment={{ amount: reminder.amount, label: reminder.label }}
          clientName={reminder.clientName}
          onClose={() => setReminder(null)}
          onSent={reminder.onSent}
        />
      )}
    </main>
  )
}
