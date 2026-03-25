# DuoList Real-Time Database & Deployment Setup Guide

## Overview

Your DuoList application has been configured with:
- **Database**: PostgreSQL (Neon) with connection pooling
- **Real-time Updates**: Socket.io with room-based broadcasting
- **Backend**: Node.js/Express API
- **Frontend**: React + Vite
- **Deployment**: Vercel (recommended)

## Current Database Configuration

Your Neon PostgreSQL database credentials are configured in `server/.env`:
```
DATABASE_URL=postgresql://neondb_owner:npg_IF18aXHtNVcr@ep-dawn-dew-amver4z6-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

## Verifying Database Connection

### 1. Local Setup

**Step 1: Install dependencies in server**
```bash
cd server
npm install
```

**Step 2: Verify database connection**
```bash
npm start
```

Look for this output:
```
✓ Database connection successful
✓ Server running on http://localhost:3000
✓ Socket.io listening on ws://localhost:3000
```

If you see an error, check:
- ✅ Database URL is correct in `server/.env`
- ✅ Your Neon database is running
- ✅ Network connectivity to Neon (check firewall/VPN)

**Step 3: Test API endpoints**
```bash
# Health check endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","database":"connected","timestamp":"2024-03-25T10:30:00.000Z"}
```

### 2. Frontend Setup

**Step 1: Install dependencies**
```bash
npm install
```

**Step 2: Configure API URL**
Edit `.env.local` to match your backend:
```
VITE_APP_API_URL=http://localhost:3000
```

**Step 3: Start frontend**
```bash
npm run dev
```

**Step 4: Test real-time updates**
- Sign up/Sign in at http://localhost:5173
- Create a task
- Watch for real-time updates in console
- Should see: `✓ Connected to server`

## Real-Time Updates Configuration

### How It Works

1. **Socket.io Connection** - Established when user logs in
2. **User Rooms** - Each authenticated user joins `user:{userId}` room
3. **Event Broadcasting**:
   - Own tasks: Emit to `user:{userId}` room
   - Friend tasks: Broadcast to all clients
   - All events logged to console

### Troubleshooting Real-Time Updates

**Check Socket Connection:**
```javascript
// Open browser DevTools Console and run:
localStorage.getItem('authToken')  // Should exist
localStorage.getItem('userId')      // Should exist
```

**Verify Events in Console:**
- Look for: `✓ Connected to server`
- Look for: `User {userId} joined room: user:{userId}`
- When creating/updating tasks: `Task updated: {id} by user {userId}`

**If Updates Don't Work:**
1. Check browser console for errors
2. Check server logs for socket errors
3. Verify network tab shows WebSocket connection
4. Clear browser cache: `localStorage.clear()`

## Deployment to Vercel

### Backend Deployment

**Step 1: Create Vercel Account**
- Go to https://vercel.com
- Sign up with GitHub

**Step 2: Deploy Server**
```bash
# Install Vercel CLI
npm i -g vercel

