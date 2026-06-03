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
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="panel-premium max-h-[90vh] w-full max-w-md overflow-y-auto p-6 md:p-8"
      >
        <h2 className="font-display text-xl font-semibold text-text">
          {client.name ? 'Müşteri düzenle' : 'Yeni müşteri'}
        </h2>

        <label className="mt-6 block">
          <span className="label-premium">İsim</span>
          <input
            className="input-premium mt-2"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
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

        <label className="mt-4 block">
          <span className="label-premium">Aylık ücret (₺)</span>
          <input
            type="number"
            className="input-premium mt-2"
            value={form.monthly_fee}
            onChange={(e) => update('monthly_fee', e.target.value)}
          />
        </label>

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
          <span className="label-premium">İletişim</span>
          <input
            className="input-premium mt-2"
            value={form.contact}
            onChange={(e) => update('contact', e.target.value)}
            placeholder="E-posta veya telefon"
          />
        </label>

        <label className="mt-4 block">
          <span className="label-premium">Notlar</span>
          <textarea
            className="input-premium mt-2 min-h-[80px] resize-y"
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
