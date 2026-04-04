import React from 'react';
import { useTasks } from '../context/TaskContext';
import AuthSimple from '../components/AuthSimple';

const LandingPageTest = () => {
  let contextData = null;
  let contextError = null;
  
  try {
    contextData = useTasks();
  } catch (err) {
    contextError = err?.message || 'Context error';
  }

  const { user = null, loading = false } = contextData || {};

  console.log('🔍 LandingPageTest rendered - user:', user, 'loading:', loading);

  // Fallback UI if context fails
  if (contextError) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        padding: '40px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>⚠️ Context Error</h1>
        <p>{contextError}</p>
        <p>Try refreshing the page.</p>
      </div>
    );
  }

  // If context is working but data is loading
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🚀 DuoTask</h1>
          <p style={{ fontSize: '1.2rem', color: '#aaa' }}>Initializing...</p>
        </div>
      </div>
    );
  }

  // User is logged in
  if (user) {
    return (
      <div style={{ 
        padding: '40px',
        backgroundColor: '#1a1a2e', 
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: '#fff'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>👋 Welcome, {user.displayName || user.email}!</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#aaa' }}>You're all set! Explore your tasks:</p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <a href="/my-tasks" style={{ 
            padding: '12px 24px', 
            backgroundColor: '#ec4899', 
            color: '#fff', 
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>📝 My Tasks</a>
          <a href="/friend-tasks" style={{ 
            padding: '12px 24px', 
            backgroundColor: '#2196f3', 
            color: '#fff', 
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>👥 Friend Tasks</a>
          <a href="/group-tasks" style={{ 
            padding: '12px 24px', 
            backgroundColor: '#10b981', 
            color: '#fff', 
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>🤝 Group Tasks</a>
        </div>
      </div>
    );
  }

  // Not logged in - show auth form and landing page
  return (
    <div style={{ 
      padding: '40px',
      backgroundColor: '#1a1a2e', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>🚀 DuoTask</h1>
          <p style={{ fontSize: '1.1rem', color: '#aaa' }}>
            Organize tasks with friends. Collaborate smarter. Get more done.
          </p>
        </div>
        
        <AuthSimple />

        <div style={{ 
          marginTop: '40px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px'
        }}>
          <div style={{ padding: '15px', backgroundColor: '#16213e', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>Track Tasks</h3>
            <p style={{ margin: '0', color: '#aaa', fontSize: '0.8rem' }}>Organize tasks</p>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#16213e', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>Collaborate</h3>
            <p style={{ margin: '0', color: '#aaa', fontSize: '0.8rem' }}>Share tasks</p>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#16213e', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏱️</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>Pomodoro</h3>
            <p style={{ margin: '0', color: '#aaa', fontSize: '0.8rem' }}>Stay focused</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageTest;
