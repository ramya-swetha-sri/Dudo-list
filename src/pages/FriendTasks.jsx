import React from 'react';
import { motion } from 'framer-motion';
import TaskList from '../components/TaskList';

const FriendTasks = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
    >
      <TaskList 
        type="friend_f1" 
        title="kayyy's tasks" 
        subtitle="Cheer kayyy on from the sidelines!"
        readonly={false} 
      />
    </motion.div>
  );
};

export default FriendTasks;
