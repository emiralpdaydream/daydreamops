import { useCallback, useRef, useState } from 'react'
import { ToastContext } from './toastContext'

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((message) => {
    setToast(message)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="toast-premium" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  )
}
