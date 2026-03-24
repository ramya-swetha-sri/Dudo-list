import React from 'react';
import { motion } from 'framer-motion';
import TaskList from '../components/TaskList';

const MyTasks = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
    >
      <TaskList 
        type="myTasks" 
        title="swayyy's tasks" 
        subtitle="Crush your individual goals today!"
      />
    </motion.div>
  );
};

export default MyTasks;
