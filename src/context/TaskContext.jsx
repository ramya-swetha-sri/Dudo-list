import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api/client';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [groupTasks, setGroupTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendTasksData, setFriendTasksData] = useState({});
  const [themes, setThemes] = useState({
    myTasks: '#ec4899',      // Pink
    friendTasks: '#2196f3',  // Blue
    groupTasks: '#10b981'    // Green
  });

  async function loadUserData() {
    try {
      const [tasksData, friendsData, requestsData] = await Promise.all([
        api.getTasks(),
        api.getFriends(),
        api.getFriendRequests()
      ]);

      // Separate personal and group tasks
      const personalTasks = tasksData.filter(t => t.taskType !== 'group');
      const groupTasksList = tasksData.filter(t => t.taskType === 'group');

      setTasks(personalTasks);
      setGroupTasks(groupTasksList);
      setFriends(friendsData);
      setFriendRequests(requestsData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading user data:', err);
    }
  }

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const userData = localStorage.getItem('user');

    if (token && userId && userData) {
      api.setAuthToken(token, userId);
      api.connectSocket();
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Load user themes
      if (parsedUser.themeColors) {
        try {
          setThemes(JSON.parse(parsedUser.themeColors));
        } catch (e) {
          console.error('Error parsing themes:', e);
        }
      }
      
      loadUserData();
    }

    setLoading(false);
  }, []);

  // Real-time listeners
  useEffect(() => {
    if (!user) return;

    // Own task events
    api.onTaskCreated(({ userId, task }) => {
      if (userId === user.id) {
        setTasks(prev => (
          prev.some((existingTask) => existingTask.id === task.id)
            ? prev
            : [task, ...prev]
        ));
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

    // Friend request events - Real-time updates
    api.onFriendRequestReceived(({ toId, request }) => {
      if (toId === user.id) {
        // Optimistic update: add the new request immediately for instant feedback
        setFriendRequests(prev => [request, ...prev]);
      }
    });

    api.onFriendRequestAccepted(({ userId, friendId }) => {
      if (userId === user.id || friendId === user.id) {
        // Fetch updated friends list for both users
        api.getFriends().then(setFriends);
      }
    });

    api.onFriendRequestRejected(({ requestId }) => {
      // Remove the rejected request from UI immediately
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
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
      api.offFriendRequestRejected();
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

  const addTask = async (text, taskType = 'personal') => {
    try {
      setError(null);
      const createdTask = await api.createTask(text, taskType);
      
      if (taskType === 'group') {
        setGroupTasks(prev => (
          prev.some((task) => task.id === createdTask.id)
            ? prev
            : [createdTask, ...prev]
        ));
      } else {
        setTasks(prev => (
          prev.some((task) => task.id === createdTask.id)
            ? prev
            : [createdTask, ...prev]
        ));
      }
      return createdTask;
    } catch (err) {
      setError(err.message);
      console.error('Error adding task:', err);
      return null;
    }
  };

  const addGroupTask = async (text) => {
    return addTask(text, 'group');
  };

  const toggleTask = async (taskId) => {
    try {
      setError(null);
      let task = tasks.find(t => t.id === taskId);
      let isGroupTask = false;

      if (!task) {
        task = groupTasks.find(t => t.id === taskId);
        isGroupTask = true;
      }

      if (!task) {
        return false;
      }

      const updatedTask = await api.updateTask(taskId, { completed: !task.completed });
      
      if (isGroupTask) {
        setGroupTasks(prev =>
          prev.map(t => t.id === taskId ? updatedTask : t)
        );
      } else {
        setTasks(prev =>
          prev.map(t => t.id === taskId ? updatedTask : t)
        );
      }
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error toggling task:', err);
      return false;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setError(null);
      await api.deleteTask(taskId);
      
      setTasks(prev => prev.filter((task) => task.id !== taskId));
      setGroupTasks(prev => prev.filter((task) => task.id !== taskId));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting task:', err);
      return false;
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
      // Optimistic update - remove from requests immediately
      const previousRequests = friendRequests;
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
      await api.acceptFriendRequest(requestId);
      
      // Fetch updated friends list
      const updatedFriends = await api.getFriends();
      setFriends(updatedFriends);
    } catch (err) {
      // Revert optimistic update on error
      setFriendRequests(previousRequests);
      setError(err.message);
      console.error('Error accepting friend request:', err);
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      // Optimistic update - remove from requests immediately
      const previousRequests = friendRequests;
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
      await api.rejectFriendRequest(requestId);
    } catch (err) {
      // Revert optimistic update on error
      setFriendRequests(previousRequests);
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
      setError(null);
      const friendTasks = await api.getFriendTasks(friendId);
      setFriendTasksData(prev => ({
        ...prev,
        [friendId]: friendTasks
      }));
      return friendTasks;
    } catch (err) {
      setError(err.message);
      console.error('Error loading friend tasks:', err);
      return [];
    }
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);
      const updatedUser = await api.updateProfile(updates);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update themes if themeColors is returned
      if (updatedUser.themeColors) {
        try {
          setThemes(JSON.parse(updatedUser.themeColors));
        } catch (e) {
          console.error('Error parsing themes:', e);
        }
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
      return false;
    }
  };

  const updateThemes = async (newThemes) => {
    try {
      setError(null);
      const updatedUser = await api.updateProfile({ 
        themeColors: JSON.stringify(newThemes) 
      });
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setThemes(newThemes);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error updating themes:', err);
      return false;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        groupTasks,
        friends,
        friendRequests,
        user,
        loading,
        error,
        themes,
        signup,
        signin,
        signout,
        addTask,
        addGroupTask,
        toggleTask,
        deleteTask,
        searchUsers,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        subscribeFriendTasks,
        subscribeToFriendTasks: subscribeFriendTasks,
        forgotPassword: forgotPasswordToken,
        resetPassword: performResetPassword,
        updateProfile,
        updateThemes,
        getFriendTasks: (friendId) => friendTasksData[friendId] || []
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
