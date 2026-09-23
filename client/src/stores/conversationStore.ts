import { create } from 'zustand'

export interface Contact {
  id: string
  userId: string
  nickname: string
  isFavorite: boolean
  user: {
    id: string
    email: string
    displayName: string
    profilePicture?: string
    aboutText?: string
    isActive: boolean
    lastSeenAt?: string
  }
  createdAt: string
}

export interface Message {
  id: string
  content: string
  sender: {
    id: string
    displayName: string
    profilePicture?: string
  }
  createdAt: string
  readBy: string[]
}

export interface Conversation {
  id: string
  displayName: string
  participantId?: string
  isGroup: boolean
  picture?: string
  unreadCount: number
  lastMessage?: {
    id: string
    content: string
    senderName: string
    createdAt: string
  }
  updatedAt: string
}

interface ConversationStore {
  // Contacts
  contacts: Contact[]
  setContacts: (contacts: Contact[]) => void
  addContact: (contact: Contact) => void
  removeContact: (contactId: string) => void
  updateContact: (contactId: string, contact: Partial<Contact>) => void

  // Conversations
  conversations: Conversation[]
  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (conversationId: string, conversation: Partial<Conversation>) => void

  // Selected Conversation
  selectedConversationId: string | null
  setSelectedConversationId: (id: string | null) => void

  // Messages
  messages: { [conversationId: string]: Message[] }
  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void

  // Typing Status - Track users typing per conversation
  typingUsers: { [conversationId: string]: string[] }
  setTypingUsers: (conversationId: string, users: string[]) => void

  // Online Status - Track which contacts are online
  onlineUsers: Set<string>
  setUserOnline: (userId: string) => void
  setUserOffline: (userId: string) => void
  isUserOnline: (userId: string) => boolean

  // Clear store
  clearStore: () => void
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  // Contacts
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  addContact: (contact) =>
    set((state) => ({
      contacts: [contact, ...state.contacts],
    })),
  removeContact: (contactId) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== contactId),
    })),
  updateContact: (contactId, updates) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === contactId ? { ...c, ...updates } : c
      ),
    })),

  // Conversations
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [
        conversation,
        ...state.conversations.filter((item) => item.id !== conversation.id),
      ],
    })),
  updateConversation: (conversationId, updates) =>
    set((state) => ({
      conversations: state.conversations
        .map((c) => c.id === conversationId ? { ...c, ...updates } : c)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    })),

  // Selected Conversation
  selectedConversationId: null,
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),

  // Messages
  messages: {},
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),
  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),
  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),

  // Typing Status
  typingUsers: {},
  setTypingUsers: (conversationId, users) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: users,
      },
    })),

  // Online Status
  onlineUsers: new Set(),
  setUserOnline: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers)
      newSet.add(userId)
      return { onlineUsers: newSet }
    }),
  setUserOffline: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers)
      newSet.delete(userId)
      return { onlineUsers: newSet }
    }),
  isUserOnline: (userId) => {
    return get().onlineUsers.has(userId)
  },

  // Clear all data
  clearStore: () =>
    set({
      contacts: [],
      conversations: [],
      selectedConversationId: null,
      messages: {},
      typingUsers: {},
      onlineUsers: new Set(),
    }),
}))
