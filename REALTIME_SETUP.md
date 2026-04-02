# Real-Time Friend Requests - Quick Setup Guide

## What's Been Implemented

✅ **Real-Time Friend Requests**
- Friend requests appear instantly when received
- Accept/Reject happens in real-time with optimistic UI updates
- No page refresh needed

✅ **Socket.io Integration**
- Targeted messaging to specific users (not broadcast)
- Automatic reconnection handling
- Fallback to polling if WebSocket fails
- Production-ready error handling

✅ **Vercel Deployment Ready**
- Environment variables configured in `.env.production`
- Build settings optimized in `vercel.json`
- CORS properly configured for cross-domain Socket.io

## Local Development

1. **Start Backend:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your database URL and JWT_SECRET
   npx prisma migrate deploy  # Run database migrations
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   npm install
   cp .env.local.example .env.local
   npm run dev
   ```

3. **Test Real-Time:**
   - Open http://localhost:5173 in two browser windows
   - Create two accounts
   - Send friend request from one to the other
   - Watch it appear instantly in the other window ✨

## Deploy to Vercel + Render

### Step 1: Deploy Backend (Render.com)

```bash
# 1. Push code to GitHub
git push origin main

# 2. Go to https://render.com
# 3. Create PostgreSQL database
#    - Save connection string as DATABASE_URL
# 4. Create Web Service
#    - Connect GitHub repo
#    - Build: npm install
#    - Start: npm start
#    - Add environment variables:
#      - DATABASE_URL: [your-database-url]
#      - JWT_SECRET: [generate-a-secure-key]
#      - FRONTEND_URL: https://your-app.vercel.app
#      - NODE_ENV: production
# 5. Deploy and copy the service URL (e.g., https://your-api.onrender.com)
```

### Step 2: Deploy Frontend (Vercel)

```bash
# Option 1: Using Vercel CLI
npm run deploy

# Option 2: Using GitHub in Vercel Dashboard
# 1. Go to https://vercel.com
# 2. Click "Add New" → "Project"
# 3. Connect your GitHub repository
# 4. Add environment variable:
#    - VITE_API_URL: [your-render-backend-url]
#    - Example: https://your-api.onrender.com
# 5. Deploy
```

### Step 3: Run Database Migrations

```bash
# In your local terminal, after backend is deployed:
DATABASE_URL="postgresql://user:pass@host:port/db" npx prisma migrate deploy
```

## Verify Real-Time Works on Production

1. Open your Vercel app in two browser windows
2. Create/login with two different accounts
3. Send friend request from account A to account B
4. Check browser console (DevTools) for: `✓ Connected to server`
5. Friend request should appear instantly in account B's window

### If It Doesn't Work

**Check console for errors:**
1. Open DevTools → Console
2. Look for red errors about connection
3. Common issues:

```
❌ "Connection refused"
→ Backend URL is wrong or backend is down
→ Fix: Check VITE_API_URL in Vercel environment variables

❌ "CORS error"
→ Backend's FRONTEND_URL doesn't match Vercel URL
→ Fix: Update FRONTEND_URL in backend environment variables

❌ "WebSocket is closed before the connection is established"
→ This is normal, Socket.io will fallback to polling
→ Check if real-time still works
```

## Project Structure

```
project/
├── src/
│   ├── api/client.js              ← Socket.io setup (enhanced)
│   ├── components/FriendRequests.jsx ← Real-time UI (enhanced)
│   ├── context/TaskContext.jsx    ← Real-time listeners (enhanced)
│   └── ...
├── server/
│   ├── src/server.js              ← Socket.io events (updated)
│   ├── .env.example               ← Backend config
│   └── ...
├── .env.local.example             ← Frontend dev config
├── .env.production                ← Frontend prod config
├── vercel.json                    ← Vercel config (updated)
└── DEPLOYMENT.md                  ← Full deployment guide
```

## Key Changes Made

### Backend (`server/src/server.js`)
- ✅ Changed from `io.emit()` to `io.to(roomId).emit()` for targeted messages
- ✅ Added friend request rejection event
- ✅ Added detailed error handling

### Frontend API Client (`src/api/client.js`)
- ✅ Added URL normalization for production
- ✅ Added fallback transport (polling)
- ✅ Added better error diagnostics
- ✅ Added `onFriendRequestRejected` listener

### Context (`src/context/TaskContext.jsx`)
- ✅ Added optimistic UI updates
- ✅ Added error recovery for failed requests
- ✅ Added real-time request listener with full request data
- ✅ Added rejection event handler

### Component (`src/components/FriendRequests.jsx`)
- ✅ Added loading states for buttons
- ✅ Added loading label text ("Accepting...", "Rejecting...")
- ✅ Added smooth animations for requests appearing/disappearing
- ✅ Added hover effects for better UX

### Config Files
- ✅ Updated `vercel.json` with environment variable declaration
- ✅ Updated `.env.local.example` with VITE_API_URL
- ✅ Updated `.env.production` with detailed comments
- ✅ Updated `server/.env.example` with production settings

## Environment Variables Checklist

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com  ← No trailing slash!
```

### Backend (Render)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secure-secret-key
FRONTEND_URL=https://your-app.vercel.app        ← Exact match!
NODE_ENV=production
PORT=3000
```

## Scaling Tips

If you launch and get tons of users:

1. **Multiple Backend Instances:**
   - Add Redis for Socket.io adapter
   - Ensures messages work across instances

2. **Database Performance:**
   - Add connection pooling (PgBouncer)
   - Optimize Prisma queries

3. **Monitoring:**
   - Set up error tracking (Sentry)
   - Monitor backend metrics (CPU, memory)
   - Monitor WebSocket connections

## Support & Debugging

**Real-time not working locally?**
- Check both backend and frontend are running
- Check `VITE_API_URL` is set to `http://localhost:3000`
- Restart both services

**Real-time not working on production?**
- Check `VITE_API_URL` in Vercel matches backend URL
- Check `FRONTEND_URL` in backend matches Vercel URL
- Check both services are healthy
- Check browser console for specific error messages

**Need more details?**
- See `DEPLOYMENT.md` for comprehensive guide
- Check Socket.io docs: https://socket.io/docs/
- Check Vercel docs: https://vercel.com/docs

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Test real-time functionality
4. ✅ Share with friends and get feedback
5. 🚀 Scale as needed

Happy deploying! 🎉
