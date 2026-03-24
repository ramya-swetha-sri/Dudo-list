# PostgreSQL Migration Summary

## What Changed?

Your DuoList app has been migrated from Firebase to PostgreSQL. Here's what you need to know:

---

## Stack Comparison

### Before (Firebase)
```
Frontend: React + Firestore listeners
Backend: NONE (Firebase handles it)
Database: Firebase Firestore
Real-time: onSnapshot listeners
Auth: Firebase Authentication
```

### After (PostgreSQL)
```
Frontend: React + Socket.io client
Backend: Express.js + Prisma ORM
Database: Neon PostgreSQL (same as your Vercel setup!)
Real-time: Socket.io WebSockets
Auth: JWT tokens + bcryptjs
```

---

## Files Changed

### Frontend
- ✅ `src/api/client.js` — NEW API client (replaces Firebase SDK)
- ✅ `src/context/TaskContext.jsx` — Updated to use API + Socket.io
- ✅ `src/components/Auth.jsx` — Updated to use JWT auth
- ✅ `package.json` — Removed Firebase, added Socket.io
- ✅ `.env.local` — Add `REACT_APP_API_URL`

### Backend (NEW!)
- 📁 `server/` directory created with:
  - `src/server.js` — Express + Socket.io server
  - `prisma/schema.prisma` — Database schema
  - `package.json` — Backend dependencies
  - `.env.example` — Environment template

---

## Quick Start (Local Development)

### Terminal 1 - Backend

```bash
cd server
npm install
npm run dev
```

Expected output:
```
Server running on port 3000
✓ Database connected
```

### Terminal 2 - Frontend

```bash
npm install  # if needed
npm run dev
```

Expected output:
```
  VITE v5.2.0  running at:

  ➜  Local:   http://localhost:5173/
```

### Test It

1. Open `http://localhost:5173`
2. Sign up: `test@example.com` / `password123`
3. Add a task: "Test task"
4. Open same URL in different browser
5. Sign in same account → **See task instantly!** ✨

---

## Important Files to Know

### API Client (`src/api/client.js`)
Handles all communication with backend:
```javascript
import { signup, signin, getTasks, createTask } from './api/client.js';

// All API calls + Socket.io listeners
await signup(email, password, displayName);
await createTask(text);

socket.on('task:created', (task) => { /* update UI */ });
```

### Context (`src/context/TaskContext.jsx`)
Global state + API integration:
```javascript
const { 
  tasks, 
  addTask, 
  toggleTask, 
  friends,
  sendFriendRequest 
} = useTasks();
```

### Backend Server (`server/src/server.js`)
Express API + Socket.io:
```
POST   /api/auth/signup
POST   /api/auth/signin
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
+ Friend endpoints
```

### Database Schema (`server/prisma/schema.prisma`)
Defines database tables:
- `User` — Accounts with email, password, displayName
- `Task` — Tasks with userId, text, completed
- `FriendRequest` — Friend requests with status

---

## Environment Variables

### Frontend (`.env.local`)
```
REACT_APP_API_URL=http://localhost:3000
```

### Backend (`server/.env`)
```
DATABASE_URL=postgresql://user:password@host/db
JWT_SECRET=your-secret-key-here-make-it-long
PORT=3000
FRONTEND_URL=http://localhost:5173
```

---

## Real-time Architecture

### How it Works

```
User A Creates Task
    ↓
API Call to Backend
    ↓
Server Saves to PostgreSQL
    ↓
Server Broadcasts via Socket.io: 'task:created'
    ↓
User B Receives Event Instantly
    ↓
UI Updates (No Refresh Needed!)
```

### No More Database Listeners

❌ OLD (Firebase):
```javascript
const unsubscribe = onSnapshot(tasksQuery, (snap) => {
  // Listener runs on Firestore updates
});
```

✅ NEW (PostgreSQL):
```javascript
socket.on('task:created', (task) => {
  setState(prev => [...prev, task]);
});
```

Both real-time, but PostgreSQL is more scalable!

---

## Authentication Flow

### Sign Up
```
1. User enters: email, password, display name
2. Frontend: POST /api/auth/signup
3. Backend: Hash password + Create user in database
4. Backend: Generate JWT token valid for 7 days
5. Frontend: Store token in localStorage
6. All future API calls include token in Authorization header
```

