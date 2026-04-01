import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

const prisma = new PrismaClient();

// Map to track which user is connected via which socket
const userSocketMap = new Map();

// Middleware
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ============ DATABASE HEALTH CHECK ============

const verifyDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
};

// Auth Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (_err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTH ROUTES ============

// Sign up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName: displayName || email.split('@')[0]
      }
    });

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Sign in
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signin failed' });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a simple 6-digit token for this example
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires }
    });

    // In a real app, send email. Here, we'll return it for testing.
    res.json({ message: 'Reset token generated', resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Forgot password request failed' });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.resetToken !== resetToken || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Reset password failed' });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', async (req, res) => {
  try {
    const dbHealthy = await verifyDatabaseConnection();
    if (dbHealthy) {
      res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } else {
      res.status(503).json({ status: 'error', database: 'disconnected' });
    }
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

// ============ TASK ROUTES ============

// Get user's tasks
app.get('/api/tasks', verifyToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task
app.post('/api/tasks', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    const task = await prisma.task.create({
      data: {
        text,
        userId: req.user.id
      }
    });

    // Emit to user's room and broadcast to friends
    io.to(`user:${req.user.id}`).emit('task:created', { userId: req.user.id, task });
    io.emit('friend-task:created', { userId: req.user.id, task });

    console.log(`Task created: ${task.id} by user ${req.user.id}`);
    res.json(task);
  } catch (err) {
    console.error('Error creating task:', err.message);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, text } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(completed !== undefined && { completed }),
        ...(text && { text })
      }
    });

    // Emit to user's room and broadcast to friends
    io.to(`user:${req.user.id}`).emit('task:updated', { userId: req.user.id, task });
    io.emit('friend-task:updated', { userId: req.user.id, task });

    console.log(`Task updated: ${id} by user ${req.user.id} - completed: ${task.completed}`);
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err.message);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({ where: { id } });

    // Emit to user's room and broadcast to friends
    io.to(`user:${req.user.id}`).emit('task:deleted', { userId: req.user.id, taskId: id });
    io.emit('friend-task:deleted', { userId: req.user.id, taskId: id });

    console.log(`Task deleted: ${id} by user ${req.user.id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting task:', err.message);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ============ FRIEND ROUTES ============

// Get user's friends
app.get('/api/friends', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        friends: {
          select: { id: true, email: true, displayName: true }
        }
      }
    });

    res.json(user.friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Get friend's tasks
app.get('/api/friends/:friendId/tasks', verifyToken, async (req, res) => {
  try {
    const { friendId } = req.params;

    // Check if they're friends
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { friends: { where: { id: friendId } } }
    });

    if (user.friends.length === 0) {
      return res.status(403).json({ error: 'Not friends' });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: friendId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch friend tasks' });
  }
});

// Search users
app.get('/api/search/users', verifyToken, async (req, res) => {
  try {
    const { email } = req.query;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, displayName: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Send friend request
app.post('/api/friend-requests', verifyToken, async (req, res) => {
  try {
    const { toId } = req.body;

    if (toId === req.user.id) {
      return res.status(400).json({ error: 'Cannot add yourself' });
    }

    const request = await prisma.friendRequest.create({
      data: {
        fromId: req.user.id,
        toId
      }
    });

    // Emit to recipient
    io.emit('friendRequest:received', {
      toId,
      request: {
        id: request.id,
        fromId: request.fromId
      }
    });

    res.json(request);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Request already sent' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to send request' });
  }
});

// Get friend requests
app.get('/api/friend-requests', verifyToken, async (req, res) => {
  try {
    const requests = await prisma.friendRequest.findMany({
      where: { toId: req.user.id, status: 'pending' },
      include: {
        from: {
          select: { id: true, email: true, displayName: true }
        }
      }
    });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Accept friend request
app.post('/api/friend-requests/:id/accept', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.friendRequest.update({
      where: { id },
      data: { status: 'accepted' }
    });

    // Add each other as friends
    await prisma.user.update({
      where: { id: request.fromId },
      data: {
        friends: {
          connect: { id: request.toId }
        }
      }
    });

    await prisma.user.update({
      where: { id: request.toId },
      data: {
        friends: {
          connect: { id: request.fromId }
        }
      }
    });

    // Emit to both users
    io.emit('friendRequest:accepted', {
      userId: request.fromId,
      friendId: request.toId
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

// Reject friend request
app.post('/api/friend-requests/:id/reject', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.friendRequest.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// Remove friend
app.post('/api/friends/:friendId/remove', verifyToken, async (req, res) => {
  try {
    const { friendId } = req.params;

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        friends: {
          disconnect: { id: friendId }
        }
      }
    });

    io.emit('friend:removed', {
      userId: req.user.id,
      friendId
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// ============ SOCKET.IO (Real-time) ============

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining with authentication
  socket.on('user:join', (data) => {
    try {
      const { userId, token } = data;
      
      // Verify token
      jwt.verify(token, JWT_SECRET);
      
      // Store socket mapping
      userSocketMap.set(userId, socket.id);
      
      // Join user-specific room for targeted broadcasts
      socket.join(`user:${userId}`);
      socket.join('realtime-updates');
      
      console.log(`User ${userId} joined room: user:${userId}`);
      
      // Notify others that user is online
      io.emit('user:online', { userId, socketId: socket.id });
    } catch (err) {
      console.error('Authentication failed for socket:', err.message);
      socket.emit('auth:error', { message: 'Invalid token' });
    }
  });

  socket.on('disconnect', () => {
    // Find and remove user mapping
    let disconnectedUserId = null;
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        userSocketMap.delete(userId);
        break;
      }
    }
    
    if (disconnectedUserId) {
      console.log(`User ${disconnectedUserId} disconnected from room: user:${disconnectedUserId}`);
      io.emit('user:offline', { userId: disconnectedUserId });
    } else {
      console.log('Unknown user disconnected:', socket.id);
    }
  });

  // Handle reconnection
  socket.on('reconnect', () => {
    console.log('User reconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 3000;

// Verify database connection before starting server
verifyDatabaseConnection().then((isConnected) => {
  if (!isConnected) {
    console.error('\n⚠️  WARNING: Database connection verification failed!');
    console.error('The server will start but database operations may fail.');
    console.error('Check your DATABASE_URL environment variable.\n');
  }

  server.listen(PORT, () => {
    console.log(`\n✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Socket.io listening on ws://localhost:${PORT}`);
    console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('\nServer is ready to accept connections.\n');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await prisma.$disconnect();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
