import io from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Initialize socket but don't connect yet (will connect on login)
const socket = io(API_BASE_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Store auth token and user
let authToken = localStorage.getItem('authToken');
let currentUserId = localStorage.getItem('userId');

// Socket connection state
let isSocketConnected = false;

// Update token and user when authentication changes
export const setAuthToken = (token, userId) => {
  authToken = token;
  currentUserId = userId;
  localStorage.setItem('authToken', token);
  localStorage.setItem('userId', userId);
  
  // Connect socket if not already connected
  if (!isSocketConnected && token) {
    connectSocket();
  }
};

// Connect socket with authentication
export const connectSocket = () => {
  if (isSocketConnected || !authToken || !currentUserId) {
    return;
  }
  
  socket.connect();
  socket.emit('user:join', { userId: currentUserId, token: authToken });
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    isSocketConnected = false;
  }
};

// Socket connection event handlers
socket.on('connect', () => {
  console.log('✓ Connected to server');
  isSocketConnected = true;
  if (authToken && currentUserId) {
    socket.emit('user:join', { userId: currentUserId, token: authToken });
  }
});

socket.on('connect_error', (error) => {
  console.error('✗ Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('✗ Disconnected:', reason);
  isSocketConnected = false;
});

socket.on('auth:error', (data) => {
  console.error('✗ Authentication error:', data.message);
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
});

const getAuthHeader = () => ({
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json'
});

// ============ AUTH ============

export const signup = async (email, password, displayName) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName })
  });

  if (!response.ok) throw new Error('Signup failed');
  return response.json();
};

export const signin = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) throw new Error('Signin failed');
  return response.json();
};

// ============ TASKS ============

export const getTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    headers: getAuthHeader()
  });

  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const createTask = async (text) => {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ text })
  });

  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
};

export const updateTask = async (id, updates) => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(updates)
  });

  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });

  if (!response.ok) throw new Error('Failed to delete task');
  return response.json();
};

// ============ FRIENDS ============

export const getFriends = async () => {
  const response = await fetch(`${API_BASE_URL}/api/friends`, {
    headers: getAuthHeader()
  });

  if (!response.ok) throw new Error('Failed to fetch friends');
  return response.json();
};

export const getFriendTasks = async (friendId) => {
  const response = await fetch(`${API_BASE_URL}/api/friends/${friendId}/tasks`, {
    headers: getAuthHeader()
  });

  if (!response.ok) throw new Error('Failed to fetch friend tasks');
  return response.json();
};

export const searchUsers = async (email) => {
  const response = await fetch(`${API_BASE_URL}/api/search/users?email=${email}`, {
    headers: getAuthHeader()
  });

  if (!response.ok) return null;
  return response.json();
};

export const sendFriendRequest = async (toId) => {
  const response = await fetch(`${API_BASE_URL}/api/friend-requests`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ toId })
  });

  if (!response.ok) throw new Error('Failed to send request');
  return response.json();
};

export const getFriendRequests = async () => {
  const response = await fetch(`${API_BASE_URL}/api/friend-requests`, {
    headers: getAuthHeader()
  });

  if (!response.ok) throw new Error('Failed to fetch requests');
  return response.json();
};

export const acceptFriendRequest = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/friend-requests/${id}/accept`, {
    method: 'POST',
    headers: getAuthHeader()
  });

  if (!response.ok) throw new Error('Failed to accept request');
  return response.json();
};

export const rejectFriendRequest = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/friend-requests/${id}/reject`, {
    method: 'POST',
    headers: getAuthHeader()
  });

  if (!response.ok) throw new Error('Failed to reject request');
  return response.json();
};

export const removeFriend = async (friendId) => {
  const response = await fetch(`${API_BASE_URL}/api/friends/${friendId}/remove`, {
    method: 'POST',
    headers: getAuthHeader()
  });

  if (!response.ok) throw new Error('Failed to remove friend');
  return response.json();
};

// ============ SOCKET.IO (Real-time) ============

// Task events (own tasks)
export const onTaskCreated = (callback) => {
  socket.on('task:created', callback);
};

export const onTaskUpdated = (callback) => {
  socket.on('task:updated', callback);
};

export const onTaskDeleted = (callback) => {
  socket.on('task:deleted', callback);
};

// Friend task events (for seeing friend's task updates)
export const onFriendTaskCreated = (callback) => {
  socket.on('friend-task:created', callback);
};

export const onFriendTaskUpdated = (callback) => {
  socket.on('friend-task:updated', callback);
};

export const onFriendTaskDeleted = (callback) => {
  socket.on('friend-task:deleted', callback);
};

// Friend request events
export const onFriendRequestReceived = (callback) => {
  socket.on('friendRequest:received', callback);
};

export const onFriendRequestAccepted = (callback) => {
  socket.on('friendRequest:accepted', callback);
};

export const onFriendRemoved = (callback) => {
  socket.on('friend:removed', callback);
};

// User presence events
export const onUserOnline = (callback) => {
  socket.on('user:online', callback);
};

export const onUserOffline = (callback) => {
  socket.on('user:offline', callback);
};

// Cleanup listeners
export const offTaskCreated = () => socket.off('task:created');
export const offTaskUpdated = () => socket.off('task:updated');
export const offTaskDeleted = () => socket.off('task:deleted');
export const offFriendTaskCreated = () => socket.off('friend-task:created');
export const offFriendTaskUpdated = () => socket.off('friend-task:updated');
export const offFriendTaskDeleted = () => socket.off('friend-task:deleted');
export const offFriendRequestReceived = () => socket.off('friendRequest:received');
export const offFriendRequestAccepted = () => socket.off('friendRequest:accepted');
export const offFriendRemoved = () => socket.off('friend:removed');
export const offUserOnline = () => socket.off('user:online');
export const offUserOffline = () => socket.off('user:offline');

export default socket;
