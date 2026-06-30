import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api/client';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [groupTasks, setGroupTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState({});
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendTasksData, setFriendTasksData] = useState({});
  const [themes, setThemes] = useState({
    myTasks: '#ec4899',
    friendTasks: '#2196f3',
    groupTasks: '#10b981'
  });

  async function loadUserData() {
    try {
      setError(null);
      const [tasksData, friendsData, requestsData] = await Promise.all([
        api.getTasks().catch(err => {
          console.log('getTasks failed:', err.message);
          return [];
        }),
        api.getFriends().catch(err => {
          console.log('getFriends failed:', err.message);
          return [];
        }),
        api.getFriendRequests().catch(err => {
          console.log('getFriendRequests failed:', err.message);
          return [];
        })
      ]);

      const personalTasks = (tasksData || []).filter(t => t.taskType !== 'group');
      const groupTasksList = (tasksData || []).filter(t => t.taskType === 'group');

      setTasks(personalTasks);
      setGroupTasks(groupTasksList);
      setFriends(friendsData || []);
      setFriendRequests(requestsData || []);
    } catch (err) {
      console.warn('Warning: Could not load some user data:', err.message);
      setError(err.message);
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        const userData = localStorage.getItem('user');

        if (token && userId && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            api.setAuthToken(token, userId);
            api.connectSocket();
            setUser(parsedUser);
            
            if (parsedUser.themeColors) {
              try {
                setThemes(JSON.parse(parsedUser.themeColors));
              } catch (e) {
                console.error('Error parsing themes:', e);
              }
            }
            
            try {
              await loadUserData();
            } catch (err) {
              console.error('Error during loadUserData:', err);
            }
          } catch (parseErr) {
            console.error('Error parsing stored user data:', parseErr);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!user) return;

    api.onTaskCreated(({ userId, task }) => {
      if (userId === user.id) {
        setTasks(prev => prev.some(t => t.id === task.id) ? prev : [task, ...prev]);
      }
    });

    api.onTaskUpdated(({ userId, task }) => {
      if (userId === user.id) {
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      }
    });

    api.onTaskDeleted(({ userId, taskId }) => {
      if (userId === user.id) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    });

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

    // Friend request real-time updates
    api.onFriendRequestReceived(({ toId, request }) => {
      if (toId === user.id) {
        setFriendRequests(prev => [request, ...prev]);
      }
    });

    api.onFriendRequestAccepted(({ userId, friendId }) => {
      if (userId === user.id || friendId === user.id) {
        api.getFriends().then(setFriends);
        api.getFriendRequests().then(setFriendRequests);
      }
    });

    api.onFriendRequestRejected(({ requestId }) => {
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    });

    api.onFriendRemoved(({ userId, friendId }) => {
      if (userId === user.id || friendId === user.id) {
        api.getFriends().then(setFriends);
      }
    });

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
        setGroupTasks(prev => prev.some(t => t.id === createdTask.id) ? prev : [createdTask, ...prev]);
      } else {
        setTasks(prev => prev.some(t => t.id === createdTask.id) ? prev : [createdTask, ...prev]);
      }
      return createdTask;
    } catch (err) {
      setError(err.message);
      console.error('Error adding task:', err);
      return null;
    }
  };

  const addGroupTask = async (text) => addTask(text, 'group');

  const toggleTask = async (taskId) => {
    try {
      setError(null);
      let task = tasks.find(t => t.id === taskId);
      let isGroupTask = false;

      if (!task) {
        task = groupTasks.find(t => t.id === taskId);
        isGroupTask = true;
      }

      if (!task) return false;

      const updatedTask = await api.updateTask(taskId, { completed: !task.completed });
      
      if (isGroupTask) {
        setGroupTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      } else {
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
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
      
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setGroupTasks(prev => prev.filter(t => t.id !== taskId));
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
      const previousRequests = friendRequests;
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
      await api.acceptFriendRequest(requestId);
      
      const updatedFriends = await api.getFriends();
      setFriends(updatedFriends);
    } catch (err) {
      setFriendRequests(previousRequests);
      setError(err.message);
      console.error('Error accepting friend request:', err);
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      const previousRequests = friendRequests;
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
      await api.rejectFriendRequest(requestId);
    } catch (err) {
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

  const sendInvitation = async (inviteeEmail) => {
    try {
      setError(null);
      await api.sendInvitation(inviteeEmail);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error sending invitation:', err);
      return false;
    }
  };

  const addNote = async (content, color = '#fbbf24') => {
    try {
      setError(null);
      const note = await api.createNote({ 
        content, 
        color,
        date: new Date().toISOString().split('T')[0]
      });
      setNotes(prev => [note, ...prev]);
      return note;
    } catch (err) {
      setError(err.message);
      console.error('Error adding note:', err);
      return null;
    }
  };

  const updateNote = async (noteId, updates) => {
    try {
      setError(null);
      const updatedNote = await api.updateNote(noteId, updates);
      setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error updating note:', err);
      return false;
    }
  };

  const deleteNote = async (noteId) => {
    try {
      setError(null);
      await api.deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting note:', err);
      return false;
    }
  };

  const loadNotes = async () => {
    try {
      setError(null);
      const allNotes = await api.getNotes();
      setNotes(allNotes);
    } catch (err) {
      setError(err.message);
      console.error('Error loading notes:', err);
    }
  };

  const getTasksByDate = (date) => archivedTasks[date] || [];

  const archiveCompletedTasks = async () => {
    try {
      setError(null);
      const today = new Date().toISOString().split('T')[0];
      const completedTasks = [...tasks, ...groupTasks].filter(t => t.completed);
      
      if (completedTasks.length > 0) {
        setArchivedTasks(prev => ({
          ...prev,
          [today]: completedTasks
        }));
        localStorage.setItem('archivedTasks', JSON.stringify({
          ...JSON.parse(localStorage.getItem('archivedTasks') || '{}'),
          [today]: completedTasks
        }));
      }
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error archiving tasks:', err);
      return false;
    }
  };

  useEffect(() => {
    const archivedTasksData = localStorage.getItem('archivedTasks');
    if (archivedTasksData) {
      setArchivedTasks(JSON.parse(archivedTasksData));
    }
    if (user) {
      loadNotes();
    }
  }, [user]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        groupTasks,
        notes,
        archivedTasks,
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
        sendInvitation,
        subscribeFriendTasks,
        subscribeToFriendTasks: subscribeFriendTasks,
        forgotPassword: forgotPasswordToken,
        resetPassword: performResetPassword,
        updateProfile,
        updateThemes,
        getFriendTasks: (friendId) => friendTasksData[friendId] || [],
        addNote,
        updateNote,
        deleteNote,
        loadNotes,
        getTasksByDate,
        archiveCompletedTasks
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
