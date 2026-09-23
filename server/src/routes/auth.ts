import { Router, Request, Response } from 'express'
import { validateRegister, validateLogin } from '../validators/authValidator'
import { userService } from '../services/userService'
import { authenticate } from '../middleware/authenticate'

const router = Router()

// Register route
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { error, value } = validateRegister(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const result = await userService.register(value)
    res.status(201).json({ data: result })
  } catch (err: any) {
    if (err.message === 'User already exists') {
      return res.status(409).json({ error: err.message })
    }
    res.status(500).json({ error: err.message })
  }
})

// Login route
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { error, value } = validateLogin(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const result = await userService.login(value)
    res.json({ data: result })
  } catch (err: any) {
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ error: err.message })
    }
    res.status(500).json({ error: err.message })
  }
})

// Logout route (invalidate on client side)
router.post('/logout', authenticate, (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' })
})

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const user = await userService.getUserById(userId)
    res.json({ data: user })
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

export default router
