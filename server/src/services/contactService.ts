import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ContactService {
  /**
   * Get all contacts for a user
   */
  async getContacts(userId: string) {
    const contacts = await prisma.contact.findMany({
      where: { fromId: userId },
      include: {
        to: {
          select: {
            id: true,
            email: true,
            displayName: true,
            profilePicture: true,
            aboutText: true,
            isActive: true,
            lastSeenAt: true,
          },
        },
      },
      orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
    })

    return contacts.map((contact: any) => ({
      id: contact.id,
      userId: contact.toId,
      nickname: contact.nickname || contact.to.displayName,
      isFavorite: contact.isFavorite,
      user: contact.to,
      createdAt: contact.createdAt,
    }))
  }

  /**
   * Add a new contact by searching for user email
   */
  async addContact(userId: string, contactEmail: string) {
    // Find user by email
    const contactUser = await prisma.user.findUnique({
      where: { email: contactEmail },
    })

    if (!contactUser) {
      throw new Error('User not found')
    }

    if (contactUser.id === userId) {
      throw new Error('Cannot add yourself as a contact')
    }

    // Check if already a contact
    const existing = await prisma.contact.findUnique({
      where: {
        fromId_toId: {
          fromId: userId,
          toId: contactUser.id,
        },
      },
    })

    if (existing) {
      throw new Error('User is already a contact')
    }

    // Create contact
    const contact = await prisma.contact.create({
      data: {
        fromId: userId,
        toId: contactUser.id,
        nickname: contactUser.displayName,
      },
      include: {
        to: {
          select: {
            id: true,
            email: true,
            displayName: true,
            profilePicture: true,
            aboutText: true,
            isActive: true,
            lastSeenAt: true,
          },
        },
      },
    })

    return {
      id: contact.id,
      userId: contact.toId,
      nickname: contact.nickname || contact.to.displayName,
      isFavorite: contact.isFavorite,
      user: contact.to,
      createdAt: contact.createdAt,
    }
  }

  /**
   * Update contact (nickname, favorite status)
   */
  async updateContact(
    userId: string,
    contactId: string,
    data: { nickname?: string; isFavorite?: boolean }
  ) {
    const existing = await prisma.contact.findFirst({
      where: { id: contactId, fromId: userId },
    })
    if (!existing) {
      throw new Error('Contact not found')
    }

    const updated = await prisma.contact.update({
      where: { id: existing.id },
      data,
      include: {
        to: {
          select: {
            id: true,
            email: true,
            displayName: true,
            profilePicture: true,
            aboutText: true,
            isActive: true,
            lastSeenAt: true,
          },
        },
      },
    })

    return {
      id: updated.id,
      userId: updated.toId,
      nickname: updated.nickname || updated.to.displayName,
      isFavorite: updated.isFavorite,
      user: updated.to,
      createdAt: updated.createdAt,
    }
  }

  /**
   * Remove a contact
   */
  async removeContact(userId: string, contactId: string) {
    const result = await prisma.contact.deleteMany({
      where: { id: contactId, fromId: userId },
    })
    if (result.count === 0) throw new Error('Contact not found')
  }

  /**
   * Search for users to add as contacts
   */
  async searchUsers(userId: string, query: string) {
    if (query.length < 2) {
      throw new Error('Search query must be at least 2 characters')
    }

    // Get list of users this person already contacts
    const existingContacts = await prisma.contact.findMany({
      where: { fromId: userId },
      select: { toId: true },
    })

    const existingContactIds = existingContacts.map((c: { toId: string }) => c.toId)

    // Search users by email or displayName
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
            ],
          },
          { id: { not: userId } }, // Don't include self
          { id: { notIn: existingContactIds } }, // Don't include existing contacts
        ],
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        profilePicture: true,
        aboutText: true,
        isActive: true,
        lastSeenAt: true,
      },
      take: 10,
    })

    return users
  }

  /**
   * Check if user is blocked by another user
   */
  async isBlocked(userId: string, targetId: string) {
    const blocked = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: targetId,
          blockedId: userId,
        },
      },
    })

    return !!blocked
  }

  /**
   * Block a user
   */
  async blockUser(userId: string, targetId: string) {
    if (userId === targetId) {
      throw new Error('Cannot block yourself')
    }

    const existing = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId: targetId,
        },
      },
    })

    if (existing) {
      throw new Error('User is already blocked')
    }

    await prisma.blockedUser.create({
      data: {
        blockerId: userId,
        blockedId: targetId,
      },
    })
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string, targetId: string) {
    await prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId: targetId,
        },
      },
    })
  }
}

export default new ContactService()
