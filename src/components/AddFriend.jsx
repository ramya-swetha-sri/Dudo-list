import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { X, Mail } from 'lucide-react';

const AddFriend = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [tab, setTab] = useState('search'); // 'search' or 'invite'
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [requested, setRequested] = useState(false);
  const { searchUsers, sendFriendRequest, sendInvitation, user } = useTasks();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage('');
    setSearchResult(null);

    try {
      const result = await searchUsers(email);
      if (result) {
        if (result.id === user.id) {
          setMessage("🙃 That's you!");
        } else {
          setSearchResult(result);
        }
      } else {
        setMessage('User not found on DuoTask');
      }
    } catch {
      setMessage('Error searching user');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      setLoading(true);
      await sendFriendRequest(searchResult.id);
      setMessage('✅ Friend request sent!');
      setRequested(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setMessage('Error sending friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const success = await sendInvitation(email);
      if (success) {
        setMessage('✅ Invitation sent! They can now sign up and connect with you.');
        setEmail('');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage('Error sending invitation');
      }
    } catch (err) {
      setMessage(err.message || 'Error sending invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease-in'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}
        >
          <h2 style={{ margin: 0 }}>Add Friend</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#999',
              fontSize: '24px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => { setTab('search'); setMessage(''); setEmail(''); setSearchResult(null); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: tab === 'search' ? '#4F46E5' : '#f0f0f0',
              color: tab === 'search' ? 'white' : '#333',
              fontWeight: tab === 'search' ? 'bold' : 'normal'
            }}
          >
            Search
          </button>
          <button
            onClick={() => { setTab('invite'); setMessage(''); setEmail(''); setSearchResult(null); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: tab === 'invite' ? '#4F46E5' : '#f0f0f0',
              color: tab === 'invite' ? 'white' : '#333',
              fontWeight: tab === 'invite' ? 'bold' : 'normal'
            }}
          >
            <Mail size={16} style={{ marginRight: '4px' }} /> Invite
          </button>
        </div>

        {/* Search Tab */}
        {tab === 'search' && (
          <form onSubmit={handleSearch} style={{ marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="Enter friend's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '12px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        )}

        {/* Invite Tab */}
        {tab === 'invite' && (
          <form onSubmit={handleSendInvitation} style={{ marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="Enter email to invite"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '8px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <p style={{ fontSize: '12px', color: '#666', margin: '8px 0' }}>
              💡 Send an invitation to someone not yet on DuoTask
            </p>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        )}

        {message && (
          <p
            style={{
              textAlign: 'center',
              margin: '12px 0',
              color: message.includes('✅') ? '#22c55e' : '#ef4444',
              fontSize: '14px',
              animation: 'slideDown 0.3s ease'
            }}
          >
            {message}
          </p>
        )}

        {searchResult && !requested && tab === 'search' && (
          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              animation: 'slideDown 0.3s ease'
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
              {searchResult.displayName}
            </p>
            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
              {searchResult.email}
            </p>
            <button
              onClick={handleSendRequest}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Sending...' : 'Send Friend Request'}
            </button>
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideDown {
            from { transform: translateY(-10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddFriend;
