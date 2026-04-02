import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, Trash2, Circle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import './TaskList.css';

const TaskList = ({ type = 'myTasks', title, subtitle, readonly = false, themeColor }) => {
  const { tasks, groupTasks, addTask, addGroupTask, toggleTask, deleteTask, themes } = useTasks();
  const [newTaskText, setNewTaskText] = useState('');
  const inputRef = useRef(null);

  // Use themeColor prop if provided, otherwise use context themes
  const titleColor = themeColor || (type === 'myTasks' ? themes.myTasks : type === 'friendTasks' ? themes.friendTasks : themes.groupTasks);

  const currentTasks = useMemo(() => {
    if (type === 'groupTasks') {
      return Array.isArray(groupTasks) ? groupTasks : [];
    }
    
    if (Array.isArray(tasks)) {
      return tasks;
    }

    return tasks?.[type] || [];
  }, [tasks, groupTasks, type]);

  const highlighterClass = type === 'friendTasks' ? 'highlighter-blue' : 'highlighter-pink';

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmedText = newTaskText.trim();

    if (!trimmedText || readonly) {
      return;
    }

    if (type === 'groupTasks') {
      await addGroupTask(trimmedText);
    } else {
      await addTask(trimmedText);
    }
    setNewTaskText('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleToggle = (task) => {
    if (readonly) return;

    toggleTask(task.id);

    if (!task.completed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [titleColor, '#10b981', '#6366f1']
      });
    }
  };

  const uncompletedTasks = currentTasks.filter((task) => !task.completed);
  const completedTasks = currentTasks.filter((task) => task.completed);

  return (
    <div className="task-container">
      <div className="task-header" style={{ borderBottomColor: titleColor }}>
        <div>
          <h1 className="text-4xl font-bold" style={{ color: titleColor }}>{title}</h1>
          {subtitle && <p className="text-secondary mt-2">{subtitle}</p>}
        </div>
      </div>

      {!readonly && (
        <div className="task-entry-wrapper">
          <form onSubmit={handleAdd} className="task-entry-row glass-panel">
            <button type="submit" className="checkbox entry-checkbox" title="Add task" aria-label="Add task">
              <Circle size={16} color="var(--border-color)" />
            </button>

            <input
              ref={inputRef}
              type="text"
              placeholder="Type a task and press Enter"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              autoFocus
              className="task-input"
            />
          </form>
          <p className="entry-hint">Press Enter and a fresh checkbox is ready for the next task.</p>
        </div>
      )}

      <div className="task-lists-wrapper">
        <div className="task-list">
          <AnimatePresence>
            {uncompletedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => handleToggle(task)}
                onDelete={() => deleteTask(task.id)}
                readonly={readonly}
                themeColor={titleColor}
              />
            ))}
          </AnimatePresence>
        </div>

        {completedTasks.length > 0 && (
          <div className="completed-section mt-8">
            <h3 className="completed-title">Completed - {completedTasks.length}</h3>
            <div className="task-list completed-list">
              <AnimatePresence>
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggle(task)}
                    onDelete={() => deleteTask(task.id)}
                    readonly={readonly}
                    themeColor={titleColor}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {currentTasks.length === 0 && (
          <div className="empty-task-state">
            {readonly ? 'No completed tasks to show yet.' : 'Your tasks will appear here as soon as you add them.'}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskItem = ({ task, onToggle, onDelete, readonly, themeColor }) => {
  const [showMark, setShowMark] = useState(false);

  const handleToggle = () => {
    if (readonly) return;

    if (!task.completed) {
      setShowMark(true);
      setTimeout(() => setShowMark(false), 1200);
    }

    onToggle();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`task-item glass-panel ${task.completed ? 'completed' : ''} ${readonly ? 'readonly' : ''} relative`}
      style={{
        '--hl-color': `${themeColor}33`
      }}
    >
      {showMark && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 0.5, rotate: -15 }}
          animate={{ opacity: 0, y: -60, scale: 1.5, rotate: 10 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            left: 20,
            top: -20,
            color: themeColor,
            fontWeight: '900',
            fontSize: '1.8rem',
            pointerEvents: 'none',
            zIndex: 50,
            textShadow: `0 2px 10px ${themeColor}66`
          }}
        >
          +100
        </motion.div>
      )}

      <button
        className={`checkbox ${task.completed ? 'checked' : ''}`}
        onClick={handleToggle}
        disabled={readonly}
        style={{
          borderColor: task.completed ? themeColor : 'var(--text-primary)',
          color: themeColor
        }}
      >
        {task.completed ? <Check size={16} strokeWidth={3} /> : <Circle size={16} color="var(--border-color)" />}
      </button>

      <span className="task-text-container">
        <span className="task-text" style={{ color: task.completed ? 'var(--text-secondary)' : themeColor }}>
          {task.text}
        </span>
      </span>

      {!readonly && (
        <button className="delete-btn" onClick={onDelete}>
          <Trash2 size={18} />
        </button>
      )}
    </motion.div>
  );
};

export default TaskList;
