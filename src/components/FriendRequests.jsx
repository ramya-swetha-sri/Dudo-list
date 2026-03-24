import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Check, X } from 'lucide-react';

const FriendRequests = () => {
  const { friendRequests, acceptFriendRequest, rejectFriendRequest } = useTasks();

  if (friendRequests.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: '#FFF8DC',
        border: '1px solid #FFD700',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
        Friend Requests ({friendRequests.length})
      </h3>

      {friendRequests.map((request) => (
        <div
          key={request.id}
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
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
              {request.displayName}
            </p>
            <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
              {request.email}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => acceptFriendRequest(request.id)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Check size={16} />
              Accept
            </button>

            <button
              onClick={() => rejectFriendRequest(request.id)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <X size={16} />
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;