### Sign In
```
1. User enters: email, password
2. Frontend: POST /api/auth/signin
3. Backend: Find user + Compare hashed passwords
4. Backend: Generate JWT token
5. Frontend: Store token, load user's data
```

### Verify Token
```
Before any API call:
- Check token in localStorage
- Include in Authorization header: Authorization: Bearer token123
- Backend verifies token before returning data
- If invalid/expired → User logged out
```

---

## Database Tables

### User
```sql
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,  -- hashed with bcryptjs
  displayName VARCHAR,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Task
```sql
CREATE TABLE "Task" (
  id SERIAL PRIMARY KEY,
  text VARCHAR NOT NULL,
  completed BOOLEAN DEFAULT false,
  userId INTEGER NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES "User"(id)
);
```

### FriendRequest
```sql
CREATE TABLE "FriendRequest" (
  id SERIAL PRIMARY KEY,
  fromId INTEGER NOT NULL,    -- Who sent request
  toId INTEGER NOT NULL,      -- Who receives request
  status VARCHAR NOT NULL,    -- 'pending', 'accepted', 'rejected'
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (fromId) REFERENCES "User"(id),
  FOREIGN KEY (toId) REFERENCES "User"(id)
);
```

### Friend Relationship

When FriendRequest.status = 'accepted', both users are friends:
- User A can see User B's tasks
- User B can see User A's tasks
- Either can remove friendship

---

## API Endpoints

### Authentication
```
POST /api/auth/signup
  Body: { email, password, displayName }
  Returns: { user: {...}, token: "..." }

POST /api/auth/signin
  Body: { email, password }
  Returns: { user: {...}, token: "..." }
```

### Tasks
```
GET /api/tasks
  Returns: [ { id, text, completed, userId, createdAt } ]

POST /api/tasks
  Body: { text: "Buy milk" }
  Returns: { id, text, completed, userId, createdAt }
  Broadcasts: 'task:created'

PUT /api/tasks/:id
  Body: { completed: true } or { text: "New text" }
  Returns: { id, text, completed, userId, createdAt }
  Broadcasts: 'task:updated'

DELETE /api/tasks/:id
  Returns: {}
  Broadcasts: 'task:deleted'
```

### Friends
```
GET /api/friends
  Returns: [ { id, email, displayName } ]

GET /api/friends/:friendId/tasks
  Returns: [ { id, text, completed, userId } ]

GET /api/search/users?email=...
  Returns: { id, email, displayName } or null

POST /api/friend-requests
  Body: { toId: 123 }
  Returns: { id, fromId, toId, status: 'pending' }
  Broadcasts: 'friendRequest:received' to recipient

GET /api/friend-requests
  Returns: [ { id, from: {...}, toId, status } ]

POST /api/friend-requests/:id/accept
  Changes status to 'accepted'
  Broadcasts: 'friendRequest:accepted' to both users

POST /api/friend-requests/:id/reject
  Deletes request
  Broadcasts: 'friendRequest:rejected'

POST /api/friends/:friendId/remove
  Deletes friendship
  Broadcasts: 'friend:removed' to both users
```

---

## Socket.io Events

### Task Events
```javascript
socket.on('task:created', ({ userId, task }) => {
  // Add task to list
});

socket.on('task:updated', ({ userId, task }) => {
  // Update existing task
});

socket.on('task:deleted', ({ userId, taskId }) => {
  // Remove task from list
});
```

### Friend Events
```javascript
socket.on('friendRequest:received', ({ from, friendRequest }) => {
  // Show notification: "Alice sent friend request"
});

socket.on('friendRequest:accepted', ({ from, friendId }) => {
  // Add to friends list
});

socket.on('friendRequest:rejected', ({ from }) => {
  // Remove from pending
});

