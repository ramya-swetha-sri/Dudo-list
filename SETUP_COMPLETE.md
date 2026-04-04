# 🚀 DuoTask - Setup Complete!

## ✅ System Status
- ✅ Backend Server: **Running** on http://localhost:3000
- ✅ Frontend Server: **Running** on http://localhost:5173  
- ✅ Database: **Connected** (Neon PostgreSQL)
- ✅ All Dependencies: **Installed**

## 🌐 Access the Application

Open your browser and go to: **http://localhost:5173**

### First Time Setup:
1. Click "Sign Up" tab
2. Enter:
   - **Display Name**: Your name
   - **Email**: Your email
   - **Password**: At least 6 characters
3. Click "Create Account"
4. You'll be redirected to My Tasks page ✨

### Demo Account (Optional):
- **Email**: demo@test.com
- **Password**: demo123456
- **Display Name**: Demo User

## 📊 Features Available

### 📝 My Tasks
- Create and manage personal tasks
- Mark tasks as complete
- Delete tasks

### 👥 Friend Tasks
- View tasks from friends
- Send friend requests
- Accept/reject friend requests

### 🤝 Group Tasks
- Create group tasks
- Collaborate with team members
- Share workload

### 📝 Notes
- Write and organize notes
- Color-code notes
- Quick access

### ⏱️ Pomodoro Timer
- Built-in focus timer
- Work in focused intervals
- Track productivity

### 👤 Profile
- Update display name
- Customize theme colors
- Manage account settings

## 🔧 Running the Servers

Both servers are already running in the background terminals.

### If you need to restart:

**Backend** (Terminal 1):
```bash
cd server
npm run dev
```

**Frontend** (Terminal 2):
```bash
# In root directory
npm run dev
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Tasks
- `GET /api/tasks` - Get your tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Friends
- `GET /api/friends` - Get friends list
- `GET /api/friends/:friendId/tasks` - Get friend's tasks
- `POST /api/friend-requests` - Send friend request
- `GET /api/friend-requests` - Get friend requests
- `PUT /api/friend-requests/:id/accept` - Accept request

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## 🐛 Troubleshooting

### Blank or white screen?
- Press `F12` to open Developer Console
- Check for any JavaScript errors
- Try refreshing the page (Ctrl+R / Cmd+R)

### "Cannot GET /api..." error?
- Make sure backend is running on port 3000
- Check terminal for backend errors

### Database connection error?
- Verify `.env` file in `/server` has correct DATABASE_URL
- Current database: **Neon PostgreSQL** (cloud-hosted)

### Login not working?
- Make sure you created an account first (not just attempting to sign in)
- Check that email and password are correct
- Try creating a new test account

## 📝 Project Structure

```
/
├── src/                 # Frontend React code
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── context/        # React Context (state management)
│   ├── api/            # API client
│   └── App.jsx         # Main app component
├── server/             # Backend Express server
│   ├── src/
│   │   ├── server.js   # Main server file
│   │   └── services/   # Business logic
│   ├── prisma/         # Database schema
│   └── .env            # Environment variables
└── public/             # Static assets
```

## 🎨 Technology Stack

### Frontend
- React 19
- Vite (build tool)
- React Router (navigation)
- Socket.io (real-time updates)
- Framer Motion (animations)

### Backend
- Express.js (server framework)
- Prisma (ORM)
- PostgreSQL (database)
- Socket.io (real-time)
- JWT (authentication)
- Bcrypt (password hashing)

## 🚀 What's Next?

1. **Create tasks** - Add your first task
2. **Add friends** - Send friend requests by email
3. **Collaborate** - Create group tasks
4. **Customize** - Change theme colors in settings
5. **Stay productive** - Use Pomodoro timer!

---

**Enjoy organizing your tasks with DuoTask! 🎉**
