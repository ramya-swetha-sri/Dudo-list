import React, { useEffect, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '12px' }}>
        {view === 'auth' ? (isSignUp ? 'Sign Up' : 'Sign In') : view === 'forgot' ? 'Forgot Password' : 'Reset Password'}
      </h2>

      {view === 'forgot' && (
        <p style={{ marginTop: 0, marginBottom: '16px', color: '#6b7280', textAlign: 'center', fontSize: '14px' }}>
          Enter your email to receive a reset token and continue to a clear reset step.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {view === 'auth' && isSignUp && (
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
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
          style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
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
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <p style={{ margin: '0 0 15px 0', color: '#6b7280', fontSize: '12px' }}>
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
              style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </>
        )}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
          {loading ? 'Processing...' : view === 'auth' ? (isSignUp ? 'Sign Up' : 'Sign In') : view === 'forgot' ? 'Send Reset Token' : 'Reset Password'}
        </button>
      </form>

      {view === 'auth' && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              clearAlerts();
            }}
            style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontSize: '14px' }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>

          {!isSignUp && (
            <div style={{ marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setView('forgot');
                  clearAlerts();
                }}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '14px' }}
              >
                Forgot Password?
              </button>
            </div>
          )}
        </div>
      )}

      {view !== 'auth' && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setView('auth');
              setIsSignUp(false);
              clearAlerts();
            }}
            style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontSize: '14px' }}
          >
            Back to Sign In
          </button>
        </div>
      )}

      {error && <p style={{ color: '#ef4444', marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>{error}</p>}
      {message && <p style={{ color: '#10b981', marginTop: '15px', textAlign: 'center', fontSize: '14px', wordBreak: 'break-word' }}>{message}</p>}
    </div>
  );
};

export default Auth;
