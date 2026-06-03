import { formatTry } from './format'
import { formatDateTr } from './dates'

export function generateProposalText(form) {
  const deliverables =
    typeof form.deliverables === 'string'
      ? form.deliverables.split('\n').filter(Boolean)
      : form.deliverables || []

  const list =
    deliverables.length > 0
      ? deliverables.map((d) => `• ${d}`).join('\n')
      : '• Teslimatlar brief sonrası netleştirilecektir.'

  return `DAYDREAM PRODUCTION — TEKLİF ÖZETİ

Müşteri: ${form.client_name || '—'}
Proje: ${form.project_type || '—'}
Tarih: ${formatDateTr(form.date)}
Bütçe: ${formatTry(Number(form.budget) || 0)}

KAPSAM
${list}

NOTLAR
${form.notes?.trim() || '—'}

Bu metin Daydream Ops içinde oluşturulmuştur. PDF ve e-posta gönderimi Bağlantılar Merkezi üzerinden hazırlanıyor.

— Daydream Production`
}
