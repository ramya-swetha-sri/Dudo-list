import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Users, CheckCircle2, Circle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import AddFriend from '../components/AddFriend';
import FriendRequests from '../components/FriendRequests';
import './FriendTasks.css';

const FriendTasks = () => {
  const { friends, removeFriend, subscribeToFriendTasks } = useTasks();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [friendTasksData, setFriendTasksData] = useState(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Subscribe to friend's tasks when friend is selected
  useEffect(() => {
    if (!selectedFriendId) return;

    setIsLoadingTasks(true);
    // Subscribe to friend's tasks with real-time updates
    const unsubscribe = subscribeToFriendTasks(selectedFriendId, (tasksData) => {
      setFriendTasksData(tasksData);
      setIsLoadingTasks(false);
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
      <div className="friend-tasks-container">
        <FriendRequests />
        
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-state-icon">
            <Users size={40} />
          </div>
          <h2>No friends yet!</h2>
          <p>
            Search for friends by email and add them to see their tasks and cheer each other on!
          </p>
          <button
            className="big-add-btn"
            onClick={() => setShowAddFriend(true)}
          >
            <Plus size={22} />
            Find Friends
          </button>
        </motion.div>

        {showAddFriend && (
          <AddFriend onClose={() => setShowAddFriend(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="friend-tasks-container">
      <FriendRequests />

      {/* Friends list section */}
      <section className="friends-section">
        <div className="friends-header">
          <h2>Your Friends</h2>
          <button
            className="add-friend-btn"
            onClick={() => setShowAddFriend(true)}
          >
            <Plus size={18} />
            Add Friend
          </button>
        </div>

        <div className="friends-scroll-container">
          {friends.map((friend) => (
            <button
              key={friend.id}
              className={`friend-pill ${selectedFriendId === friend.id ? 'active' : ''}`}
              onClick={() => setSelectedFriendId(friend.id)}
            >
              {friend.displayName}
            </button>
          ))}
        </div>
      </section>

      {/* Friend's content area */}
      <AnimatePresence mode="wait">
        {selectedFriend && (
          <motion.div
            key={selectedFriendId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="friend-content-header">
              <div className="friend-info">
                <h1>{selectedFriend.displayName}'s Tasks</h1>
                <p>Support {selectedFriend.displayName} by watching their progress!</p>
              </div>
              <button
                className="remove-friend-btn"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to remove ${selectedFriend.displayName}?`)) {
                    removeFriend(selectedFriendId);
                    if (friends.length > 1) {
                      const otherFriend = friends.find(f => f.id !== selectedFriendId);
                      setSelectedFriendId(otherFriend.id);
                    } else {
                      setSelectedFriendId(null);
                    }
                  }
                }}
              >
                <Trash2 size={18} />
                <span>Remove</span>
              </button>
            </div>

            <div className="tasks-card">
              <h3>
                <CheckCircle2 size={24} color="#10b981" />
                Live Task Board
              </h3>
              
              {isLoadingTasks ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  Loading tasks...
                </div>
              ) : friendTasksData?.myTasks && friendTasksData.myTasks.length > 0 ? (
                <ul className="friend-task-list">
                  {friendTasksData.myTasks.map((task, index) => (
                    <motion.li
                      key={task.id}
                      className="friend-task-item"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`custom-checkbox ${task.completed ? 'checked' : ''}`}>
                        {task.completed && <CheckCircle2 size={16} />}
                        {!task.completed && <Circle size={16} color="#d1d5db" />}
                      </div>
                      <span className={`task-text ${task.completed ? 'completed' : ''}`}>
                        {task.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: '#9ca3af',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  border: '2px dashed #e5e7eb'
                }}>
                  No tasks active right now.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAddFriend && (
        <AddFriend onClose={() => setShowAddFriend(false)} />
      )}
    </div>
  );
};

export default FriendTasks;
