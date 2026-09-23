import { useState } from 'react'
import { Send, Loader } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string) => void | Promise<void>
  onInputChange?: () => void
  disabled?: boolean
}

export default function MessageInput({
  onSendMessage,
  onInputChange,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || loading || disabled) return

    setLoading(true)

    try {
      await onSendMessage(message)
      setMessage('')
    } catch (err) {
      // Error is handled in parent component
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    // Trigger typing indicator
    onInputChange?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
      <div className="flex gap-3">
        <textarea
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Shift+Enter for new line)"
          disabled={loading || disabled}
          rows={3}
          maxLength={5000}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:bg-gray-50 disabled:text-gray-500"
        />
        <button
          type="submit"
          disabled={!message.trim() || loading || disabled}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end flex-shrink-0"
        >
          {loading ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {message.length}/5000 {disabled && '(Connecting...)'}
      </p>
    </form>
  )
}
