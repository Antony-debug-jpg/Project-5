# ChatFlow Database Schema

## Overview

This document describes the PostgreSQL database schema for ChatFlow. The schema is managed by Prisma ORM and supports all major features planned for the application.

## Entity Relationship Diagram

```
User
├─ Profile (1-to-1)
├─ Contacts (1-to-many)
├─ Conversations (many-to-many via ConversationMember)
├─ Messages (1-to-many)
├─ BlockedUsers (1-to-many)
└─ Reports (1-to-many)

Conversation
├─ ConversationMembers (1-to-many)
├─ Messages (1-to-many)
├─ Group (optional 1-to-1)
└─ Groups (1-to-many GroupMembers)

Message
├─ MessageAttachments (1-to-many)
├─ MessageReactions (1-to-many)
├─ MessageReadReceipts (1-to-many)
├─ MessageDeliveryReceipts (1-to-many)
└─ Replies (self-referential)

Group
├─ GroupMembers (1-to-many)
└─ GroupInvites (1-to-many)

Status
└─ StatusViewers (1-to-many)
```

## Core Tables

### User
Stores user account information and profile data.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String (CUID) | PRIMARY KEY | Unique identifier |
| email | String | UNIQUE, NOT NULL | User's email address |
| password | String | NOT NULL | Hashed password (bcryptjs) |
| displayName | String | NOT NULL | User's display name |
| profilePicture | String | NULLABLE | URL to profile picture |
| aboutText | String | DEFAULT '' | User's bio/status message |
| isActive | Boolean | DEFAULT true | Account active status |
| lastSeenAt | DateTime | NULLABLE | Last online timestamp |
| createdAt | DateTime | DEFAULT now() | Account creation time |
| updatedAt | DateTime | UPDATED_AT | Last profile update |

**Indexes:**
- email (UNIQUE)
- createdAt

### Contact
Manages user's contact list.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| fromId | String | FK → User.id | Contact owner |
| toId | String | FK → User.id | Contacted user |
| nickname | String | NULLABLE | Custom name for contact |
| isFavorite | Boolean | DEFAULT false | Star contact |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | UPDATED_AT | |

**Constraints:**
- UNIQUE(fromId, toId) - No duplicate contacts

**Indexes:**
- fromId, toId

### Conversation
Represents 1-to-1 chats or group conversations.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| name | String | NULLABLE | Group name only |
| isGroup | Boolean | DEFAULT false | 1-to-1 or group |
| picture | String | NULLABLE | Group profile picture URL |
| description | String | NULLABLE | Group description |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | UPDATED_AT | |

**Indexes:**
- createdAt
- isGroup

### ConversationMember
Junction table for user-conversation relationships.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| conversationId | String | FK → Conversation.id | |
| userId | String | FK → User.id | |
| joinedAt | DateTime | DEFAULT now() | Member join time |
| leftAt | DateTime | NULLABLE | Member leave time |
| role | String | DEFAULT "member" | "admin" or "member" |
| unreadCount | Int | DEFAULT 0 | Unread messages |
| lastReadAt | DateTime | NULLABLE | Last read message time |

**Constraints:**
- UNIQUE(conversationId, userId) - No duplicate memberships

**Indexes:**
- conversationId, userId

### Message
Stores all messages across conversations.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| conversationId | String | FK → Conversation.id | Target conversation |
| senderId | String | FK → User.id | Message author |
| content | String | NOT NULL | Message text/content |
| messageType | String | DEFAULT "text" | text, image, video, etc. |
| editedAt | DateTime | NULLABLE | Message edit timestamp |
| deletedAt | DateTime | NULLABLE | Soft delete support |
| replyToId | String | FK → Message.id | Replied-to message |
| forwardedFromId | String | NULLABLE | Original message (forwarded) |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | UPDATED_AT | |

**Indexes:**
- conversationId
- senderId
- createdAt (for pagination)

### MessageAttachment
Stores file attachments for messages.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| messageId | String | FK → Message.id | Parent message |
| fileUrl | String | NOT NULL | S3/storage URL |
| fileType | String | NOT NULL | image, video, audio, document |
| fileName | String | NOT NULL | Original filename |
| fileSize | Int | NOT NULL | Size in bytes |
| mimeType | String | NOT NULL | MIME type |
| createdAt | DateTime | DEFAULT now() | |

**Indexes:**
- messageId

### MessageReaction
Emoji reactions to messages.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| messageId | String | FK → Message.id | Reacted message |
| userId | String | FK → User.id | Reacting user |
| emoji | String | NOT NULL | Emoji character |
| createdAt | DateTime | DEFAULT now() | |

**Constraints:**
- UNIQUE(messageId, userId, emoji) - One reaction per user per emoji

**Indexes:**
- messageId, userId

### MessageReadReceipt
Tracks message read status.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| messageId | String | FK → Message.id | Read message |
| userId | String | FK → User.id | Reading user |
| readAt | DateTime | DEFAULT now() | Read timestamp |

**Constraints:**
- UNIQUE(messageId, userId) - One read receipt per user per message

**Indexes:**
- messageId, userId

### MessageDeliveryReceipt
Tracks message delivery status.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| messageId | String | FK → Message.id | Delivered message |
| userId | String | FK → User.id | Recipient |
| deliveredAt | DateTime | DEFAULT now() | Delivery timestamp |

