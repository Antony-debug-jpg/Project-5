import { Socket, Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import SocketService from './service'
import { verifyConversationMembership, verifyUser } from './middleware'

const prisma = new PrismaClient()

export function registerSocketHandlers(io: Server, socketService: SocketService) {
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId

    console.log(`✓ User ${userId} connected`)

    /**
     * EVENT: set_user_id
     * Client sends user ID after connecting
     */
    socket.on('set_user_id', async () => {
      socketService.addUser(userId, socket.id)

      // Update user as online
      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: true,
          lastSeenAt: new Date(),
        },
      })

      // Get user info
      const user = await verifyUser(userId)
      if (user) {
        // Broadcast to contacts that user is online
        await socketService.broadcastToContacts(userId, 'user_online', {
          userId,
          displayName: user.displayName,
          lastSeenAt: new Date(),
        })
      }
    })

    /**
     * EVENT: join_conversation
     * User joins a conversation room
     */
    socket.on('join_conversation', async (data: { conversationId: string }) => {
      const { conversationId } = data

      // Verify user is member
      const isMember = await verifyConversationMembership(userId, conversationId)
      if (!isMember) {
        socket.emit('error', { message: 'You are not a member of this conversation' })
        return
      }

      // Join room
      socket.join(`conversation_${conversationId}`)
      socketService.joinConversation(userId, conversationId)

      console.log(`✓ User ${userId} joined conversation ${conversationId}`)

      // Mark as read
      await prisma.conversationMember.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        data: {
          unreadCount: 0,
          lastReadAt: new Date(),
        },
      })

      // Notify others that user is viewing
      socketService.broadcastToConversation(conversationId, 'user_viewing', {
        userId,
        isViewing: true,
      })
    })

    /**
     * EVENT: leave_conversation
     * User leaves a conversation room
     */
    socket.on('leave_conversation', (data: { conversationId: string }) => {
      const { conversationId } = data

      socket.leave(`conversation_${conversationId}`)
      socketService.leaveConversation(userId, conversationId)

      console.log(`✓ User ${userId} left conversation ${conversationId}`)

      // Notify others
      socketService.broadcastToConversation(conversationId, 'user_viewing', {
        userId,
        isViewing: false,
      })

      // Clear typing status
      socketService.setTyping(conversationId, userId, false)
      socketService.broadcastToConversation(conversationId, 'typing', {
        users: socketService.getTypingUsers(conversationId),
      })
    })

    /**
     * EVENT: send_message
     * User sends a message
     */
    socket.on('send_message', async (data: { conversationId: string; content: string }) => {
      const { conversationId, content } = data

      try {
        // Verify membership
        const isMember = await verifyConversationMembership(userId, conversationId)
        if (!isMember) {
          socket.emit('error', { message: 'You are not a member of this conversation' })
          return
        }

        const blockedMember = await prisma.blockedUser.findFirst({
          where: {
            OR: [
              { blockerId: userId, blockedId: { not: userId } },
              { blockerId: { not: userId }, blockedId: userId },
            ],
            blocked: {
              conversations: {
                some: { conversationId },
              },
            },
          },
        })
        if (blockedMember) {
          socket.emit('error', { message: 'You cannot send messages in this conversation' })
          return
        }

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' })
          return
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            content: content.trim(),
          },
          include: {
            sender: {
              select: {
                id: true,
                displayName: true,
                profilePicture: true,
              },
            },
          },
        })

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        })

        // Increment unread for others
        await prisma.conversationMember.updateMany({
          where: {
            conversationId,
            userId: { not: userId },
          },
          data: {
            unreadCount: { increment: 1 },
          },
        })

        // Broadcast message to conversation
        socketService.broadcastToConversation(conversationId, 'message_sent', {
          id: message.id,
          conversationId,
          content: message.content,
          sender: message.sender,
          createdAt: message.createdAt,
          readBy: [],
        })

        // Broadcast conversation update to all members (for real-time conversation list updates)
        const updatedConversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: {
            conversationMembers: {
              select: { userId: true },
            },
          },
        })

        if (updatedConversation) {
          // Get conversation details with last message
          const conversationWithMessage = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
              members: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: {
                  sender: {
                    select: { displayName: true },
                  },
                },
              },
            },
          })

          // Broadcast to all members
          updatedConversation.conversationMembers.forEach((member: any) => {
            socketService.broadcastToUser(member.userId, 'conversation_updated', {
              id: conversationWithMessage?.id,
              displayName: conversationWithMessage?.name,
              isGroup: conversationWithMessage?.isGroup,
              updatedAt: conversationWithMessage?.updatedAt,
              lastMessage: conversationWithMessage?.members[0]
                ? {
                    id: conversationWithMessage.members[0].id,
                    content: conversationWithMessage.members[0].content,
                    senderName: conversationWithMessage.members[0].sender?.displayName,
                    createdAt: conversationWithMessage.members[0].createdAt,
                  }
                : null,
            })
          })
        }

        // Stop typing
        socketService.setTyping(conversationId, userId, false)
        socketService.broadcastToConversation(conversationId, 'typing', {
          users: socketService.getTypingUsers(conversationId),
        })

        console.log(`✓ Message ${message.id} sent in conversation ${conversationId}`)
      } catch (error: any) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    /**
     * EVENT: message_read
     * User reads a message
     */
    socket.on('message_read', async (data: { messageId: string; conversationId: string }) => {
      const { messageId, conversationId } = data

      try {
        const isMember = await verifyConversationMembership(userId, conversationId)
        if (!isMember) {
          socket.emit('error', { message: 'You are not a member of this conversation' })
          return
        }

        const message = await prisma.message.findFirst({
          where: { id: messageId, conversationId },
          select: { id: true },
        })
        if (!message) {
          socket.emit('error', { message: 'Message not found' })
          return
        }

        // Create read receipt
        await prisma.messageReadReceipt.upsert({
          where: {
            messageId_userId: {
              messageId,
              userId,
            },
          },
          create: {
            messageId,
            userId,
            readAt: new Date(),
          },
          update: {
            readAt: new Date(),
          },
        })

        // Broadcast to conversation
        socketService.broadcastToConversation(conversationId, 'message_read', {
          messageId,
          userId,
          readAt: new Date(),
        })
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    })

    /**
     * EVENT: typing_start
     * User starts typing
     */
    socket.on('typing_start', (data: { conversationId: string }) => {
      const { conversationId } = data

      socketService.setTyping(conversationId, userId, true)

      // Broadcast to conversation
      socketService.broadcastToConversation(conversationId, 'typing', {
        users: socketService.getTypingUsers(conversationId),
      })
    })

    /**
     * EVENT: typing_stop
     * User stops typing
     */
    socket.on('typing_stop', (data: { conversationId: string }) => {
      const { conversationId } = data

      socketService.setTyping(conversationId, userId, false)

      // Broadcast to conversation
      socketService.broadcastToConversation(conversationId, 'typing', {
        users: socketService.getTypingUsers(conversationId),
      })
    })

    /**
     * EVENT: disconnect
     * User disconnects
     */
    socket.on('disconnect', async () => {
      console.log(`✗ User ${userId} disconnected`)

      const removed = socketService.removeUser(userId, socket.id)

      if (!removed) {
        return
      }

      // Update user as offline
      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          lastSeenAt: new Date(),
        },
      })

      // Broadcast to contacts that user is offline
      const user = await verifyUser(userId)
      if (user) {
        await socketService.broadcastToContacts(userId, 'user_offline', {
          userId,
          displayName: user.displayName,
          lastSeenAt: new Date(),
        })
      }
    })

    /**
     * EVENT: error handler
     */
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  })
}
