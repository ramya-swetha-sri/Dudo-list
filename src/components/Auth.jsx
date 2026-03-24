import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signin } = useTasks();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <button
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError('');
        }}
        style={{ marginTop: '10px', width: '100%', padding: '10px' }}
      >
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </button>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default Auth;
