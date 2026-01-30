import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type FeedbackType = 'success' | 'error' | null
type FeedbackState = { message: string; type: FeedbackType }

const FeedbackContext = createContext<{
  feedback: FeedbackState | null
  showSuccess: (message: string) => void
  showError: (message: string) => void
  clearFeedback: () => void
} | null>(null)

const AUTO_HIDE_MS = 5000

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  const clearFeedback = useCallback(() => setFeedback(null), [])

  const showSuccess = useCallback((message: string) => {
    setFeedback({ message, type: 'success' })
    setTimeout(() => setFeedback(null), AUTO_HIDE_MS)
  }, [])

  const showError = useCallback((message: string) => {
    setFeedback({ message, type: 'error' })
    setTimeout(() => setFeedback(null), AUTO_HIDE_MS)
  }, [])

  return (
    <FeedbackContext.Provider value={{ feedback, showSuccess, showError, clearFeedback }}>
      {children}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback must be used within FeedbackProvider')
  return ctx
}
