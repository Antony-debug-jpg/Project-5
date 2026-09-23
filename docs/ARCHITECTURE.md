# ChatFlow Architecture

## Overview

ChatFlow is a modern messaging application built with a microservices-ready architecture that scales from a monolithic foundation. The application separates concerns into frontend, backend, and database layers.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer (React)                      │
│  ┌──────────┬──────────────┬──────────────┬──────────────────┐   │
│  │  Pages   │  Components  │   Services   │   Stores (State) │   │
│  │          │              │   (API)      │  (Zustand)       │   │
│  └──────────┴──────────────┴──────────────┴──────────────────┘   │
│                              │                                    │
│                         HTTP + WebSocket                          │
│                              │                                    │
├─────────────────────────────────────────────────────────────────┤
│                      Server Layer (Express)                       │
│  ┌──────────┬─────────────┬──────────┬──────────┬────────────┐   │
│  │ Routes   │ Controllers │ Services │Middleware│ Socket.IO  │   │
│  └──────────┴─────────────┴──────────┴──────────┴────────────┘   │
│                                                                   │
│  ┌──────────────┬──────────────────┐                              │
│  │  Auth        │ Validation       │                              │
│  │  Middleware  │  Middleware      │                              │
│  └──────────────┴──────────────────┘                              │
│                              │                                    │
├─────────────────────────────────────────────────────────────────┤
│                   Database Layer (PostgreSQL)                     │
│           with Prisma ORM and Type Safety                        │
│  ┌──────────┬────────────┬──────────┬──────────┬──────────┐     │
│  │  Users   │ Messages   │ Contacts │ Groups   │ Statuses │     │
│  │          │            │          │          │          │     │
│  └──────────┴────────────┴──────────┴──────────┴──────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### Frontend (React + TypeScript)

**Structure:**
- `pages/` - Route components (LoginPage, ChatPage, etc.)
- `components/` - Reusable UI components (Sidebar, MessageList, etc.)
- `services/` - API clients and external integrations
- `stores/` - Zustand state management
- `hooks/` - Custom React hooks
- `types/` - TypeScript interfaces
- `utils/` - Helper functions

**Key Technologies:**
- **Vite** - Lightning-fast build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - Minimal, fast state management
- **TanStack Query** - Server state management and caching
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time WebSocket communication

### Backend (Node.js + Express)

**Structure:**
- `routes/` - Express route definitions
- `controllers/` - Request handlers and business logic entry points
- `services/` - Core business logic and database interactions
- `middleware/` - Express middleware (auth, validation, error handling)
- `validators/` - Input validation schemas (Joi)
- `socket/` - Socket.IO event handlers (Phase 4+)
- `types/` - TypeScript interfaces
- `config/` - Configuration files

**Key Technologies:**
- **Express** - Lightweight web framework
- **Socket.IO** - Real-time bidirectional communication
- **Prisma** - Type-safe ORM with migrations
- **JWT** - Stateless authentication
- **bcryptjs** - Password hashing
- **Joi** - Schema validation
- **Morgan** - HTTP request logging
- **Rate Limiting** - Request throttling
- **CORS** - Cross-origin resource sharing

### Database (PostgreSQL + Prisma)

**Key Features:**
- Type-safe queries via Prisma Client
- Automatic migrations
- Seed scripts for test data
- Comprehensive schema with proper relationships
- Soft deletes where appropriate
- Audit timestamps (createdAt, updatedAt)

## Authentication Flow

```
1. User Registration
   ├─ Validate input (email, password, displayName)
   ├─ Hash password with bcrypt
   ├─ Create user in database
   ├─ Generate JWT token
   └─ Return token + user data

2. User Login
   ├─ Validate credentials
   ├─ Compare password hash
   ├─ Generate JWT token
   ├─ Client stores token in localStorage
   └─ Include token in all API requests

3. Request Authentication
   ├─ Client sends Authorization: Bearer <token>
   ├─ Server validates JWT signature
   ├─ Extract user ID from token
   └─ Attach user to request context
```

## Real-Time Architecture (Phase 4+)

**WebSocket Communication:**
- Socket.IO handles connection management
- Automatic reconnection and fallback transports
- Room-based message delivery for conversations
- Event-driven architecture for all real-time features

**Key Events:**
- `send_message` - Client sends message
- `message_received` - Server broadcasts to conversation
- `typing_start/stop` - User typing indicators
- `user_online/offline` - Presence updates
- `message_read/delivered` - Message status updates

## Data Flow Examples

### Message Send Flow

