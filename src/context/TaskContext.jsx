import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Initialize user profile if doesn't exist
        await initializeUserProfile(currentUser.uid, currentUser.email);
        // Initialize or load user data
        await initializeUserData(currentUser.uid);
        // Subscribe to all data
        subscribeToUserTasks(currentUser.uid);
        subscribeToFriends(currentUser.uid);
        subscribeToFriendRequests(currentUser.uid);
      } else {
        setTasks(null);
        setFriends([]);
        setFriendRequests([]);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const initializeUserData = async (userId) => {
    try {
      const userTasksRef = doc(db, 'users', userId, 'data', 'tasks');
      const userDoc = await getDoc(userTasksRef);

      if (!userDoc.exists()) {
        // Initialize with default data
        const defaultData = {
          myTasks: [
            { id: '1', text: 'Drink water', completed: false },
            { id: '2', text: 'Finish UI design', completed: true },
            { id: '3', text: 'Call mom', completed: false }
          ],
          friends: [{ id: 'f1', name: 'Kayyy' }],
          friend_f1: [
            { id: '4', text: 'Gym session', completed: true },
            { id: '5', text: 'Read 20 pages', completed: false },
            { id: '6', text: 'Grocery shopping', completed: false }
          ],
          groupTasks: [
            { id: '7', text: 'Plan weekend trip', completed: false },
            { id: '8', text: 'Review project presentation', completed: false }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(userTasksRef, defaultData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error initializing user data:', err);
    }
  };

  const subscribeToUserTasks = (userId) => {
    try {
      const userTasksRef = doc(db, 'users', userId, 'data', 'tasks');

      const unsubscribe = onSnapshot(userTasksRef, (snapshot) => {
        if (snapshot.exists()) {
          setTasks(snapshot.data());
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      setError(err.message);
      console.error('Error subscribing to tasks:', err);
      setLoading(false);
    }
  };

  const initializeUserProfile = async (userId, email) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email,
          displayName: email.split('@')[0],
          createdAt: new Date(),
          friends: [],
          friendRequests: [],
          blockedUsers: []
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error initializing user profile:', err);
    }
  };

  const subscribeToFriends = (userId) => {
    try {
      const userRef = doc(db, 'users', userId);

      const unsubscribe = onSnapshot(userRef, async (snapshot) => {
        if (snapshot.exists()) {
          const friendIds = snapshot.data().friends || [];
          
          // Fetch friend details
          const friendDetails = await Promise.all(
            friendIds.map(async (friendId) => {
              const friendRef = doc(db, 'users', friendId);
              const friendDoc = await getDoc(friendRef);
              if (friendDoc.exists()) {
                return { id: friendId, ...friendDoc.data() };
              }
              return null;
            })
          );

          setFriends(friendDetails.filter(f => f !== null));
        }
      });

      return unsubscribe;
    } catch (err) {
      setError(err.message);
      console.error('Error subscribing to friends:', err);
    }
  };

  const subscribeToFriendRequests = (userId) => {
    try {
      const userRef = doc(db, 'users', userId);

      const unsubscribe = onSnapshot(userRef, async (snapshot) => {
        if (snapshot.exists()) {
          const requestIds = snapshot.data().friendRequests || [];
          
          // Fetch request details
          const requestDetails = await Promise.all(
            requestIds.map(async (senderId) => {
              const senderRef = doc(db, 'users', senderId);
              const senderDoc = await getDoc(senderRef);
              if (senderDoc.exists()) {
                return { id: senderId, ...senderDoc.data() };
              }
              return null;
            })
          );

          setFriendRequests(requestDetails.filter(r => r !== null));
        }
      });

      return unsubscribe;
    } catch (err) {
      setError(err.message);
      console.error('Error subscribing to friend requests:', err);
    }
  };

  const addTask = async (listType, text) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const newTask = { id: Date.now().toString(), text, completed: false };
      const userTasksRef = doc(db, 'users', user.uid, 'data', 'tasks');

      await updateDoc(userTasksRef, {
        [listType]: [newTask, ...(tasks?.[listType] || [])],
        updatedAt: new Date()
      });
    } catch (err) {
      setError(err.message);
      console.error('Error adding task:', err);
    }
  };

  const toggleTask = async (listType, id) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const userTasksRef = doc(db, 'users', user.uid, 'data', 'tasks');

      const updatedTasks = (tasks?.[listType] || []).map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );

      await updateDoc(userTasksRef, {
        [listType]: updatedTasks,
        updatedAt: new Date()
      });
    } catch (err) {
      setError(err.message);
      console.error('Error toggling task:', err);
    }
  };

  const deleteTask = async (listType, id) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const userTasksRef = doc(db, 'users', user.uid, 'data', 'tasks');

      const updatedTasks = (tasks?.[listType] || []).filter(t => t.id !== id);

      await updateDoc(userTasksRef, {
        [listType]: updatedTasks,
        updatedAt: new Date()
      });
    } catch (err) {
      setError(err.message);
      console.error('Error deleting task:', err);
    }
  };

  const addFriend = async (name) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const friendId = 'f' + Date.now().toString();
      const userTasksRef = doc(db, 'users', user.uid, 'data', 'tasks');

      const updatedFriends = [...(tasks?.friends || []), { id: friendId, name }];
      const updateObj = {
        friends: updatedFriends,
        [`friend_${friendId}`]: [],
        updatedAt: new Date()
      };

      await updateDoc(userTasksRef, updateObj);
    } catch (err) {
      setError(err.message);
      console.error('Error adding friend:', err);
    }
  };

  const removeFriend = async (friendId) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const friendRef = doc(db, 'users', friendId);

      // Remove from both users' friend lists
      await updateDoc(userRef, {
        friends: arrayRemove(friendId)
      });

      await updateDoc(friendRef, {
        friends: arrayRemove(user.uid)
      });
    } catch (err) {
      setError(err.message);
      console.error('Error removing friend:', err);
    }
  };

  const searchUsers = async (email) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    } catch (err) {
      setError(err.message);
      console.error('Error searching users:', err);
      return null;
    }
  };

  const sendFriendRequest = async (recipientId) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const recipientRef = doc(db, 'users', recipientId);

      // Add to recipient's friend requests
      await updateDoc(recipientRef, {
        friendRequests: arrayUnion(user.uid)
      });
    } catch (err) {
      setError(err.message);
      console.error('Error sending friend request:', err);
    }
  };

  const acceptFriendRequest = async (senderId) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const senderRef = doc(db, 'users', senderId);

      // Add to both users' friend lists
      await updateDoc(userRef, {
        friends: arrayUnion(senderId),
        friendRequests: arrayRemove(senderId)
      });

      await updateDoc(senderRef, {
        friends: arrayUnion(user.uid)
      });
    } catch (err) {
      setError(err.message);
      console.error('Error accepting friend request:', err);
    }
  };

  const rejectFriendRequest = async (senderId) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, {
        friendRequests: arrayRemove(senderId)
      });
    } catch (err) {
      setError(err.message);
      console.error('Error rejecting friend request:', err);
    }
  };

  const getFriendTasks = async (friendId) => {
    try {
      const friendTasksRef = doc(db, 'users', friendId, 'data', 'tasks');
      const friendDoc = await getDoc(friendTasksRef);

      if (friendDoc.exists()) {
        return friendDoc.data();
      }
      return null;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching friend tasks:', err);
      return null;
    }
  };

  if (!user) {
    return (
      <TaskContext.Provider
        value={{
          tasks: null,
          loading,
          error,
          addTask,
          toggleTask,
          deleteTask,
          addFriend,
          removeFriend,
          searchUsers,
          sendFriendRequest,
          acceptFriendRequest,
          rejectFriendRequest,
          friends: [],
          friendRequests: [],
          getFriendTasks,
          user: null
        }}
      >
        {children}
      </TaskContext.Provider>
    );
  }

  return (
    <TaskContext.Provider
      value={{
        tasks: tasks || {},
        loading,
        error,
        addTask,
        toggleTask,
        deleteTask,
        addFriend,
        removeFriend,
        searchUsers,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        friends,
        friendRequests,
        getFriendTasks,
        user
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
