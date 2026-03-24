# Firebase to PostgreSQL Migration: Troubleshooting Guide

## Common Issues After Migration

This guide covers problems you might encounter when switching from Firebase to PostgreSQL.

---

## 1. "Tasks Not Appearing in Database"

### Symptoms
- Create task → No error → Task not in database
- Refresh page → Task disappears
- Real-time updates not working

### Likely Causes
- Prisma migrations not run
- Database schema not created
- API not saving to database correctly

### Solutions

**Check 1: Did you run Prisma migrations?**

```bash
cd server
npm run prisma:push
```

Expected output:
```
✓ Created 3 new tables: User, Task, FriendRequest
✓ Added 2 indexes
```

**Check 2: Verify database tables exist**

```bash
psql $DATABASE_URL -c "\dt"
```

Should show:
```
 User | table
 Task | table
 FriendRequest | table
```

**Check 3: Check API is actually calling database**

In `server/src/server.js`, verify POST /api/tasks:

```javascript
// Should have: await prisma.task.create(...)
// NOT just storing in memory
```

**Check 4: Is backend actually running?**

```bash
curl http://localhost:3000/api/tasks
```

Should return array (with auth token in header).

---

## 2. "Frontend Can't Connect to Backend"

### Symptoms
- Page loads but no errors
- Click "Add Task" → Nothing happens
- Browser console: `GET http://localhost:3000 404`

### Likely Causes
- Backend not running
- Wrong API URL configured
- CORS blocked

### Solutions

**Check 1: Is backend running?**

```bash
# Terminal
cd server
npm run dev
```

Expected:
```
Server running on port 3000
```

**Check 2: Verify REACT_APP_API_URL**

In `.env.local`:
```
REACT_APP_API_URL=http://localhost:3000
```

**Check 3: Check browser console for CORS errors**

If you see: `Access to XMLHttpRequest blocked by CORS policy`

In `server/src/server.js`, verify CORS is configured:

```javascript
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Your frontend
  }
});
```

**Check 4: Restart frontend**

```bash
# Stop: Ctrl+C
# Restart:
npm run dev
```

Environment variables only load on startup.

---

## 3. "Real-time Updates Not Working"

### Symptoms
- Create task in Browser 1
- Browser 2 doesn't update automatically
- Page refresh required to see changes

### Likely Causes
- Socket.io not connected
- Backend not broadcasting events
- Wrong Socket.io event names

### Solutions

**Check 1: Is Socket.io connected?**

Open browser DevTools → Network → WS

Look for:
```
Connection Type: WebSocket
URL: ws://localhost:3000/socket.io/
Status: 101 Switching Protocols
```

If NOT there:
- Backend not running
- CORS needs update
- Frontend API URL wrong

**Check 2: Verify Socket.io listeners in context**

In `src/context/TaskContext.jsx`, should have:

```javascript
socket.on('task:created', (data) => {
  setTasks(prev => [...prev, data.task]);
});

socket.on('task:updated', (data) => {
  setTasks(prev => prev.map(t => t.id === data.task.id ? data.task : t));
});
```

**Check 3: Check backend is broadcasting**

In `server/src/server.js`, POST /api/tasks should have:

```javascript
// After creating task:
io.emit('task:created', {
  userId: user.id,
  task: newTask
});
```

**Check 4: Test with curl**

```bash
# Terminal 1 - Watch for logs
cd server
npm run dev

# Terminal 2 - Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Test"}'
```

Terminal 1 should show:
```
Broadcasting task:created event
```

---

## 4. "Authentication Not Working"

### Symptoms
- Sign up → Error
- Sign in → 401 Unauthorized
- Can't create account

### Likely Causes
- Backend not running
- Database schema not created
- JWT secret not configured

### Solutions

**Check 1: Is backend receiving signup request?**

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2 - Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

