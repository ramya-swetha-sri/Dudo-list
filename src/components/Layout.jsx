import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, Users, Music, User, Clock, LogOut } from 'lucide-react';
import './Layout.css';

import { useTasks } from '../context/TaskContext';

const Layout = () => {
  const { tasks, user, loading, signout } = useTasks();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      signout();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <div className="layout-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <p>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  const friendName = tasks?.friends && tasks.friends.length > 0 ? tasks.friends[0].name : "Friend";

  const navItems = [
    { path: '/my-tasks', label: "My Tasks", icon: User },
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
        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{user.email}</p>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
