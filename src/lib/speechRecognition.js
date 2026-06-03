export function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null
  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null
  )
}

export function isSpeechRecognitionSupported() {
  return Boolean(getSpeechRecognitionCtor())
}

/**
 * @param {{ onResult: (text: string) => void, onError?: (msg: string) => void, onEnd?: () => void }} opts
 */
export function startListening(opts) {
  const Ctor = getSpeechRecognitionCtor()
  if (!Ctor) {
    opts.onError?.('Bu tarayıcıda sesli giriş desteklenmiyor.')
    return null
  }

  const rec = new Ctor()
  rec.lang = 'tr-TR'
  rec.interimResults = false
  rec.maxAlternatives = 1

  rec.onresult = (event) => {
    const text = event.results?.[0]?.[0]?.transcript ?? ''
    if (text.trim()) opts.onResult(text.trim())
  }

  rec.onerror = () => {
    opts.onError?.('Ses tanıma hatası. Tekrar deneyin.')
    opts.onEnd?.()
  }

  rec.onend = () => opts.onEnd?.()

  try {
    rec.start()
  } catch {
    opts.onError?.('Mikrofon başlatılamadı.')
    return null
  }

  return rec
}

export function stopListening(rec) {
  try {
    rec?.stop()
  } catch {
    /* ignore */
  }
}
