import { useEffect, useMemo, useRef, useState } from 'react'
import {
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  PARASUT_STATUS_LABELS,
  VAT_RATES,
  calcInvoiceVat,
} from '../../lib/invoiceConstants'
import { formatTry } from '../../lib/format'

const emptyForm = () => ({
  invoiceType: 'sales',
  partyName: '',
  invoiceNo: '',
  amount: '',
  vatRate: 20,
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  status: 'draft',
  parasutStatus: 'unmatched',
  pdfUrl: '',
  note: '',
})

function formFromRecord(record) {
  if (!record) return emptyForm()
  return {
    invoiceType: record.invoiceType ?? 'sales',
    partyName: record.partyName ?? '',
    invoiceNo: record.invoiceNo ?? '',
    amount: record.amount != null ? String(record.amount) : '',
    vatRate: record.vatRate ?? 20,
    issueDate: record.issueDate ?? '',
    dueDate: record.dueDate ?? '',
    status: record.status ?? 'draft',
    parasutStatus: record.parasutStatus ?? 'unmatched',
    pdfUrl: record.pdfUrl ?? '',
    note: record.note ?? '',
  }
}

export default function InvoiceModal({
  open,
  record,
  focusPdf = false,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(() => formFromRecord(record))
  const pdfRef = useRef(null)

  const vatPreview = useMemo(
    () => calcInvoiceVat(form.amount, form.vatRate),
    [form.amount, form.vatRate],
  )

  useEffect(() => {
    if (!open || !focusPdf) return undefined
    const t = setTimeout(() => pdfRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [open, focusPdf, record?.id])

  if (!open) return null

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      amount: vatPreview.amount,
      vatAmount: vatPreview.vatAmount,
      totalAmount: vatPreview.total,
    })
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel modal-panel--scroll invoice-modal">
        <h2 className="font-sans text-lg font-medium text-text">
          {record ? 'Faturayı düzenle' : 'Yeni fatura'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="label-premium">Fatura tipi</span>
            <select
              className="input-premium mt-2"
              value={form.invoiceType}
              onChange={(e) => set('invoiceType', e.target.value)}
            >
              {Object.entries(INVOICE_TYPE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label-premium">Müşteri / tedarikçi</span>
            <input
              className="input-premium mt-2"
              value={form.partyName}
              onChange={(e) => set('partyName', e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="label-premium">Fatura no</span>
            <input
              className="input-premium mt-2"
              value={form.invoiceNo}
              onChange={(e) => set('invoiceNo', e.target.value)}
            />
          </label>

          <div className="invoice-vat-grid">
            <label className="block">
              <span className="label-premium">Matrah (tutar)</span>
              <input
                className="input-premium mt-2"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="label-premium">KDV oranı %</span>
              <select
                className="input-premium mt-2"
                value={form.vatRate}
                onChange={(e) => set('vatRate', Number(e.target.value))}
              >
                {VAT_RATES.map((r) => (
                  <option key={r} value={r}>
                    %{r}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label-premium">KDV tutarı</span>
              <input
                className="input-premium mt-2 invoice-vat-grid__readonly"
                readOnly
                tabIndex={-1}
                value={formatTry(vatPreview.vatAmount)}
                aria-live="polite"
              />
            </label>
            <label className="block">
              <span className="label-premium">Toplam tutar</span>
              <input
                className="input-premium mt-2 invoice-vat-grid__readonly"
                readOnly
                tabIndex={-1}
                value={formatTry(vatPreview.total)}
                aria-live="polite"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label-premium">Kesim tarihi</span>
              <input
                className="input-premium mt-2"
                type="date"
                value={form.issueDate}
                onChange={(e) => set('issueDate', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label-premium">Vade tarihi</span>
              <input
                className="input-premium mt-2"
                type="date"
                value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
              />
            </label>
          </div>
          <label className="block">
            <span className="label-premium">Durum</span>
            <select
              className="input-premium mt-2"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {Object.entries(INVOICE_STATUS_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label-premium">Paraşüt durumu</span>
            <select
              className="input-premium mt-2"
              value={form.parasutStatus}
              onChange={(e) => set('parasutStatus', e.target.value)}
            >
              {Object.entries(PARASUT_STATUS_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label-premium">PDF / dosya linki</span>
            <input
              ref={pdfRef}
              className="input-premium mt-2"
              type="url"
              placeholder="https://…"
              value={form.pdfUrl}
              onChange={(e) => set('pdfUrl', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Not</span>
            <textarea
              className="input-premium mt-2 min-h-[72px]"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" className="btn-primary btn-primary-inline">
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
