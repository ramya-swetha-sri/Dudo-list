import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Check, X } from 'lucide-react';

const FriendRequests = () => {
  const { friendRequests, acceptFriendRequest, rejectFriendRequest } = useTasks();
  const [loadingId, setLoadingId] = useState(null);

  if (friendRequests.length === 0) {
    return null;
  }

  const handleAccept = async (requestId) => {
    setLoadingId(requestId);
    try {
      await acceptFriendRequest(requestId);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setLoadingId(requestId);
    try {
      await rejectFriendRequest(requestId);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFF8DC',
        border: '1px solid #FFD700',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(20px);
          }
        }

        .friend-request-item {
          animation: slideIn 0.3s ease-out;
        }

        .friend-request-item.removing {
          animation: fadeOut 0.3s ease-out forwards;
        }

        .friend-btn {
          transition: all 0.2s;
        }

        .friend-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .friend-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>

      <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
        Friend Requests ({friendRequests.length})
      </h3>

      {friendRequests.map((request) => (
        <div
          key={request.id}
          className="friend-request-item"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '6px',
            marginBottom: '8px',
            border: '1px solid #FFD700'
          }}
        >
          <div>
              {request.from?.displayName || request.from?.email.split('@')[0]}
            </p>
            <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
              {request.from?.email}
>>>>>>> Stashed changes
=======
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
              {request.from?.displayName || request.displayName || request.from?.email.split('@')[0]}
            </p>
            <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
              {request.from?.email || request.email}
            </p>
=======
              {request.from?.displayName || request.from?.email.split('@')[0]}
            </p>
            <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
              {request.from?.email}
>>>>>>> Stashed changes
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleAccept(request.id)}
              disabled={loadingId === request.id}
              className="friend-btn"
              style={{
                padding: '8px 12px',
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: loadingId === request.id ? 0.7 : 1
              }}
            >
              <Check size={16} />
              {loadingId === request.id ? 'Accepting...' : 'Accept'}
            </button>

            <button
              onClick={() => handleReject(request.id)}
              disabled={loadingId === request.id}
              className="friend-btn"
              style={{
                padding: '8px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: loadingId === request.id ? 0.7 : 1
              }}
            >
              <X size={16} />
              {loadingId === request.id ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;
