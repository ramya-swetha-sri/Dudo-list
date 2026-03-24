# PostgreSQL Backend Deployment Guide

## Quick Start: Deploy to Render.com

Render is perfect for Node.js backends with PostgreSQL. Free tier available!

### Prerequisites
- Backend code committed to GitHub ✅
- Neon PostgreSQL connection string ✅
- Vercel frontend deployed ✅

---

## Step-by-Step Deployment

### 1. Push Backend to GitHub

Ensure your `server/` directory is committed:

```bash
git add server/
git commit -m "Add PostgreSQL Express backend"
git push origin main
```

### 2. Create Render Account

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Authorize DuoList repository

### 3. Create Web Service

1. Click **New +** → **Web Service**
2. Select your GitHub repository
3. Configure:
   - **Name**: `duellist-backend` (or similar)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if needed)

### 4. Add Environment Variables

Click **Environment** and add:

```
DATABASE_URL     = postgresql://user:password@host/db (from Neon)
JWT_SECRET       = generate-a-strong-random-secret-here
PORT             = 3000
FRONTEND_URL     = https://yourapp.vercel.app
```

**Generate JWT_SECRET:**
```bash
# Run this in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output into `JWT_SECRET` field.

### 5. Get Neon Connection String

In your Vercel project:
1. Go to Settings → Environment Variables
2. Find `DATABASE_URL`
3. Copy the value
4. Paste into Render `DATABASE_URL` field

### 6. Deploy

Click **Create Web Service** → Render deploys automatically! 🚀

You'll get a URL like: `https://duellist-backend.onrender.com`

### 7. Verify Backend Running

Test in browser:
```
https://duellist-backend.onrender.com/api/search/users?email=test@example.com
```

Should return: `null` or error (expected since no data)

### 8. Update Frontend

In Vercel project Settings → Environment Variables:

Add:
```
REACT_APP_API_URL = https://duellist-backend.onrender.com
```

Redeploy frontend:
```bash
git add .
git commit -m "Update API URL to production backend"
git push origin main
```

Vercel redeploys automatically!

---

## Complete Deployment Checklist

```
Backend Setup:
  ✓ Backend code in server/ directory
  ✓ PostgreSQL schema in prisma/schema.prisma
  ✓ Express server in src/server.js
  ✓ All dependencies in package.json
  ✓ Scripts: npm start, npm run dev
  
GitHub:
  ✓ server/ committed and pushed
  ✓ .env not committed (use .env.example)
  
Render:
  ✓ Web Service created
  ✓ DATABASE_URL set
  ✓ JWT_SECRET generated and set
  ✓ FRONTEND_URL set
  ✓ Build command: npm install
  ✓ Start command: npm start
  ✓ Backend URL obtained
  
Frontend (Vercel):
  ✓ REACT_APP_API_URL set to Render backend URL
  ✓ Redeployed after environment variable change
  ✓ socket.io-client package installed
  ✓ API client (src/api/client.js) ready
  
Testing:
  ✓ Backend server responding to requests
  ✓ Database connection working
  ✓ API endpoints accessible
  ✓ Frontend can sign up / sign in
  ✓ Real-time tasks work
```

---

## Testing Your Deployment

### Test 1: Backend API

```bash
# Test search endpoint (no auth required for this test)
curl https://duellist-backend.onrender.com/api/search/users?email=test@example.com
```

### Test 2: Full Flow (Browser)

1. Go to your Vercel frontend URL
2. Sign up with new account: `test@example.com` / `password123`
3. Create a task: "Test task"
4. Verify in database (optional):
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM \"Task\";"
   ```

### Test 3: Real-time Sync

1. Open frontend in 2 browsers side-by-side
2. Sign in both with same account
3. Create task in Browser 1
4. Verify it appears instantly in Browser 2 ✨

### Test 4: Friend System

1. Create 2 accounts: `alice@example.com` and `bob@example.com`
2. Sign in as Alice
3. Search for Bob by email → Send friend request
4. Sign in as Bob in new browser
5. Accept friend request in Bob's account
6. View Alice's tasks in Bob's account → Should show Bob's tasks
7. Bob creates new task → Alice sees it instantly! 🎉

---

## Post-Deployment Monitoring

### Check Logs

Render dashboard → Select your service → Logs tab

Look for:
```
Server running on port 3000
Listening on...
```

### Monitor Database

```bash
# Check user count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"

# Check tasks
psql $DATABASE_URL -c "SELECT * FROM \"Task\" LIMIT 5;"

