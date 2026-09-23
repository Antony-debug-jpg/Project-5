import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import morgan from 'morgan'
import { config } from 'dotenv'

// Load environment variables
config()

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { authenticate } from './middleware/authenticate'
import { rateLimiter } from './middleware/rateLimiter'
import { socketAuthMiddleware } from './socket/middleware'
import { registerSocketHandlers } from './socket/handlers'
import SocketService from './socket/service'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import contactRoutes from './routes/contacts'
import conversationRoutes from './routes/conversations'

// Initialize app
const app: Express = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
app.use(rateLimiter)

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/conversations', conversationRoutes)

// Protected routes example
app.get('/api/me', authenticate, (req: Request, res: Response) => {
  res.json({
    message: 'Protected route',
    user: (req as any).user,
  })
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  })
})

// Error handler
app.use(errorHandler)

// Socket.IO configuration
io.use(socketAuthMiddleware)
const socketService = new SocketService(io)
registerSocketHandlers(io, socketService)

console.log('✓ Socket.IO initialized with real-time features')

// Start server
const PORT = parseInt(process.env.SERVER_PORT || '5000', 10)
const HOST = process.env.SERVER_HOST || 'localhost'

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`)
  console.log(`📝 API: http://${HOST}:${PORT}/api`)
  console.log(`🔌 Socket.IO: ws://${HOST}:${PORT}`)
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`)
})

export { app, httpServer, io }
