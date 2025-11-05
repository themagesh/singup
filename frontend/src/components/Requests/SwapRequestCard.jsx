import { useState } from 'react';
import { format } from 'date-fns';
import { swapsAPI } from '../../services/api';

const SwapRequestCard = ({ request, type, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResponse = async (accepted) => {
    try {
      setLoading(true);
      setError('');
      await swapsAPI.respondToSwapRequest(request.id, accepted);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to respond to request');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  const getStatusBadge = (status) => {
    const className = `badge badge-${status.toLowerCase()}`;
    return <span className={className}>{status}</span>;
  };

  return (
    <div className="swap-request-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4>
          {type === 'incoming'
            ? `Request from ${request.requester_name}`
            : `Request to ${request.target_user_name}`}
        </h4>
        {getStatusBadge(request.status)}
      </div>

      <div className="swap-slots">
        <div className="swap-slot">
          <h5>
            {type === 'incoming' ? 'Their Slot' : 'Your Slot'}
          </h5>
          <p><strong>{request.requester_slot_title}</strong></p>
          <p>{formatDateTime(request.requester_slot_start)}</p>
          <p>{formatDateTime(request.requester_slot_end)}</p>
        </div>

        <div className="swap-arrow">↔</div>

        <div className="swap-slot">
          <h5>
            {type === 'incoming' ? 'Your Slot' : 'Their Slot'}
          </h5>
          <p><strong>{request.target_slot_title}</strong></p>
          <p>{formatDateTime(request.target_slot_start)}</p>
          <p>{formatDateTime(request.target_slot_end)}</p>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
        Requested: {format(new Date(request.created_at), 'MMM dd, yyyy hh:mm a')}
      </div>

      {error && <div className="error" style={{ marginTop: '12px' }}>{error}</div>}

      {type === 'incoming' && request.status === 'PENDING' && (
        <div className="swap-actions">
          <button
            className="button button-success"
            onClick={() => handleResponse(true)}
            disabled={loading}
          >
            Accept Swap
          </button>
          <button
            className="button button-danger"
            onClick={() => handleResponse(false)}
            disabled={loading}
          >
            Reject
          </button>
        </div>
      )}

      {type === 'outgoing' && request.status === 'PENDING' && (
        <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
          Waiting for {request.target_user_name} to respond...
        </div>
      )}

      {request.status === 'ACCEPTED' && (
        <div style={{ marginTop: '12px', fontSize: '14px', color: '#28a745', fontWeight: '600' }}>
          ✓ Swap completed successfully!
        </div>
      )}

      {request.status === 'REJECTED' && (
        <div style={{ marginTop: '12px', fontSize: '14px', color: '#dc3545' }}>
          ✗ Swap was rejected
        </div>
      )}
    </div>
  );
};

export default SwapRequestCard;
