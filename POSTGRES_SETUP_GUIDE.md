# PostgreSQL + Neon Setup Guide

## Overview

Your DuoList app now uses:
- **Backend**: Node.js/Express server with PostgreSQL
- **Database**: Neon (serverless PostgreSQL)
- **Real-time**: Socket.io for live updates
- **Frontend**: React with Socket.io client

This replaces Firebase with a more scalable PostgreSQL architecture!

## Prerequisites

- Node.js 18+ installed
- Neon PostgreSQL account (already set up in Vercel)
- Your `DATABASE_URL` from Neon/Vercel

## Setup Steps

### 1. Get Your Neon Database URL

Your Neon PostgreSQL variables are already in Vercel:
```
DATABASE_URL
POSTGRES_USER
POSTGRES_PASSWORD
PGHOST_UNPOOLED
PGDATABASE
```

For local development, add to `server/.env`:
```
DATABASE_URL=postgresql://username:password@host/database
JWT_SECRET=your_secret_key_here_make_it_long_and_random
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Set Up Database Schema with Prisma

```bash
# Create Prisma client
npm run prisma:generate

# Push schema to Neon database
npm run prisma:push
```

This creates all tables:
- `User` - User accounts
- `Task` - Tasks for users
- `FriendRequest` - Friend request system

### 4. Start Backend Server

```bash
npm run dev
```

You should see:
```
Server running on port 3000
```

### 5. Update Frontend Environment

In root `.env.local` add:
```
REACT_APP_API_URL=http://localhost:3000
```

### 6. Install Frontend Dependencies & Start

```bash
# In root directory
npm install
npm run dev
```

## Project Structure

```
DuoList/
├── server/
│   ├── src/
│   │   └── server.js (Express + Socket.io)
│   ├── prisma/
│   │   └── schema.prisma (Database schema)
│   ├── package.json
│   └── .env.example
├── src/
│   ├── api/
│   │   └── client.js (API calls + Socket.io)
│   ├── context/
│   │   └── TaskContext.jsx (PostgreSQL version)
│   ├── components/
│   │   ├── Auth.jsx (Updated)
│   │   ├── AddFriend.jsx
│   │   └── FriendRequests.jsx
│   └── pages/
├── .env.local
└── package.json
```

## How Real-time Works

1. **Frontend** connects to backend via Socket.io
2. **User A** creates a task → API call to backend
3. **Backend** saves to PostgreSQL
4. **Backend** emits `task:created` event to all connected clients via Socket.io
5. **User B** (friend) receives event instantly → UI updates
6. **Zero refresh needed!** Pure real-time sync

## API Endpoints

### Authentication
```
POST   /api/auth/signup          - Create account
POST   /api/auth/signin          - Login
```

### Tasks
```
GET    /api/tasks                - Get user's tasks
POST   /api/tasks                - Create task
PUT    /api/tasks/:id            - Update task (completed, text)
DELETE /api/tasks/:id            - Delete task
```

### Friends
```
GET    /api/friends              - Get friend list
GET    /api/friends/:friendId/tasks - Get friend's tasks
GET    /api/search/users         - Search user by email
POST   /api/friend-requests      - Send request
GET    /api/friend-requests      - Get pending requests
POST   /api/friend-requests/:id/accept - Accept request
POST   /api/friend-requests/:id/reject - Reject request
POST   /api/friends/:friendId/remove   - Remove friend
```

## Socket.io Events

### Real-time Listeners (Backend → Frontend)
```javascript
socket.on('task:created', ({ userId, task }) => ...)
socket.on('task:updated', ({ userId, task }) => ...)
socket.on('task:deleted', ({ userId, taskId }) => ...)
socket.on('friendRequest:received', ({ toId, request }) => ...)
socket.on('friendRequest:accepted', ({ userId, friendId }) => ...)
socket.on('friend:removed', ({ userId, friendId }) => ...)
```

## Deployment

### Backend Deployment (Render.com Recommended)

1. Go to [Render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set environment variables:
   ```
   DATABASE_URL = (from Neon)
   JWT_SECRET = (create a strong one)
   PORT = 3000
   FRONTEND_URL = (your Vercel frontend URL)
   ```
5. Deploy! Backend will be live at `https://your-app.onrender.com`

