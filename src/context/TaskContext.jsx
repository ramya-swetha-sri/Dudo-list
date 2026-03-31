import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api/client';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendTasksData, setFriendTasksData] = useState({});

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const userData = localStorage.getItem('user');

    if (token && userId && userData) {
      api.setAuthToken(token, userId);
      api.connectSocket();
      setUser(JSON.parse(userData));
      loadUserData();
    }

    setLoading(false);
  }, []);

  const loadUserData = async () => {
    try {
      const [tasksData, friendsData, requestsData] = await Promise.all([
        api.getTasks(),
        api.getFriends(),
        api.getFriendRequests()
      ]);

      setTasks(tasksData);
      setFriends(friendsData);
      setFriendRequests(requestsData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading user data:', err);
    }
  };

  // Real-time listeners
  useEffect(() => {
    if (!user) return;

    // Own task events
    api.onTaskCreated(({ userId, task }) => {
      if (userId === user.id) {
        setTasks(prev => [task, ...prev]);
      }
    });

    api.onTaskUpdated(({ userId, task }) => {
      if (userId === user.id) {
        setTasks(prev =>
          prev.map(t => t.id === task.id ? task : t)
        );
      }
    });

    api.onTaskDeleted(({ userId, taskId }) => {
      if (userId === user.id) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    });

    // Friend task events (for real-time updates)
    api.onFriendTaskCreated(({ userId, task }) => {
      if (userId !== user.id) {
        setFriendTasksData(prev => ({
          ...prev,
          [userId]: [task, ...(prev[userId] || [])]
        }));
      }
    });

    api.onFriendTaskUpdated(({ userId, task }) => {
      if (userId !== user.id) {
        setFriendTasksData(prev => ({
          ...prev,
          [userId]: (prev[userId] || []).map(t => t.id === task.id ? task : t)
        }));
      }
    });

    api.onFriendTaskDeleted(({ userId, taskId }) => {
      if (userId !== user.id) {
        setFriendTasksData(prev => ({
          ...prev,
          [userId]: (prev[userId] || []).filter(t => t.id !== taskId)
        }));
      }
    });

    // Friend request events
    api.onFriendRequestReceived(({ toId, request }) => {
      if (toId === user.id) {
        api.getFriendRequests().then(setFriendRequests);
      }
    });

    api.onFriendRequestAccepted(({ userId, friendId }) => {
      if (userId === user.id || friendId === user.id) {
        api.getFriends().then(setFriends);
      }
    });

    api.onFriendRemoved(({ userId, friendId }) => {
      if (userId === user.id || friendId === user.id) {
        api.getFriends().then(setFriends);
      }
    });

    // User presence events
    api.onUserOnline(({ userId }) => {
      console.log(`User ${userId} is online`);
    });

    api.onUserOffline(({ userId }) => {
      console.log(`User ${userId} is offline`);
    });

    return () => {
      api.offTaskCreated();
      api.offTaskUpdated();
      api.offTaskDeleted();
      api.offFriendTaskCreated();
      api.offFriendTaskUpdated();
      api.offFriendTaskDeleted();
      api.offFriendRequestReceived();
      api.offFriendRequestAccepted();
      api.offFriendRemoved();
      api.offUserOnline();
      api.offUserOffline();
    };
  }, [user]);

  const signup = async (email, password, displayName) => {
    try {
      const { token, user: userData } = await api.signup(email, password, displayName);
      api.setAuthToken(token, userData.id);
      api.connectSocket();
      setUser(userData);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('user', JSON.stringify(userData));
      await loadUserData();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const signin = async (email, password) => {
    try {
      const { token, user: userData } = await api.signin(email, password);
      api.setAuthToken(token, userData.id);
      api.connectSocket();
      setUser(userData);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('user', JSON.stringify(userData));
      await loadUserData();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const signout = () => {
    api.disconnectSocket();
    setUser(null);
    setTasks([]);
    setFriends([]);
    setFriendRequests([]);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
  };

  const forgotPasswordToken = async (email) => {
    try {
      const { resetToken } = await api.forgotPassword(email);
      return resetToken;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const performResetPassword = async (email, resetToken, newPassword) => {
    try {
      await api.resetPassword(email, resetToken, newPassword);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const addTask = async (text) => {
    try {
      await api.createTask(text);
    } catch (err) {
      setError(err.message);
      console.error('Error adding task:', err);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await api.updateTask(taskId, { completed: !task.completed });
    } catch (err) {
      setError(err.message);
      console.error('Error toggling task:', err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting task:', err);
    }
  };

  const searchUsers = async (email) => {
    try {
      return await api.searchUsers(email);
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const sendFriendRequest = async (toId) => {
    try {
      await api.sendFriendRequest(toId);
    } catch (err) {
      setError(err.message);
      console.error('Error sending friend request:', err);
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      await api.acceptFriendRequest(requestId);
    } catch (err) {
      setError(err.message);
      console.error('Error accepting friend request:', err);
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      await api.rejectFriendRequest(requestId);
    } catch (err) {
      setError(err.message);
      console.error('Error rejecting friend request:', err);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await api.removeFriend(friendId);
    } catch (err) {
      setError(err.message);
      console.error('Error removing friend:', err);
    }
  };

  const subscribeFriendTasks = async (friendId) => {
    try {
      const tasks = await api.getFriendTasks(friendId);
      setFriendTasksData(prev => ({
        ...prev,
        [friendId]: tasks
      }));
    } catch (err) {
      setError(err.message);
      console.error('Error loading friend tasks:', err);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        friends,
        friendRequests,
        user,
        loading,
        error,
        signup,
        signin,
        signout,
        addTask,
        toggleTask,
        deleteTask,
        searchUsers,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        subscribeFriendTasks,
        forgotPassword: forgotPasswordToken,
        resetPassword: performResetPassword,
        getFriendTasks: (friendId) => friendTasksData[friendId] || []
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
