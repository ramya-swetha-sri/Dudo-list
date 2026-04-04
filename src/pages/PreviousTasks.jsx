import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, Archive } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import './PreviousTasks.css';

const PreviousTasks = () => {
  const { tasks, groupTasks, themes, archiveCompletedTasks } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewType, setViewType] = useState('all'); // all, completed, pending

  // Get all unique dates from tasks
  const uniqueDates = useMemo(() => {
    const allTasks = [...tasks, ...groupTasks];
    const dates = new Set();
    
    allTasks.forEach(task => {
      if (task.createdAt) {
        const date = task.createdAt.split('T')[0];
        dates.add(date);
      }
    });
    
    return Array.from(dates).sort().reverse();
  }, [tasks, groupTasks]);

  // Get tasks for selected date
  const tasksForDate = useMemo(() => {
    const allTasks = [...tasks, ...groupTasks];
    let filtered = allTasks.filter(task => 
      task.createdAt && task.createdAt.split('T')[0] === selectedDate
    );

    // Apply view filter
    if (viewType === 'completed') {
      filtered = filtered.filter(t => t.completed);
    } else if (viewType === 'pending') {
      filtered = filtered.filter(t => !t.completed);
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [tasks, groupTasks, selectedDate, viewType]);

  const handleArchiveDay = async () => {
    if (window.confirm('Archive all completed tasks for this day?')) {
      await archiveCompletedTasks();
    }
  };

  const getDateDisplay = (date) => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const completedCount = tasksForDate.filter(t => t.completed).length;
  const totalCount = tasksForDate.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="previous-tasks-container"
    >
      <div className="previous-header" style={{ borderBottomColor: themes.myTasks }}>
        <div>
          <h1 className="text-4xl font-bold" style={{ color: themes.myTasks }}>
            <Calendar size={32} className="inline mr-2" />
            Task History
          </h1>
          <p className="text-secondary mt-2">Review your tasks by date and track your progress</p>
        </div>
      </div>

      {/* Date Timeline */}
      <div className="date-timeline">
        <div className="timeline-header">
          <h3>Select Date:</h3>
        </div>
        <div className="date-list">
          {uniqueDates.length > 0 ? (
            uniqueDates.map((date) => {
              const dateTasksCount = [...tasks, ...groupTasks].filter(
                t => t.createdAt && t.createdAt.split('T')[0] === date
              ).length;
              
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`date-btn ${selectedDate === date ? 'active' : ''}`}
                >
                  <span className="date-text">{getDateDisplay(date)}</span>
                  <span className="task-count">{dateTasksCount} tasks</span>
                </button>
              );
            })
          ) : (
            <p className="no-dates">No tasks yet</p>
          )}
        </div>
      </div>

      {/* View Controls */}
      <div className="view-controls">
        <div className="filter-buttons">
          <button
            onClick={() => setViewType('all')}
            className={`filter-btn ${viewType === 'all' ? 'active' : ''}`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setViewType('completed')}
            className={`filter-btn ${viewType === 'completed' ? 'active' : ''}`}
          >
            <Check size={16} />
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setViewType('pending')}
            className={`filter-btn ${viewType === 'pending' ? 'active' : ''}`}
          >
            Pending ({totalCount - completedCount})
          </button>
        </div>
        <button onClick={handleArchiveDay} className="archive-btn">
          <Archive size={18} />
          Archive Day
        </button>
      </div>

      {/* Tasks Display */}
      <div className="tasks-section">
        <h2 className="section-title">{getDateDisplay(selectedDate)}</h2>
        
        {tasksForDate.length > 0 ? (
          <AnimatePresence>
            <div className="tasks-list">
              {tasksForDate.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                >
                  <div className="task-checkbox">
                    {task.completed && <Check size={20} />}
                  </div>
                  <div className="task-content">
                    <p className="task-text">{task.text}</p>
                    <span className="task-meta">
                      {new Date(task.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="task-type">
                    <span className={`badge ${task.taskType}`}>
                      {task.taskType === 'group' ? 'Group' : 'Personal'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="empty-state"
          >
            <Calendar size={48} />
            <p>No {viewType !== 'all' ? viewType : ''} tasks found for this date</p>
          </motion.div>
        )}
      </div>

      {/* Statistics */}
      {tasksForDate.length > 0 && (
        <div className="statistics">
          <div className="stat-card">
            <h4>Completion Rate</h4>
            <p className="stat-value">
              {Math.round((completedCount / totalCount) * 100)}%
            </p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
          <div className="stat-card">
            <h4>Tasks Today</h4>
            <p className="stat-value">{totalCount}</p>
          </div>
          <div className="stat-card">
            <h4>Completed</h4>
            <p className="stat-value" style={{ color: themes.groupTasks }}>
              {completedCount}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PreviousTasks;
