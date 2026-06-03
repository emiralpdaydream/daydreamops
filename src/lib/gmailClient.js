/** Gmail API — yalnızca sunucu proxy; token tarayıcıya gelmez */

export async function testGmailConnection() {
  try {
    const res = await fetch('/api/gmail/test', { method: 'GET', credentials: 'include' })
    const body = await res.json().catch(() => ({}))
    return {
      ok: Boolean(body.ok),
      status: body.status || (body.ok ? 'connected' : 'disconnected'),
      message: body.message || 'Gmail durumu alınamadı.',
      email: body.email || null,
    }
  } catch {
    return {
      ok: false,
      status: 'error',
      message: 'Gmail testi yapılamadı.',
      email: null,
    }
  }
}

export function startGmailOAuth() {
  window.location.href = '/api/google/auth'
}

export async function disconnectGmail() {
  const res = await fetch('/api/google/disconnect', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  return res.json().catch(() => ({ ok: false }))
}

export async function saveGmailDraft(mail) {
  const res = await fetch('/api/gmail/draft', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mail),
  })
  const body = await res.json().catch(() => ({}))
  return {
    ok: Boolean(body.ok),
    message: body.message || (body.ok ? 'Taslak Gmail\'e kaydedildi.' : 'Taslak kaydedilemedi.'),
  }
}

export async function sendGmailMail(mail) {
  const res = await fetch('/api/gmail/send', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mail),
  })
  const body = await res.json().catch(() => ({}))
  return {
    ok: Boolean(body.ok),
    message:
      body.message ||
      (body.ok ? 'Mail gönderildi.' : 'Mail gönderilemedi. Gmail bağlantısını kontrol edin.'),
  }
}
