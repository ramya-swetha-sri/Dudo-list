# Environment Variables Quick Reference

## 🖥️ Frontend - Local Development

**File:** `.env.local`

```env
# Backend API & Socket.io URL
VITE_API_URL=http://localhost:3000

# Firebase (optional, if using Firebase)
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

## 🖥️ Frontend - Production (Vercel)

**Location:** Vercel Dashboard → Settings → Environment Variables

```env
VITE_API_URL=https://your-backend-api.onrender.com
```

**⚠️ Important:**
- NO trailing slash
- Must match your actual backend URL
- Use HTTPS for production
- Example: `https://duolist-api.onrender.com`

---

## 🗄️ Backend - Local Development

**File:** `server/.env`

```env
# Database Connection (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/duolist

# JWT Secret (make this unique and secure)
JWT_SECRET=your-secret-key-change-this

# Server Port
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
```

---

## 🗄️ Backend - Production (Render/Railway/Heroku)

**Location:** Your hosting service's environment variables dashboard

```env
# Database URL from your database provider
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Generate a secure secret key (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6r7s8t9u0v1w2x3y4z5

# Port (Render/Railway will set this, but include for reference)
PORT=3000

# Your Vercel deployment URL (MUST match exactly)
FRONTEND_URL=https://your-app-name.vercel.app

# Production flag
NODE_ENV=production
```

**⚠️ Critical:**
- `FRONTEND_URL` must match your Vercel URL exactly
- Use `?sslmode=require` in DATABASE_URL for security
- Generate a strong `JWT_SECRET` and never share it

---

## 🚀 Deployment URLs (Examples)

### Backend URLs (Examples)

```bash
# Render.com
https://render-api-name.onrender.com

# Railway.app
https://railway-project-production.up.railway.app

# Heroku (legacy)
https://heroku-app-name.herokuapp.com

# Local Development
http://localhost:3000
```

### Frontend URLs (Examples)

```bash
# Vercel
https://project-name.vercel.app

# Custom Domain
https://app.example.com

# Local Development
http://localhost:5173
```

---

## ✅ Setup Checklist

### Step 1: Local Development Setup

- [ ] `cd server && cp .env.example .env`
- [ ] `npm install && npm run dev` (backend running)
- [ ] `cp .env.local.example .env.local` (frontend)
- [ ] `npm install && npm run dev` (frontend running)
- [ ] Test at http://localhost:5173

### Step 2: Backend Deployment (Render)

- [ ] Create Render account
- [ ] Create PostgreSQL database
- [ ] Note database URL
- [ ] Create Web Service
- [ ] Set environment variables:
  - [ ] `DATABASE_URL` (from database)
  - [ ] `JWT_SECRET` (generate new)
  - [ ] `FRONTEND_URL` (your Vercel URL)
  - [ ] `NODE_ENV=production`
- [ ] Deploy
- [ ] Note backend URL (e.g., https://your-api.onrender.com)

### Step 3: Frontend Deployment (Vercel)

- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Add environment variable:
  - [ ] `VITE_API_URL` (your backend URL)
- [ ] Deploy
- [ ] Note frontend URL (e.g., https://your-app.vercel.app)

### Step 4: Update Backend (After Frontend Deployed)

- [ ] Update backend's `FRONTEND_URL` to Vercel URL
- [ ] Redeploy backend
- [ ] Run migrations on production database
  ```bash
  DATABASE_URL="your_prod_url" npx prisma migrate deploy
  ```

### Step 5: Test Real-Time

- [ ] Open frontend in two browser windows
- [ ] Log in to two different accounts
- [ ] Send friend request from one to other
- [ ] Check browser console: Look for `✓ Connected to server`
- [ ] Verify request appears instantly ✨

---

## 🔒 Security Best Practices

### JWT_SECRET
```bash
# Generate a secure random secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Don't use: "secret123" or "password"
# Do use: Complex random string like: a7f9e2c8d4b1a6f3e9c2d5b8a4f1e6c9
```

### DATABASE_URL
```bash
# Local (development):
postgresql://postgres:password@localhost:5432/duolist

# Production (always use SSL):
postgresql://user:pass@host:port/db?sslmode=require
```

### FRONTEND_URL
```bash
# Must match exactly what's in browser!
# ❌ Wrong: https://your-app.vercel.app/  (has trailing slash)
# ✅ Correct: https://your-app.vercel.app  (no trailing slash)
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to backend"
```
Check:
✓ VITE_API_URL is correct in Vercel
✓ Backend is running and healthy
✓ Backend URL has no trailing slash
✓ Backend FRONTEND_URL matches your Vercel URL
```

### Error: "CORS error"
```
Fix: Backend's FRONTEND_URL must match your Vercel URL exactly
Example: https://my-duolist.vercel.app (not .com, not /app)
```

### Error: "Database connection failed"
```
Check:
✓ DATABASE_URL is correct
✓ Database is running
✓ Database credentials are correct
✓ Firewall allows connection
✓ Use SSL for production: ?sslmode=require
```

### Error: "JWT signature is invalid"
```
Fix: Your JWT_SECRET is different in development vs production
Solution: Verify JWT_SECRET is set correctly in backend
```

---

## 📋 Copy-Paste Templates

### Frontend Vercel Environment Variables
```
VITE_API_URL=[PASTE_YOUR_BACKEND_URL_HERE]
```

### Backend Production Environment Variables
```
DATABASE_URL=[PASTE_YOUR_DATABASE_URL_HERE]
JWT_SECRET=[GENERATE_NEW_RANDOM_STRING]
FRONTEND_URL=[PASTE_YOUR_VERCEL_URL_HERE]
NODE_ENV=production
PORT=3000
```

---

## 🔄 Updating Variables After Deployment

### Frontend (Vercel)
1. Dashboard → Project Settings → Environment Variables
2. Edit `VITE_API_URL`
3. Redeploy (automatic if connected to GitHub)

### Backend (Render)
1. Dashboard → Service → Environment
2. Edit variables
3. Redeploy

---

**Everything set up? Run `npm run dev` (backend) and `npm run dev` (frontend) and start developing! 🚀**
