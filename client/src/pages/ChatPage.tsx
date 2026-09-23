import { useState, useEffect } from 'react'
import { MessageCircle, ArrowLeft, Info, Wifi, WifiOff } from 'lucide-react'
import { conversationService } from '../services/authService'
import { Message, useConversationStore } from '../stores/conversationStore'
import useSocket from '../hooks/useSocket'
import ConversationList from '../components/ConversationList'
import ContactsList from '../components/ContactsList'
import MessageBubble from '../components/MessageBubble'
import MessageInput from '../components/MessageInput'

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<'messages' | 'contacts'>('messages')
  const [conversationDetail, setConversationDetail] = useState<any>(null)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState('')
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  const {
    selectedConversationId,
    setSelectedConversationId,
    messages,
    setMessages,
    addMessage,
    updateMessage,
    updateConversation,
    setTypingUsers: setStoreTypingUsers,
    typingUsers: storeTypingUsers,
  } = useConversationStore()

  const { isConnected, joinConversation, leaveConversation, sendMessage: emitMessage, markAsRead, startTyping, stopTyping, on, off } =
    useSocket()

  // Load conversation details when selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchConversationDetail()
      fetchMessages()
      // Join conversation via Socket.IO
      joinConversation(selectedConversationId)
    } else {
      setConversationDetail(null)
    }

    return () => {
      if (selectedConversationId) {
        leaveConversation(selectedConversationId)
      }
    }
  }, [selectedConversationId])

  // Setup Socket.IO listeners
  useEffect(() => {
    if (!isConnected) return

    // Listen for new messages
    on('message_sent', (message) => {
      if (selectedConversationId && selectedConversationId === message.conversationId) {
        addMessage(selectedConversationId, message)
      }
    })

    // Listen for message read receipts
    on('message_read', (data) => {
      if (selectedConversationId) {
        const existingReadBy = messages[selectedConversationId]?.find((m) => m.id === data.messageId)?.readBy || []
        updateMessage(selectedConversationId, data.messageId, {
          readBy: Array.from(new Set([data.userId, ...existingReadBy])),
        })
      }
    })

    // Listen for conversation updates from socket events
    on('conversation_updated', (conversation) => {
      if (!conversation?.id) return
      updateConversation(conversation.id, {
        ...conversation,
        unreadCount: conversation.unreadCount ?? 0,
      })
    })

    // Listen for typing status
    on('typing', (data) => {
      if (selectedConversationId) {
        setStoreTypingUsers(selectedConversationId, data.users || [])
      }
    })

    return () => {
      off('message_sent')
      off('message_read')
      off('conversation_updated')
      off('typing')
    }
  }, [isConnected, selectedConversationId, messages, updateConversation, setStoreTypingUsers, addMessage, updateMessage, off, on])

  const fetchConversationDetail = async () => {
    if (!selectedConversationId) return

    try {
      setError('')
      const detail = await conversationService.getConversation(selectedConversationId)
      setConversationDetail(detail)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load conversation')
    }
  }

  const fetchMessages = async () => {
    if (!selectedConversationId) return

    try {
      setLoadingMessages(true)
      setError('')
      const convMessages = await conversationService.getMessages(selectedConversationId)
      setMessages(selectedConversationId, convMessages)
      if (isConnected) {
        convMessages.forEach((message: Message) => markAsRead(message.id, selectedConversationId))
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load messages')
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId || !isConnected) {
      setError('Not connected. Please refresh.')
      return
    }

    try {
      setError('')
      // Emit via Socket.IO instead of HTTP
      emitMessage(selectedConversationId, content)
      // Clear typing indicator
      stopTyping(selectedConversationId)
      if (typingTimeout) {
        clearTimeout(typingTimeout)
        setTypingTimeout(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    }
  }

  const handleMessageInputChange = () => {
    if (!selectedConversationId || !isConnected) return

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Send typing start
    startTyping(selectedConversationId)

    // Auto stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      stopTyping(selectedConversationId)
      setTypingTimeout(null)
    }, 3000)

    setTypingTimeout(timeout)
  }

  const conversationMessages = selectedConversationId
    ? messages[selectedConversationId] || []
    : []

  const currentTypingUsers = selectedConversationId
    ? (storeTypingUsers[selectedConversationId] || [])
    : []

  return (
    <div className="h-full flex gap-0">
      {/* Sidebar - Conversations or Contacts */}
      <div
        className={`border-r border-gray-200 bg-white transition-all ${
          selectedConversationId ? 'hidden lg:flex w-72' : 'w-full lg:w-72'
        } flex-col`}
      >
        {/* Tab buttons */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 px-4 py-3 font-medium transition ${
              activeTab === 'messages'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 px-4 py-3 font-medium transition ${
              activeTab === 'contacts'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contacts
          </button>
        </div>

        {/* Socket status indicator */}
        <div className={`px-4 py-2 flex items-center gap-2 text-xs ${isConnected ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
          {isConnected ? (
            <>
              <Wifi size={14} />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={14} />
              <span>Connecting...</span>
            </>
          )}
        </div>

        {/* Content */}
        {activeTab === 'messages' ? (
          <ConversationList />
        ) : (
          <ContactsList />
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversationId ? (
          <>
            {/* Chat header */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="font-bold text-gray-900">
                    {conversationDetail?.displayName}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {conversationDetail?.members.length} members
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConversationId(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Conversation info"
              >
                <Info size={20} />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading messages...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : conversationMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle size={48} className="mb-3 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                conversationMessages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))
              )}

              {/* Typing indicator */}
              {currentTypingUsers.length > 0 && (
                <div className="flex gap-2 items-center text-gray-500 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span>
                    {currentTypingUsers.length === 1
                      ? 'Someone is typing'
                      : `${currentTypingUsers.length} people are typing`}
                  </span>
                </div>
              )}
            </div>

            {/* Message input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onInputChange={handleMessageInputChange}
              disabled={!isConnected}
            />
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="text-center max-w-md">
              <MessageCircle size={64} className="text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ChatFlow</h2>
              <p className="text-gray-600 mb-8">
                Select a conversation from the list or add a new contact to start messaging.
              </p>

              <div className="space-y-2 text-left bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Phase 4 Features ⚡</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Real-time messaging via Socket.IO</li>
                  <li>✓ Typing indicators</li>
                  <li>✓ Online/offline status</li>
                  <li>✓ Read receipts (live updates)</li>
                  <li>✓ Live conversation updates</li>
                  <li>✓ Automatic reconnection</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
