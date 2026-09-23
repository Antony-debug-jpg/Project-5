import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.message.deleteMany()
  await prisma.conversationMember.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user1 = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      password: hashedPassword,
      displayName: 'Demo User',
      aboutText: 'Welcome to ChatFlow!',
      isActive: true,
      lastSeenAt: new Date(),
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: hashedPassword,
      displayName: 'Alice Johnson',
      aboutText: 'Available for chat',
      isActive: true,
      lastSeenAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: hashedPassword,
      displayName: 'Bob Smith',
      aboutText: 'Working on something cool',
      isActive: false,
      lastSeenAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  })

  const user4 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      password: hashedPassword,
      displayName: 'Charlie Brown',
      aboutText: 'Love coding and coffee ☕',
      isActive: true,
      lastSeenAt: new Date(),
    },
  })

  console.log('👥 Created 4 demo users')

  // Create contacts
  await prisma.contact.create({
    data: {
      fromId: user1.id,
      toId: user2.id,
      nickname: 'Alice',
      isFavorite: true,
    },
  })

  await prisma.contact.create({
    data: {
      fromId: user1.id,
      toId: user3.id,
      nickname: 'Bob',
      isFavorite: false,
    },
  })

  await prisma.contact.create({
    data: {
      fromId: user1.id,
      toId: user4.id,
      nickname: 'Charlie',
      isFavorite: true,
    },
  })

  console.log('📇 Created 3 contacts')

  // Create 1-to-1 conversations
  const conv1 = await prisma.conversation.create({
    data: {
      isGroup: false,
    },
  })

  const conv2 = await prisma.conversation.create({
    data: {
      isGroup: false,
    },
  })

  const conv3 = await prisma.conversation.create({
    data: {
      isGroup: false,
    },
  })

  console.log('💬 Created 3 conversations')

  // Add conversation members
  await prisma.conversationMember.createMany({
    data: [
      { conversationId: conv1.id, userId: user1.id, role: 'member' },
      { conversationId: conv1.id, userId: user2.id, role: 'member' },
      { conversationId: conv2.id, userId: user1.id, role: 'member' },
      { conversationId: conv2.id, userId: user3.id, role: 'member' },
      { conversationId: conv3.id, userId: user1.id, role: 'member' },
      { conversationId: conv3.id, userId: user4.id, role: 'member' },
    ],
  })

  console.log('✅ Added conversation members')

  // Create some demo messages
  const now = new Date()
  const messages = [
    {
      conversationId: conv1.id,
      senderId: user2.id,
      content: 'Hey! How are you doing?',
      createdAt: new Date(now.getTime() - 3600000),
    },
    {
      conversationId: conv1.id,
      senderId: user1.id,
      content: 'Great! Just been working on ChatFlow. Really enjoying it.',
      createdAt: new Date(now.getTime() - 3540000),
    },
    {
      conversationId: conv1.id,
      senderId: user2.id,
      content: 'That sounds awesome! Can\'t wait to see it',
      createdAt: new Date(now.getTime() - 3480000),
    },
    {
      conversationId: conv2.id,
      senderId: user1.id,
      content: 'Hi Bob! When will you be available?',
      createdAt: new Date(now.getTime() - 7200000),
    },
    {
      conversationId: conv3.id,
      senderId: user4.id,
      content: 'Hey! Just finished that feature we discussed',
      createdAt: new Date(now.getTime() - 1800000),
    },
    {
      conversationId: conv3.id,
      senderId: user1.id,
      content: 'Amazing! Let\'s review it in the meeting tomorrow',
      createdAt: new Date(now.getTime() - 1500000),
    },
  ]

  await prisma.message.createMany({
    data: messages,
  })

  console.log('📨 Created 6 demo messages')

  console.log('✨ Database seed completed successfully!')
  console.log('')
  console.log('Demo credentials:')
  console.log('  Email: demo@example.com')
  console.log('  Password: password123')
  console.log('')
  console.log('Other test accounts:')
  console.log('  alice@example.com / password123')
  console.log('  bob@example.com / password123')
  console.log('  charlie@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
