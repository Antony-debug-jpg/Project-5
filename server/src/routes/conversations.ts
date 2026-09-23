import express, { Request, Response } from 'express'
import { authenticate } from '../middleware/authenticate'
import conversationService from '../services/conversationService'
import {
  validateSendMessage,
  validateMarkAsRead,
} from '../validators/contactValidator'

const router = express.Router()

// Middleware to validate request body
const validateRequest = (schema: any) => (req: Request, res: Response, next: any) => {
  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

/**
 * GET /api/conversations
 * Get all conversations for authenticated user
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50
    const conversations = await conversationService.getConversations(userId, limit)
    res.json(conversations)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/conversations
 * Create a new 1-to-1 conversation or get existing
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { participantId } = req.body

    if (!participantId) {
      return res.status(400).json({ error: 'participantId is required' })
    }

    const conversation = await conversationService.createConversation(
      userId,
      participantId
    )
    res.status(201).json(conversation)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * GET /api/conversations/:id
 * Get a specific conversation
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params
    const conversation = await conversationService.getConversation(id, userId)
    res.json(conversation)
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message })
    }
    if (error.message.includes('not a member')) {
      return res.status(403).json({ error: error.message })
    }
    res.status(400).json({ error: error.message })
  }
})

/**
 * GET /api/conversations/:id/messages
 * Get messages from a conversation (paginated)
 */
router.get('/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0

    const messages = await conversationService.getMessages(id, userId, limit, offset)
    res.json(messages)
  } catch (error: any) {
    if (error.message.includes('not a member')) {
      return res.status(403).json({ error: error.message })
    }
    res.status(400).json({ error: error.message })
  }
})

/**
 * POST /api/conversations/:id/messages
 * Send a message to a conversation
 */
router.post(
  '/:id/messages',
  authenticate,
  validateRequest(validateSendMessage),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id
      const { id } = req.params
      const { content } = req.body

      const message = await conversationService.sendMessage(id, userId, content)
      res.status(201).json(message)
    } catch (error: any) {
      if (error.message.includes('not a member')) {
        return res.status(403).json({ error: error.message })
      }
      res.status(400).json({ error: error.message })
    }
  }
)

/**
 * PUT /api/conversations/:id/read
 * Mark all messages as read
 */
router.put('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    await conversationService.markAsRead(id, userId)
    res.json({ message: 'Marked as read successfully' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router
