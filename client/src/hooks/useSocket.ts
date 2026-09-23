import { useEffect, useState, useCallback } from 'react'
import socketService from '../services/socketService'
import { useAuthStore } from '../stores/authStore'

/**
 * Custom hook to manage Socket.IO connection and events
 */
export const useSocket = () => {
  const { token, user } = useAuthStore()
  const [isConnected, setIsConnected] = useState(socketService.isConnected())

  // Initialize socket connection
  useEffect(() => {
    if (!token || !user) {
      return
    }

    socketService.connect(token, user.id)
    setIsConnected(socketService.isConnected())
  }, [token, user])

  useEffect(() => {
    const removeConnectionListener = socketService.onConnectionChange(setIsConnected)
    return () => {
      removeConnectionListener()
    }
  }, [])

  /**
   * Join a conversation room
   */
  const joinConversation = useCallback((conversationId: string) => {
    socketService.joinConversation(conversationId)
  }, [])

  /**
   * Leave a conversation room
   */
  const leaveConversation = useCallback((conversationId: string) => {
    socketService.leaveConversation(conversationId)
  }, [])

  /**
   * Send a message
   */
  const sendMessage = useCallback((conversationId: string, content: string) => {
    socketService.sendMessage(conversationId, content)
  }, [])

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback((messageId: string, conversationId: string) => {
    socketService.markMessageAsRead(messageId, conversationId)
  }, [])

  /**
   * Start typing indicator
   */
  const startTyping = useCallback((conversationId: string) => {
    socketService.startTyping(conversationId)
  }, [])

  /**
   * Stop typing indicator
   */
  const stopTyping = useCallback((conversationId: string) => {
    socketService.stopTyping(conversationId)
  }, [])

  /**
   * Register event listener
   */
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    const socket = socketService.getSocket()
    if (socket) {
      socket.on(event, callback)
    }
  }, [])

  /**
   * Remove event listener
   */
  const off = useCallback((event: string) => {
    socketService.removeListener(event)
  }, [])

  return {
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    on,
    off,
  }
}

export default useSocket
