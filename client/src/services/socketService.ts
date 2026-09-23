import { io, Socket } from 'socket.io-client'

const SOCKET_URL = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

let socket: Socket | null = null
const joinedConversations = new Set<string>()
const connectionListeners = new Set<(connected: boolean) => void>()

const notifyConnectionListeners = (connected: boolean) => {
  connectionListeners.forEach((listener) => listener(connected))
}

export const socketService = {
  /**
   * Initialize socket connection with JWT token
   */
  connect: (token: string, userId: string) => {
    if (socket) {
      if (socket.connected) {
        console.log('Socket already connected')
      }
      return socket
    }

    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    // After connection, send user ID
    socket.on('connect', () => {
      console.log('✓ Socket connected')
      socket?.emit('set_user_id', { userId })
      joinedConversations.forEach((conversationId) => {
        socket?.emit('join_conversation', { conversationId })
      })
      notifyConnectionListeners(true)
    })

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('✗ Socket connection error:', error)
    })

    // Handle errors from server
    socket.on('error', (error) => {
      console.error('✗ Socket error:', error)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('✗ Socket disconnected')
      notifyConnectionListeners(false)
    })

    // Handle reconnection
    socket.on('reconnect', () => {
      console.log('✓ Socket reconnected')
      socket?.emit('set_user_id', { userId })
      joinedConversations.forEach((conversationId) => {
        socket?.emit('join_conversation', { conversationId })
      })
      notifyConnectionListeners(true)
    })

    return socket
  },

  /**
   * Disconnect socket
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect()
      socket = null
      joinedConversations.clear()
      notifyConnectionListeners(false)
    }
  },

  /**
   * Get socket instance
   */
  getSocket: () => socket,

  /**
   * Check if socket is connected
   */
  isConnected: () => socket?.connected || false,

  // ===== Conversation Events =====

  /**
   * Join a conversation
   */
  joinConversation: (conversationId: string) => {
    joinedConversations.add(conversationId)
    socket?.emit('join_conversation', { conversationId })
  },

  /**
   * Leave a conversation
   */
  leaveConversation: (conversationId: string) => {
    joinedConversations.delete(conversationId)
    socket?.emit('leave_conversation', { conversationId })
  },

  onConnectionChange: (listener: (connected: boolean) => void) => {
    connectionListeners.add(listener)
    return () => connectionListeners.delete(listener)
  },

  /**
   * Send a message
   */
  sendMessage: (conversationId: string, content: string) => {
    socket?.emit('send_message', { conversationId, content })
  },

  /**
   * Mark message as read
   */
  markMessageAsRead: (messageId: string, conversationId: string) => {
    socket?.emit('message_read', { messageId, conversationId })
  },

  // ===== Typing Events =====

  /**
   * Emit typing start
   */
  startTyping: (conversationId: string) => {
    socket?.emit('typing_start', { conversationId })
  },

  /**
   * Emit typing stop
   */
  stopTyping: (conversationId: string) => {
    socket?.emit('typing_stop', { conversationId })
  },

  // ===== Listeners =====

  /**
   * Listen for new messages
   */
  onMessageSent: (callback: (message: any) => void) => {
    socket?.on('message_sent', callback)
  },

  /**
   * Listen for message read receipts
   */
  onMessageRead: (callback: (data: any) => void) => {
    socket?.on('message_read', callback)
  },

  /**
   * Listen for typing status
   */
  onTyping: (callback: (data: { users: string[] }) => void) => {
    socket?.on('typing', callback)
  },

  /**
   * Listen for user online status
   */
  onUserOnline: (callback: (data: any) => void) => {
    socket?.on('user_online', callback)
  },

  /**
   * Listen for user offline status
   */
  onUserOffline: (callback: (data: any) => void) => {
    socket?.on('user_offline', callback)
  },

  /**
   * Listen for user viewing status
   */
  onUserViewing: (callback: (data: any) => void) => {
    socket?.on('user_viewing', callback)
  },

  /**
   * Listen for conversation updates (new messages, typing, etc.)
   */
  onConversationUpdated: (callback: (data: any) => void) => {
    socket?.on('conversation_updated', callback)
  },

  /**
   * Listen for errors
   */
  onError: (callback: (error: any) => void) => {
    socket?.on('error', callback)
  },

  // ===== Cleanup =====

  /**
   * Remove all listeners
   */
  removeAllListeners: () => {
    socket?.removeAllListeners()
  },

  /**
   * Remove specific listener
   */
  removeListener: (event: string) => {
    socket?.removeListener(event)
  },
}

export default socketService
