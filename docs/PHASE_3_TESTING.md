# Phase 3 Testing Guide

## Setup

```bash
# Install dependencies
npm install

# Create .env file with PostgreSQL connection string
# Copy .env.example to .env and set DATABASE_URL

# Initialize database
npm run db:setup

# Seed demo data
npm run db:seed

# Start development servers
npm run dev
```

## Test Scenarios

### 1. Add a Contact
**Steps:**
1. Login as demo@example.com / password123
2. Click "Messages" tab (should be selected)
3. Click "Contacts" tab
4. Click "Add" button
5. Search for "alice" or "alice@example.com"
6. Click "Add" button on Alice Johnson
7. Should see Alice in contacts list

**Expected Results:**
- ✓ Alice appears in "All Contacts" section
- ✓ Search is case-insensitive
- ✓ Cannot add duplicate
- ✓ Cannot add self

### 2. Favorite a Contact
**Steps:**
1. In Contacts tab, find Alice in the list
2. Click the Star icon on her contact
3. Star should turn yellow/filled

**Expected Results:**
- ✓ Alice moves to "Favorites" section
- ✓ Star is filled (yellow)
- ✓ Clicking again removes from favorites

### 3. Start Conversation
**Steps:**
1. In Contacts tab, find Alice
2. Click the Message bubble icon
3. Should switch to Messages tab
4. Alice should appear at top of conversations

**Expected Results:**
- ✓ New conversation created with Alice
- ✓ Conversation is selected automatically
- ✓ Empty message view shows (no messages yet)

### 4. Send and Receive Messages
**Steps:**
1. With conversation open, type "Hello Alice!" in message input
2. Press Enter or click Send
3. Message appears in chat
4. Open second browser tab and login as alice@example.com
5. In Alice's account, click Messages
6. Click conversation with demo user
7. Should see "Hello Alice!" message

**Expected Results:**
- ✓ Message appears immediately on sender side
- ✓ Message visible to receiver
- ✓ Shows sender avatar and name
- ✓ Timestamp displays
- ✓ Read status shows single checkmark (sender side)

### 5. Read Receipts
**Steps:**
1. With Alice's account viewing the conversation
2. All messages show double checkmark (read)
3. Back to demo account
4. Send new message "How are you?"
5. Switch to Alice's tab
6. Message shows single checkmark initially
7. When Alice views conversation, shows double checkmark
8. Back to demo account - should show double checkmark

**Expected Results:**
- ✓ Single checkmark = sent
- ✓ Double checkmark = read
- ✓ Status updates in real-time

### 6. Unread Badges
**Steps:**
1. Demo account at top of Conversations tab
2. Send message to Alice from demo (Alice's tab)
3. Go to Alice's Messages tab
4. Should see red badge with "1" on demo conversation
5. Click conversation to open
6. Badge should disappear
7. Send new message from demo
8. Alice's badge should show "2"

**Expected Results:**
- ✓ Badge shows number of unread messages
- ✓ Badge disappears when conversation is viewed
- ✓ Badge updates with new messages
- ✓ Max badge display is "9+"

### 7. Search Conversations
**Steps:**
1. In Messages tab, type "alice" in search
2. Only Alice's conversation should show
3. Clear search
4. All conversations appear again

**Expected Results:**
- ✓ Search is case-insensitive
- ✓ Searches conversation display names
- ✓ Real-time filtering

### 8. Search Contacts
**Steps:**
1. In Contacts tab, type "bob" in search
2. Only Bob Smith should show (if contact)
3. Type "bob@" - still shows Bob
4. Clear search

**Expected Results:**
- ✓ Search by display name or email
- ✓ Real-time filtering
- ✓ Case-insensitive

### 9. Conversation List Ordering
**Steps:**
1. Start conversation with Alice, send message
2. Start conversation with Bob, send message
3. Wait a few seconds
4. Send message back to Alice
5. Alice conversation should move to top (most recent)

**Expected Results:**
- ✓ Conversations sorted by most recent
- ✓ List updates as messages sent
- ✓ Last message preview shows sender name

### 10. Mobile Responsive
**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Rotate to portrait
4. Click on conversation to open
5. Back arrow should appear in header
6. Click back arrow
7. Should return to conversation list

**Expected Results:**
- ✓ Sidebar hidden on mobile
- ✓ Back button appears
- ✓ Full-width chat on mobile
- ✓ Messages readable on small screen

## Edge Cases to Test

### Case 1: Cannot add self as contact
- Try searching for demo@example.com
- Should not appear in results

### Case 2: Duplicate contact prevention
- Add Alice as contact
- Try adding again via search
- Should show error: "User is already a contact"

### Case 3: Non-existent user
- Search for "doesnotexist@fake.com"
- Click Add
- Should show error: "User not found"

### Case 4: Empty message
- Leave message input empty
- Try to send (click button)
- Nothing happens OR button disabled

### Case 5: Long messages
- Paste a long text (up to 5000 chars)
- Character counter shows "5000/5000"
- Should send successfully
- Message wraps correctly

### Case 6: Special characters
- Send message with emoji, symbols, etc.
- Should preserve formatting
- Should display correctly

### Case 7: Network error (optional - use DevTools)
- Open DevTools Network tab
- Search for user and throttle connection
- Should show loading state
- Offline should show error

## API Testing with curl/Postman

### Get Contacts
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:5000/api/contacts
```

### Add Contact
```bash
curl -X POST -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com"}' \
  http://localhost:5000/api/contacts
```

### Get Conversations
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:5000/api/conversations
```

### Create Conversation
```bash
curl -X POST -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"participantId":"<USER_ID>"}' \
  http://localhost:5000/api/conversations
```

### Get Messages
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:5000/api/conversations/<CONV_ID>/messages
```

### Send Message
```bash
curl -X POST -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello!"}' \
  http://localhost:5000/api/conversations/<CONV_ID>/messages
```

## Debugging

### Check Prisma Database
```bash
npm run db:studio
# Opens UI at http://localhost:5555
```

### Server Logs
- Frontend dev server logs at http://localhost:5173
- Backend console shows requests via Morgan middleware
- Check for errors in VS Code Terminal

### Browser Console
- F12 to open DevTools
- Check for fetch/axios errors
- Check Redux DevTools if available

### Clear Application Data
- IndexedDB in DevTools (App tab)
- localStorage for authToken
- Reload page after clearing

## Known Limitations (Phase 3)

- Real-time updates require page refresh (WebSocket in Phase 4)
- No typing indicators (Phase 4)
- No online status (Phase 9)
- No file sharing (Phase 6)
- No group chats (Phase 7)
- No message editing (Phase 5)
- No message reactions (Phase 5)

## Performance Notes

- First load: ~2-3 seconds (initial data fetch)
- Search response: <500ms
- Message send: <1 second
- UI updates: Instant (via Zustand)

## Success Criteria (All should pass)

- [ ] Can add, update, remove contacts
- [ ] Can search users
- [ ] Can start conversations
- [ ] Can send messages
- [ ] Messages appear on receiver's side
- [ ] Read receipts work
- [ ] Unread badges display
- [ ] Search works for conversations and contacts
- [ ] Mobile layout responsive
- [ ] No console errors
- [ ] No infinite loops or performance issues

---

**Ready for testing!** 🚀
