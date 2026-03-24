import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Image as ImageIcon, Maximize, Minimize, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Pomodoro.css';

const backgrounds = [
  { id: 'work', name: 'Work Mode', type: 'video', value: '/work_mode.mp4' },
  { id: 'lofi', name: 'Lofi Mode', type: 'video', value: '/lofi_mode.mp4' },
  { id: 'cafe', name: 'Cozy Cafe', type: 'video', value: '/cozy%20cafe_mode.mp4' },
  { id: 'us', name: 'Us Mode', type: 'video', value: '/us_mode.mp4' },
];

const Pomodoro = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus, break
  const [bg, setBg] = useState(backgrounds[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pomodoroRef = React.useRef(null);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Auto switch modes and play sound
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      pomodoroRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen to fullscreen changes to update the state correctly
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={pomodoroRef}
      className={`pomodoro-container ${isFullscreen ? 'fullscreen-mode' : ''}`}
      style={bg.type !== 'video' ? { background: bg.value, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {bg.type === 'video' && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="video-background"
          key={bg.id}
        >
          <source src={bg.value} type="video/mp4" />
        </video>
      )}
      <nav className="pomodoro-menu-bar">
        <div className="p-menu-left">
          <Link to="/" className="p-brand">
            <CheckSquare size={20} />
            <span>DuoTask</span>
          </Link>
          <div className="p-nav-links">
            <Link to="/my-tasks">My Tasks</Link>
            <Link to="/friend-tasks">Friend's Tasks</Link>
            <Link to="/leaderboard">Leaderboard</Link>
          </div>
        </div>
        
        <div className="p-menu-right">
          <ImageIcon size={18} style={{ marginRight: '8px' }} />
          {backgrounds.map(b => (
            <button 
              key={b.id} 
              className={`p-bg-btn ${bg.id === b.id ? 'active' : ''}`}
              onClick={() => setBg(b)}
            >
              {b.name}
            </button>
          ))}
          <button 
            className="fullscreen-toggle-btn-inline"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </nav>

      <motion.div 
        className="timer-glass-panel"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'focus' ? 'active' : ''}`}
            onClick={() => switchMode('focus')}
          >
            Focus
          </button>
          <button 
            className={`mode-btn ${mode === 'break' ? 'active' : ''}`}
            onClick={() => switchMode('break')}
          >
            Break
          </button>
        </div>

        <div className="timer-glass-circle">
          {formatTime(timeLeft)}
        </div>

        <div className="controls">
          <button className="control-btn play-btn" onClick={toggleTimer}>
            {isActive ? <Pause size={32} /> : <Play size={32} style={{marginLeft: '4px'}} />}
          </button>
          <button className="control-btn reset-btn" onClick={resetTimer}>
            <RotateCcw size={24} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Pomodoro;