**Expected response:**
```json
{
  "user": { "id": "...", "email": "test@example.com", "displayName": "Test User" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**If error `UNIQUE constraint failed`:**
- User already exists
- Try different email

**Check 2: Verify JWT_SECRET is set**

In `server/.env`:
```
JWT_SECRET=random_secret_here_at_least_32_chars
```

Without this, token generation fails.

**Check 3: Check browser error message**

In sign up form, what error appears?

- `"Network error"` → Backend not running / wrong URL
- `"Email already exists"` → User signup twice
- `"Invalid email format"` → Validation error

---

## 5. "Can't See Friend's Tasks"

### Symptoms
- Send friend request → "Accepted"
- View friend's tasks → Empty
- "Friend not found" error

### Likely Causes
- Friend not in database
- Friend request status wrong
- API endpoint issue

### Solutions

**Check 1: Friend actually created account?**

```bash
# Check both users exist
psql $DATABASE_URL -c "SELECT id, email FROM \"User\" WHERE email IN ('alice@test.com', 'bob@test.com');"
```

**Check 2: View friend requests**

```bash
# Check friend requests between users
psql $DATABASE_URL -c "
  SELECT * FROM \"FriendRequest\" 
  WHERE status = 'accepted';
"
```

**Check 3: Verify friendship in database**

In Prisma schema, friends relationship is stored via FriendRequest with status='accepted'.

In code, should be:

```javascript
// Get Alice's friends
const friends = await prisma.user.findUnique({
  where: { id: aliceId },
  include: {
    friends: {
      where: { status: 'accepted' }
    }
  }
});
```

---

## 6. "Database Connection Failed"

### Symptoms
- Start backend → Error message
- `ERROR: connect ENOTFOUND host`
- `Error: getaddrinfo ENOTFOUND`

### Likely Causes
- DATABASE_URL wrong
- Neon database offline
- Network connection issue

### Solutions

**Check 1: Verify DATABASE_URL format**

Should be:
```
postgresql://username:password@host/database
```

NOT:
```
postgres://... (old format)
mysql://... (wrong database)
mongodb://... (wrong database type)
```

**Check 2: Test Neon connection directly**

```bash
psql $DATABASE_URL -c "SELECT 1;"
```

If this works, then:
- Connection string is valid
- Neon is running
- Problem is in backend code

**Check 3: Check environment variable is loaded**

In `server/.env`:
```
DATABASE_URL=postgresql://...
```

NOT in `.env.example` (that's just template).

**Check 4: Restart backend after changing .env**

```bash
# Stop: Ctrl+C
npm run dev
```

Environment variables only load on startup.

**Check 5: Try Prisma studio**

```bash
npx prisma studio
```

If this works, then connection is fine and problem is in server.js code.

---

## 7. "CORS Errors in Browser Console"

### Symptoms
```
Access to XMLHttpRequest at 'http://localhost:3000/api/tasks'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

### Likely Causes
- Backend CORS not configured
- Frontend URL not whitelisted
- Using production URL in development

### Solutions

**For Local Development:**

In `server/src/server.js`:

```javascript
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Also add Express CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

**For Production:**

Update environment variable:

In Render dashboard:
```
FRONTEND_URL=https://yourapp.vercel.app
```

In `server/src/server.js`:

```javascript
const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    // ...
  }
});
```

Restart backend after changing.

---

## 8. "Prisma Schema Errors"

### Symptoms
- Invalid field type
- Relation error
- Migration fails

### Solution

**Check schema syntax:**

```bash
cd server
npx prisma validate
```

**Common errors:**

❌ Wrong type:
```prisma
text String  // Should be String (capital S)
```

✅ Correct:
```prisma
text String
```

❌ Missing relation:
```prisma
model Task {
  userId Int      // References user but no relation defined
}
```

✅ Correct:
```prisma
model Task {
  userId Int
  user   User @relation(fields: [userId], references: [id])
}
```

---

## 9. "Token Expired / Unauthorized 401"

### Symptoms
- Sign in works
- Click once → works
- Click again → 401 error
- Sign in again → works again

### Likely Causes
- JWT token expired (valid 7 days)
- Token not being sent in headers
- Backend not validating token properly

### Solutions

**Check 1: Token stored in localStorage?**

In browser DevTools → Application → Local Storage:

Should see:
```
authToken = eyJhbGciOiJIUzI1NiIs...
```

**Check 2: Token being sent with requests?**

In `src/api/client.js`:

```javascript
function getAuthHeader() {
  const token = localStorage.getItem('authToken');
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`
  };
}
```

**Check 3: Backend validating token?**

In `server/src/server.js`:

```javascript
function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

**Check 4: Extend token expiry (optional)**

In `server/src/server.js`, change:

```javascript
// Current (7 days)
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }  // ← Change this
);

