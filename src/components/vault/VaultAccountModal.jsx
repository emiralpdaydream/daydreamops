import { useState } from 'react'
import {
  VAULT_SERVICE_SUGGESTIONS,
  VAULT_SUBSCRIPTION_LABELS,
  VAULT_SUBSCRIPTION_TYPES,
} from '../../lib/vaultConstants'

const emptyForm = () => ({
  serviceName: '',
  email: '',
  username: '',
  passwordNote: '',
  subscriptionType: VAULT_SUBSCRIPTION_TYPES.MONTHLY,
  feeAmount: '',
  feeCurrency: 'TRY',
  paymentMethod: '',
  renewalDate: '',
  linkUrl: '',
  notes: '',
})

function formFromRecord(record) {
  if (!record) return emptyForm()
  return {
    serviceName: record.serviceName ?? '',
    email: record.email ?? '',
    username: record.username ?? '',
    passwordNote: record.passwordNote ?? '',
    subscriptionType: record.subscriptionType ?? VAULT_SUBSCRIPTION_TYPES.MONTHLY,
    feeAmount: record.feeAmount != null ? String(record.feeAmount) : '',
    feeCurrency: record.feeCurrency ?? 'TRY',
    paymentMethod: record.paymentMethod ?? '',
    renewalDate: record.renewalDate ?? '',
    linkUrl: record.linkUrl ?? '',
    notes: record.notes ?? '',
  }
}

export default function VaultAccountModal({ open, record, onSave, onClose }) {
  const [form, setForm] = useState(() => formFromRecord(record))

  if (!open) return null

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      feeAmount: Number(form.feeAmount) || 0,
    })
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel modal-panel--scroll vault-modal">
        <h2 className="font-sans text-lg font-medium text-text">
          {record ? 'Hesabı düzenle' : 'Yeni hesap'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="label-premium">Servis adı</span>
            <input
              className="input-premium mt-2"
              list="vault-services"
              value={form.serviceName}
              onChange={(e) => set('serviceName', e.target.value)}
              required
            />
            <datalist id="vault-services">
              {VAULT_SERVICE_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="label-premium">E-posta</span>
            <input
              className="input-premium mt-2"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Kullanıcı adı</span>
            <input
              className="input-premium mt-2"
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Şifre notu</span>
            <input
              className="input-premium mt-2"
              value={form.passwordNote}
              onChange={(e) => set('passwordNote', e.target.value)}
              placeholder="Hatırlatma — gerçek şifre saklamayın"
            />
          </label>
          <label className="block">
            <span className="label-premium">Abonelik tipi</span>
            <select
              className="input-premium mt-2"
              value={form.subscriptionType}
              onChange={(e) => set('subscriptionType', e.target.value)}
            >
              {Object.entries(VAULT_SUBSCRIPTION_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label-premium">Ücret</span>
              <input
                className="input-premium mt-2"
                type="number"
                min="0"
                step="0.01"
                value={form.feeAmount}
                onChange={(e) => set('feeAmount', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label-premium">Para birimi</span>
              <input
                className="input-premium mt-2"
                value={form.feeCurrency}
                onChange={(e) => set('feeCurrency', e.target.value)}
              />
            </label>
          </div>
          <label className="block">
            <span className="label-premium">Ödeme yöntemi</span>
            <input
              className="input-premium mt-2"
              value={form.paymentMethod}
              onChange={(e) => set('paymentMethod', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Yenileme tarihi</span>
            <input
              className="input-premium mt-2"
              type="date"
              value={form.renewalDate}
              onChange={(e) => set('renewalDate', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Bağlantı linki</span>
            <input
              className="input-premium mt-2"
              type="url"
              value={form.linkUrl}
              onChange={(e) => set('linkUrl', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Notlar</span>
            <textarea
              className="input-premium mt-2 min-h-[80px]"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
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
