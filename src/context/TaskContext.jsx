import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('duovibe-tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.friends) {
        parsed.friends = [{ id: 'f1', name: 'Kayyy' }];
        parsed.friend_f1 = parsed.friendTasks || [
          { id: '4', text: 'Gym session', completed: true },
          { id: '5', text: 'Read 20 pages', completed: false },
          { id: '6', text: 'Grocery shopping', completed: false }
        ];
        delete parsed.friendTasks;
      }
      return parsed;
    }
    return {
      myTasks: [
        { id: '1', text: 'Drink water', completed: false },
        { id: '2', text: 'Finish UI design', completed: true },
        { id: '3', text: 'Call mom', completed: false }
      ],
      friends: [
        { id: 'f1', name: 'Kayyy' }
      ],
      friend_f1: [
        { id: '4', text: 'Gym session', completed: true },
        { id: '5', text: 'Read 20 pages', completed: false },
        { id: '6', text: 'Grocery shopping', completed: false }
      ],
      groupTasks: [
        { id: '7', text: 'Plan weekend trip', completed: false },
        { id: '8', text: 'Review project presentation', completed: false }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('duovibe-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addFriend = (name) => {
    const friendId = 'f' + Date.now().toString();
    setTasks(prev => ({
      ...prev,
      friends: [...(prev.friends || []), { id: friendId, name }],
      [`friend_${friendId}`]: []
    }));
  };

  const removeFriend = (friendId) => {
    setTasks(prev => {
      const next = { ...prev };
      next.friends = (next.friends || []).filter(f => f.id !== friendId);
      delete next[`friend_${friendId}`];
      return next;
    });
  };

  const addTask = (listType, text) => {
    const newTask = { id: Date.now().toString(), text, completed: false };
    setTasks(prev => ({
      ...prev,
      [listType]: [newTask, ...(prev[listType] || [])]
    }));
  };

  const toggleTask = (listType, id) => {
    setTasks(prev => ({
      ...prev,
      [listType]: (prev[listType] || []).map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    }));
  };

  const deleteTask = (listType, id) => {
    setTasks(prev => ({
      ...prev,
      [listType]: (prev[listType] || []).filter(t => t.id !== id)
    }));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, toggleTask, deleteTask, addFriend, removeFriend }}>
      {children}
    </TaskContext.Provider>
  );
};
