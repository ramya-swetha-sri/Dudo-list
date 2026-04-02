import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save, X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import ThemeSettings from './ThemeSettings';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useTasks();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const success = await updateProfile({ displayName: displayName.trim() });
      if (success) {
        setMessage('✅ Profile updated successfully!');
        // Clear success message after 2 seconds
        setTimeout(() => setMessage(''), 2000);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDisplayName(user?.displayName || '');
    setMessage('');
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
      className="profile-page"
    >
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-icon">
            <User size={32} />
          </div>
          <h1>Profile Settings</h1>
          <p>Manage your account information</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="form-input disabled"
              readOnly
            />
            <p className="form-hint">Your email cannot be changed</p>
          </div>

          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="form-input"
              autoFocus
            />
            <p className="form-hint">This name will appear on your tasks and to your friends</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="alert alert-error"
            >
              <X size={16} />
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="alert alert-success"
            >
              {message}
            </motion.div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || displayName === (user?.displayName || '')}
              className="btn btn-primary"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <div className="profile-info">
          <h3>Account Information</h3>
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Member Since</span>
            <span className="info-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        <ThemeSettings />
      </div>
    </motion.div>
  );
};

export default Profile;
