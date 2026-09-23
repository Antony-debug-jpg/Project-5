# ChatFlow Development Setup Guide

## Prerequisites

Before setting up ChatFlow, ensure you have:

- **Node.js** 18.x or higher ([download](https://nodejs.org/))
- **npm** or **yarn** or **pnpm** (comes with Node.js)
- **PostgreSQL** 12.x or higher ([download](https://www.postgresql.org/download/))
- **Git** ([download](https://git-scm.com/))
- A code editor (VS Code recommended)

### Verify Installation

```bash
node --version      # Should be v18+
npm --version       # Should be 9+
psql --version      # Should be 12+
```

## Initial Setup

### 1. Clone or Initialize the Project

If you're starting fresh:
```bash
cd /path/to/project
```

### 2. Install Dependencies

Install dependencies for all workspaces:
```bash
npm install
```

This will install packages for:
- `/client` - Frontend React application
- `/server` - Backend Express application
- `/shared` - Shared types and utilities
- `/prisma` - Database schema and ORM

### 3. PostgreSQL Database Setup

#### Create the Database

Open PostgreSQL and create a new database:

```sql
-- Using psql
createuser chatflow -P  # Creates user 'chatflow' with password prompt
createdb chatflow -O chatflow
```

Or using pgAdmin GUI:
1. Right-click on "Databases"
2. Click "Create" → "Database"
3. Name: `chatflow`
4. Owner: Create new user `chatflow` with password

#### Verify Connection

```bash
psql -U chatflow -d chatflow -h localhost
# If prompted for password, enter your password
# If connected, you'll see: chatflow=#
# Exit with: \q
```

### 4. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database
DATABASE_URL=postgresql://chatflow:your_password@localhost:5432/chatflow

# JWT (generate unique secrets in production)
JWT_SECRET=your-super-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this

# Server
SERVER_PORT=5000
SERVER_HOST=localhost
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5000/api

# Other settings remain as-is for development
```

### 5. Database Schema Setup

Create the database tables using Prisma:

```bash
npm run db:setup
```

This command:
1. Creates all tables based on `prisma/schema.prisma`
2. Creates indexes and relationships
3. Generates Prisma Client

If you need to reset the database (dev only):
```bash
npx prisma migrate reset
```

### 6. Verify Database Setup

Open Prisma Studio to view the database:
```bash
npm run db:studio
```

This opens a web UI at http://localhost:5555 where you can view and manage data.

## Running the Application

### Development Mode (Both Frontend and Backend)

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173 (React app)
- **Backend**: http://localhost:5000 (API server)
- **Socket.IO**: ws://localhost:5000 (WebSocket)

### Frontend Only

```bash
npm run dev:client
```

Frontend runs at http://localhost:5173

### Backend Only

```bash
npm run dev:server
```

Backend runs at http://localhost:5000

## Testing the Setup

### 1. Check Backend Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### 2. Test Authentication

The backend includes a demo user for testing:
- **Email**: demo@example.com
- **Password**: password123

In development (browser console shows credentials), you can use these to test login.

### 3. Access the Frontend

Open http://localhost:5173 in your browser. You should see:
- ChatFlow login page
- Ability to register new accounts
- (Phase 2+) Full messaging interface

### 4. View Database

Run Prisma Studio to inspect data:
```bash
npm run db:studio
```

## Common Setup Issues

### Issue: "Cannot find module 'tsx'"

**Solution:**
```bash
npm install -D tsx
```

### Issue: "ECONNREFUSED 127.0.0.1:5432"

**Solution:** PostgreSQL is not running.
- **Windows**: Start the PostgreSQL service from Services
- **macOS**: `brew services start postgresql`
- **Linux**: `sudo systemctl start postgresql`

### Issue: "password authentication failed"

**Solution:** Database credentials are incorrect. Verify:
```bash
psql -U chatflow -d chatflow -h localhost
```

Update `.env` with correct credentials.

### Issue: "FATAL: database 'chatflow' does not exist"

**Solution:** Create the database:
```bash
createdb chatflow -U postgres
```

### Issue: Port 5000 or 5173 already in use

**Solution:** Change the port in `.env`:
```env
SERVER_PORT=5001
# Frontend will auto-adjust to 5174
```

Or kill the process using the port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Issue: "Module not found" errors after install

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Database Management Commands

### Create a New Migration

After modifying `prisma/schema.prisma`:
```bash
npm run db:setup
```

Prisma will detect schema changes and prompt you to create a migration.

### View Prisma Logs

```bash
export DEBUG=prisma:*
npm run dev:server
```

### Seed Data (Phase 2+)

```bash
npm run db:seed
```

Currently just a placeholder. Seeds will be implemented in Phase 2.

## Development Workflow

### During Development

1. Keep both frontend and backend running in separate terminals:
   ```bash
   # Terminal 1
   npm run dev:client

   # Terminal 2
   npm run dev:server
   ```

2. Make changes and see hot-reload:
   - Frontend: Changes auto-reload in browser
   - Backend: Changes require restart (use nodemon in Phase 2)

3. Check database with Prisma Studio:
   ```bash
   npm run db:studio
   ```

### Type Checking

Check for TypeScript errors without running:
```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Building for Production

### Build All Packages

```bash
npm run build
```

This creates:
- `/client/dist` - Optimized frontend build
- `/server/dist` - Compiled backend

### Run Production Build

```bash
npm start
```

The application will run on the configured `SERVER_PORT`.

## Environment Variables Reference

| Variable | Purpose | Default |
|----------|---------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://... |
| SERVER_PORT | Backend port | 5000 |
| SERVER_HOST | Backend host | localhost |
| NODE_ENV | Environment | development |
| JWT_SECRET | Token signing key | (set this) |
| JWT_REFRESH_SECRET | Refresh token key | (set this) |
| VITE_API_URL | Frontend API endpoint | http://localhost:5000/api |
| MAX_FILE_SIZE | File upload limit | 52428800 (50MB) |
| STORAGE_TYPE | Storage backend | local |
| STORAGE_PATH | Local upload path | ./uploads |

## Next Steps

After successful setup:

1. ✅ Verify both frontend and backend start
2. ✅ Test login with demo credentials
3. ✅ Explore Prisma Studio
4. ✅ Review the architecture docs

Ready for **Phase 2** (Authentication & User Profiles)?

Run:
```bash
npm run dev
```

And proceed to Phase 2 implementation.

## Troubleshooting

### Reset Everything (Development Only)

```bash
# Stop the servers first (Ctrl+C)

# Remove dependencies
rm -rf node_modules package-lock.json

# Reset database
npx prisma migrate reset

# Reinstall
npm install

# Run setup
npm run db:setup
```

### View Logs

Backend logs are printed to console. For detailed Prisma logging:
```bash
DEBUG=prisma:* npm run dev:server
```

### Check Port Usage

```bash
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000
```

### Validate Schema

```bash
npx prisma validate
```

## Getting Help

- Check logs in the terminal
- Review error messages carefully
- Ensure PostgreSQL is running: `psql -U chatflow`
- Verify environment variables in `.env`
- Check that all ports (5000, 5173) are available

For more details, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure
- [README.md](../README.md) - Project overview