// To 30 days:
{ expiresIn: '30d' }
```

---

## 10. "Tasks Disappear on Refresh"

### Symptoms
- Create task → Appears
- Refresh page → Gone
- (But visible in database)

### Likely Causes
- Frontend not fetching tasks on load
- API endpoint not returning tasks
- Database has tasks but context not loading them

### Solutions

**Check 1: TaskContext on mount**

In `src/context/TaskContext.jsx`:

```javascript
useEffect(() => {
  if (authToken) {
    getTasks();  // Should fetch from API
    getFriends();
    getFriendRequests();
  }
}, [authToken]);
```

**Check 2: getTasks API call**

In `src/api/client.js`:

```javascript
async function getTasks() {
  const res = await fetch(`${API_URL}/api/tasks`, {
    headers: getAuthHeader()
  });
  
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();  // Should return array
}
```

**Check 3: Backend GET /api/tasks**

In `server/src/server.js`:

```javascript
app.get('/api/tasks', verifyToken, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId }
  });
  res.json(tasks);  // Should return array, not null
});
```

**Check 4: Verify tasks in database**

```bash
psql $DATABASE_URL -c "SELECT * FROM \"Task\" WHERE \"userId\" = 123;"
```

(Replace 123 with actual userId)

---

## 11. "Port Already in Use"

### Symptoms
```
Error: listen EADDRINUSE: address already in use :::3000
```

### Solution

**Option 1: Kill process using port**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

**Option 2: Use different port**

In `server/.env`:
```
PORT=3001
```

Then restart backend.

---

## 12. "Module Not Found Errors"

### Symptoms
```
Error: Cannot find module 'express'
Error: Cannot find module 'socket.io'
```

### Solutions

**Check 1: Install dependencies**

```bash
cd server
npm install
```

**Check 2: Clear cache**

```bash
rm -rf node_modules
npm install
```

**Check 3: Check package.json**

Verify these exist in `server/package.json`:
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.7.0",
    "@prisma/client": "^5.0.0"
  }
}
```

---

## 13. "Cannot Find Variable 'Socket' in API Client"

### Symptoms
```
ReferenceError: socket is not defined
Something is not defined in src/api/client.js
```

### Likely Cause
- Socket.io not imported

### Solution

In `src/api/client.js`, verify top:

```javascript
import io from 'socket.io-client';  // ← Must be here

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
let socket;

export function connect() {
  socket = io(API_URL);  // ← Now socket is defined
  return socket;
}
```

---

## 14. "Prisma Error: P1001"

### Symptoms
```
Error P1001: Can't reach database server at `...`
```

### Causes
- Database URL invalid
- Connection refused
- Network issue

### Solutions

```bash
# Test connection string
psql $DATABASE_URL -c "SELECT 1;"

# If fails, check format and try again
echo $DATABASE_URL  # Print actual URL

# Try with explicit parameters
psql -h host -U user -d database -c "SELECT 1;"
```

---

## 15. Quick Diagnostic Script

Run this to check everything:

```bash
#!/bin/bash

echo "=== BACKEND CHECKS ==="
echo "1. Backend running?"
curl http://localhost:3000/api/search/users?email=test@test.com 2>/dev/null | head -c 50 && echo " ✓" || echo " ✗"

echo "2. Database connected?"
cd server && psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";" 2>/dev/null && echo " ✓" || echo " ✗"

echo "3. JWT_SECRET set?"
grep JWT_SECRET .env > /dev/null && echo " ✓" || echo " ✗"

echo ""
echo "=== FRONTEND CHECKS ==="
echo "4. REACT_APP_API_URL set?"
grep REACT_APP_API_URL ../.env.local > /dev/null && echo " ✓" || echo " ✗"

echo "5. socket.io-client installed?"
grep socket.io-client ../package.json > /dev/null && echo " ✓" || echo " ✗"

echo ""
echo "Run: npm run dev (frontend) && npm run dev (in server/)"
```

---

## Still Having Issues?

1. Check the specific error message carefully
2. Look at backend logs: `npm run dev` output
3. Check browser console: DevTools → Console tab
4. Search database: `psql $DATABASE_URL -c "..."`
5. Test endpoint directly: `curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/tasks`

**Most issues are one of:**
- Backend not running
- Environment variable not set
- Database not connected
- Token/auth issue

Start there! 🔍
