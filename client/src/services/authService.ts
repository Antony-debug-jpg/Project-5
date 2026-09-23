import axios from 'axios'

const API_URL = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:5000/api'

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await client.post('/auth/login', { email, password })
    return data.data
  },

  register: async (email: string, password: string, displayName: string) => {
    const { data } = await client.post('/auth/register', {
      email,
      password,
      displayName,
    })
    return data.data
  },

  logout: async () => {
    await client.post('/auth/logout')
  },

  getCurrentUser: async () => {
    const { data } = await client.get('/auth/me')
    return data.data
  },
}

export const userService = {
  getProfile: async () => {
    const { data } = await client.get('/users/profile')
    return data.data
  },

  updateProfile: async (updateData: { displayName?: string; aboutText?: string; profilePicture?: string }) => {
    const { data } = await client.put('/users/profile', updateData)
    return data.data
  },

  updatePassword: async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    const { data } = await client.post('/users/password', {
      oldPassword,
      newPassword,
      confirmPassword,
    })
    return data.data
  },

  getUserById: async (userId: string) => {
    const { data } = await client.get(`/users/${userId}`)
    return data.data
  },
}

export const contactService = {
  getContacts: async () => {
    const { data } = await client.get('/contacts')
    return data
  },

  addContact: async (email: string) => {
    const { data } = await client.post('/contacts', { email })
    return data
  },

  updateContact: async (contactId: string, updateData: { nickname?: string; isFavorite?: boolean }) => {
    const { data } = await client.put(`/contacts/${contactId}`, updateData)
    return data
  },

  removeContact: async (contactId: string) => {
    const { data } = await client.delete(`/contacts/${contactId}`)
    return data
  },

  searchUsers: async (query: string) => {
    const { data } = await client.get('/contacts/search', { params: { query } })
    return data
  },

  blockUser: async (userId: string) => {
    const { data } = await client.post(`/contacts/block/${userId}`)
    return data
  },

  unblockUser: async (userId: string) => {
    const { data } = await client.post(`/contacts/unblock/${userId}`)
    return data
  },
}

export const conversationService = {
  getConversations: async (limit: number = 50) => {
    const { data } = await client.get('/conversations', { params: { limit } })
    return data
  },

  createConversation: async (participantId: string) => {
    const { data } = await client.post('/conversations', { participantId })
    return data
  },

  getConversation: async (conversationId: string) => {
    const { data } = await client.get(`/conversations/${conversationId}`)
    return data
  },

  getMessages: async (conversationId: string, limit: number = 50, offset: number = 0) => {
    const { data } = await client.get(`/conversations/${conversationId}/messages`, {
      params: { limit, offset },
    })
    return data
  },

  sendMessage: async (conversationId: string, content: string) => {
    const { data } = await client.post(`/conversations/${conversationId}/messages`, {
      content,
    })
    return data
  },

  markAsRead: async (conversationId: string) => {
    const { data } = await client.put(`/conversations/${conversationId}/read`)
    return data
  },
}

export default client
