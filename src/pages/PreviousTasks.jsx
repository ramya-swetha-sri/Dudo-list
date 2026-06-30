import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, Archive } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import './PreviousTasks.css';

const NOTE_COLORS = ['#fff9c4', '#ffccbc', '#c8e6c9', '#bbdefb', '#e1bee7', '#ffe0b2'];

const PreviousTasks = () => {
  const { tasks, groupTasks, themes, archiveCompletedTasks } = useTasks();
  const [viewType, setViewType] = useState('all');

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const allTasks = [...tasks, ...groupTasks];
    const grouped = {};

    allTasks.forEach(task => {
      if (task.createdAt) {
        const date = task.createdAt.split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(task);
      }
    });

    // Sort dates descending
    const sortedDates = Object.keys(grouped).sort().reverse();

    // Apply view filter
    if (viewType !== 'all') {
      sortedDates.forEach(date => {
        grouped[date] = grouped[date].filter(t =>
          viewType === 'completed' ? t.completed : !t.completed
        );
      });
    }

    return { dates: sortedDates, grouped };
  }, [tasks, groupTasks, viewType]);

  const handleArchiveDay = async () => {
    if (window.confirm('Archive all completed tasks?')) {
      await archiveCompletedTasks();
    }
  };

  const getDateDisplay = (date) => {
    const d = new Date(date + 'T00:00:00');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (date === today) return '📌 Today';
    if (date === yesterdayStr) return '📌 Yesterday';
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalTasks = [...tasks, ...groupTasks].length;
  const completedTasks = [...tasks, ...groupTasks].filter(t => t.completed).length;

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
          <p className="text-secondary mt-2">Your tasks pinned on sticky notes, day by day</p>
        </div>
      </div>

      {/* View Controls */}
      <div className="view-controls">
        <div className="filter-buttons">
          <button
            onClick={() => setViewType('all')}
            className={`filter-btn ${viewType === 'all' ? 'active' : ''}`}
          >
            All ({totalTasks})
          </button>
          <button
            onClick={() => setViewType('completed')}
            className={`filter-btn ${viewType === 'completed' ? 'active' : ''}`}
          >
            <Check size={16} />
            Done ({completedTasks})
          </button>
          <button
            onClick={() => setViewType('pending')}
            className={`filter-btn ${viewType === 'pending' ? 'active' : ''}`}
          >
            Pending ({totalTasks - completedTasks})
          </button>
        </div>
        <button onClick={handleArchiveDay} className="archive-btn">
          <Archive size={18} />
          Archive
        </button>
      </div>

      {/* Sticky Notes by Date */}
      <div className="history-notes-wall">
        <AnimatePresence>
          {tasksByDate.dates.length > 0 ? (
            tasksByDate.dates.map((date, dateIdx) => {
              const dateTasks = tasksByDate.grouped[date];
              if (!dateTasks || dateTasks.length === 0) return null;

              const noteColor = NOTE_COLORS[dateIdx % NOTE_COLORS.length];
              const completedCount = dateTasks.filter(t => t.completed).length;
              const rotation = ((dateIdx % 5) - 2) * 1.5; // -3 to +3 degrees

              return (
                <motion.div
                  key={date}
                  className="history-sticky-note"
                  style={{
                    backgroundColor: noteColor,
                    '--note-rotation': `${rotation}deg`
                  }}
                  initial={{ opacity: 0, scale: 0.8, rotate: rotation }}
                  animate={{ opacity: 1, scale: 1, rotate: rotation }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: dateIdx * 0.08 }}
                >
                  {/* Date header tab */}
                  <div className="note-date-tab">
                    <span className="note-date-text">{getDateDisplay(date)}</span>
                    <span className="note-date-stats">
                      {completedCount}/{dateTasks.length} done
                    </span>
                  </div>

                  {/* Progress strip */}
                  <div className="note-progress-strip">
                    <div
                      className="note-progress-fill"
                      style={{
                        width: `${dateTasks.length > 0 ? (completedCount / dateTasks.length) * 100 : 0}%`,
                        background: themes.groupTasks
                      }}
                    />
                  </div>

                  {/* Tasks on the note */}
                  <ul className="note-task-list">
                    {dateTasks.map((task) => (
                      <li
                        key={task.id}
                        className={`note-task-item ${task.completed ? 'completed' : ''}`}
                      >
                        <span className="note-checkbox">
                          {task.completed ? '☑' : '☐'}
                        </span>
                        <span className="note-task-text">{task.text}</span>
                        <span className={`note-task-badge ${task.taskType}`}>
                          {task.taskType === 'group' ? 'G' : 'P'}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Pin decoration */}
                  <div className="note-pin" />
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state"
            >
              <Calendar size={48} />
              <p>No {viewType !== 'all' ? viewType : ''} tasks found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats cards */}
      {totalTasks > 0 && (
        <div className="statistics">
          <div className="stat-card stat-note" style={{ backgroundColor: '#fff9c4' }}>
            <h4>Completion Rate</h4>
            <p className="stat-value" style={{ color: themes.myTasks }}>
              {Math.round((completedTasks / totalTasks) * 100)}%
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              />
            </div>
          </div>
          <div className="stat-card stat-note" style={{ backgroundColor: '#bbdefb' }}>
            <h4>Total Tasks</h4>
            <p className="stat-value" style={{ color: themes.friendTasks }}>{totalTasks}</p>
          </div>
          <div className="stat-card stat-note" style={{ backgroundColor: '#c8e6c9' }}>
            <h4>Completed</h4>
            <p className="stat-value" style={{ color: themes.groupTasks }}>
              {completedTasks}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PreviousTasks;
