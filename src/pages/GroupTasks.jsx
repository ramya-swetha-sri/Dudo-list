import React from 'react';
import { motion } from 'framer-motion';
import TaskList from '../components/TaskList';
import { useTasks } from '../context/TaskContext';
import './GroupTasks.css';

const GroupTasks = () => {
  const { themes } = useTasks();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="group-tasks-container"
      style={{ '--title-color': themes.groupTasks || '#10b981' }}
    >
      <div className="group-content">
        <div className="task-section">
          <TaskList 
            type="groupTasks" 
            title="Group Vibe" 
            subtitle="Tackle these challenges together"
            themeColor={themes.groupTasks}
          />
        </div>
        
        <div className="spotify-section">
          <h3 className="spotify-title">Vibe Check</h3>
          <p className="spotify-subtitle">Listen along while getting things done.</p>
          <div className="spotify-embed">
            <iframe 
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0" 
              width="100%" 
              height="352" 
              frameBorder="0" 
              allowFullScreen="" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupTasks;
