import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Crown } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import './Leaderboard.css';

const Leaderboard = () => {
  const { tasks } = useTasks();

  // swayyy's metrics
  const myTasksList = tasks.myTasks || [];
  const swayyyTotal = myTasksList.length;
  const swayyyCompleted = myTasksList.filter(t => t.completed).length;
  const swayyyHasStar = swayyyTotal > 0 && swayyyCompleted === swayyyTotal;

  // friend's metrics
  const friendId = tasks.friends?.length > 0 ? tasks.friends[0].id : null;
  const friendName = tasks.friends?.length > 0 ? tasks.friends[0].name : "kayyy";
  const friendTasksList = friendId ? (tasks[`friend_${friendId}`] || []) : [];
  const friendTotal = friendTasksList.length;
  const friendCompleted = friendTasksList.filter(t => t.completed).length;
  const friendHasStar = friendTotal > 0 && friendCompleted === friendTotal;

  const candidates = [
    {
      name: "swayyy",
      total: swayyyTotal,
      completed: swayyyCompleted,
      hasStar: swayyyHasStar,
      avatar: "🐶"
    },
    {
      name: friendName,
      total: friendTotal,
      completed: friendCompleted,
      hasStar: friendHasStar,
      avatar: "🐱"
    }
  ];

  // Sort by who has a star, then by completion percentage
  candidates.sort((a, b) => {
    if (a.hasStar && !b.hasStar) return -1;
    if (!a.hasStar && b.hasStar) return 1;
    const aPct = a.total > 0 ? a.completed / a.total : 0;
    const bPct = b.total > 0 ? b.completed / b.total : 0;
    return bPct - aPct;
  });

  return (
    <div className="leaderboard-wrapper">
      <motion.div 
        className="leaderboard-panel paper-style"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="lb-header">
          <Trophy size={32} color="#f59e0b" className="bounce-icon" />
          <h1>Daily Vibe Leaderboard 🏆</h1>
          <p>Complete all tasks today to earn the golden star!</p>
        </div>

        <div className="lb-candidates">
          {candidates.map((c, index) => {
            const pct = c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0;
            return (
              <motion.div 
                key={c.name}
                className={`lb-card ${c.hasStar ? 'winner-card' : ''} rank-${index + 1}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="lb-rank">
                  {index === 0 && <Crown size={24} color="#f59e0b" />}
                  {index === 1 && <span style={{fontSize: '1.2rem', color: '#666'}}>2nd</span>}
                </div>
                
                <div className="lb-avatar">{c.avatar}</div>
                
                <div className="lb-details">
                  <h3 className="lb-name">
                    {c.name} {c.hasStar && <Star className="spin-star" size={20} fill="#f59e0b" color="#f59e0b" />}
                  </h3>
                  <div className="lb-progress-bar">
                    <div className="lb-progress-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                  <div className="lb-stats">
                    <span>{c.completed} / {c.total} tasks completed</span>
                    <span>{pct}% 🎯</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Roaming pixel animals */}
      <div className="roaming-animal animal-1">🐕</div>
      <div className="roaming-animal animal-2 delay-1">🐢</div>
      <div className="roaming-animal animal-3 delay-2">🦆</div>
      <div className="roaming-animal animal-4 delay-3">🐇</div>
    </div>
  );
};

export default Leaderboard;
