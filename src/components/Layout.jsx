import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, Users, Music, User, Clock, LogOut, Menu } from 'lucide-react';
import './Layout.css';

import { useTasks } from '../context/TaskContext';

const Layout = () => {
  const { user, loading, signout, friends } = useTasks();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
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

  const friendName = friends.length > 0
    ? (friends[0].displayName || friends[0].name || 'Friend')
    : 'Friend';

  const navItems = [
    { path: '/my-tasks', label: "My Tasks", icon: User },
    { path: '/friend-tasks', label: `${friendName}'s tasks`, icon: Users },
    { path: '/group-tasks', label: 'Group Vibe', icon: Music },
    { path: '/pomodoro', label: 'Pomodoro Clock', icon: Clock },
  ];

  return (
    <div className={`layout-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <button 
        className="sidebar-toggle" 
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Show menu" : "Hide menu"}
      >
        <Menu size={24} />
      </button>

      <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
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
        <div className="sidebar-footer">
          <p className="user-email">{user.email}</p>
          <button onClick={handleSignOut} className="signout-button">
            <LogOut size={16} />
            <span>Sign Out</span>
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
