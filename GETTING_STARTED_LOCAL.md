# Running DuoList Locally (PostgreSQL Edition)

## Complete Step-by-Step Guide

Follow these steps to run the app on your computer.

---

## Prerequisites

Make sure you have:
- ✅ Node.js 18+ installed (check: `node --version`)
- ✅ Your Neon PostgreSQL connection string
- ✅ Git (to pull latest code)

---

## Step 1: Get Your Database Connection String

### From Neon (or Vercel)

1. Go to Vercel Dashboard
2. Select "Dudo list" project
3. Settings → Environment Variables
4. Find: `DATABASE_URL`
5. Copy the value (looks like: `postgresql://user:pass@host/db`)
6. Save it somewhere safe (you'll need it right now!)

---

## Step 2: Set Up Backend

### 2.1 Navigate to server directory

```bash
cd server
```

### 2.2 Install dependencies

```bash
npm install
```

**Wait for it to complete** → You should see:
```
added 250+ packages
```

### 2.3 Create local environment file

Create file: `server/.env`

Add these lines:
```
DATABASE_URL=PASTE_YOUR_CONNECTION_STRING_HERE
JWT_SECRET=dev_secret_key_12345678901234567890
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Replace:** `PASTE_YOUR_CONNECTION_STRING_HERE` with your actual database URL

Example:
```
DATABASE_URL=postgresql://neon_user:neon_pass@us-east-1.neon.tech/duolist_db?sslmode=require
JWT_SECRET=dev_secret_key_12345678901234567890
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 2.4 Test database connection

```bash
psql $DATABASE_URL -c "SELECT 1;"
```

Expected output:
```
 ?column?
----------
        1
(1 row)
```

If ERROR: Check your `DATABASE_URL` is correct

### 2.5 Create database tables (Prisma migration)

```bash
npm run prisma:push
```

This creates 3 tables:
- `User` (for accounts)
- `Task` (for todos)
- `FriendRequest` (for friend system)

Watch for output:
```
✓ Created 3 new tables
✓ Added 2 indexes
```

### 2.6 Start backend server

```bash
npm run dev
```

**Keep this terminal open!**

Expected output:
```
Server running on port 3000
```

---

## Step 3: Set Up Frontend

### 3.1 Open NEW terminal window

**Important:** Don't close the backend terminal! Open a new one.

### 3.2 Go to root directory

```bash
cd ..
```

(Back to main project folder, not server/)

### 3.3 Create environment file

Create file: `.env.local` (in root directory, NOT in server/)

Add:
```
REACT_APP_API_URL=http://localhost:3000
```

### 3.4 Install dependencies

```bash
npm install
```

### 3.5 Start frontend dev server

```bash
npm run dev
```

**Keep this terminal open too!**

Expected output:
```
  VITE v5.2.0  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Step 4: Test the App

### 4.1 Open in browser

Click or copy-paste: http://localhost:5173

You should see the DuoList login page!

### 4.2 Create account

1. Click "Sign Up"
2. Enter:
   - Email: `test1@example.com`
   - Password: `password123`
   - Display Name: `Test User`
3. Click "Sign Up"
4. Should see: Task list page
5. Should feel: Relief that it works! 😄

### 4.3 Create a task

1. Type in input: "Learn PostgreSQL"
2. Click button (or press Enter)
3. Task appears instantly! ✨

### 4.4 Test real-time updates

1. Open second browser window: http://localhost:5173
2. Sign in as same user: `test1@example.com`
3. In Browser 1: Create new task "Test real-time"
4. In Browser 2: **See it appear instantly!** (no refresh needed)
5. In Browser 2: Mark task as complete
6. In Browser 1: See it marked complete instantly!

**This is real-time sync working!** 🎉

### 4.5 Test friend system (optional)

Browser 1 (signed in as test1@example.com):
1. Go to "Friends"
2. Search: `test2@example.com`
3. Click "Send Request"

Browser 2 (create new account test2@example.com):
1. Sign up with: `test2@example.com` / `password123`
2. Go to "Friend Requests"
3. Accept request from test1
4. Go to "Friends"
5. Click on test1 → See their tasks!
6. Browser 1 creates task → Browser 2 sees it instantly! ✨

---

## Directory Structure

```
DuoList/
├── server/                          # Backend (Node.js + Express)
│   ├── src/
│   │   └── server.js               # Main server file
│   ├── prisma/
│   │   └── schema.prisma           # Database schema
│   ├── package.json
│   ├── .env                        # Backend env vars (you created)
│   └── .env.example
│
├── src/                            # Frontend (React)
│   ├── api/
│   │   └── client.js               # API calls to backend
│   ├── context/
│   │   └── TaskContext.jsx         # Global state
│   ├── components/
│   │   └── Auth.jsx                # Login/Signup
│   └── pages/
│       ├── MyTasks.jsx
│       ├── FriendTasks.jsx
│       ├── Leaderboard.jsx
│       └── Pomodoro.jsx
│
├── package.json
├── .env.local                      # Frontend env var (you created)
└── vite.config.js
```

---

## Common Issues While Running

### ❌ "Cannot find module 'express'"

**Fix:** You haven't run `npm install` in `server/` directory

```bash
cd server
npm install
```

### ❌ "connect ENOTFOUND"

**Fix:** Database connection string is wrong

Check `.env` file, verify DATABASE_URL:
```bash
cat server/.env | grep DATABASE_URL
```

Should show:
```
DATABASE_URL=postgresql://...
```

### ❌ "EADDRINUSE: address already in use :::3000"

**Fix:** Port 3000 is already in use

```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill it
taskkill /PID <PID_NUMBER> /F

# Or just use different port in server/.env:
PORT=3001
```

### ❌ "Frontend loads, but can't sign up"

**Fix 1:** Backend not running

Check terminal 1: Should say "Server running on port 3000"

**Fix 2:** .env.local wrong

Check `.env.local` has:
```
REACT_APP_API_URL=http://localhost:3000
```

Restart frontend (`npm run dev`).

### ❌ "Real-time not working (need to refresh)"

**Fix:** Socket.io not connected

In browser DevTools (F12):
1. Network tab → Filter "WS"
2. Should see: `socket.io?` connection
3. Status: Connected

If NOT there:
- Backend not running
- API_URL wrong
- Restart frontend

### ❌ "Prisma schema doesn't match database"

**Fix:** Run migration

```bash
cd server
npm run prisma:push
```

This updates your database to match schema.

### ❌ "Port 5173 already in use"

**Fix:** Different frontend port

```bash
npm run dev -- --port 5174
```

Or kill whatever's using 5173:
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

## Useful Commands

### Backend

```bash
cd server

# Start development (auto-reload on file changes)
npm run dev

# Start normally
npm start

# View database
npm run prisma:studio

# Update schema after changes
npm run prisma:push

# Generate Prisma client (if needed)
npm run prisma:generate

# Connect to database directly
psql $DATABASE_URL
```

### Frontend

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clear node_modules and reinstall
rm -r node_modules && npm install
```

### Database (Direct Access)

```bash
# Connect
psql $DATABASE_URL

# View tables
\dt

# View users
SELECT * FROM "User";

# View tasks
SELECT * FROM "Task" LIMIT 5;

# View friend requests
SELECT * FROM "FriendRequest";

# Count records
SELECT COUNT(*) FROM "Task";

# Exit psql
\q
```

---

## Debugging

### Check Backend Logs

In terminal running backend (Terminal 1):
- Look for errors when you perform actions
- Should see: `Broadcasting task:created` when you create task
- Should see: `New connection` when frontend connects

### Check Frontend Console

In browser (F12 → Console):
- Look for red errors
- Check Network tab for failed API calls
- Check WS tab for Socket.io connection

### Check Database

```bash
# After creating account test1@example.com
psql $DATABASE_URL -c "SELECT email FROM \"User\" WHERE email = 'test1@example.com';"

# Should return the email if successful
```

---

## Performance Tips

✅ Don't have too many terminals open (terminal lag)
✅ Frontend and backend can run on same computer
✅ Closing browser doesn't affect backend (it keeps running)
✅ Can refresh frontend without restarting backend
✅ Real-time sync should feel instant (< 100ms)

---

## Stopping the App

### Stop Backend

In Terminal 1 (where backend runs):
```
Press: Ctrl + C
```

### Stop Frontend

In Terminal 2 (where frontend runs):
```
Press: Ctrl + C
```

### Restart Everything

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2 (new terminal, at root)
npm run dev
```

---

## Next: Deploy to Production

When ready to go live:

1. See `DEPLOYMENT_GUIDE_POSTGRESQL.md`
2. Deploy backend to Render.com
3. Update frontend with backend URL
4. Go live! 🚀

---

## Quick Reference Card

### Two Terminals Needed

```
TERMINAL 1 (Backend)        TERMINAL 2 (Frontend)
cd server                   [stay at project root]
npm run dev                 npm run dev
↓                           ↓
Listening on :3000         Listening on :5173
```

### Verification Checklist

- [ ] Backend terminal shows "Server running on port 3000"
- [ ] Frontend terminal shows "Local: http://localhost:5173"
- [ ] Browser shows login page at http://localhost:5173
- [ ] Can sign up with email/password
- [ ] Can create tasks
- [ ] Tasks appear instantly in 2nd browser tab
- [ ] Database URL connecting correctly
- [ ] No red errors in browser console

### Files You Created

- ✅ `server/.env` (Database connection + JWT secret)
- ✅ `.env.local` (Frontend API URL)

### If Stuck

1. **Backend won't start?** → Check `DATABASE_URL` in `server/.env`
2. **Can't sign up?** → Check backend running + `.env.local` has API_URL
3. **Real-time not working?** → Check Socket.io connection in Network tab
4. **Database error?** → Run `npm run prisma:push` in `server/`

---

## Success! 🎉

If you completed this guide:
- ✅ Backend running locally
- ✅ Frontend running locally
- ✅ Database connected
- ✅ Real-time sync working
- ✅ Friend system ready

**Congrats! Your app is live.** Time to test with friends! 🚀

---

## Need Help?

See these guides:
- `TROUBLESHOOTING_POSTGRESQL.md` — Common problems & fixes
- `POSTGRES_SETUP_GUIDE.md` — Detailed setup explanation
- `DEPLOYMENT_GUIDE_POSTGRESQL.md` — Deploy to production
- `POSTGRESQL_MIGRATION_SUMMARY.md` — What changed from Firebase

---

**Ready to build something awesome!** 💪
