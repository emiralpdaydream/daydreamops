import { useEffect, useRef, useState } from 'react'
import BrandMark from './BrandMark'
import ProposedActionBar from './ProposedActionBar'
import { useOperator } from '../lib/useOperator'
import { OPERATOR_PRESETS } from '../lib/operatorPresets'
import {
  isSpeechRecognitionSupported,
  startListening,
  stopListening,
} from '../lib/speechRecognition'
import { isSpeechSynthesisSupported } from '../lib/speechOutput'

export default function DaydreamOperatorPanel() {
  const {
    open,
    setOpen,
    messages,
    input,
    setInput,
    loading,
    error,
    voiceReply,
    speaking,
    listening,
    setListening,
    sendMessage,
    toggleVoiceReply,
    stopVoice,
  } = useOperator()

  const scrollRef = useRef(null)
  const recRef = useRef(null)
  const [dismissedActionId, setDismissedActionId] = useState(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  function handleMic() {
    if (!isSpeechRecognitionSupported()) {
      return
    }
    if (listening) {
      stopListening(recRef.current)
      recRef.current = null
      setListening(false)
      return
    }
    setListening(true)
    recRef.current = startListening({
      onResult: (text) => {
        setInput(text)
        setListening(false)
      },
      onError: () => setListening(false),
      onEnd: () => setListening(false),
    })
  }

  return (
    <div className="operator-overlay" role="dialog" aria-label="Daydream Operator">
      <button
        type="button"
        className="operator-overlay__backdrop"
        aria-label="Kapat"
        onClick={() => setOpen(false)}
      />
      <aside className="operator-panel">
        <header className="operator-panel__head">
          <div className="operator-panel__brand">
            <BrandMark />
            <div>
              <h2 className="operator-panel__title">Daydream Operator</h2>
              <p className="operator-panel__sub">
                Operasyonu analiz eder, not alır, önerir ve onayınla aksiyon
                alır.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost shrink-0"
            onClick={() => setOpen(false)}
          >
            Kapat
          </button>
        </header>

        <div className="operator-presets">
          {OPERATOR_PRESETS.map((label) => (
            <button
              key={label}
              type="button"
              className="operator-chip"
              disabled={loading}
              onClick={() => sendMessage(label)}
            >
              {label}
            </button>
          ))}
        </div>

        <div ref={scrollRef} className="operator-chat">
          {messages.length === 0 && (
            <p className="operator-chat-empty">
              Soru sorun veya hızlı komut seçin. Verileriniz özet halinde
              analiz edilir; değişiklikler yalnızca onayınızla uygulanır.
            </p>
          )}
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'
            const actionKey = `${i}-${msg.proposedAction?.type ?? ''}`
            const showAction =
              !isUser &&
              msg.proposedAction &&
              dismissedActionId !== actionKey

            return (
              <div
                key={`${msg.role}-${i}`}
                className={
                  isUser ? 'operator-msg operator-msg--user' : 'operator-msg'
                }
              >
                <p>{msg.content}</p>
                {showAction && (
                  <ProposedActionBar
                    action={msg.proposedAction}
                    onDone={() => setDismissedActionId(actionKey)}
                  />
                )}
              </div>
            )
          })}
          {loading && (
            <p className="operator-chat-status">Operatör düşünüyor…</p>
          )}
          {error && <p className="operator-chat-error">{error}</p>}
        </div>

        <footer className="operator-panel__foot">
          <div className="operator-voice-row">
            <button
              type="button"
              className={`operator-voice-toggle${voiceReply ? ' is-on' : ''}`}
              onClick={toggleVoiceReply}
              disabled={!isSpeechSynthesisSupported()}
            >
              Sesli Yanıt: {voiceReply ? 'Açık' : 'Kapalı'}
            </button>
            {speaking && (
              <span className="operator-speaking">
                <span className="operator-pulse" aria-hidden />
                Konuşuyor…
                <button type="button" className="btn-ghost" onClick={stopVoice}>
                  Durdur
                </button>
              </span>
            )}
          </div>

          <form className="operator-compose" onSubmit={handleSubmit}>
            <button
              type="button"
              className={`operator-mic${listening ? ' is-active' : ''}`}
              onClick={handleMic}
              disabled={!isSpeechRecognitionSupported() || loading}
              title={
                isSpeechRecognitionSupported()
                  ? 'Sesli giriş'
                  : 'Bu tarayıcıda sesli giriş desteklenmiyor.'
              }
              aria-label="Mikrofon"
            >
              ◉
            </button>
            <input
              className="input-premium operator-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Operatöre yazın…"
              disabled={loading}
            />
            <button
              type="submit"
              className="btn-primary btn-primary-inline shrink-0"
              disabled={loading || !input.trim()}
            >
              Gönder
            </button>
          </form>
          {!isSpeechRecognitionSupported() && (
            <p className="operator-foot-note">
              Bu tarayıcıda sesli giriş desteklenmiyor.
            </p>
          )}
        </footer>
      </aside>
    </div>
  )
}
