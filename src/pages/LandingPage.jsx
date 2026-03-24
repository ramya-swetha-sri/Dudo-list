import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Rocket, LogOut } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import Auth from '../components/Auth';
import './LandingPage.css';

const LandingPage = () => {
  const { user, signout } = useTasks();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      signout();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (user) {
    // User is logged in, show welcome screen
    return (
      <div className="landing-container">
        <nav className="landing-nav">
          <h2 className="nav-logo">DuoTask</h2>
          <div className="nav-actions">
            <p style={{ margin: '0 16px', color: '#666' }}>Welcome, {user.email}</p>
            <button 
              onClick={handleSignOut}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#ff6b6b', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </nav>

        <main className="hero-section">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="badge">
              <Sparkles size={16} />
              <span>Ready to crush your goals?</span>
            </div>

            <h1 className="hero-title">
              Welcome to<br />
              <span>DuoTask</span>
            </h1>
            
            <p className="hero-subtitle">
              Your tasks are now synced to the cloud! Start managing your personal tasks, check your friend's progress, and collaborate together.
            </p>

            <div className="hero-cta">
              <Link to="/my-tasks">
                <motion.button 
                  className="btn-primary cta-main"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Rocket size={20} />
                  Go to My Tasks
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // User not logged in, show auth form
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <h2 className="nav-logo">DuoTask</h2>
      </nav>

      <main className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="badge">
            <Sparkles size={16} />
            <span>The perfect task manager for two</span>
          </div>

          <h1 className="hero-title">
            conquer your day, <br />
            <span>together.</span>
          </h1>
          
          <p className="hero-subtitle">
            Manage your personal tasks, monitor your best friend's progress, and collaborate in a shared vibey space.
          </p>
        </motion.div>

        <motion.div 
          className="hero-cards"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <div className="preview-card card-1">
            <div className="card-header">
              <div className="dot"></div>
              My Tasks
            </div>
            <div className="card-body">
              <div className="skeleton-line" style={{width: '80%'}}></div>
              <div className="skeleton-line" style={{width: '60%'}}></div>
            </div>
          </div>
          
          <div className="preview-card card-2">
            <div className="card-header">
              <Heart size={16} color="var(--accent-secondary)" />
              Friend's Progress
            </div>
            <div className="card-body">
              <div className="skeleton-line" style={{width: '90%'}}></div>
            </div>
          </div>
        </motion.div>
      </main>

      <Auth />
    </div>
  );
};

export default LandingPage;
