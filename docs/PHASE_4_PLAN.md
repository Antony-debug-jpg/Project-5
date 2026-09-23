# Phase 4: Real-time Features Implementation Plan

## Phase 4 Overview
Implement real-time messaging using Socket.IO with:
- Live message updates (no refresh needed)
- Typing indicators
- Online/offline status
- User presence tracking
- Real-time conversation updates
- Delivery receipts

## Backend Implementation

### 1. Socket.IO Event Handlers (`server/src/socket/handlers.ts`)

**Connection Events:**
- `connection` - User connects to WebSocket
- `disconnect` - User disconnects
- `set_user_id` - Client sends user ID after connecting

**Messaging Events:**
- `send_message` - Receive message from client
- `message_sent` - Broadcast to all conversation members
- `message_read` - User reads message
- `messages_read` - Broadcast read receipts

**Typing Events:**
- `typing_start` - User starts typing
- `typing` - Broadcast typing indicator
- `typing_stop` - User stops typing

**Presence Events:**
- `online` - User comes online
- `offline` - User goes offline
- `user_status` - Broadcast status to contacts

**Conversation Events:**
- `join_conversation` - User joins conversation room
- `leave_conversation` - User leaves conversation room

### 2. Socket Service (`server/src/services/socketService.ts`)

**Namespace Management:**
- Map user IDs to socket IDs
- Track active conversations per user
- Manage typing status per conversation

**Methods:**
- `addUser(userId, socketId)` - Register user connection
- `removeUser(userId)` - Unregister user
- `getUserSocket(userId)` - Get socket for user
- `getConversationSockets(conversationId)` - Get all sockets in conversation
- `setTypingStatus(conversationId, userId, isTyping)` - Track typing
- `getTypingUsers(conversationId)` - Get who's typing

### 3. Socket Middleware (`server/src/socket/middleware.ts`)

- JWT authentication via socket handshake
- User validation
- Conversation membership verification

## Frontend Implementation

### 1. Socket Service (`client/src/services/socketService.ts`)

**Connection:**
- Connect to server on app load
- Emit user_id after connection
- Handle reconnection

**Message Events:**
- Emit: `send_message`
- Listen: `message_sent`, `message_read`

**Typing Events:**
- Emit: `typing_start`, `typing_stop`
- Listen: `typing`

**Presence Events:**
- Emit: `online`, `offline`
- Listen: `user_status`

**Conversation Events:**
- Emit: `join_conversation`, `leave_conversation`

### 2. Socket Store Hook (`client/src/hooks/useSocket.ts`)

- Connect/disconnect management
- Event listener registration
- Error handling
- Reconnection logic

### 3. Component Updates

**ChatPage.tsx:**
- Join conversation on select
- Listen for real-time messages
- Display typing indicators
- Show online status

**ConversationList.tsx:**
- Update unread counts in real-time
- Show online status of contacts
- Display typing status

**MessageBubble.tsx:**
- Show delivery status (sent → delivered → read)

**MessageInput.tsx:**
- Send typing events
- Emit message_sent event

### 4. Store Updates

**conversationStore.ts:**
- Add typing users tracking
- Add online status tracking
- Add delivery status for messages
- Update methods for real-time changes

## Database Changes

**No new tables needed** - use existing schema:
- ConversationMember tracks membership
- Message has timestamps (sent vs delivered vs read)
- User.lastSeenAt already tracks presence

## Communication Flow

### Message Flow (Real-time)
1. User types message and hits Send
2. Frontend emits `send_message` with content
3. Backend broadcasts `message_sent` to all in conversation
4. All clients receive message instantly
5. No database refresh needed
6. When other users view, emits `message_read`
7. Backend broadcasts `messages_read`

### Typing Flow
1. User starts typing
2. Frontend emits `typing_start` after 200ms delay
3. Backend broadcasts `typing` with user info
4. Other clients see "User is typing..."
5. After 3 seconds inactivity, emit `typing_stop`
6. Backend broadcasts `typing` (empty list)

### Presence Flow
1. User connects
2. Frontend emits `online` with user ID
3. Backend updates lastSeenAt and broadcasts status
4. User's contacts see "Online" indicator
5. User goes offline
6. Frontend emits `offline`
7. Other clients see "Last seen 5m ago"

## Socket.IO Rooms

- Each conversation is a room: `conversation_${conversationId}`
- Users join on conversation select
- Users leave on unmount or switch conversation
- Broadcasting to room broadcasts to all members

## Implementation Order

1. **Backend Socket Infrastructure**
   - Socket middleware (auth)
   - Socket service (user/conversation tracking)
   - Event handlers (all events)

2. **Backend Integration**
   - Add to index.ts
   - Socket.IO configuration
   - Namespace setup

3. **Frontend Socket Service**
   - Create socketService.ts
   - Connection logic
   - Event emitters and listeners

4. **Frontend Hook**
   - useSocket custom hook
   - Connection management
   - Event registration

5. **Store Updates**
   - Add typing tracking
   - Add online status
   - Add delivery status

6. **Component Updates**
   - ChatPage: join/leave conversation
   - ConversationList: display typing, online
   - MessageBubble: delivery status
   - MessageInput: typing events

7. **Testing**
   - Multi-tab test
   - Typing indicators
   - Online status
   - Real-time message delivery
   - Reconnection handling

## Performance Considerations

- Debounce typing events (200ms delay before emit)
- Rate limit presence updates (5 second minimum)
- Clean up listeners on component unmount
- Graceful degradation if WebSocket fails
- Message fallback to polling (Phase 3 level)

## Error Handling

- Socket connection errors
- Authentication failures
- Conversation membership validation
- Message validation
- Graceful reconnection

## Security

- JWT authentication on socket handshake
- Verify user in conversation before broadcasting
- Sanitize message content
- Rate limiting on events
- Prevent impersonation attempts

## Status

- Phase 1: ✅ Complete
- Phase 2: ✅ Complete
- Phase 3: ✅ Complete
- Phase 4: 🚀 Starting

---

This document will be updated as Phase 4 progresses.
