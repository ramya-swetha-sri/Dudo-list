import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, Trash2, Plus, Circle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import './TaskList.css';

const TaskList = ({ type, title, subtitle, readonly = false }) => {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const currentTasks = tasks[type] || [];
  const highlighterClass = type === 'myTasks' ? 'highlighter-pink' : 'highlighter-blue';

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask(type, newTaskText);
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const handleToggle = (id, currentStatus) => {
    if (readonly) return;
    
    toggleTask(type, id);
    
    // Trigger confetti if task is being completed
    if (!currentStatus) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#10b981']
      });
    }
  };

  const uncompletedTasks = currentTasks.filter(t => !t.completed);
  const completedTasks = currentTasks.filter(t => t.completed);

  return (
    <div className="task-container">
      <div className="task-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-4xl font-bold bg-clip-text gradient-text" style={{ margin: 0 }}>{title}</h1>
          {subtitle && <p className="text-secondary mt-2">{subtitle}</p>}
        </div>
        {!readonly && !isAddingTask && (
          <button className="minimal-add-btn" onClick={() => setIsAddingTask(true)} title="Add Task" style={{ margin: 0, width: '40px', height: '40px' }}>
            <Plus size={24} />
          </button>
        )}
      </div>

      {!readonly && isAddingTask && (
        <div className="add-task-container mb-8">
          <form onSubmit={handleAdd} className="add-task-form glass-panel">
            <input 
              type="text" 
              placeholder="What needs to be done?" 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              autoFocus
              onBlur={() => !newTaskText && setIsAddingTask(false)}
              className="task-input"
            />
            <button type="submit" className="add-btn">
              <Check size={20} />
            </button>
          </form>
        </div>
      )}

      <div className="task-lists-wrapper">
        <div className="task-list">
          <AnimatePresence>
            {uncompletedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={() => handleToggle(task.id, task.completed)}
                onDelete={() => deleteTask(type, task.id)}
                readonly={readonly}
                highlighterClass={highlighterClass}
              />
            ))}
          </AnimatePresence>
        </div>

        {completedTasks.length > 0 && (
          <div className="completed-section mt-8">
            <h3 className="completed-title">Completed - {completedTasks.length}</h3>
            <div className="task-list completed-list">
              <AnimatePresence>
                {completedTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={() => handleToggle(task.id, task.completed)}
                    onDelete={() => deleteTask(type, task.id)}
                    readonly={readonly}
                    highlighterClass={highlighterClass}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskItem = ({ task, onToggle, onDelete, readonly, highlighterClass }) => {
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
      className={`task-item glass-panel ${task.completed ? 'completed' : ''} ${readonly ? 'readonly' : ''} relative ${highlighterClass}`}
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
            color: '#10b981',
            fontWeight: '900',
            fontSize: '1.8rem',
            pointerEvents: 'none',
            zIndex: 50,
            textShadow: '0 2px 10px rgba(16, 185, 129, 0.4)'
          }}
        >
          +100
        </motion.div>
      )}

      <button 
        className={`checkbox ${task.completed ? 'checked' : ''}`}
        onClick={handleToggle}
        disabled={readonly}
      >
        {task.completed ? <Check size={16} strokeWidth={3} /> : <Circle size={16} color="var(--border-color)" />}
      </button>
      
      <span className="task-text-container" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <span className="task-text">{task.text}</span>
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
