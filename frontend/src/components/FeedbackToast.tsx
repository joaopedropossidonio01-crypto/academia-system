import { useFeedback } from '../contexts/FeedbackContext'
import { CheckCircle, XCircle, X } from 'lucide-react'

export function FeedbackToast() {
  const { feedback, clearFeedback } = useFeedback()
  if (!feedback) return null

  const isSuccess = feedback.type === 'success'
  return (
    <div
      role="alert"
      className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg transition-opacity"
      style={{
        backgroundColor: isSuccess ? 'rgb(236 253 245)' : 'rgb(254 242 242)',
        borderColor: isSuccess ? 'rgb(167 243 208)' : 'rgb(254 202 202)',
      }}
    >
      {isSuccess ? (
        <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0 text-red-600" />
      )}
      <p
        className="text-sm font-medium"
        style={{ color: isSuccess ? 'rgb(5 46 22)' : 'rgb(127 29 29)' }}
      >
        {feedback.message}
      </p>
      <button
        type="button"
        onClick={clearFeedback}
        className="ml-1 rounded p-1 hover:bg-black/5"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" style={{ color: isSuccess ? 'rgb(5 46 22)' : 'rgb(127 29 29)' }} />
      </button>
    </div>
  )
}