socket.on('friend:removed', ({ friendId }) => {
  // Remove from friends list
});
```

---

## Data Flow Example

### Creating a Task (Step by Step)

1. **User clicks "Add Task"**
   ```javascript
   const handleAddTask = async (text) => {
     await createTask(text);  // from API client
   };
   ```

2. **Frontend sends to Backend**
   ```javascript
   // src/api/client.js
   const response = await fetch(`${API_URL}/api/tasks`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({ text })
   });
   ```

3. **Backend receives Request**
   ```javascript
   // server/src/server.js
   app.post('/api/tasks', verifyToken, async (req, res) => {
     const task = await prisma.task.create({
       data: {
         text: req.body.text,
         userId: req.userId
       }
     });
     // ...
   ```

4. **Backend saves to Database**
   ```sql
   INSERT INTO "Task" (text, completed, userId, "createdAt", "updatedAt")
   VALUES ('Buy milk', false, 42, NOW(), NOW());
   ```

5. **Backend broadcasts to all clients**
   ```javascript
   io.emit('task:created', {
     userId: req.userId,
     task: task
   });
   ```

6. **Frontend receives event**
   ```javascript
   // src/api/client.js
   socket.on('task:created', ({ userId, task }) => {
     setTasks(prev => [...prev, task]);
   });
   ```

7. **UI Updates Instantly** ✨

---

## Deployment Overview

### Step 1: Deploy Backend

Use Render.com (or similar):
1. Push code to GitHub (backend in `server/` directory)
2. Create Web Service on Render
3. Set environment variables
4. Backend deployed at: `https://your-backend.onrender.com`

### Step 2: Verify Backend

Test endpoint:
```bash
curl https://your-backend.onrender.com/api/search/users?email=test@example.com
```

### Step 3: Update Frontend

Set in Vercel:
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

### Step 4: Redeploy Frontend

Vercel auto-deploys when environment variables change.

### Step 5: Test Production

- Sign up at your Vercel URL
- Add task
- Open in another browser
- See real-time update! 🎉

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Backend won't start | `npm run dev` in `server/` directory? Check error message |
| Tasks not saving | Run `npm run prisma:push` in `server/` |
| Real-time not working | Is `npm run dev` running in `server/`? Is Socket.io in browser Network tab? |
| Login fails | Check `DATABASE_URL` in `server/.env` |
| Frontend blank page | Check browser console for errors |
| CORS blocked | Update CORS origin in `server/src/server.js` |

See `TROUBLESHOOTING_POSTGRESQL.md` for detailed fixes.

---

## Commands Cheat Sheet

### Backend
```bash
cd server

# Development
npm run dev              # Start with auto-reload

# Production
npm start                # Start normally

# Database
npm run prisma:push     # Create/update tables
npm run prisma:studio   # View data in browser UI
npm run prisma:generate # Generate Prisma client
```

### Frontend
```bash
# Development
npm run dev             # Start dev server

# Production
npm run build           # Build for deployment
npm run preview         # Preview production build
```

### Database (Direct)
```bash
# Connect to database
psql $DATABASE_URL

# View tables
\dt

# View users
SELECT * FROM "User";

# View tasks
SELECT * FROM "Task";

# Export data
pg_dump $DATABASE_URL > backup.sql
```

---

## What You Gain

✅ **Real-time sync** — See changes instantly, no refresh
✅ **Scalable** — Handle thousands of concurrent users
✅ **Cheap** — Render free tier + Neon free tier = Free!
✅ **Familiar** — SQL database, Node backend, standard tech
✅ **Control** — Own your data, not locked into Firebase
✅ **Flexible** — Add features easily with Express

---

## Next Steps

1. **Run Locally**
   ```bash
   cd server && npm run dev    # Terminal 1
   npm run dev                 # Terminal 2 (root)
   ```

2. **Test Everything**
   - Sign up
   - Create/update/delete tasks
   - Add friend
   - View friend's tasks
   - Test real-time (2 browsers)

3. **Deploy Backend**
   - Push to GitHub
   - Deploy to Render.com

4. **Deploy Frontend**
   - Update REACT_APP_API_URL in Vercel
   - Redeploy frontend

5. **Go Live!** 🚀

---

## Documentation

- `POSTGRES_SETUP_GUIDE.md` — Full setup guide
- `DEPLOYMENT_GUIDE_POSTGRESQL.md` — How to deploy
- `TROUBLESHOOTING_POSTGRESQL.md` — Common issues & fixes
- `FRIEND_SYSTEM_GUIDE.md` — Friend system details

---

## Summary

🎉 **Your app is now powered by PostgreSQL instead of Firebase!**

Same functionality, better scalability, same real-time updates. Just run `npm run dev` in both directories and start building!

Time to invite friends and collaborate! 🚀
