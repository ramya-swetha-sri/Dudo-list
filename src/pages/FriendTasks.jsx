import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import AddFriend from '../components/AddFriend';
import FriendRequests from '../components/FriendRequests';
import TaskList from '../components/TaskList';

const FriendTasks = () => {
  const { friends, removeFriend, subscribeToFriendTasks } = useTasks();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [friendTasksData, setFriendTasksData] = useState(null);

  // Subscribe to friend's tasks when friend is selected
  useEffect(() => {
    if (!selectedFriendId) return;

    // Subscribe to friend's tasks with real-time updates
    const unsubscribe = subscribeToFriendTasks(selectedFriendId, (tasksData) => {
      setFriendTasksData(tasksData);
    });

    // Cleanup subscription when friend changes or component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedFriendId, subscribeToFriendTasks]);

  // Auto-select first friend if available
  useEffect(() => {
    if (friends.length > 0 && !selectedFriendId) {
      setSelectedFriendId(friends[0].id);
    }
  }, [friends, selectedFriendId]);

  const selectedFriend = friends.find(f => f.id === selectedFriendId);

  if (friends.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{ padding: '32px' }}
      >
        <FriendRequests />
        
        <div style={{
          textAlign: 'center',
          padding: '60px 32px',
          backgroundColor: '#f5f5f5',
          borderRadius: '12px'
        }}>
          <h2 style={{ marginBottom: '16px' }}>No friends yet!</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Search for friends by email and add them to see their tasks
          </p>
          <button
            onClick={() => setShowAddFriend(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px'
            }}
          >
            <Plus size={20} />
            Add Friend
          </button>
        </div>

        {showAddFriend && (
          <AddFriend onClose={() => setShowAddFriend(false)} />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '32px' }}
    >
      <FriendRequests />

      {/* Friends list */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0 }}>Your Friends</h2>
          <button
            onClick={() => setShowAddFriend(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={18} />
            Add
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => setSelectedFriendId(friend.id)}
              style={{
                padding: '10px 16px',
                backgroundColor: selectedFriendId === friend.id ? '#4F46E5' : '#f5f5f5',
                color: selectedFriendId === friend.id ? 'white' : '#333',
                border: selectedFriendId === friend.id ? '2px solid #4F46E5' : '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {friend.displayName}
            </button>
          ))}
        </div>
      </div>

      {/* Friend's tasks */}
      {selectedFriend && friendTasksData && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <h1 style={{ margin: '0 0 8px 0' }}>{selectedFriend.displayName}'s Tasks</h1>
              <p style={{ margin: 0, color: '#666' }}>Cheer {selectedFriend.displayName} on!</p>
            </div>
            <button
              onClick={() => {
                removeFriend(selectedFriendId);
                if (friends.length > 1) {
                  setSelectedFriendId(friends[0].id);
                } else {
                  setSelectedFriendId(null);
                }
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={16} />
              Remove
            </button>
          </div>

          {/* Display friend's tasks (read-only) */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ marginTop: 0 }}>Tasks</h3>
            {friendTasksData.myTasks && friendTasksData.myTasks.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {friendTasksData.myTasks.map((task) => (
                  <li
                    key={task.id}
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid #e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      disabled
                      style={{ cursor: 'not-allowed' }}
                    />
                    <span
                      style={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? '#999' : '#333'
                      }}
                    >
                      {task.text}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#999' }}>No tasks yet</p>
            )}
          </div>
        </div>
      )}

      {showAddFriend && (
        <AddFriend onClose={() => setShowAddFriend(false)} />
      )}
    </motion.div>
  );
};

export default FriendTasks;
