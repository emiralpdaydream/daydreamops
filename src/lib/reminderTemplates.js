export const REMINDER_TONES = [
  { id: 'nazik', label: 'Nazik' },
  { id: 'direkt', label: 'Direkt' },
  { id: 'kisa', label: 'Kısa' },
]

export function buildReminderMessage({ clientName, amount, label, tone }) {
  const amt = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount)

  if (tone === 'direkt') {
    return `Merhaba ${clientName} ekibi,\n\n${label} için ${amt} tutarındaki ödemenizin geciktiğini hatırlatmak isterim. En kısa sürede dönüş rica ederim.\n\n— Daydream Production`
  }
  if (tone === 'kisa') {
    return `Merhaba, ${clientName} — ${label}: ${amt}. Müsait olduğunuzda haber verir misiniz? Teşekkürler.`
  }
  return `Merhaba ${clientName} ekibi,\n\nUmarız her şey yolundadır. ${label} kapsamındaki ${amt} tutarlı ödemenizle ilgili nazikçe hatırlatmak istedik. Bir sorunuz varsa memnuniyetle yardımcı oluruz.\n\nSevgiler,\nDaydream Production`
}
