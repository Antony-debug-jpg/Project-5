import { useEffect, useState } from 'react'
import { MessageSquare, Search } from 'lucide-react'
import { conversationService } from '../services/authService'
import { useConversationStore } from '../stores/conversationStore'
import useSocket from '../hooks/useSocket'

export default function ConversationList() {
  const {
    conversations,
    setConversations,
    selectedConversationId,
    setSelectedConversationId,
    updateConversation,
    addConversation,
  } = useConversationStore()
  const { isConnected, on, off } = useSocket()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (!isConnected) return

    on('conversation_updated', (conversation) => {
      if (!conversation?.id) return

      const exists = conversations.some((item) => item.id === conversation.id)
      if (exists) {
        updateConversation(conversation.id, {
          ...conversation,
          unreadCount: conversation.unreadCount ?? 0,
        })
      } else {
        addConversation({
          id: conversation.id,
          displayName: conversation.displayName,
          isGroup: conversation.isGroup,
          participantId: conversation.participantId,
          picture: conversation.picture,
          unreadCount: conversation.unreadCount ?? 0,
          lastMessage: conversation.lastMessage ?? undefined,
          updatedAt: conversation.updatedAt ?? new Date().toISOString(),
        })
      }
    })

    return () => {
      off('conversation_updated')
    }
  }, [isConnected, conversations, updateConversation, addConversation, on, off])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError('')
      const convs = await conversationService.getConversations()
      setConversations(convs)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (date: string) => {
    const time = new Date(date)
    const now = new Date()
    const diff = now.getTime() - time.getTime()

    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <MessageSquare size={48} className="mb-3 opacity-50" />
            <p>{searchQuery ? 'No conversations match your search' : 'No conversations yet'}</p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onSelect={() => setSelectedConversationId(conversation.id)}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ConversationItemProps {
  conversation: any
  isSelected: boolean
  onSelect: () => void
  formatTime: (date: string) => string
}

function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  formatTime,
}: ConversationItemProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition ${
        isSelected
          ? 'bg-primary-light border-l-4 border-l-primary'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {conversation.displayName?.charAt(0).toUpperCase()}
          </div>
          {conversation.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {Math.min(conversation.unreadCount, 9)}
            </div>
          )}
        </div>

        {/* Conversation info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-900'} truncate`}>
              {conversation.displayName}
            </p>
            {conversation.lastMessage && (
              <p className="text-xs text-gray-500 flex-shrink-0">
                {formatTime(conversation.lastMessage.createdAt)}
              </p>
            )}
          </div>

          {/* Last message preview */}
          {conversation.lastMessage ? (
            <p
              className={`text-sm truncate mt-1 ${
                isSelected
                  ? 'text-gray-700'
                  : conversation.unreadCount > 0
                    ? 'font-semibold text-gray-900'
                    : 'text-gray-600'
              }`}
            >
              <span className="font-medium">{conversation.lastMessage.senderName}:</span>{' '}
              {conversation.lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-gray-500 italic mt-1">No messages yet</p>
          )}
        </div>
      </div>
    </button>
  )
}
