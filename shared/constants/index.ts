// Shared constants

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  SYSTEM: 'system',
} as const

export const CALL_TYPES = {
  VOICE: 'voice',
  VIDEO: 'video',
} as const

export const CALL_STATUS = {
  COMPLETED: 'completed',
  MISSED: 'missed',
  REJECTED: 'rejected',
} as const

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // User presence
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  
  // Typing
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  
  // Messages
  SEND_MESSAGE: 'send_message',
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',
  MESSAGE_EDITED: 'message_edited',
  MESSAGE_DELETED: 'message_deleted',
  
  // Reactions
  REACTION_ADDED: 'reaction_added',
  REACTION_REMOVED: 'reaction_removed',
  
  // Calls
  CALL_STARTED: 'call_started',
  CALL_ACCEPTED: 'call_accepted',
  CALL_REJECTED: 'call_rejected',
  CALL_ENDED: 'call_ended',
} as const
