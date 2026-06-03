const STORAGE_VOICE = 'daydream_operator_voice_reply'

export function isVoiceReplyEnabled() {
  try {
    return localStorage.getItem(STORAGE_VOICE) === '1'
  } catch {
    return false
  }
}

export function setVoiceReplyEnabled(on) {
  try {
    localStorage.setItem(STORAGE_VOICE, on ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
}

export function isSpeaking() {
  return (
    typeof window !== 'undefined' &&
    window.speechSynthesis?.speaking === true
  )
}

/**
 * Ses katmanı soyutlaması — ileride ElevenLabs buraya bağlanabilir.
 * @param {string} text
 * @param {{ onStart?: () => void, onEnd?: () => void }} hooks
 */
export function speak(text, hooks = {}) {
  stopSpeaking()
  const trimmed = String(text ?? '').trim()
  if (!trimmed) {
    hooks.onEnd?.()
    return
  }

  if (typeof window === 'undefined' || !window.speechSynthesis) {
    hooks.onEnd?.()
    return
  }

  const utter = new SpeechSynthesisUtterance(trimmed)
  utter.lang = 'tr-TR'
  utter.rate = 0.95
  utter.pitch = 1

  const voices = window.speechSynthesis.getVoices()
  const tr =
    voices.find((v) => v.lang === 'tr-TR') ||
    voices.find((v) => v.lang.startsWith('tr'))
  if (tr) utter.voice = tr

  utter.onstart = () => hooks.onStart?.()
  utter.onend = () => hooks.onEnd?.()
  utter.onerror = () => hooks.onEnd?.()

  window.speechSynthesis.speak(utter)
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
