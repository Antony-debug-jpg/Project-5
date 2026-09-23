# ChatFlow

## Deployment

### Backend and database on Render

1. Create a new Render Blueprint from this repository.
2. Render will provision the `chatflow-api` web service and `chatflow-db` PostgreSQL database from `render.yaml`.
3. Set `SOCKET_IO_CORS_ORIGIN` to the deployed Vercel URL.
4. After the first deploy, run the Prisma migration against the Render database if migrations have been added:

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

### Frontend on Vercel

1. Import this repository into Vercel.
2. Set the project root directory to `client`.
3. Add `VITE_API_URL` with the Render API URL followed by `/api`.
4. Deploy with the included `client/vercel.json` configuration.

A modern, production-quality messaging application with real-time communication, media support, and rich features for both personal and group conversations.

## Overview

ChatFlow is built as a full-stack TypeScript application with:
- **Frontend**: React + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express + Socket.IO
- **Database**: PostgreSQL + Prisma ORM
- **Real-time**: WebSocket via Socket.IO
- **Media**: File upload/storage abstraction (local + S3-ready)
- **Calling**: WebRTC architecture (to be implemented in Phase 10)

## Project Structure

```
chatflow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API clients, WebSocket
│   │   ├── stores/        # State management (Zustand)
│   │   ├── types/         # TypeScript interfaces
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # Express routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── socket/        # Socket.IO handlers
│   │   ├── validators/    # Input validation
│   │   ├── database/      # Database utilities
│   │   ├── types/         # TypeScript interfaces
│   │   ├── utils/         # Utility functions
│   │   ├── config/        # Configuration files
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env (gitignored)
├── shared/                # Shared types and utilities
│   ├── types/
│   ├── constants/
│   ├── utils/
│   └── package.json
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Database schema
│   ├── migrations/
│   ├── seeds/             # Seed data
│   └── package.json
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_ROUTES.md
│   ├── SOCKET_EVENTS.md
│   └── SETUP.md
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm
- PostgreSQL 12+

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database URL and other settings.

3. **Setup database**:
   ```bash
   npm run db:setup
   ```

4. **Start development servers**:
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

### Individual Server Development

Frontend only:
```bash
npm run dev:client
```

Backend only:
```bash
npm run dev:server
```

### Database Operations

View database UI:
```bash
npm run db:studio
```

Seed sample data:
```bash
npm run db:seed
```

## Development Phases

### Phase 1 ✅ (Current)
- Project structure and setup
- React frontend foundation
- Express backend foundation
- PostgreSQL + Prisma
- Basic routing and UI framework
- Environment configuration

### Phase 2 (Next)
- User registration and login
- JWT authentication
- User profiles
- Secure password handling

### Phase 3
- Contacts management
- One-to-one conversations
- Conversation list UI

### Phase 4
- Real-time messaging with Socket.IO
- Message delivery
- Message states

### Phase 5
- Message features (reactions, replies, editing, deletion)
- Message search
- Starred messages

### Phase 6
- Media uploads (images, videos, audio)
- Voice messages
- File uploads

### Phase 7
- Group messaging
- Group administration

### Phase 8
- Status/stories system

### Phase 9
- Notifications
- Online/offline presence

### Phase 10
- WebRTC voice and video calling

### Phase 11
- Security hardening
- Privacy features

### Phase 12
- Testing
- Optimization
- Deployment preparation

## Architecture Decisions (Phase 1)

1. **Monorepo with Workspaces**: Enables code sharing via `/shared` workspace and single repository management.

2. **TypeScript Everywhere**: All packages use TypeScript for type safety and developer experience.

3. **Separate Frontend Build**: React with Vite for fast development and optimized production builds.

4. **Express Backend**: Lightweight, well-established framework with excellent TypeScript support.

5. **Prisma ORM**: Type-safe database access with automatic migrations and excellent DX.

6. **Socket.IO**: Mature real-time communication library with fallbacks and excellent scaling story.

7. **Zustand**: Lightweight state management for React (minimal boilerplate).

8. **Tailwind CSS**: Utility-first CSS framework for rapid UI development.

9. **Environment Variables**: Twelve-factor app methodology for configuration.

## Key Files to Know

- `server/src/index.ts` - Backend entry point
- `client/src/App.tsx` - Frontend entry point
- `prisma/schema.prisma` - Database schema definition
- `docs/ARCHITECTURE.md` - Detailed architecture documentation
- `docs/DATABASE_SCHEMA.md` - Database schema documentation
- `.env.example` - Environment variable template

## Git Workflow

This repository includes `.gitignore` configured to exclude:
- node_modules
- .env files (only .env.example is tracked)
- Build outputs
- IDE settings
- Logs and temporary files

## Next Steps

Phase 1 is complete with:
- ✅ Project structure
- ✅ Build configuration
- ✅ Database setup
- ✅ Environment configuration
- ✅ Basic frontend and backend scaffolding

To proceed to **Phase 2 (Authentication & User Profiles)**, run:
```bash
npm run dev
```

Verify both frontend and backend start correctly, then confirm you're ready for Phase 2.

## License

TBD

## Support

For questions or issues, please open an issue in the repository.
