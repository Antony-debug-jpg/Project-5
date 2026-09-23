# ChatFlow API Routes

## Base URL
```
http://localhost:5000/api
```

## Authentication Routes
```
POST   /auth/register      - Register new user
POST   /auth/login         - Login with credentials
POST   /auth/logout        - Logout (invalidate session)
POST   /auth/refresh       - Refresh access token (Phase 2+)
GET    /auth/me            - Get current user info
```

## Response Format

### Success Response
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "displayName": "John Doe",
      "profilePicture": null
    }
  }
}
```

### Error Response
```json
{
  "error": "Invalid credentials"
}
```

## Endpoints (Phase 1)

### Auth Endpoints

#### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Requirements:**
- Email must be valid and unique
- Password must be at least 8 characters
- displayName must be 2-100 characters

**Response (201 Created):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "cuid123",
      "email": "user@example.com",
      "displayName": "John Doe"
    }
  }
}
```

**Error Responses:**
- 400 Bad Request - Validation failed
- 409 Conflict - Email already registered

---

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "cuid123",
      "email": "user@example.com",
      "displayName": "John Doe"
    }
  }
}
```

**Error Responses:**
- 400 Bad Request - Missing fields
- 401 Unauthorized - Invalid credentials

---

#### POST /auth/logout
Logout the current user (placeholder in Phase 1).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### GET /auth/me
Get the current authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Protected route",
  "user": {
    "id": "cuid123",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- 401 Unauthorized - Missing or invalid token

---

## Utility Endpoints

#### GET /health
Health check endpoint for monitoring.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

## Authentication

### JWT Token Format

Tokens are signed JWT with:
- **Header**: `Authorization: Bearer <token>`
- **Expiration**: 15 minutes (configured via JWT_EXPIRATION)
- **Payload**: Contains `id` and `email`
- **Secret**: Stored in environment variable JWT_SECRET

### Including Token in Requests

All protected endpoints require:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The token is automatically included by the frontend's `authService` axios client.

---

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Invalid/missing token |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

---

## Rate Limiting

All endpoints are rate-limited:
- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Header**: `RateLimit-Limit`, `RateLimit-Remaining`

When limit exceeded:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Future Routes (Phases 2+)

### Phase 2 - Users & Profiles
```
GET    /users/:id
PUT    /users/:id
PUT    /users/:id/profile-picture
PUT    /users/:id/about
POST   /auth/refresh
```

### Phase 3 - Contacts
```
GET    /contacts
POST   /contacts
DELETE /contacts/:id
PUT    /contacts/:id/favorite
GET    /users/search?q=...
```

### Phase 3 - Conversations
```
GET    /conversations
POST   /conversations
GET    /conversations/:id
PUT    /conversations/:id
DELETE /conversations/:id
```

### Phase 4 - Messages (REST + Socket.IO)
```
GET    /conversations/:id/messages
POST   /conversations/:id/messages
PUT    /messages/:id
DELETE /messages/:id
POST   /messages/:id/reactions
```

### Phase 5 - Search
```
GET    /search/messages?q=...&conversationId=...
GET    /search/conversations?q=...
GET    /search/users?q=...
```

### Phase 6 - Media
```
POST   /media/upload
GET    /media/:id
DELETE /media/:id
```

### Phase 7 - Groups
```
GET    /groups
POST   /groups
GET    /groups/:id
PUT    /groups/:id
DELETE /groups/:id
POST   /groups/:id/members
DELETE /groups/:id/members/:userId
POST   /groups/:id/invites
```

### Phase 8 - Status/Stories
```
GET    /status
POST   /status
GET    /status/:id/viewers
DELETE /status/:id
```

### Phase 9 - Notifications
```
GET    /notifications
PUT    /notifications/:id/read
DELETE /notifications/:id
```

### Phase 10 - Calls
```
GET    /calls
POST   /calls
GET    /calls/:id
```

---

## Testing Endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Protected route
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"

# Health check
curl http://localhost:5000/health
```

### Using Postman

1. Import as request
2. Set method: POST
3. Set URL: http://localhost:5000/api/auth/login
4. Set Body → raw → JSON
5. Paste request JSON
6. Send

### Using Frontend

The `authService` in `client/src/services/authService.ts` handles all requests automatically.

---

## Version History

- **Phase 1** - Initial auth endpoints
- **Phase 2** - Database integration (coming next)
- **Phase 3+** - Additional endpoints per phase

For detailed implementation, see [ARCHITECTURE.md](./ARCHITECTURE.md).
