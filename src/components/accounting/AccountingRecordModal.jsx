import { useState } from 'react'
import {
  CURRENCIES,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  MONEY_ACCOUNT_LABELS,
  PAYABLE_SOURCE_OPTIONS,
  PAYABLE_STATUS,
  PAYABLE_STATUS_LABELS,
  RECEIVABLE_ACCOUNT_OPTIONS,
  RECEIVABLE_STATUS,
  RECEIVABLE_STATUS_LABELS,
} from '../../lib/accountingConstants'

const TYPE_META = {
  receivable: { titleAdd: 'Yeni Alacak', titleEdit: 'Alacağı Düzenle', submit: 'Kaydet' },
  payable: { titleAdd: 'Yeni Ödeme', titleEdit: 'Ödemeyi Düzenle', submit: 'Kaydet' },
  expense: { titleAdd: 'Yeni Harcama', titleEdit: 'Harcamayı Düzenle', submit: 'Kaydet' },
}

function emptyForm(type) {
  if (type === 'receivable') {
    return {
      fromName: '',
      amount: '',
      currency: 'TRY',
      dueDate: '',
      status: RECEIVABLE_STATUS.WAITING,
      targetAccount: RECEIVABLE_ACCOUNT_OPTIONS[0],
      category: 'Genel',
      note: '',
      reminderSent: false,
    }
  }
  if (type === 'payable') {
    return {
      toName: '',
      amount: '',
      currency: 'TRY',
      dueDate: '',
      status: PAYABLE_STATUS.WAITING,
      sourceAccount: PAYABLE_SOURCE_OPTIONS[0],
      category: 'Genel',
      note: '',
      hasInvoice: false,
    }
  }
  return {
    title: '',
    amount: '',
    currency: 'TRY',
    date: '',
    sourceAccount: PAYABLE_SOURCE_OPTIONS[0],
    category: EXPENSE_CATEGORIES.OTHER,
    isCompanyExpense: true,
    hasReceipt: false,
    note: '',
  }
}

