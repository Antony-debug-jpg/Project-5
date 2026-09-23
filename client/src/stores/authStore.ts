import { create } from 'zustand'
import socketService from '../services/socketService'

interface User {
  id: string
  email: string
  displayName: string
  profilePicture?: string
  aboutText?: string
}

interface AuthStore {
  token: string | null
  user: User | null
  setToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('authToken'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null,
  setToken: (token) => {
    localStorage.setItem('authToken', token)
    set({ token })
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
  logout: () => {
    socketService.disconnect()
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },
}))
