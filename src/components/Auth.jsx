import React, { useEffect, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useNavigate } from 'react-router-dom';
import '../pages/Auth.css';

const Auth = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState(() => sessionStorage.getItem('authDraftPassword') || '');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [view, setView] = useState('auth');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signin, forgotPassword, resetPassword } = useTasks();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('rememberedEmail', email);
  }, [email]);

  useEffect(() => {
    if (password) {
      sessionStorage.setItem('authDraftPassword', password);
    } else {
      sessionStorage.removeItem('authDraftPassword');
    }
  }, [password]);

  const clearAlerts = () => {
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAlerts();
    setLoading(true);

    try {
      if (view === 'auth') {
        const success = isSignUp
          ? await signup(email.trim(), password, displayName.trim())
          : await signin(email.trim(), password);

        if (success) {
          navigate('/my-tasks');
        } else {
          setError('Authentication failed. Please check your details and try again.');
        }
      } else if (view === 'forgot') {
        const token = await forgotPassword(email.trim());

        if (token) {
          setResetToken(token);
          setView('reset');
          setMessage('Your reset token is ready below. Enter a new password to finish quickly.');
        } else {
          setError('We could not generate a reset token right now. Please try again.');
        }
      } else if (view === 'reset') {
        if (newPassword.length < 6) {
          setError('New password must be at least 6 characters long.');
          return;
        }

        if (newPassword !== confirmPassword) {
          setError('New password and confirmation do not match.');
          return;
        }

        const success = await resetPassword(email.trim(), resetToken.trim(), newPassword);

        if (success) {
          setPassword(newPassword);
          sessionStorage.setItem('authDraftPassword', newPassword);
          setNewPassword('');
          setConfirmPassword('');
          setIsSignUp(false);
          setView('auth');
          setMessage('Password reset successful. Sign in with your updated password below.');
        } else {
          setError('Password reset failed. Please verify the reset token and try again.');
        }
      }
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    clearAlerts();
  };

  const showForgot = () => {
    setView('forgot');
    clearAlerts();
  };

  const backToAuth = () => {
    setView('auth');
    setIsSignUp(false);
    clearAlerts();
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">
        {view === 'auth' ? (isSignUp ? 'Sign Up' : 'Sign In') : view === 'forgot' ? 'Forgot Password' : 'Reset Password'}
      </h2>

      {view === 'forgot' && (
        <p className="auth-subtitle">
          Enter your email to receive a reset token and continue to a clear reset step.
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        {view === 'auth' && isSignUp && (
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={view === 'reset'}
          autoComplete="username"
        />

        {view === 'auth' && (
          <>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
            <p className="auth-info">
              Your latest password stays available for this browser session to make sign-in smoother.
            </p>
          </>
        )}

        {view === 'reset' && (
          <>
            <input
              type="text"
              placeholder="Reset Token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </>
        )}

        <button 
          type="submit" 
          className="auth-submit"
          disabled={loading}
        >
          {loading ? 'Processing...' : view === 'auth' ? (isSignUp ? 'Sign Up' : 'Sign In') : view === 'forgot' ? 'Send Reset Token' : 'Reset Password'}
        </button>
      </form>

      {view === 'auth' && (
        <div className="auth-links">
          <button type="button" className="auth-link" onClick={toggleMode}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>

          {!isSignUp && (
            <>
              <hr className="auth-divider" />
              <button type="button" className="auth-link secondary" onClick={showForgot}>
                Forgot Password?
              </button>
            </>
          )}
        </div>
      )}

      {view !== 'auth' && (
        <div className="auth-links">
          <button type="button" className="auth-link" onClick={backToAuth}>
            Back to Sign In
          </button>
        </div>
      )}

      {error && <div className="auth-alert auth-error">⚠️ {error}</div>}
      {message && <div className="auth-alert auth-success">✓ {message}</div>}
    </div>
  );
};

export default Auth;
