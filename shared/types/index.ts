// Shared types for frontend and backend

export interface User {
  id: string
  email: string
  displayName: string
  profilePicture?: string
  aboutText?: string
  isActive: boolean
  lastSeenAt?: string
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'system'
  editedAt?: string
  deletedAt?: string
  replyToId?: string
  createdAt: string
}

export interface Conversation {
  id: string
  name?: string
  isGroup: boolean
  picture?: string
  description?: string
  createdAt: string
}
