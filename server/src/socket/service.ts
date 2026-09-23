import { Server, Socket } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class SocketService {
  private userSockets: Map<string, string> = new Map() // userId -> socketId
  private userConversations: Map<string, Set<string>> = new Map() // userId -> Set<conversationId>
  private conversationTyping: Map<string, Set<string>> = new Map() // conversationId -> Set<userId>
  private io: Server

  constructor(io: Server) {
    this.io = io
  }

  /**
   * Register user connection
   */
  addUser(userId: string, socketId: string) {
    this.userSockets.set(userId, socketId)
    console.log(`User ${userId} connected with socket ${socketId}`)
  }

  /**
   * Unregister user connection
   */
  removeUser(userId: string, socketId: string): boolean {
    if (this.userSockets.get(userId) !== socketId) {
      return false
    }

    this.userSockets.delete(userId)
    this.userConversations.delete(userId)
    console.log(`User ${userId} disconnected`)
    return true
  }

  /**
   * Get socket ID for user
   */
  getUserSocket(userId: string): string | undefined {
    return this.userSockets.get(userId)
  }

  /**
   * Get all socket IDs for users in a conversation
   */
  async getConversationSockets(conversationId: string): Promise<string[]> {
    const members = await prisma.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true },
    })

    const socketIds: string[] = []
    for (const member of members) {
      const socketId = this.userSockets.get(member.userId)
      if (socketId) {
        socketIds.push(socketId)
      }
    }

    return socketIds
  }

  /**
   * Track that user joined conversation
   */
  joinConversation(userId: string, conversationId: string) {
    if (!this.userConversations.has(userId)) {
      this.userConversations.set(userId, new Set())
    }
    this.userConversations.get(userId)!.add(conversationId)
  }

  /**
   * Track that user left conversation
   */
  leaveConversation(userId: string, conversationId: string) {
    this.userConversations.get(userId)?.delete(conversationId)
  }

  /**
   * Get conversations user is currently viewing
   */
  getUserConversations(userId: string): string[] {
    return Array.from(this.userConversations.get(userId) || [])
  }

  /**
   * Mark user as typing
   */
  setTyping(conversationId: string, userId: string, isTyping: boolean) {
    if (!this.conversationTyping.has(conversationId)) {
      this.conversationTyping.set(conversationId, new Set())
    }

    const typingSet = this.conversationTyping.get(conversationId)!

    if (isTyping) {
      typingSet.add(userId)
    } else {
      typingSet.delete(userId)
    }
  }

  /**
   * Get users currently typing in conversation
   */
  getTypingUsers(conversationId: string): string[] {
    return Array.from(this.conversationTyping.get(conversationId) || [])
  }

  /**
   * Broadcast message to conversation members
   */
  broadcastToConversation(conversationId: string, event: string, data: any) {
    this.io.to(`conversation_${conversationId}`).emit(event, data)
  }

  /**
   * Broadcast to specific user
   */
  broadcastToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId)
    if (socketId) {
      this.io.to(socketId).emit(event, data)
    }
  }

  /**
   * Broadcast to user's contacts
   */
  async broadcastToContacts(userId: string, event: string, data: any) {
    const contacts = await prisma.contact.findMany({
      where: { toId: userId },
      select: { fromId: true },
    })

    for (const contact of contacts) {
      this.broadcastToUser(contact.fromId, event, data)
    }
  }

  /**
   * Get all connected users (for debugging)
   */
  getConnectedUsers(): Map<string, string> {
    return new Map(this.userSockets)
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId)
  }
}

export default SocketService
