import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import TaskList from '../components/TaskList';
import { useTasks } from '../context/TaskContext';

const FriendTasks = () => {
  const { tasks, addFriend, removeFriend } = useTasks();
  const [newFriendName, setNewFriendName] = useState('');
  
  const handleAddFriend = (e) => {
    e.preventDefault();
    if (newFriendName.trim()) {
      addFriend(newFriendName);
      setNewFriendName('');
    }
  };

  const friends = tasks.friends || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="task-header mb-8">
        <h1 className="text-4xl font-bold bg-clip-text gradient-text">Friends' Tasks</h1>
        <p className="text-secondary mt-2">See what your besties are up to and add new friends</p>
      </div>

      <form onSubmit={handleAddFriend} className="add-task-form glass-panel mb-12">
        <input 
          type="text" 
          placeholder="Enter friend's name..." 
          value={newFriendName}
          onChange={(e) => setNewFriendName(e.target.value)}
          className="task-input"
        />
        <button type="submit" className="add-btn">
          <Plus size={20} />
        </button>
      </form>

      {friends.map(friend => (
        <div key={friend.id} className="mb-12 relative">
          <button 
             onClick={() => removeFriend(friend.id)}
             className="absolute top-0 right-0 p-2 text-red-500 opacity-50 hover:opacity-100 transition-opacity z-10"
             title="Remove Friend"
             style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
             <Trash2 size={24} color="#ef4444" />
          </button>
          <TaskList 
            type={`friend_${friend.id}`} 
            title={`${friend.name}'s tasks`} 
            subtitle={`Cheer ${friend.name} on from the sidelines!`}
            readonly={false} 
          />
        </div>
      ))}
    </motion.div>
  );
};

export default FriendTasks;
