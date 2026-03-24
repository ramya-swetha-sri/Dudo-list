import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, Users, Music, User, Clock } from 'lucide-react';
import './Layout.css';

import { useTasks } from '../context/TaskContext';

const Layout = () => {
  const { tasks } = useTasks();
  const location = useLocation();

  const friendName = tasks.friends && tasks.friends.length > 0 ? tasks.friends[0].name : "kayyy";

  const navItems = [
    { path: '/my-tasks', label: "swayyy's tasks", icon: User },
    { path: '/friend-tasks', label: `${friendName}'s tasks`, icon: Users },
    { path: '/group-tasks', label: 'Group Vibe', icon: Music },
    { path: '/pomodoro', label: 'Pomodoro Clock', icon: Clock },
  ];

  return (
    <div className="layout-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <Link to="/">
            <h2 className="logo-text"><CheckSquare size={24} /> DuoTask</h2>
          </Link>
        </div>
        <div className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link to={item.path} key={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={20} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div layoutId="navIndicator" className="nav-indicator" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
