import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TaskProvider, useTasks } from './context/TaskContext';
import { ErrorBoundary } from './ErrorBoundary';
import LandingPage from './pages/LandingPageTest';
import MyTasks from './pages/MyTasks';
import FriendTasks from './pages/FriendTasks';
import GroupTasks from './pages/GroupTasks';
import Pomodoro from './pages/Pomodoro';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Notes from './pages/Notes';
import PreviousTasks from './pages/PreviousTasks';
import Layout from './components/Layout';

function AppContent() {
  const { themes } = useTasks();

  useEffect(() => {
    // Apply themes to CSS variables
    if (themes) {
      document.documentElement.style.setProperty('--theme-my-tasks', themes.myTasks);
      document.documentElement.style.setProperty('--theme-friend-tasks', themes.friendTasks);
      document.documentElement.style.setProperty('--theme-group-tasks', themes.groupTasks);
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
        <Route path="/notes" element={<Notes />} />
        <Route path="/previous-tasks" element={<PreviousTasks />} />
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
