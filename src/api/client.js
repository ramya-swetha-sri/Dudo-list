import io from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const socket = io(API_BASE_URL);

// Store auth token
let authToken = localStorage.getItem('authToken');

// Update token when it changes
export const setAuthToken = (token) => {
  authToken = token;
  localStorage.setItem('authToken', token);
};

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

export const onTaskCreated = (callback) => {
  socket.on('task:created', callback);
};

export const onTaskUpdated = (callback) => {
  socket.on('task:updated', callback);
};

export const onTaskDeleted = (callback) => {
  socket.on('task:deleted', callback);
};

export const onFriendRequestReceived = (callback) => {
  socket.on('friendRequest:received', callback);
};

export const onFriendRequestAccepted = (callback) => {
  socket.on('friendRequest:accepted', callback);
};

export const onFriendRemoved = (callback) => {
  socket.on('friend:removed', callback);
};

// Cleanup listeners
export const offTaskCreated = () => socket.off('task:created');
export const offTaskUpdated = () => socket.off('task:updated');
export const offTaskDeleted = () => socket.off('task:deleted');
export const offFriendRequestReceived = () => socket.off('friendRequest:received');
export const offFriendRequestAccepted = () => socket.off('friendRequest:accepted');
export const offFriendRemoved = () => socket.off('friend:removed');

export default socket;
