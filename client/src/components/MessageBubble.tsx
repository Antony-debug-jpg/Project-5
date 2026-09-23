import { Check, CheckCheck } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    sender: {
      id: string
      displayName: string
      profilePicture?: string
    }
    createdAt: string
    readBy: string[]
  }
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuthStore()
  const isSent = message.sender.id === user?.id
  const isRead = message.readBy.length > 0

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`flex gap-3 ${isSent ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar (for received messages) */}
      {!isSent && (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {message.sender.displayName?.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-xs rounded-lg px-4 py-2 ${
          isSent
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        {/* Sender name (for group chats or received messages) */}
        {!isSent && (
          <p className="text-xs font-semibold mb-1 opacity-75">
            {message.sender.displayName}
          </p>
        )}

        {/* Message content */}
        <p className="break-words whitespace-pre-wrap text-sm">{message.content}</p>

        {/* Time and read status */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <p className="text-xs opacity-70">{formatTime(message.createdAt)}</p>
          {isSent && (
            <>
              {isRead ? (
                <CheckCheck size={14} />
              ) : (
                <Check size={14} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
