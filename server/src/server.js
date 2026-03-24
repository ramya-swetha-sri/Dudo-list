import express from 'express';
import cors from 'express-cors';
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
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
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
    console.error(err);
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

    // Emit to all connected clients
    io.emit('task:created', { userId: req.user.id, task });

    res.json(task);
  } catch (err) {
    console.error(err);
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

    // Emit to all connected clients
    io.emit('task:updated', { userId: req.user.id, task });

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({ where: { id } });

    // Emit to all connected clients
    io.emit('task:deleted', { userId: req.user.id, taskId: id });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
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

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
