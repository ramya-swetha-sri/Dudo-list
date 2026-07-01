import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TaskProvider, useTasks } from './context/TaskContext';
import { ErrorBoundary } from './ErrorBoundary';
import LandingPage from './pages/LandingPage';
import MyTasks from './pages/MyTasks';
import FriendTasks from './pages/FriendTasks';
import GroupTasks from './pages/GroupTasks';
import Pomodoro from './pages/Pomodoro';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import PreviousTasks from './pages/PreviousTasks';
import Scrapbook from './pages/Scrapbook';
import Layout from './components/Layout';

function AppContent() {
  const { themes } = useTasks();

  useEffect(() => {
    // Apply themes to CSS variables
    if (themes) {
      document.documentElement.style.setProperty('--theme-my-tasks', themes.myTasks || '#ec4899');
      document.documentElement.style.setProperty('--theme-friend-tasks', themes.friendTasks || '#2196f3');
      document.documentElement.style.setProperty('--theme-group-tasks', themes.groupTasks || '#10b981');
      document.documentElement.style.setProperty('--accent-secondary', themes.inkColor || '#2b5b84');
      document.documentElement.style.setProperty('--accent-primary', themes.marginColor || '#d94646');
      document.documentElement.style.setProperty('--bg-primary', themes.paperColor || '#ffffff');
      document.documentElement.style.setProperty('--text-primary', themes.textColor || '#1a1a1a');
    }
  }, [themes]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<Layout />}>
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/friend-tasks" element={<FriendTasks />} />
        <Route path="/group-tasks" element={<GroupTasks />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/previous-tasks" element={<PreviousTasks />} />
        <Route path="/scrapbook" element={<Scrapbook />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </ErrorBoundary>
  );
}

export default App;
