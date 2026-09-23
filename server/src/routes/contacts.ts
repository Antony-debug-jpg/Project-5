import express, { Request, Response } from 'express'
import { authenticate } from '../middleware/authenticate'
import contactService from '../services/contactService'
import {
  validateAddContact,
  validateUpdateContact,
  validateSearchUsers,
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

const validateQuery = (schema: any) => (req: Request, res: Response, next: any) => {
  const { error } = schema.validate(req.query)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

/**
 * GET /api/contacts
 * Get all contacts for authenticated user
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const contacts = await contactService.getContacts(userId)
    res.json(contacts)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/contacts
 * Add a new contact by email
 */
router.post(
  '/',
  authenticate,
  validateRequest(validateAddContact),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id
      const { email } = req.body
      const contact = await contactService.addContact(userId, email)
      res.status(201).json(contact)
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message })
      }
      if (error.message.includes('already')) {
        return res.status(409).json({ error: error.message })
      }
      res.status(400).json({ error: error.message })
    }
  }
)

/**
 * PUT /api/contacts/:id
 * Update contact (nickname, favorite status)
 */
router.put(
  '/:id',
  authenticate,
  validateRequest(validateUpdateContact),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req as any).user.id
      const { nickname, isFavorite } = req.body
      const contact = await contactService.updateContact(userId, id, {
        ...(nickname !== undefined && { nickname }),
        ...(isFavorite !== undefined && { isFavorite }),
      })
      res.json(contact)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
)

/**
 * DELETE /api/contacts/:id
 * Remove a contact
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    await contactService.removeContact(userId, id)
    res.json({ message: 'Contact removed successfully' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * GET /api/contacts/search
 * Search for users to add as contacts
 */
router.get(
  '/search',
  authenticate,
  validateQuery(validateSearchUsers),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id
      const { query } = req.query as { query: string }
      const users = await contactService.searchUsers(userId, query)
      res.json(users)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
)

/**
 * POST /api/contacts/block/:userId
 * Block a user
 */
router.post('/block/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { userId: targetId } = req.params
    await contactService.blockUser(userId, targetId)
    res.json({ message: 'User blocked successfully' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * POST /api/contacts/unblock/:userId
 * Unblock a user
 */
router.post('/unblock/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { userId: targetId } = req.params
    await contactService.unblockUser(userId, targetId)
    res.json({ message: 'User unblocked successfully' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router
