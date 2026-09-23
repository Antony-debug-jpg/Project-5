# Phase 3: Contacts & Conversations Management

## Phase 3 Overview
Implement complete contacts management and conversation system, connecting one-to-one messaging infrastructure. Users can:
- Add/remove/favorite contacts
- Search for users to add as contacts
- View list of conversations
- Start new conversations with contacts
- See unread message counts
- Display last message preview in conversation list

## Implementation Plan

### Backend Tasks

#### 1. Contact Service (`server/src/services/contactService.ts`)
- `getContacts(userId)` - Get all contacts with user info
- `addContact(userId, contactEmail)` - Add new contact by email
- `updateContact(contactId, {nickname, isFavorite})` - Update contact
- `removeContact(contactId)` - Delete contact
- `searchUsers(userId, query)` - Search users by email/name
- `isBlocked(userId, targetId)` - Check if user is blocked
- `blockUser(userId, targetId)` - Block a user
- `unblockUser(userId, targetId)` - Unblock a user

#### 2. Conversation Service (`server/src/services/conversationService.ts`)
- `getConversations(userId)` - Get all conversations with last message
- `getConversation(conversationId, userId)` - Get single conversation
- `createConversation(user1Id, user2Id)` - Create 1-to-1 conversation
- `getMessages(conversationId, userId, limit, offset)` - Get paginated messages
- `sendMessage(conversationId, userId, content)` - Send message
- `markAsRead(conversationId, userId)` - Mark messages as read

#### 3. API Routes
- `POST /api/contacts` - Add contact
- `GET /api/contacts` - List contacts
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Remove contact
- `GET /api/contacts/search` - Search users
- `POST /api/conversations` - Create conversation
- `GET /api/conversations` - List conversations
- `GET /api/conversations/:id` - Get conversation
- `GET /api/conversations/:id/messages` - Get messages
- `POST /api/conversations/:id/messages` - Send message

#### 4. Validators
- `validateAddContact` - Email required, not self
- `validateUpdateContact` - Nickname, favorite optional
- `validateSendMessage` - Content required, not empty
- `validateSearchUsers` - Query min 2 characters

### Frontend Tasks

#### 1. Components
- `ContactsList` - Display all contacts, search, add button
- `AddContactDialog` - Search users and add as contact
- `ConversationList` - List all conversations with last message
- `ConversationDetail` - Show messages and message input
- `MessageBubble` - Individual message display
- `UnreadBadge` - Show unread count

#### 2. Pages
- Update `ChatPage.tsx` - Main chat interface with conversation list
- Create contact management UI in sidebar

#### 3. Services
- Extend `authService.ts` with contact/conversation methods

#### 4. State Management
- Extend `authStore` with:
  - `contacts` list
  - `conversations` list
  - `selectedConversationId`
  - Methods to update contacts/conversations

#### 5. Routing
- `/conversations/:id` - Open specific conversation

### Database (Already Complete in Schema)
- Contact model: stores contact relationships
- Conversation model: 1-to-1 and group conversations
- ConversationMember model: membership and read status
- Message model: individual messages
- BlockedUser model: blocked relationships

## Execution Order

1. **Backend Service Layer**
   - Create ContactService with full CRUD
   - Create ConversationService with messaging

2. **Backend API Routes**
   - Create contacts routes
   - Create conversations routes
   - Add validators

3. **Backend Integration**
   - Add routes to index.ts
   - Test with Postman/curl

4. **Frontend Services**
   - Add API methods for contacts
   - Add API methods for conversations

5. **Frontend State Management**
   - Extend authStore with contacts/conversations
   - Add action creators

6. **Frontend UI Components**
   - ContactsList component
   - AddContactDialog component
   - ConversationList component
   - MessageBubble component

7. **Frontend Pages**
   - Update ChatPage to integrate all components
   - Add conversation detail view
   - Add message input

8. **Testing**
   - Test complete flow: add contact → start conversation → send message
   - Verify unread counts
   - Verify search functionality

## Status
- Phase 1: ✅ Complete
- Phase 2: ✅ Complete
- Phase 3: 🚀 Starting now

---

This document will be updated as Phase 3 progresses.
