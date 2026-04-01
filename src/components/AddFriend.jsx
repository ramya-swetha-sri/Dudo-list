import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { X } from 'lucide-react';

const AddFriend = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [requested, setRequested] = useState(false);
  const { searchUsers, sendFriendRequest, user } = useTasks();

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
        setMessage('User not found');
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
        zIndex: 1000
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
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
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
              color: '#999'
            }}
          >
            <X size={24} />
          </button>
        </div>

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
              boxSizing: 'border-box'
            }}
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
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {message && (
          <p
            style={{
              textAlign: 'center',
              margin: '12px 0',
              color: message.includes('✅') ? '#22c55e' : '#ef4444',
              fontSize: '14px'
            }}
          >
            {message}
          </p>
        )}

        {searchResult && !requested && (
          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px'
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
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Sending...' : 'Send Friend Request'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFriend;