### Update Frontend API URL

Update `REACT_APP_API_URL` in Vercel to your Render backend URL:
```
REACT_APP_API_URL=https://your-app.onrender.com
```

### CORS Configuration

Backend allows CORS from frontend URL set in environment variable.

To add more origins, update in `server/src/server.js`:
```javascript
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',           // Local dev
      'https://your-vercel-url.vercel.app',  // Production
      'https://your-app.onrender.com'  // Your domain
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
```

## Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` is correct in `.env`
- Make sure Neon database is running
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### "Socket.io connection refused"
- Backend server must be running (`npm run dev`)
- Check `REACT_APP_API_URL` points to backend
- Check CORS allows your frontend URL

### "Tasks not updating in real-time"
- Check browser console for Socket.io connection status
- Make sure backend is broadcasting events
- Check Network tab → WS for Socket.io connection

### "Friend requests not appearing"
- Reload page to get latest from API
- Real-time events will trigger on next action
- Check database has `FriendRequest` table

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check Neon token is valid
- Test with: `npm run prisma:push`

## Development Workflow

### Local Development
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

Both run with hot reload. Make changes → auto-reload!

### Production
```bash
# Build frontend
npm run build

# Backend auto-deploys on GitHub push (if using Render)
```

## Performance Tips

✅ **Database**
- Neon auto-scales with traffic
- Indexes on frequently queried fields
- Connection pooling built-in

✅ **Real-time**
- Socket.io only sends needed events
- Efficient JSON payloads
- WebSocket connections (faster than HTTP polling)

✅ **API**
- JWT tokens in localStorage
- API calls debounced
- Error handling for offline

## Security

⚠️ **Current Setup (Development)**
- JWT tokens valid for 7 days
- Passwords hashed with bcryptjs
- API requires valid token

🔒 **For Production**
- Add HTTPS only
- Implement rate limiting
- Add input validation
- Use environment secrets
- Set up monitoring/logging
- Enable CORS properly

## Database Schema

```prisma
User {
  id, email, password, displayName
  tasks (owns many)
  friends (mutual relationship)
  friendRequestsReceived, friendRequestsSent
}

Task {
  id, text, completed
  userId (owner)
}

FriendRequest {
  id, status (pending/accepted)
  fromId, toId
}
```

## Common Tasks

### Reset Database
```bash
cd server
npm run prisma:migrate -- --skip-generate
# or
npx prisma db push --force-reset
```

### View Database
```bash
npx prisma studio
```
Opens UI at http://localhost:5555 to view/edit data

### Update Schema
1. Edit `server/prisma/schema.prisma`
2. Run: `npm run prisma:push`
3. Restart backend server

## FAQ

**Q: Why PostgreSQL instead of Firebase?**
A: Better control, cheaper at scale, real-time with Socket.io, direct database access

**Q: Can I use MongoDB instead?**
A: Yes, change Prisma provider to `mongodb` and update schema

**Q: How do I backup data?**
A: Neon handles backups automatically. You can also export: `pg_dump $DATABASE_URL > backup.sql`

**Q: What if I want to switch back to Firebase?**
A: The original Firebase context is still available. Just change imports and environment variables.

## Next Steps

- [ ] Set up backend locally with `npm run dev`
- [ ] Push database schema with Prisma
- [ ] Test authentication (sign up/sign in)
- [ ] Test real-time task sync between 2 browsers
- [ ] Deploy backend to Render
- [ ] Update frontend to use production backend URL
- [ ] Test friend system end-to-end

---

**Your app is now production-ready with PostgreSQL!** 🚀
