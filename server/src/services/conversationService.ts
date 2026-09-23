import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ConversationService {
  /**
   * Get all conversations for a user with last message and unread count
   */
  async getConversations(userId: string, limit: number = 50) {
    const conversations = await prisma.conversation.findMany({
      where: {
        conversationMembers: {
          some: {
            userId: userId,
            leftAt: null,
          },
        },
      },
      include: {
        conversationMembers: {
          where: {
            userId: userId,
          },
          select: {
            unreadCount: true,
            lastReadAt: true,
          },
        },
        members: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            sender: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    })

    // For 1-to-1 conversations, fetch the other participant
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv: any) => {
        let displayName = conv.name || 'Unknown'
        let participantId = null

        if (!conv.isGroup) {
          // Get the other participant
          const otherMember = await prisma.conversationMember.findFirst({
            where: {
              conversationId: conv.id,
              userId: { not: userId },
            },
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  profilePicture: true,
                  isActive: true,
                },
              },
            },
          })

          if (otherMember) {
            displayName = otherMember.user.displayName
            participantId = otherMember.user.id
          }
        }

        return {
          id: conv.id,
          displayName,
          participantId,
          isGroup: conv.isGroup,
          picture: conv.picture,
          unreadCount: conv.conversationMembers[0]?.unreadCount || 0,
          lastMessage: conv.members[0] ? {
            id: conv.members[0].id,
            content: conv.members[0].content,
            senderName: conv.members[0].sender.displayName,
            createdAt: conv.members[0].createdAt,
          } : null,
          updatedAt: conv.updatedAt,
        }
      })
    )

    return enrichedConversations
  }

  /**
   * Get a single conversation by ID
   */
  async getConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        conversationMembers: {
          select: {
            user: {
              select: {
                id: true,
                displayName: true,
                profilePicture: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      throw new Error('Conversation not found')
    }

    // Check if user is a member
    const isMember = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        },
      },
    })

    if (!isMember) {
      throw new Error('You are not a member of this conversation')
    }

    let displayName = conversation.name || 'Unknown'
    if (!conversation.isGroup && conversation.conversationMembers.length > 0) {
      const otherParticipant = conversation.conversationMembers.find(
        (m: any) => m.user.id !== userId
      )
      if (otherParticipant) {
        displayName = otherParticipant.user.displayName
      }
    }

    return {
      id: conversation.id,
      displayName,
      isGroup: conversation.isGroup,
      picture: conversation.picture,
      members: conversation.conversationMembers.map((m: any) => ({
        id: m.user.id,
        displayName: m.user.displayName,
        profilePicture: m.user.profilePicture,
        isActive: m.user.isActive,
      })),
    }
  }

  /**
   * Create or get existing 1-to-1 conversation
   */
  async createConversation(user1Id: string, user2Id: string) {
    if (user1Id === user2Id) {
      throw new Error('Cannot create conversation with yourself')
    }

    const blocked = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: user1Id, blockedId: user2Id },
          { blockerId: user2Id, blockedId: user1Id },
        ],
      },
    })
    if (blocked) {
      throw new Error('Cannot start a conversation with a blocked user')
    }

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        conversationMembers: {
          every: {
            userId: { in: [user1Id, user2Id] },
          },
        },
      },
    })

    if (existing) {
      return await this.getConversation(existing.id, user1Id)
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        conversationMembers: {
          create: [
            { userId: user1Id },
            { userId: user2Id },
          ],
        },
      },
    })

    return await this.getConversation(conversation.id, user1Id)
  }

  /**
   * Get messages for a conversation (paginated)
   */
  async getMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    // Check user is a member
    const isMember = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        },
      },
    })

    if (!isMember) {
      throw new Error('You are not a member of this conversation')
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            profilePicture: true,
          },
        },
        readReceipts: {
          select: {
            userId: true,
            readAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    })

    return messages.reverse().map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      createdAt: msg.createdAt,
      readBy: msg.readReceipts.map((r: any) => r.userId),
    }))
  }

  /**
   * Send a message to a conversation
   */
  async sendMessage(conversationId: string, userId: string, content: string) {
    // Check user is a member
    const isMember = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        },
      },
    })

    if (!isMember) {
      throw new Error('You are not a member of this conversation')
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Message cannot be empty')
    }

    // Create message
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
        readReceipts: {
          select: {
            userId: true,
            readAt: true,
          },
        },
      },
    })

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    // Reset unread counts for other members (they have new unread message)
    await prisma.conversationMember.updateMany({
      where: {
        conversationId,
        userId: { not: userId },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    })

    return {
      id: message.id,
      content: message.content,
      sender: message.sender,
      createdAt: message.createdAt,
      readBy: message.readReceipts.map((r: any) => r.userId),
    }
  }

  /**
   * Mark all messages as read
   */
  async markAsRead(conversationId: string, userId: string) {
    // Get all unread messages
    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readReceipts: {
          none: { userId },
        },
      },
      select: { id: true },
    })

    // Create read receipts
    if (unreadMessages.length > 0) {
      await prisma.messageReadReceipt.createMany({
        data: unreadMessages.map((msg: { id: string }) => ({
          messageId: msg.id,
          userId,
          readAt: new Date(),
        })),
        skipDuplicates: true,
      })
    }

    // Update conversation member unread count
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
  }
}

export default new ConversationService()