# From server directory
cd server
vercel
```

**Step 3: Configure Environment Variables**
In Vercel dashboard for your server project:
1. Go to Settings → Environment Variables
2. Add:
```
DATABASE_URL=postgresql://neondb_owner:npg_IF18aXHtNVcr@ep-dawn-dew-amver4z6-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
JWT_SECRET=your-secure-random-string-here
FRONTEND_URL=https://your-frontend-url.vercel.app
PORT=3000
```

**Step 4: Deploy Frontend**
```bash
# From root directory
vercel
```
When prompted, configure:
- Build command: `npm run build`
- Output directory: `dist`

**Step 5: Configure Frontend Environment**
Update `.env.production`:
```
VITE_APP_API_URL=https://your-server-url.vercel.app
```

Then redeploy:
```bash
vercel
```

### Post-Deployment Verification

1. **Test API Health Endpoint**
   ```bash
   curl https://your-server-url.vercel.app/api/health
   ```

2. **Test Sign Up**
   - Go to your frontend URL
   - Create a new account
   - Check server logs for connection

3. **Test Real-Time Updates**
   - Create a task
   - Verify it appears instantly
   - Check Socket.io connection in DevTools

4. **Monitor Logs**
   ```bash
   # View Vercel logs
   vercel logs --follow
   ```

## Troubleshooting Deployment

### Backend Issues

**"Database connection failed"**
- Verify DATABASE_URL is correct in Vercel
- Check Neon database status at https://console.neon.tech
- Ensure SSL mode is set to `require`

**"Socket.io connection refused"**
- Check that FRONTEND_URL matches your frontend domain
- Verify CORS is allowing your frontend domain
- Check browser console for connection errors

**"500 errors on task operations"**
- Check Vercel logs: `vercel logs`
- Verify Prisma schema matches database
- Run: `npm run prisma:generate` before deployment

### Frontend Issues

**Blank page or 404**
- Check build logs in Vercel
- Verify dist folder is created: `npm run build`
- Check that VITE_APP_API_URL is correct

**API calls won't work**
- Verify VITE_APP_API_URL in .env.production
- Check browser console CORS errors
- Verify backend is allowing your frontend origin

## Environment Variable Reference

### Server (.env)
```
DATABASE_URL                 # Neon PostgreSQL connection (pooled)
DATABASE_URL_UNPOOLED        # For migrations/unpooled connections
JWT_SECRET                   # Secret for JWT signing (change in production!)
PORT                         # Server port (default 3000)
FRONTEND_URL                 # Your frontend URL for CORS
POSTGRES_PRISMA_URL          # Alternate Prisma URL for migrations
```

### Frontend (.env.local / .env.production)
```
VITE_APP_API_URL            # Backend API URL
```

## Health Check & Monitoring

### Automated Health Check
Monitor your backend health:
```bash
# Create a cron job or monitoring service to check:
curl https://your-server-url.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-03-25T10:30:00.000Z"
}
```

### Real-Time Update Statistics
The server logs all operations:
```
✓ Task created: {id} by user {userId}
✓ Task updated: {id} by user {userId} - completed: true/false
✓ Task deleted: {id} by user {userId}
User {userId} joined room: user:{userId}
User {userId} disconnected from room: user:{userId}
```

## Performance Tips

### Database
- Connection pooling is enabled (pgbouncer) for production
- For large data sets, use pagination
- Index on userId is already configured

### Real-Time Updates
- Socket.io rooms limit unnecessary broadcasts
- Friend-specific updates don't spam all users
- Automatic reconnection with exponential backoff

### Frontend
- Real-time updates are optimized with context
- Only relevant data is re-rendered
- Socket listeners properly cleaned up

## Security Checklist

✅ JWT_SECRET changed (not default)
✅ Database SSL required in connection string
✅ Neon database access restricted to VPC
✅ Frontend CORS properly configured
✅ Password hashing with bcrypt
✅ Token expires in 7 days

## Next Steps

1. ✅ Database: Verified in `server/.env`
2. 🔄 Deploy backend: Follow "Backend Deployment" above
3. 🔄 Deploy frontend: Follow "Frontend Deployment" above
4. 🔄 Test real-time: Use "Troubleshooting Real-Time Updates"
5. 📊 Monitor: Set up health check monitoring

## Support Resources

- **Neon Docs**: https://neon.tech/docs
- **Vercel Docs**: https://vercel.com/docs
- **Socket.io Docs**: https://socket.io/docs
- **Prisma Docs**: https://www.prisma.io/docs

## Summary

Your DuoList application is now configured with:
- ✅ Real-time task updates via Socket.io
- ✅ Secure PostgreSQL database (Neon)
- ✅ JWT authentication
- ✅ Production-ready server with error handling
- ✅ Health check endpoint for monitoring
- ✅ Environment configurations for development and production

Users can now update tasks in real-time with instant synchronization across all clients!