export default function AccountingRecordModal({
  open,
  type,
  record,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(() =>
    record
      ? { ...emptyForm(type), ...record, amount: String(record.amount ?? '') }
      : emptyForm(type),
  )
  const meta = TYPE_META[type]

  if (!open) return null

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      amount: Number(form.amount),
    }
    if (type === 'expense') payload.title = form.title || form.fromName
    onSave(payload)
  }

  return (
    <div className="accounting-modal-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="accounting-modal-overlay__backdrop"
        aria-label="Kapat"
        onClick={onClose}
      />
      <form className="accounting-modal-panel" onSubmit={handleSubmit}>
        <header className="accounting-modal-panel__head">
          <h2>{record ? meta.titleEdit : meta.titleAdd}</h2>
          <button type="button" className="btn-ghost" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="accounting-modal-panel__body">
          {type === 'receivable' && (
            <>
              <label className="accounting-field">
                <span>Kimden alınacak?</span>
                <input
                  className="accounting-input"
                  value={form.fromName}
                  onChange={(e) => update('fromName', e.target.value)}
                  required
                />
              </label>
              <div className="accounting-field-row">
                <label className="accounting-field">
                  <span>Tutar</span>
                  <input
                    type="number"
                    min="0"
                    className="accounting-input"
                    value={form.amount}
                    onChange={(e) => update('amount', e.target.value)}
                    required
                  />
                </label>
                <label className="accounting-field">
                  <span>Para birimi</span>
                  <select
                    className="accounting-input"
                    value={form.currency}
                    onChange={(e) => update('currency', e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="accounting-field">
                <span>Vade tarihi</span>
                <input
                  type="date"
                  className="accounting-input"
                  value={form.dueDate}
                  onChange={(e) => update('dueDate', e.target.value)}
                />
              </label>
              <label className="accounting-field">
                <span>Durum</span>
                <select
                  className="accounting-input"
                  value={form.status}
                  onChange={(e) => update('status', e.target.value)}
                >
                  {Object.entries(RECEIVABLE_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="accounting-field">
                <span>Hangi hesaba gelecek?</span>
                <select
                  className="accounting-input"
                  value={form.targetAccount}
                  onChange={(e) => update('targetAccount', e.target.value)}
                >
                  {RECEIVABLE_ACCOUNT_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {MONEY_ACCOUNT_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {type === 'payable' && (
            <>
              <label className="accounting-field">
                <span>Kime ödenecek?</span>
                <input
                  className="accounting-input"
                  value={form.toName}
                  onChange={(e) => update('toName', e.target.value)}
                  required
                />
              </label>
              <div className="accounting-field-row">
                <label className="accounting-field">
                  <span>Tutar</span>
                  <input
                    type="number"
                    min="0"
                    className="accounting-input"
                    value={form.amount}
                    onChange={(e) => update('amount', e.target.value)}
                    required
                  />
                </label>
                <label className="accounting-field">
                  <span>Para birimi</span>
                  <select
                    className="accounting-input"
                    value={form.currency}
                    onChange={(e) => update('currency', e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="accounting-field">
                <span>Son ödeme tarihi</span>
                <input
                  type="date"
                  className="accounting-input"
                  value={form.dueDate}
                  onChange={(e) => update('dueDate', e.target.value)}
                />
              </label>
              <label className="accounting-field">
                <span>Durum</span>
                <select
                  className="accounting-input"
                  value={form.status}
                  onChange={(e) => update('status', e.target.value)}
                >
                  {Object.entries(PAYABLE_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="accounting-field">
                <span>Hangi hesaptan ödenecek?</span>
                <select
                  className="accounting-input"
                  value={form.sourceAccount}
                  onChange={(e) => update('sourceAccount', e.target.value)}
                >
                  {PAYABLE_SOURCE_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {MONEY_ACCOUNT_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="accounting-field accounting-field--check">
                <input
                  type="checkbox"
                  checked={form.hasInvoice}
                  onChange={(e) => update('hasInvoice', e.target.checked)}
                />
                <span>Fatura var</span>
              </label>
            </>
          )}

          {type === 'expense' && (
            <>
              <label className="accounting-field">
                <span>Harcama adı</span>
                <input
                  className="accounting-input"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  required
                />
              </label>
              <div className="accounting-field-row">
                <label className="accounting-field">
                  <span>Tutar</span>
                  <input
                    type="number"
                    min="0"
                    className="accounting-input"
                    value={form.amount}
                    onChange={(e) => update('amount', e.target.value)}
                    required
                  />
                </label>
                <label className="accounting-field">
                  <span>Tarih</span>
                  <input
                    type="date"
                    className="accounting-input"
                    value={form.date}
                    onChange={(e) => update('date', e.target.value)}
                  />
                </label>
              </div>
              <label className="accounting-field">
                <span>Para kaynağı</span>
                <select
                  className="accounting-input"
                  value={form.sourceAccount}
                  onChange={(e) => update('sourceAccount', e.target.value)}
                >
                  {PAYABLE_SOURCE_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {MONEY_ACCOUNT_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="accounting-field">
                <span>Kategori</span>
                <select
                  className="accounting-input"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                >
                  {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="accounting-field accounting-field--check">
                <input
                  type="checkbox"
                  checked={form.isCompanyExpense}
                  onChange={(e) => update('isCompanyExpense', e.target.checked)}
                />
                <span>Şirket gideri</span>
              </label>
              <label className="accounting-field accounting-field--check">
                <input
                  type="checkbox"
                  checked={form.hasReceipt}
                  onChange={(e) => update('hasReceipt', e.target.checked)}
                />
                <span>Fiş / fatura var</span>
              </label>
            </>
          )}

          {(type === 'receivable' || type === 'payable') && (
            <label className="accounting-field">
              <span>Kategori</span>
              <input
                className="accounting-input"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
              />
            </label>
          )}

          <label className="accounting-field">
            <span>Açıklama / not</span>
            <textarea
              className="accounting-input accounting-input--area"
              rows={3}
              value={form.note}
              onChange={(e) => update('note', e.target.value)}
            />
          </label>
        </div>

        <footer className="accounting-modal-panel__foot">
          <button type="button" className="btn-outline accounting-btn" onClick={onClose}>
            Vazgeç
          </button>
          <button type="submit" className="btn-primary btn-primary-inline accounting-btn">
            {meta.submit}
          </button>
        </footer>
      </form>
    </div>
  )
}
