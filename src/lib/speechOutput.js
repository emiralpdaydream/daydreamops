/**
 * Ses çıkışı — tarayıcı SpeechSynthesis (ElevenLabs için soyutlama noktası).
 * iOS: voiceschanged + kullanıcı dokunuşu ile unlock gerekir.
 */

const STORAGE_VOICE = 'daydream_operator_voice_reply'

let cachedVoices = []
let voicesListenerAttached = false
/** Oturum içi — localStorage'a yazılmaz (iOS reload sonrası yeniden unlock gerekir) */
let speechUnlocked = false

function requiresSpeechUnlock() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function isVoiceReplyEnabled() {
  try {
    const v = localStorage.getItem(STORAGE_VOICE)
    if (v === null) return true
    return v === '1'
  } catch {
    return true
  }
}

export function setVoiceReplyEnabled(on) {
  try {
    localStorage.setItem(STORAGE_VOICE, on ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function isSpeechUnlocked() {
  return speechUnlocked
}

export function isSpeechUnlockRequired() {
  return requiresSpeechUnlock()
}

/** Ses listesini yükle — modül ve Operator mount'ta çağır */
export function initSpeechVoices() {
  if (!isSpeechSynthesisSupported()) return

  const loadVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || []
    } catch {
      cachedVoices = []
    }
  }

  loadVoices()

  if (!voicesListenerAttached) {
    voicesListenerAttached = true
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    window.speechSynthesis.onvoiceschanged = loadVoices
  }

  if (!requiresSpeechUnlock()) {
    speechUnlocked = true
  }
}

function pickTurkishVoice() {
  if (!isSpeechSynthesisSupported()) return null
  const voices = cachedVoices.length
    ? cachedVoices
    : window.speechSynthesis.getVoices() || []
  return (
    voices.find((v) => v.lang?.toLowerCase() === 'tr-tr') ||
    voices.find((v) => v.lang?.toLowerCase().startsWith('tr')) ||
    null
  )
}

function applyUtteranceOptions(utter) {
  utter.lang = 'tr-TR'
  utter.rate = 0.92
  utter.pitch = 0.95
  utter.volume = 1
  const trVoice = pickTurkishVoice()
  if (trVoice) utter.voice = trVoice
}

export function stopSpeaking() {
  if (!isSpeechSynthesisSupported()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}

export function isSpeaking() {
  return (
    isSpeechSynthesisSupported() && window.speechSynthesis.speaking === true
  )
}

/**
 * @param {string} text
 * @param {{ onStart?: () => void, onEnd?: () => void, onError?: () => void, onBlocked?: () => void }} hooks
 * @returns {boolean} konuşma başlatıldı mı
 */
function splitForSpeech(text) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) return []
  const chunks = trimmed.match(/[^.!?\n]+[.!?\n]?/g)
  if (!chunks || chunks.length <= 1) return [trimmed]
  return chunks.map((c) => c.trim()).filter(Boolean)
}

/** Gönder / mikrofon gibi kullanıcı dokunuşunda — iOS async yanıt için motoru aç */
export function primeSpeechFromUserGesture() {
  if (!isSpeechSynthesisSupported()) return false
  speechUnlocked = true
  try {
    const synth = window.speechSynthesis
    synth.cancel()
    if (synth.paused) synth.resume()
    const warm = new SpeechSynthesisUtterance(' ')
    warm.volume = 0
    warm.rate = 10
    synth.speak(warm)
    window.setTimeout(() => {
      try {
        synth.cancel()
      } catch {
        /* ignore */
      }
    }, 40)
  } catch {
    /* ignore */
  }
  return true
}

function speakInternal(text, hooks = {}) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) {
    hooks.onEnd?.()
    return false
  }

  if (!isSpeechSynthesisSupported()) {
    hooks.onBlocked?.()
    return false
  }

  if (!speechUnlocked) {
    hooks.onBlocked?.()
    return false
  }

  stopSpeaking()

  const parts = splitForSpeech(trimmed)
  let index = 0
  let started = false

  const runNext = () => {
    if (index >= parts.length) {
      hooks.onEnd?.()
      return
    }

    try {
      const synth = window.speechSynthesis
      if (synth.paused) synth.resume()

      const utter = new SpeechSynthesisUtterance(parts[index])
      applyUtteranceOptions(utter)
      index += 1

      utter.onstart = () => {
        if (!started) {
          started = true
          hooks.onStart?.()
        }
      }
      utter.onend = () => {
        if (index < parts.length) {
          window.setTimeout(runNext, requiresSpeechUnlock() ? 120 : 40)
        } else {
          hooks.onEnd?.()
        }
      }
      utter.onerror = () => {
        hooks.onError?.()
        hooks.onEnd?.()
      }

      synth.speak(utter)
    } catch {
      hooks.onError?.()
      hooks.onEnd?.()
    }
  }

  const delay = requiresSpeechUnlock() ? 80 : 0
  if (delay) {
    window.setTimeout(runNext, delay)
  } else {
    runNext()
  }

  return true
}

/**
 * Kullanıcı dokunuşu (Sesi Hazırla) — iOS speech engine unlock.
 * @returns {boolean}
 */
export function unlockSpeech(text = 'AI Asistan hazır.', hooks = {}) {
  if (!isSpeechSynthesisSupported()) {
    hooks.onBlocked?.()
    return false
  }

  speechUnlocked = true

  return speakInternal(text, {
    onStart: () => hooks.onStart?.(),
    onEnd: () => hooks.onEnd?.(),
    onError: () => hooks.onError?.(),
    onBlocked: () => hooks.onBlocked?.(),
  })
}

/** AI yanıtını seslendir */
export function speak(text, hooks = {}) {
  return speakInternal(text, hooks)
}

/** @deprecated unlockSpeech kullanın */
export function prepareSpeech(text, hooks) {
  return unlockSpeech(text, hooks)
}
