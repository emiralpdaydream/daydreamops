/** AI system context — client buildDataSnapshot + insights ile uyumlu */

export function formatSnapshotContextMessage(dataSnapshot) {
  if (!dataSnapshot || typeof dataSnapshot !== 'object') {
    return 'Operasyon verisi: (boş)'
  }
  const i = dataSnapshot.insights
  const lines = [
    `Güncel tarih: ${dataSnapshot.date}`,
    'KURAL: Aşağıdaki JSON gerçek şirket verisidir. Sayı ve isim uydurma; yoksa "bu konuda kayıt yok" de.',
  ]
  if (i) {
    lines.push(
      `insights.weeklyRisk: ${i.weeklyRiskSummary ?? '—'}`,
      `insights.collectFrom (${i.collectFrom?.totalCount ?? 0} alacak, ${i.collectFrom?.totalAmountLabel ?? '0'}): ${i.collectFrom?.summary ?? 'bu konuda kayıt yok'}`,
      `insights.spending: ${i.spending?.summary ?? 'bu konuda kayıt yok'}`,
      `insights.todayFocus: ${i.todayFocus?.summary ?? 'bu konuda kayıt yok'}`,
    )
  }
  lines.push(`\nTam operasyon özeti (JSON):\n${JSON.stringify(dataSnapshot)}`)
  return lines.join('\n')
}
