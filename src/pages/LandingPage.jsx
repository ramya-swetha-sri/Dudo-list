import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Rocket } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <h2 className="nav-logo">DuoTask</h2>
        <div className="nav-actions">
          <Link to="/my-tasks" className="btn-secondary">Log In</Link>
          <Link to="/my-tasks" className="btn-primary">Get Started</Link>
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
            <span>The perfect task manager for two</span>
          </div>

          <h1 className="hero-title">
            conquer your day, <br />
            <span>together.</span>
          </h1>
          
          <p className="hero-subtitle">
            Manage your personal tasks, monitor your best friend's progress, and collaborate in a shared vibey space.
          </p>

          <div className="hero-cta">
            <Link to="/my-tasks">
              <motion.button 
                className="btn-primary cta-main"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket size={20} />
                Enter App
              </motion.button>
            </Link>
          </div>
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
    </div>
  );
};

export default LandingPage;
