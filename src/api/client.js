import io from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Validate and normalize the API URL
const normalizeApiUrl = (url) => {
  if (!url) return 'http://localhost:3000';
  // Remove trailing slash if present
  return url.replace(/\/$/, '');
};

const NORMALIZED_URL = normalizeApiUrl(API_BASE_URL);

// Initialize socket but don't connect yet (will connect on login)
const socket = io(NORMALIZED_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'] // Fallback to polling if WebSocket fails
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
  console.log('✓ Connected to server at', NORMALIZED_URL);
  isSocketConnected = true;
  if (authToken && currentUserId) {
    socket.emit('user:join', { userId: currentUserId, token: authToken });
  }
});

socket.on('connect_error', (error) => {
  console.error('✗ Connection error:', error.message);
  
  // Detailed error diagnostics
  if (NORMALIZED_URL.includes('localhost')) {
    console.warn('ℹ️ Local development: Ensure backend is running at', NORMALIZED_URL);
  } else {
    console.warn('ℹ️ Production: Check that VITE_API_URL environment variable is correct');
    console.warn('ℹ️ Backend URL:', NORMALIZED_URL);
  }
});

socket.on('disconnect', (reason) => {
  console.log('✗ Disconnected:', reason);
  isSocketConnected = false;
  
  // Provide helpful context for different disconnection reasons
  if (reason === 'io server disconnect') {
    console.warn('ℹ️ Server closed connection. Check server logs.');
  } else if (reason === 'transport close') {
    console.warn('ℹ️ Network connection lost. Checking for reconnection...');
  }
});

socket.on('auth:error', (data) => {
  console.error('✗ Authentication error:', data.message);
  console.warn('ℹ️ Your session may have expired. Please log in again.');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
});

const getAuthHeader = () => ({
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json'
});

// ============ AUTH ============

export const signup = async (email, password, displayName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }
    
    return data;
  } catch (err) {
    console.error('Signup error:', err);
    throw err;
  }
};

export const signin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Signin failed');
    }
    
    return data;
  } catch (err) {
    console.error('Signin error:', err);
    throw err;
  }
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!response.ok) throw new Error('Password reset request failed');
  return response.json();
};

export const resetPassword = async (email, resetToken, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, resetToken, newPassword })
  });

  if (!response.ok) throw new Error('Password reset failed');
  return response.json();
};

export const updateProfile = async (updates) => {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(updates)
  });

  if (!response.ok) throw new Error('Failed to update profile');
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

export const createTask = async (text, taskType = 'personal') => {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ text, taskType })
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

export const sendInvitation = async (inviteeEmail) => {
  const response = await fetch(`${API_BASE_URL}/api/invite`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ inviteeEmail })
  });

  if (!response.ok) throw new Error('Failed to send invitation');
  return response.json();
};

// ============ NOTES ============

export const createNote = async (noteData) => {
  const response = await fetch(`${API_BASE_URL}/api/notes`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(noteData)
  });

  if (!response.ok) throw new Error('Failed to create note');
  return response.json();
};

export const getNotes = async () => {
  const response = await fetch(`${API_BASE_URL}/api/notes`, {
    headers: getAuthHeader()
  });

  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
};

export const updateNote = async (noteId, updates) => {
  const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(updates)
  });

  if (!response.ok) throw new Error('Failed to update note');
  return response.json();
};

export const deleteNote = async (noteId) => {
  const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });

  if (!response.ok) throw new Error('Failed to delete note');
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

export const onFriendRequestRejected = (callback) => {
  socket.on('friendRequest:rejected', callback);
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
export const offFriendRequestRejected = () => socket.off('friendRequest:rejected');
export const offFriendRemoved = () => socket.off('friend:removed');
export const offUserOnline = () => socket.off('user:online');
export const offUserOffline = () => socket.off('user:offline');

export default socket;
