import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Image as ImageIcon } from 'lucide-react';
import './Pomodoro.css';

const backgrounds = [
  { id: 'gradient', name: 'Dreamy Vibe', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { id: 'cafe', name: 'Cozy Cafe', value: 'url(https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80)' },
  { id: 'lofi', name: 'Lofi Room', value: 'url(https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&q=80)' },
  { id: 'rain', name: 'Rainy Window', value: 'url(https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80)' },
];

const Pomodoro = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus, break
  const [bg, setBg] = useState(backgrounds[0]);

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

  return (
    <div 
      className="pomodoro-container"
      style={{ background: bg.value, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="bg-selector-glass mb-6">
        <ImageIcon size={20} style={{ marginRight: '8px' }} />
        <div className="bg-buttons">
          {backgrounds.map(b => (
            <button 
              key={b.id} 
              className={`bg-btn ${bg.id === b.id ? 'active' : ''}`}
              onClick={() => setBg(b)}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

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

        <div className="timer-display">
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
