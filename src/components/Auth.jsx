import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [view, setView] = useState('auth'); // 'auth', 'forgot', 'reset'
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signin, forgotPassword, resetPassword } = useTasks();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (view === 'auth') {
        let success;
        if (isSignUp) {
          success = await signup(email, password, displayName);
        } else {
          success = await signin(email, password);
        }

        if (success) {
          navigate('/my-tasks');
        } else {
          setError('Authentication failed');
        }
      } else if (view === 'forgot') {
        const token = await forgotPassword(email);
        if (token) {
          setMessage(`Reset token generated: ${token} (In a real app, this would be emailed)`);
          setTimeout(() => setView('reset'), 3000);
        } else {
          setError('Failed down to generate reset token');
        }
      } else if (view === 'reset') {
        const success = await resetPassword(email, resetToken, newPassword);
        if (success) {
          setMessage('Password reset successful! You can now sign in.');
          setTimeout(() => setView('auth'), 2000);
        } else {
          setError('Password reset failed. Check your token.');
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
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {view === 'auth' ? (isSignUp ? 'Sign Up' : 'Sign In') : view === 'forgot' ? 'Forgot Password' : 'Reset Password'}
      </h2>
      
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
        
        {(view === 'auth' || view === 'forgot' || view === 'reset') && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={view === 'reset'}
            style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        )}

        {view === 'auth' && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
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
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setMessage('');
            }}
            style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontSize: '14px' }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
          
          {!isSignUp && (
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => {
                  setView('forgot');
                  setError('');
                  setMessage('');
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
            onClick={() => {
              setView('auth');
              setError('');
              setMessage('');
            }}
            style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontSize: '14px' }}
          >
            Back to Sign In
          </button>
        </div>
      )}

      {error && <p style={{ color: '#ef4444', marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>{error}</p>}
      {message && <p style={{ color: '#10b981', marginTop: '15px', textAlign: 'center', fontSize: '14px', wordBreak: 'break-all' }}>{message}</p>}
    </div>
  );
};

export default Auth;
