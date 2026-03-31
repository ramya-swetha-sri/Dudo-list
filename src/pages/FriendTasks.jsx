import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Users, CheckCircle2, Circle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import AddFriend from '../components/AddFriend';
import FriendRequests from '../components/FriendRequests';
import './FriendTasks.css';

const FriendTasks = () => {
  const { friends, removeFriend, subscribeFriendTasks, getFriendTasks } = useTasks();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  useEffect(() => {
    if (friends.length > 0 && !selectedFriendId) {
      setSelectedFriendId(friends[0].id);
    }
  }, [friends, selectedFriendId]);

  useEffect(() => {
    let isActive = true;

    const loadFriendTasks = async () => {
      if (!selectedFriendId) return;

      setIsLoadingTasks(true);
      await subscribeFriendTasks(selectedFriendId);

      if (isActive) {
        setIsLoadingTasks(false);
      }
    };

    loadFriendTasks();

    return () => {
      isActive = false;
    };
  }, [selectedFriendId, subscribeFriendTasks]);

  const selectedFriend = friends.find((friend) => friend.id === selectedFriendId);
  const friendTasks = useMemo(() => {
    if (!selectedFriendId) {
      return [];
    }

    return getFriendTasks(selectedFriendId);
  }, [getFriendTasks, selectedFriendId]);

  const handleRemoveFriend = async () => {
    if (!selectedFriend || !window.confirm(`Are you sure you want to remove ${selectedFriend.displayName}?`)) {
      return;
    }

    await removeFriend(selectedFriendId);

    if (friends.length > 1) {
      const otherFriend = friends.find((friend) => friend.id !== selectedFriendId);
      setSelectedFriendId(otherFriend?.id || null);
    } else {
      setSelectedFriendId(null);
    }
  };

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
              <button className="remove-friend-btn" onClick={handleRemoveFriend}>
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
              ) : friendTasks.length > 0 ? (
                <ul className="friend-task-list">
                  {friendTasks.map((task, index) => (
                    <motion.li
                      key={task.id}
                      className={`friend-task-item ${task.completed ? 'completed' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`custom-checkbox ${task.completed ? 'checked' : ''}`}>
                        {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} color="#d1d5db" />}
                      </div>
                      <span className={`friend-task-text ${task.completed ? 'completed' : ''}`}>
                        {task.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#9ca3af',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #e5e7eb'
                  }}
                >
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
