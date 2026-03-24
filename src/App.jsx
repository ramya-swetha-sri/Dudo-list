import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import LandingPage from './pages/LandingPage';
import MyTasks from './pages/MyTasks';
import FriendTasks from './pages/FriendTasks';
import GroupTasks from './pages/GroupTasks';
import Pomodoro from './pages/Pomodoro';
import Layout from './components/Layout';

function App() {
  return (
    <TaskProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/friend-tasks" element={<FriendTasks />} />
          <Route path="/group-tasks" element={<GroupTasks />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
        </Route>
      </Routes>
    </TaskProvider>
  );
}

export default App;
