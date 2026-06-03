import { useEffect, useRef, useState } from 'react'
import CollectedNotesSection from './CollectedNotesSection'
import Logo from './Logo'
import ProposedActionBar from './ProposedActionBar'
import { getTodayBriefRecord } from '../lib/briefSelectors'
import { useOps } from '../lib/useOps'
import { useOperator } from '../lib/useOperator'
import { OPERATOR_PRESETS } from '../lib/operatorPresets'
import {
  isSpeechRecognitionSupported,
  startListening,
  stopListening,
} from '../lib/speechRecognition'
import {
  isSpeechSynthesisSupported,
  isSpeechUnlockRequired,
  primeSpeechFromUserGesture,
} from '../lib/speechOutput'

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
    voicePrepared,
    speaking,
    listening,
    setListening,
    sendMessage,
    toggleVoiceReply,
    stopVoice,
    prepareVoice,
    testVoice,
  } = useOperator()

  const { data, setBriefNotes, appendBriefNote } = useOps()
  const brief = getTodayBriefRecord(data)
  const scrollRef = useRef(null)
  const recRef = useRef(null)
  const [dismissedActionId, setDismissedActionId] = useState(null)
  const [panelTab, setPanelTab] = useState('chat')

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (voiceReply) primeSpeechFromUserGesture()
    sendMessage(input)
  }

  function handleMic() {
    if (!isSpeechRecognitionSupported()) return
    if (listening) {
      stopListening(recRef.current)
      recRef.current = null
      setListening(false)
      return
    }
    primeSpeechFromUserGesture()
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

  const showEmpty = messages.length === 0 && !loading

  return (
    <div className="operator-overlay" role="dialog" aria-label="AI Asistan">
      <button
        type="button"
        className="operator-overlay__backdrop"
        aria-label="Kapat"
        onClick={() => setOpen(false)}
      />
      <aside className="operator-panel ai-chat-panel">
        <header className="ai-chat-head">
          <div className="ai-chat-head__brand">
            <Logo variant="avatar" className="ai-chat-head__logo" />
            <h2 className="ai-chat-head__title">AI Asistan</h2>
          </div>
          <div className="ai-chat-head__tools">
            {isSpeechSynthesisSupported() && (
              <>
                {isSpeechUnlockRequired() && !voicePrepared && (
                  <button
                    type="button"
                    className="ai-chat-icon-btn"
                    onClick={prepareVoice}
                    title="Sesi Hazırla (iPhone)"
                  >
                    🔊
                  </button>
                )}
                <button
                  type="button"
                  className="ai-chat-icon-btn"
                  onClick={testVoice}
                  title="Ses testi"
                >
                  ▶
                </button>
                <button
                  type="button"
                  className={`ai-chat-icon-btn${voiceReply ? ' is-on' : ''}`}
                  onClick={toggleVoiceReply}
                  title={
                    voiceReply
                      ? 'Sesli yanıt açık'
                      : 'Sesli yanıt kapalı'
                  }
                  aria-pressed={voiceReply}
                >
                  {voiceReply ? '🔈' : '🔇'}
                </button>
              </>
            )}
            <button
              type="button"
              className="ai-chat-icon-btn"
              onClick={() => setOpen(false)}
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="ai-chat-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={panelTab === 'chat'}
            className={`ai-chat-tab${panelTab === 'chat' ? ' is-active' : ''}`}
            onClick={() => setPanelTab('chat')}
          >
            Sohbet
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={panelTab === 'notes'}
            className={`ai-chat-tab${panelTab === 'notes' ? ' is-active' : ''}`}
            onClick={() => setPanelTab('notes')}
          >
            Alınan notlar
          </button>
        </div>

        {panelTab === 'notes' ? (
          <CollectedNotesSection
            compact
            notes={brief.notes ?? ''}
            onSaveNotes={setBriefNotes}
            onAppendNote={appendBriefNote}
          />
        ) : (
          <>
        <div ref={scrollRef} className="ai-chat-scroll">
          <div className="ai-chat-thread">
            {showEmpty && (
              <div className="ai-chat-welcome">
                <p className="ai-chat-welcome__title">Merhaba</p>
                <p className="ai-chat-welcome__sub">
                  Operasyon verilerinizi özetler, önerir ve onayınızla işlem
                  önerir.
                </p>
                <div className="ai-chat-suggestions">
                  {OPERATOR_PRESETS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="ai-chat-suggestion"
                      disabled={loading}
                      onClick={() => sendMessage(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
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
                    isUser
                      ? 'ai-chat-row ai-chat-row--user'
                      : 'ai-chat-row ai-chat-row--assistant'
                  }
                >
                  {isUser ? (
                    <span className="ai-chat-avatar" aria-hidden>
                      S
                    </span>
                  ) : (
                    <span className="ai-chat-avatar ai-chat-avatar--logo" aria-hidden>
                      <Logo variant="avatar" />
                    </span>
                  )}
                  <div className="ai-chat-bubble">
                    <p className="ai-chat-bubble__text">{msg.content}</p>
                    {showAction && (
                      <ProposedActionBar
                        action={msg.proposedAction}
                        onDone={() => setDismissedActionId(actionKey)}
                      />
                    )}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="ai-chat-row ai-chat-row--assistant">
                <span className="ai-chat-avatar ai-chat-avatar--logo" aria-hidden>
                  <Logo variant="avatar" />
                </span>
                <div className="ai-chat-bubble ai-chat-bubble--typing">
                  <span className="ai-chat-dots" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="sr-only">Yanıt hazırlanıyor</span>
                </div>
              </div>
            )}

            {error && <p className="ai-chat-error">{error}</p>}
          </div>
        </div>

        <footer className="ai-chat-compose-wrap">
          {speaking && (
            <div className="ai-chat-speaking-bar">
              <span className="operator-pulse" aria-hidden />
              Sesli okunuyor…
              <button type="button" className="btn-ghost" onClick={stopVoice}>
                Durdur
              </button>
            </div>
          )}
          {isSpeechUnlockRequired() && voiceReply && !voicePrepared && (
            <p className="ai-chat-hint">
              iPhone: ses için üstteki 🔊 ile &quot;Sesi Hazırla&quot;ya
              dokunun.
            </p>
          )}
          <form className="ai-chat-compose" onSubmit={handleSubmit}>
            <button
              type="button"
              className={`ai-chat-compose__mic${listening ? ' is-active' : ''}`}
              onClick={handleMic}
              disabled={!isSpeechRecognitionSupported() || loading}
              aria-label="Sesli giriş"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.71V21h2v-3.29A7 7 0 0 0 19 11h-2z" />
              </svg>
            </button>
            <textarea
              rows={1}
              className="ai-chat-compose__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Mesaj yazın…"
              disabled={loading}
              autoComplete="off"
            />
            <button
              type="submit"
              className="ai-chat-compose__send"
              disabled={loading || !input.trim()}
              aria-label="Gönder"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </footer>
          </>
        )}
      </aside>
    </div>
  )
}
