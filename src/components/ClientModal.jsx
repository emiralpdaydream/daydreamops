import { useState } from 'react'
import { SERVICE_TYPES } from '../lib/constants'

export default function ClientModal({ client, onSave, onClose }) {
  const [form, setForm] = useState({ ...client })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      ...form,
      monthly_fee: Number(form.monthly_fee) || 0,
      agreed_price: Number(form.agreed_price) || Number(form.monthly_fee) || 0,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="panel-premium max-h-[92vh] w-full max-w-lg overflow-y-auto p-6 md:p-8"
      >
        <h2 className="font-display text-2xl font-medium text-text">
          {client.name ? 'Müşteri' : 'Yeni müşteri'}
        </h2>
        <p className="mt-2 text-xs text-muted">
          Pitch deck — Faz 2. İletişim ve fiyat alanları operasyon merkezi için.
        </p>

        <label className="mt-6 block">
          <span className="label-premium">Müşteri / marka adı</span>
          <input
            className="input-premium mt-2"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
        </label>

        <label className="mt-4 block">
          <span className="label-premium">Sorumlu (Daydream)</span>
          <input
            className="input-premium mt-2"
            value={form.responsible ?? ''}
            onChange={(e) => update('responsible', e.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className="label-premium">İletişimde olduğumuz kişi</span>
          <input
            className="input-premium mt-2"
            value={form.contact_person ?? ''}
            onChange={(e) => update('contact_person', e.target.value)}
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label-premium">Telefon</span>
            <input
              className="input-premium mt-2"
              value={form.phone ?? ''}
              onChange={(e) => update('phone', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">E-posta</span>
            <input
              type="email"
              className="input-premium mt-2"
              value={form.email ?? form.contact ?? ''}
              onChange={(e) => update('email', e.target.value)}
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="label-premium">Muhasebe tarafı</span>
          <input
            className="input-premium mt-2"
            value={form.accounting_contact ?? ''}
            onChange={(e) => update('accounting_contact', e.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className="label-premium">Kreatif taraf</span>
          <input
            className="input-premium mt-2"
            value={form.creative_contact ?? ''}
            onChange={(e) => update('creative_contact', e.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className="label-premium">Servis tipi</span>
          <select
            className="input-premium mt-2"
            value={form.service_type}
            onChange={(e) => update('service_type', e.target.value)}
          >
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label-premium">Anlaşılan fiyat (₺)</span>
            <input
              type="number"
              className="input-premium mt-2"
              value={form.agreed_price ?? form.monthly_fee}
              onChange={(e) => update('agreed_price', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label-premium">Aylık / vade tutarı (₺)</span>
            <input
              type="number"
              className="input-premium mt-2"
              value={form.monthly_fee}
              onChange={(e) => update('monthly_fee', e.target.value)}
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="label-premium">Vade tarihi</span>
          <input
            type="date"
            className="input-premium mt-2"
            value={form.due_date}
            onChange={(e) => update('due_date', e.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className="label-premium">Pitch deck (not)</span>
          <textarea
            className="input-premium mt-2 min-h-[60px]"
            value={form.pitch_deck_notes ?? ''}
            onChange={(e) => update('pitch_deck_notes', e.target.value)}
            placeholder="Link veya Faz 2 — otomatik deck"
          />
        </label>

        <label className="mt-4 block">
          <span className="label-premium">Genel notlar</span>
          <textarea
            className="input-premium mt-2 min-h-[80px]"
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </label>

        <div className="mt-8 flex gap-2">
          <button type="submit" className="btn-primary flex-1">
            Kaydet
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            İptal
          </button>
        </div>
      </form>
    </div>
  )
}