# Check friend requests
psql $DATABASE_URL -c "SELECT * FROM \"FriendRequest\" LIMIT 5;"
```

### Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Cannot find module 'express'` | `npm install` didn't run. Increase build timeout in Render settings |
| `CONNECTION REFUSED` on DATABASE_URL | Check DATABASE_URL is correct and Neon is running |
| `CORS error in console` | Update `FRONTEND_URL` environment variable |
| `Socket.io connection fails` | Check `REACT_APP_API_URL` in frontend env vars |

---

## Scaling Tips

### Render Tier Comparison

| Feature | Free | Starter ($7/mo) | Standard ($25+/mo) |
|---------|------|---|---|
| Uptime | 99.5% | 99.99% | 99.99% |
| Sleep | Spins down after 15min | Always on | Always on |
| Resources | Limited | Generous | Scalable |
| Best for | Dev/Testing | Production | High traffic |

**Recommendation**: Start on Free, upgrade as users grow

### Optimize Database Queries

Prisma already optimizes for you, but:

```javascript
// Good - only fetch needed fields
const task = await prisma.task.findUnique({
  where: { id },
  select: { text: true, completed: true }
});

// Better - batch queries
const tasks = await prisma.task.findMany({
  where: { userId },
  take: 50 // Limit results
});
```

### Cache Frequently Used Data

Consider Redis for:
- Friend lists
- Recent tasks
- Search results

(Add later if needed)

---

## Production Checklist

Before going live with real users:

- [ ] Backend deployed and responding
- [ ] Database schema created (via Prisma)
- [ ] Authentication tested (sign up/sign in)
- [ ] Tasks CRUD working
- [ ] Real-time updates working (Socket.io)
- [ ] Friend system tested end-to-end
- [ ] Error handling working
- [ ] Frontend AND backend error messages user-friendly
- [ ] Rate limiting configured (optional but recommended)
- [ ] Database backups enabled (Neon handles this)
- [ ] Monitoring set up (check logs regularly)
- [ ] Performance tested with multiple users

---

## Alternative Backend Hosts

If not using Render:

### Railway.app
```
+ Simple GitHub integration
+ Good free tier
- Slightly limited
Deploy to: railway.app/new
```

### Heroku (Paid)
```
+ Industry standard
+ Easy scaling
- No longer has free tier ($7/mo minimum)
```

### DigitalOcean App Platform
```
+ Highly scalable
+ Better pricing at scale
- More complex setup
```

### Fly.io
```
+ Fast global deployment
+ Good pricing
- Learning curve
```

**Recommendation: Stick with Render.com** (easiest + free option)

---

## Troubleshooting Deployment

### Backend won't start

Check Render logs:
```
Error: Cannot find module
→ npm install didn't complete. Increase timeout in Render settings.

Error: ENOENT: no such file
→ Root Directory should be 'server', not '.'

Error: listen EADDRINUSE
→ PORT already in use. Ensure PORT env var is set to 3000
```

### Database connection fails

```
Error: getaddrinfo ENOTFOUND host
→ Check DATABASE_URL in environment variables

Error: password authentication failed
→ DATABASE_URL invalid. Copy again from Neon

Error: database does not exist
→ Run `npm run prisma:push` after deployment
```

### Socket.io not connecting

```
Error: WebSocket connection to 'ws://...' failed
→ Check REACT_APP_API_URL in frontend environment

Error: connect.failed (from browser console)
→ CORS not configured. Update FRONTEND_URL in backend
```

### Real-time updates not working

```
Symptoms: Create task, doesn't appear on friend's screen

Check:
1. Both users connected to same Socket.io server
2. Backend is broadcasting events
3. Socket.io imported in src/api/client.js
4. Listeners set up in TaskContext.jsx
```

---

## Next Steps After Deployment

1. **Test with real users** - Invite friends to test
2. **Gather feedback** - What features are missing?
3. **Monitor performance** - Check Render dashboard
4. **Scale as needed** - Upgrade Render tier if traffic grows
5. **Add features** - Leaderboard, Pomodoro, etc.

---

## Support

If stuck:
1. Check Render logs
2. Check browser console (DevTools)
3. Test API endpoints with curl
4. Verify environment variables

**Getting help:**
- Render docs: https://render.com/docs
- Express docs: https://expressjs.com
- Prisma docs: https://prisma.io/docs
- Socket.io docs: https://socket.io/docs

---

**Your backend is now deployed! The app is live.** 🎉

Time to invite friends and start collaborating! 🚀