```
Client                          Server                      Database
│                                │                               │
├─ send_message ─────────────────>                               │
│                                ├─ Validate message             │
│                                ├─ Save to database ────────────>
│                                <─────────────────── Saved       │
│                                ├─ Create delivery receipt       │
│                                ├─ Broadcast to recipients       │
│<─ message_received ────────────┤                               │
│                                ├─ Emit delivery_receipt ──────>│
│<─ message_delivered ───────────┤                               │
```

### Authentication Flow

```
Client                          Server
│                                │
├─ POST /auth/login ────────────>
│                                ├─ Find user by email
│                                ├─ Compare password hash
│                                ├─ Create JWT token
│<─ { token, user } ────────────┤
│                                │
├─ Store token ─────────────────┤
├─ Set Authorization header ────>
```

## Security Considerations

### Authentication & Authorization
- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens with short expiration (15 minutes)
- Refresh tokens for extended sessions (Phase 2+)
- Authorization checks on all protected routes
- User context attached to requests

### Data Protection
- Input validation on all routes (Joi)
- SQL injection prevention via Prisma
- CORS configuration for cross-origin requests
- Rate limiting on auth endpoints
- No sensitive data in logs

### Future Enhancements (Phase 11)
- HTTPS/TLS enforcement
- CSRF protection
- Content Security Policy (CSP)
- End-to-end encryption (message content)
- Two-factor authentication
- API key management
- Audit logging

## Storage Architecture (Phase 6+)

**Abstraction Layer Design:**
```
Application
    │
    ├─ Storage Service (abstraction)
    │   ├─ Local Storage (development)
    │   └─ S3-Compatible (production)
    │
    ├─ File Validation
    │   ├─ MIME type checking
    │   ├─ File size limits
    │   └─ Virus scanning (optional)
    │
    └─ Database
        └─ File metadata (name, type, size, URL)
```

## State Management Strategy

### Frontend State Layers
1. **Server State** (TanStack Query)
   - API data, messages, conversations
   - Automatic caching and synchronization

2. **Client State** (Zustand)
   - Authentication token and user
   - UI state (sidebar open, modal visible)
   - Temporary form data

3. **Component State** (useState)
   - Form input values
   - Loading states within components

### Backend State
- Primarily database-driven
- Socket.IO rooms for connection tracking
- In-memory user presence map (Phase 9+)

## Scalability Considerations

### Horizontal Scaling
- Stateless Express servers
- JWT for auth (no session affinity needed)
- Redis for session/socket state (Phase 10+)
- Database connection pooling

### Performance
- Message indexing by timestamp
- Conversation member indexing
- User activity timestamps
- Lazy loading conversations and messages

### Caching Strategy
- TanStack Query on frontend
- Redis caching layer (Phase 10+)
- Static asset caching via CDN

## Deployment Architecture

```
┌────────────────────────────────────────────┐
│          CloudFlare / CDN                  │
│     (Static assets, image resizing)        │
└──────────────────┬─────────────────────────┘
                   │
┌──────────────────▼─────────────────────────┐
│        Load Balancer / Reverse Proxy        │
│     (HTTPS termination, request routing)   │
└──────────────────┬─────────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
   ┌──▼──┐     ┌──▼──┐     ┌──▼──┐
   │ API │     │ API │     │ API │
   │  1  │     │  2  │     │  3  │
   └─────┘     └─────┘     └─────┘
      │            │            │
      └────────────┼────────────┘
                   │
         ┌─────────▼─────────┐
         │  PostgreSQL DB    │
         │   with Replicas   │
         └───────────────────┘
```

## Environment Configuration

See `.env.example` for all required variables:
- Database connection (PostgreSQL)
- JWT secrets
- File upload settings
- CORS origins
- Rate limiting parameters
- Email/notification settings

## Development Workflow

1. **Setup**
   ```bash
   npm install
   cp .env.example .env
   npm run db:setup
   ```

2. **Development**
   ```bash
   npm run dev        # Frontend + Backend
   npm run dev:client # Frontend only
   npm run dev:server # Backend only
   ```

3. **Database**
   ```bash
   npm run db:studio  # Prisma Studio
   npm run db:seed    # Seed data
   ```

4. **Building**
   ```bash
   npm run build
   ```

## Next Steps

- Phase 2: Implement complete user registration and authentication with database persistence
- Phase 3: Add contact management and conversation list
- Phase 4: Integrate Socket.IO for real-time messaging
- Phase 5: Add message features (reactions, replies, editing, etc.)
