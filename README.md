# Dudo — Smart Task & Productivity Manager

Dudo is a productivity application that helps users manage tasks, connect with friends, and stay focused using real-time updates and a Pomodoro timer.

## Tech Stack

- **Frontend**: React 19, Vite, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL via [Prisma ORM](https://www.prisma.io/)
- **Auth**: JWT (JSON Web Tokens)

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database (e.g., [Neon](https://neon.tech) — free tier available)

### 1. Clone the repository

```bash
git clone https://github.com/ramya-swetha-sri/Dudo-list.git
cd Dudo-list
```

### 2. Configure the backend environment

Copy the example env file and fill in your values:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your database and JWT settings:

```env
# PostgreSQL connection string (Neon, Supabase, Railway, etc.)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT secret — use a long random string in production
JWT_SECRET=your-super-secret-key-change-this

# Port for the backend server
PORT=3000

# Frontend URL for CORS (must match where your frontend runs)
FRONTEND_URL=http://localhost:5173

# Optional: email notifications for friend requests
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Install dependencies and initialise the database

Run this once after cloning (or when the schema changes):

```bash
npm run setup
```

This command:
1. Installs frontend `node_modules`
2. Installs server `node_modules`
3. Generates the Prisma client
4. Pushes the database schema to your PostgreSQL instance

### 4. Start development servers

```bash
npm run dev:all
```

This starts both servers concurrently:

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

Or run them separately in two terminals:

```bash
# Terminal 1 — frontend
npm run dev

# Terminal 2 — backend
npm run server:dev
```

### 5. Build for production

```bash
npm run build
```

---

## Available Scripts

| Command              | Description                                          |
|----------------------|------------------------------------------------------|
| `npm run setup`      | Install all deps + generate Prisma client + push DB  |
| `npm run dev:all`    | Run frontend and backend together (concurrently)     |
| `npm run dev`        | Frontend only (Vite dev server)                      |
| `npm run server:dev` | Backend only (auto-restarts on file changes)         |
| `npm run build`      | Build frontend for production                        |
| `npm run deploy`     | Build frontend and deploy to Vercel                  |

---

## Features

- **Task Management** — Create, complete, and delete personal and group tasks
- **Friends** — Send/accept friend requests and view friends' tasks in real-time
- **Pomodoro Timer** — Built-in focus timer
- **Leaderboard** — Track productivity across friends
- **Themes** — Customisable colour themes per section
- **Real-time sync** — Socket.io keeps all clients in sync instantly

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full Vercel + backend hosting instructions.

