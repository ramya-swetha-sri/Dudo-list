# DuoList - Deployment Guide

This guide explains how to deploy DuoList with real-time Socket.io functionality to Vercel and a backend service.

## Architecture Overview

- **Frontend**: Deployed on Vercel (static hosting)
- **Backend**: Must be deployed separately (Render, Railway, Heroku, or similar)
- **Database**: PostgreSQL (Neon, Supabase, or similar)
- **Real-time Communication**: Socket.io (WebSocket)

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

```bash
# Install dependencies
npm install

# Build and test locally
npm run build
npm run preview
```

### Step 2: Deploy to Vercel

```bash
# Deploy using Vercel CLI
npm run deploy

# Or connect your GitHub repo to Vercel dashboard:
# 1. Go to https://vercel.com
# 2. Click "Add New" → "Project"
# 3. Connect your GitHub repository
# 4. Configure build settings (already configured in vercel.json)
```

### Step 3: Set Environment Variables

In your Vercel project dashboard:

1. Go to Settings → Environment Variables
2. Add the following variables:

```
VITE_API_URL=https://your-backend-url.example.com
```

Replace `https://your-backend-url.example.com` with your actual backend URL.

## Backend Deployment

### Recommended Services:

1. **Render.com** (Recommended for Node.js + WebSocket)
   - Free tier available
   - Built-in support for WebSockets
   - Easy Redis add-on for scaling

2. **Railway.app**
   - Good performance
   - WebSocket support
   - Pay-as-you-go pricing

3. **Heroku** (Legacy)
   - Paid tiers only
   - WebSocket support available

### Deployment Steps (Example: Render.com)

1. **Create PostgreSQL Database:**
   - Go to Render.com dashboard
   - Create a new PostgreSQL database
   - Copy the connection string

2. **Deploy Node.js Service:**
   ```bash
   # Push your code to GitHub
   git push origin main

   # In Render dashboard:
   # 1. Click "New +" → "Web Service"
   # 2. Connect your GitHub repository
   # 3. Configure:
   #    - Build: npm install
   #    - Start: npm start
   #    - Region: Choose closest to users
   ```

3. **Set Environment Variables:**

   In Render dashboard → Environment:

   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-very-secure-secret-key
   PORT=3000
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   ```

4. **Run Database Migrations:**
   ```bash
   # In your local terminal:
   DATABASE_URL="your-render-db-url" npx prisma migrate deploy
   ```

## Socket.io Configuration for Production

### Server Configuration (`server/.env`)

```env
DATABASE_URL=your_production_db_url
JWT_SECRET=your_production_secret_key
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### CORS Settings

The server is configured with CORS for Socket.io:

```javascript
// In server/src/server.js
cors: {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}
```

Make sure `FRONTEND_URL` environment variable matches your Vercel deployment URL.

### Frontend API URL (`client/.env.production`)

```env
VITE_API_URL=https://your-backend-url.example.com
```

This must point to your backend service URL without trailing slash.

## Real-time Features Enabled

✅ **Friend Requests** - Instant notifications when you receive a friend request
✅ **Friend Request Status** - Real-time accept/reject feedback
✅ **Friend List Updates** - Automatic sync when friends are added/removed
✅ **User Presence** - Know when friends go online/offline
✅ **Task Updates** - See friend task changes in real-time

## Testing Real-time Functionality

### Local Testing

1. Start the backend:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in two browser windows

4. Test friend requests:
   - Send a friend request from one user to another
   - Accept/reject the request
   - Verify it updates in real-time on both windows

### Production Testing

1. Access your Vercel deployment: https://your-frontend.vercel.app
2. Open in two different browser instances
3. Test friend requests across instances
4. Check browser DevTools Console for Socket.io connection status

## Troubleshooting

### Socket.io Not Connecting

1. **Check Backend URL:** Verify `VITE_API_URL` in Vercel matches your backend URL
2. **Check CORS:** Ensure `FRONTEND_URL` in backend matches your Vercel URL
3. **Check Backend Status:** Make sure your backend service is running and healthy
4. **Check Firewall:** Ensure WebSocket connections (port 443 for secure) are not blocked

### WebSocket Connection Errors

```
❌ Connection error: Error during WebSocket handshake...
```

**Solutions:**
- Verify backend URL is correct and accessible
- Check backend CORS configuration
- Ensure backend service is running
- Check for SSL certificate issues

### Database Connection Errors

```
✗ Database connection failed...
```

**Solutions:**
- Verify `DATABASE_URL` is correct
- Check database is running and accessible
- Verify database user has proper permissions
- Run migrations: `npx prisma migrate deploy`

## Scaling Considerations

### For Multiple Instances (Multiple Backend Servers)

If you scale to multiple backend instances, you'll need to use a message broker:

1. **Add Redis:**
   - Use Socket.io adapter for Redis
   - Install: `npm install socket.io-redis`

2. **Update server configuration:**
   ```javascript
   import { RedisAdapter } from "socket.io-redis";
   
   io.adapter(new RedisAdapter(redisClient, redisClient));
   ```

### Environment Variables for Scaling

```env
REDIS_URL=redis://host:port
```

## Security Checklist

- [ ] JWT_SECRET is different from example and very secure
- [ ] DATABASE_URL uses SSL connection (`?sslmode=require`)
- [ ] FRONTEND_URL exactly matches your Vercel URL
- [ ] Database backups are configured
- [ ] API rate limiting is enabled (optional: add express-rate-limit)
- [ ] HTTPS is enforced (Vercel does this automatically)

## Monitoring

Monitor your deployment:

1. **Vercel Dashboard**: https://vercel.com/dashboard
   - View build logs
   - Check deployment status
   - Monitor real-time metrics

2. **Backend Service Dashboard** (Render/Railway):
   - Check service health
   - View server logs
   - Monitor resource usage

3. **Database Dashboard** (Neon/Supabase):
   - Monitor query performance
   - Check for errors
   - View connection stats

## Common Issues & Solutions

### Issue: Requests work but real-time doesn't
**Solution**: Check that `VITE_API_URL` ends without a slash and matches your backend exactly.

### Issue: Friends see each other's requests but not instantly
**Solution**: Verify Socket.io connection on both clients by checking browser console for "✓ Connected to server"

### Issue: Database migrations fail on deploy
**Solution**: Run migrations manually:
```bash
DATABASE_URL="production_url" npx prisma migrate deploy
```

### Issue: Vercel shows blank page
**Solution**: 
1. Check build logs in Vercel dashboard
2. Verify dependencies are installed
3. Check for build errors: `npm run build`

## Next Steps

- Set up automatic email notifications for friend requests
- Add data persistence for offline users
- Implement read receipts for friend requests
- Add request expiration (e.g., 30 days)
- Implement request limits to prevent spam

## Support

For issues with:
- **Socket.io**: Check Socket.io documentation: https://socket.io/docs/
- **Vercel**: Visit Vercel support: https://vercel.com/support
- **Prisma**: Check Prisma docs: https://www.prisma.io/docs/
- **This app**: Check GitHub issues or create new one
