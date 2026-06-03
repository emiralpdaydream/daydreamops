import { useCallback, useEffect, useMemo, useState } from 'react'
import { OperatorContext } from './operatorContextCore'
import { buildDataSnapshot } from './buildDataSnapshot'
import { callOperator } from './operatorClient'
import { inferProposedAction } from './inferProposedAction'
import { useToast } from './useToast'
import {
  initSpeechVoices,
  isSpeechSynthesisSupported,
  isSpeechUnlockRequired,
  isSpeechUnlocked,
  isVoiceReplyEnabled,
  setVoiceReplyEnabled,
  speak,
  stopSpeaking,
  unlockSpeech,
} from './speechOutput'

export function OperatorProvider({ children, data }) {
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [voiceReply, setVoiceReply] = useState(() => isVoiceReplyEnabled())
  const [voicePrepared, setVoicePrepared] = useState(() => {
    if (typeof window === 'undefined') return false
    initSpeechVoices()
    return isSpeechUnlocked()
  })
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)

  useEffect(() => {
    initSpeechVoices()
  }, [])

  const runSpeakReply = useCallback(
    (reply) => {
      if (!voiceReply) return

      const started = speak(reply, {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
        onBlocked: () => {
          setSpeaking(false)
          if (isSpeechUnlockRequired()) {
            setVoicePrepared(false)
            showToast('Sesli yanıt için önce Sesi Hazırla\'ya dokunun.')
          } else if (!isSpeechSynthesisSupported()) {
            showToast('Bu cihazda sesli yanıt desteklenmiyor.')
          }
        },
      })

      if (!started && voiceReply && isSpeechUnlockRequired() && !isSpeechUnlocked()) {
        showToast('Sesli yanıt için önce Sesi Hazırla\'ya dokunun.')
      }
    },
    [voiceReply, showToast],
  )

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = String(text ?? '').trim()
      if (!trimmed || loading) return

      const userMsg = { role: 'user', content: trimmed }
      const nextMessages = [...messages, userMsg]
      setMessages(nextMessages)
      setInput('')
      setLoading(true)
      setError(null)
      stopSpeaking()
      setSpeaking(false)

      try {
        const snapshot = buildDataSnapshot(data)
        const { reply, proposedAction } = await callOperator({
          messages: nextMessages,
          dataSnapshot: snapshot,
          voiceReply,
        })
        const resolvedAction = inferProposedAction(
          reply,
          proposedAction,
          trimmed,
        )
        const assistantMsg = {
          role: 'assistant',
          content: reply,
          proposedAction: resolvedAction,
        }
        setMessages((prev) => [...prev, assistantMsg])

        runSpeakReply(reply)
      } catch (e) {
        setError(e?.message || 'Operatör yanıt veremedi.')
      } finally {
        setLoading(false)
      }
    },
    [data, loading, messages, voiceReply, runSpeakReply],
  )

  const toggleVoiceReply = useCallback(() => {
    setVoiceReply((v) => {
      const next = !v
      setVoiceReplyEnabled(next)
      if (!next) {
        stopSpeaking()
        setSpeaking(false)
      } else if (next && isSpeechUnlockRequired() && !isSpeechUnlocked()) {
        showToast('Önce Sesi Hazırla ile ses motorunu açın.')
      }
      return next
    })
  }, [showToast])

  const stopVoice = useCallback(() => {
    stopSpeaking()
    setSpeaking(false)
  }, [])

  const prepareVoice = useCallback(() => {
    const started = unlockSpeech('Daydream Operator hazır.', {
      onStart: () => {
        setVoicePrepared(true)
        setSpeaking(true)
      },
      onEnd: () => setSpeaking(false),
      onError: () => {
        setSpeaking(false)
        setVoicePrepared(isSpeechUnlocked())
      },
      onBlocked: () => {
        setSpeaking(false)
        showToast('Bu cihazda sesli yanıt desteklenmiyor.')
      },
    })

    if (started) {
      setVoicePrepared(true)
      showToast('Ses motoru hazır.')
    }
  }, [showToast])

  const value = useMemo(
    () => ({
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
    }),
    [
      open,
      messages,
      input,
      loading,
      error,
      voiceReply,
      voicePrepared,
      speaking,
      listening,
      sendMessage,
      toggleVoiceReply,
      stopVoice,
      prepareVoice,
    ],
  )

  return (
    <OperatorContext.Provider value={value}>
      {children}
    </OperatorContext.Provider>
  )
}
