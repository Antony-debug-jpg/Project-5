import { Socket } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

/**
 * Authenticate socket connection via JWT token
 */
export const socketAuthMiddleware = (socket: Socket, next: any) => {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error('Authentication required'))
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    socket.data.userId = decoded.id
    socket.data.email = decoded.email
    next()
  } catch (error) {
    next(new Error('Invalid token'))
  }
}

/**
 * Verify user is member of conversation
 */
export const verifyConversationMembership = async (
  userId: string,
  conversationId: string
): Promise<boolean> => {
  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  })

  return !!membership
}

/**
 * Verify user exists
 */
export const verifyUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      profilePicture: true,
      isActive: true,
      lastSeenAt: true,
    },
  })

  return user
}