**Constraints:**
- UNIQUE(messageId, userId) - One delivery receipt per recipient

### Group
Extended information for group conversations.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| conversationId | String | FK → Conversation.id | Link to conversation |
| createdById | String | FK → User.id | Group creator |
| announcements | String | NULLABLE | Latest announcement |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | UPDATED_AT | |

**Indexes:**
- createdById

### GroupMember
Group membership information.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| groupId | String | FK → Group.id | Parent group |
| userId | String | FK → User.id | Member user |
| role | String | DEFAULT "member" | admin or member |
| joinedAt | DateTime | DEFAULT now() | |

**Constraints:**
- UNIQUE(groupId, userId) - One membership per user per group

### GroupInvite
Shareable group invitation links.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| groupId | String | FK → Group.id | Target group |
| token | String | UNIQUE | Invite token |
| expiresAt | DateTime | NOT NULL | Link expiration |
| createdAt | DateTime | DEFAULT now() | |

### BlockedUser
User blocking functionality.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| blockerId | String | FK → User.id | Blocking user |
| blockedId | String | FK → User.id | Blocked user |
| createdAt | DateTime | DEFAULT now() | |

**Constraints:**
- UNIQUE(blockerId, blockedId) - One block per pair

### StarredMessage
User's saved/starred messages.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| messageId | String | FK → Message.id | Starred message |
| userId | String | FK → User.id | User who starred |
| createdAt | DateTime | DEFAULT now() | |

**Constraints:**
- UNIQUE(messageId, userId) - One star per user per message

### PinnedMessage
Pinned messages in conversations.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| messageId | String | FK → Message.id | Pinned message |
| conversationId | String | FK → Conversation.id | Target conversation |
| pinnedAt | DateTime | DEFAULT now() | |

**Constraints:**
- UNIQUE(messageId, conversationId) - One pin per message per conversation

### Status
User's status/stories.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| userId | String | FK → User.id | Status owner |
| content | String | NOT NULL | Text or media URL |
| statusType | String | DEFAULT "text" | text, image, video |
| expiresAt | DateTime | NOT NULL | Expiration timestamp |
| createdAt | DateTime | DEFAULT now() | |

**Indexes:**
- userId
- expiresAt (for cleanup queries)

### StatusViewer
Who viewed a status.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| statusId | String | FK → Status.id | Viewed status |
| userId | String | FK → User.id | Viewing user |
| viewedAt | DateTime | DEFAULT now() | |

**Constraints:**
- UNIQUE(statusId, userId) - One view per user per status

### Notification
Push/in-app notifications.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| userId | String | FK → User.id | Recipient |
| type | String | NOT NULL | Notification type |
| data | String | NOT NULL | JSON data |
| isRead | Boolean | DEFAULT false | Read status |
| createdAt | DateTime | DEFAULT now() | |

**Indexes:**
- userId
- createdAt (for pagination)

### Call
Call history.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| conversationId | String | FK → Conversation.id | Call target |
| callerId | String | FK → User.id | Call initiator |
| calleeId | String | NULLABLE | Recipient (null for groups) |
| callType | String | NOT NULL | voice or video |
| duration | Int | NOT NULL | Duration in seconds |
| status | String | NOT NULL | completed, missed, rejected |
| startedAt | DateTime | NOT NULL | |
| endedAt | DateTime | NULLABLE | |
| createdAt | DateTime | DEFAULT now() | |

**Indexes:**
- conversationId, callerId, createdAt

### Report
User reports/abuse.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| id | String | PRIMARY KEY | |
| reporterId | String | FK → User.id | Report creator |
| reportedId | String | FK → User.id | Reported user |
| reason | String | NOT NULL | Report category |
| description | String | NULLABLE | Additional details |
| status | String | DEFAULT "open" | open, under_review, resolved |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | UPDATED_AT | |

**Indexes:**
- reporterId, reportedId, status

## Indexing Strategy

### High-Priority Indexes
- User.email (UNIQUE)
- Message.conversationId + Message.createdAt (for pagination)
- ConversationMember.userId (for user's conversations)
- MessageReadReceipt.messageId + messageId.userId (for read status)

### Query Optimization
- Composite indexes for common filter + sort combinations
- Indexes on foreign keys for JOIN operations
- Indexes on timestamp fields for range queries
- Unique constraints implemented as indexes

## Migration Strategy

Database migrations are managed by Prisma:
```bash
npm run db:setup          # Run all pending migrations
npx prisma migrate dev    # Create and apply new migration
npx prisma migrate reset  # Reset to baseline (dev only)
```

Each migration is versioned and tracked in `/prisma/migrations/`.

## Data Integrity

### Foreign Key Constraints
- Most FKs use CASCADE delete (messages when conversation deleted)
- User deletions handled carefully (soft delete consideration)
- Group deletions cascade to members and messages

### Soft Deletes
- Message.deletedAt for message deletion
- ConversationMember.leftAt for group leave
- Allows data retention and recovery

### Unique Constraints
- Single Contact relationship per pair
- One Message reaction per user per emoji per message
- One ConversationMember entry per user per conversation

## Future Enhancements

- Partitioning Message table by conversationId for scale
- Archive/soft delete conversations
- Message encryption flags
- RLS (Row Level Security) in PostgreSQL
- Computed columns for frequently-accessed data
- Materialized views for reporting
