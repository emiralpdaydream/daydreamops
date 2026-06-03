import { useCallback, useMemo, useState } from 'react'
import { OperatorContext } from './operatorContextCore'
import { buildDataSnapshot } from './buildDataSnapshot'
import { callOperator } from './operatorClient'
import {
  isVoiceReplyEnabled,
  setVoiceReplyEnabled,
  speak,
  stopSpeaking,
} from './speechOutput'

export function OperatorProvider({ children, data }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [voiceReply, setVoiceReply] = useState(() => isVoiceReplyEnabled())
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)

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

      try {
        const snapshot = buildDataSnapshot(data)
        const { reply, proposedAction } = await callOperator({
          messages: nextMessages,
          dataSnapshot: snapshot,
          voiceReply,
        })
        const assistantMsg = {
          role: 'assistant',
          content: reply,
          proposedAction,
        }
        setMessages((prev) => [...prev, assistantMsg])

        if (voiceReply) {
          speak(reply, {
            onStart: () => setSpeaking(true),
            onEnd: () => setSpeaking(false),
          })
        }
      } catch (e) {
        setError(e?.message || 'Operatör yanıt veremedi.')
      } finally {
        setLoading(false)
      }
    },
    [data, loading, messages, voiceReply],
  )

  const toggleVoiceReply = useCallback(() => {
    setVoiceReply((v) => {
      const next = !v
      setVoiceReplyEnabled(next)
      if (!next) stopSpeaking()
      return next
    })
  }, [])

  const stopVoice = useCallback(() => {
    stopSpeaking()
    setSpeaking(false)
  }, [])

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
      speaking,
      listening,
      setListening,
      sendMessage,
      toggleVoiceReply,
      stopVoice,
    }),
    [
      open,
      messages,
      input,
      loading,
      error,
      voiceReply,
      speaking,
      listening,
      sendMessage,
      toggleVoiceReply,
      stopVoice,
    ],
  )

  return (
    <OperatorContext.Provider value={value}>
      {children}
    </OperatorContext.Provider>
  )
}
