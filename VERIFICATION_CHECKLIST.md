# ✅ DuoList Setup Verification Checklist

## Local Testing (Before Deployment)

### Step 1: Backend Setup ✓
```bash
cd server
npm install
npm start
```

**Expected Output:**
```
✓ Database connection successful
✓ Server running on http://localhost:3000
✓ Socket.io listening on ws://localhost:3000
✓ Frontend URL: http://localhost:5173

Server is ready to accept connections.
```

**Verify Database Connection:**
```bash
# In another terminal
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{"status":"ok","database":"connected","timestamp":"2024-03-25T10:30:00.000Z"}
```

---

### Step 2: Frontend Setup ✓
```bash
npm install
npm run dev
```

**Expected Output:**
```
✓ dev server running at http://localhost:5173
VITE v4.x.x ready in xxx ms
```

---

### Step 3: Real-Time Testing ✓

**1. Sign Up**
- Open http://localhost:5173 in browser
- Create account: test@example.com / password123
- You should see browser console: `✓ Connected to server`

**2. Create Task**
- Type a task and submit
- Check server console:
  ```
  Task created: {task-id} by user {user-id}
  ```
- Task appears instantly without page refresh ✓

**3. Update Task**
- Click task to mark complete
- Check server console:
  ```
  Task updated: {task-id} by user {user-id} - completed: true
  ```
- Task status updates instantly ✓

**4. Delete Task**
- Click delete button on task
- Check server console:
  ```
  Task deleted: {task-id} by user {user-id}
  ```
- Task disappears instantly ✓

**5. Real-Time Sync Test**
- Open same app in another browser tab
- Create task in Tab 1
- Should appear instantly in Tab 2 ✓

---

### Step 4: Verify Socket Connection (DevTools Console)
```javascript
// In browser console, check these:
localStorage.getItem('authToken')    // Should be a long JWT string
localStorage.getItem('userId')       // Should be a user ID
// You should see these in Network → WS:
// ws://localhost:3000/socket.io/?...
```

---

## Database Verification

### Check Connection Status
```bash
# Server health check
curl http://localhost:3000/api/health

# Should respond with 200 OK
# If 503 error: database is down or unreachable
```

### Verify Neon Database
1. Go to https://console.neon.tech
2. Check your project dashboard
3. Connection string should match `server/.env` DATABASE_URL
4. Ensure SSL mode is `require`

---

## Environment Files Configured ✓

### Backend Configuration
- **File:** `server/.env`
- **Status:** ✅ Created with Neon credentials
- **Key Settings:**
  - `DATABASE_URL=postgresql://...` (Neon pooled)
  - `JWT_SECRET=...` (for token signing)
  - `FRONTEND_URL=http://localhost:5173`

### Frontend Configuration  
- **File:** `.env.local`
- **Status:** ✅ Updated with API URL
- **Key Settings:**
  - `VITE_APP_API_URL=http://localhost:3000`

### Production Frontend
- **File:** `.env.production`
- **Status:** ✅ Created (update URL before deployment)

---

## Real-Time Architecture ✓

### How Real-Time Updates Work
```
User Signs In
    ↓
Socket Connects (Socket.io)
    ↓
User Joins Room: user:{userId}
    ↓
Create/Update/Delete Task
    ↓
Server Emits Event to Room
    ↓
All Connected Tabs Update Instantly
```

### Events Flow
- **Own tasks**: Emitted to `user:{userId}` room
- **Friend tasks**: Broadcast to all connected clients
- **Friend requests**: Sent to specific recipient
- **User presence**: Track online/offline status

---

## Server Endpoints Configured ✓

| Endpoint | Method | Status | Real-Time |
|----------|--------|--------|-----------|
| `/api/health` | GET | ✅ | — |
| `/api/auth/signup` | POST | ✅ | — |
| `/api/auth/signin` | POST | ✅ | — |
| `/api/tasks` | GET | ✅ | — |
| `/api/tasks` | POST | ✅ | **Socket.io** |
| `/api/tasks/{id}` | PUT | ✅ | **Socket.io** |
| `/api/tasks/{id}` | DELETE | ✅ | **Socket.io** |
| `/api/friends` | GET | ✅ | — |
| `/api/friends/{id}/tasks` | GET | ✅ | — |
| `/api/friend-requests` | GET | ✅ | — |
| `/api/friend-requests` | POST | ✅ | **Socket.io** |

---

## Troubleshooting

### Server won't start
```bash
# Check Node version (should be 18+)
node --version

# Check port 3000 is free
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000

# Install dependencies first
cd server && npm install
```

### Database connection fails
```bash
# Verify .env file exists: server/.env
# Verify DATABASE_URL is correct
# Test connection from command line:
psql "postgresql://neondb_owner:...@..."

# If SSL error:
# Ensure sslmode=require in connection string
```

### Real-time updates don't work
```bash
# Check Socket.io connection
# DevTools → Network → WS tab
# Should see: ws://localhost:3000/socket.io/?...

# Check browser console for errors
# Should see: "✓ Connected to server"

# If not connected:
# - Clear localStorage: localStorage.clear()
# - Refresh browser: Ctrl+R
# - Check server logs for auth errors
```

### Tasks don't appear in real-time
```bash
# Check server logs for:
# "Task created: {id}" messages

# Check browser console for:
# "task:created" events

# Verify Socket.io authenticated:
# localStorage.getItem('userId') should exist
```

---

## Ready for Deployment? ✓

Before deploying to Vercel:

- [ ] Server starts without errors: `npm start` in server/
- [ ] Health check works: `curl http://localhost:3000/api/health`
- [ ] Frontend starts: `npm run dev`
- [ ] Can sign up and create tasks
- [ ] Real-time updates work (test in multiple tabs)
- [ ] Database is connected and verified
- [ ] Environment variables documented
- [ ] Both `.env` files configured correctly

---

## Next: Deploy to Vercel

See `DATABASE_AND_REALTIME_SETUP.md` for full deployment instructions.

**Key steps:**
1. Deploy backend first to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy frontend to Vercel
4. Update `.env.production` with backend URL
5. Test health endpoint and real-time sync on production

---

## Support

**Issues?** Check these files:
- Server logs: `npm start` output
- Browser console: DevTools → Console tab
- Network: DevTools → Network tab
- WebSocket: DevTools → Network → WS filter

**Configuration files:**
- Backend: `server/.env`
- Frontend local: `.env.local`
- Frontend prod: `.env.production`
