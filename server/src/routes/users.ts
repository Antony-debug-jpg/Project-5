import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/authenticate'
import { userService } from '../services/userService'
import { validateUpdateProfile, validateUpdatePassword } from '../validators/userValidator'

const router = Router()

// Get user profile
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const user = await userService.getUserById(userId)
    res.json({ data: user })
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

// Update user profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { error, value } = validateUpdateProfile(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const userId = (req as any).user.id
    const updatedUser = await userService.updateProfile(userId, value)
    res.json({ data: updatedUser })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Update password
router.post('/password', authenticate, async (req: Request, res: Response) => {
  try {
    const { error, value } = validateUpdatePassword(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const userId = (req as any).user.id
    const result = await userService.updatePassword(
      userId,
      value.oldPassword,
      value.newPassword
    )
    res.json({ data: result })
  } catch (err: any) {
    if (err.message === 'User not found') {
      return res.status(404).json({ error: err.message })
    }
    if (err.message === 'Current password is incorrect') {
      return res.status(401).json({ error: err.message })
    }
    res.status(500).json({ error: err.message })
  }
})

// Get user by ID (for contacts/search)
router.get('/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const user = await userService.getUserById(userId)
    res.json({ data: user })
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

export default router
