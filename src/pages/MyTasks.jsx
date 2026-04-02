import React from 'react';
import { motion } from 'framer-motion';
import TaskList from '../components/TaskList';
import { useTasks } from '../context/TaskContext';

const MyTasks = () => {
  const { user, themes } = useTasks();
  const userName = user?.displayName || 'Tasks';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
    >
      <TaskList 
        type="myTasks" 
        title={`${userName}'s Tasks`}
        subtitle="Crush your individual goals today!"
        themeColor={themes.myTasks}
      />
    </motion.div>
  );
};

export default MyTasks;
