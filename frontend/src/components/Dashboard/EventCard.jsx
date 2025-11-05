import { useState } from 'react';
import { format } from 'date-fns';
import { eventsAPI } from '../../services/api';

const EventCard = ({ event, onUpdate, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      setError('');
      await eventsAPI.updateEvent(event.id, { status: newStatus });
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await eventsAPI.deleteEvent(event.id);
      onDelete();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  return (
    <div className="event-card">
      <div className="event-header">
        <h3 className="event-title">{event.title}</h3>
        <span className={`event-status ${event.status.toLowerCase()}`}>
          {event.status}
        </span>
      </div>
      <div className="event-time">
        {formatDateTime(event.start_time)} - {formatDateTime(event.end_time)}
      </div>
      {error && <div className="error">{error}</div>}
      <div className="event-actions">
        {event.status === 'BUSY' && (
          <button
            className="button button-success button-sm"
            onClick={() => handleStatusChange('SWAPPABLE')}
            disabled={loading}
          >
            Make Swappable
          </button>
        )}
        {event.status === 'SWAPPABLE' && (
          <button
            className="button button-secondary button-sm"
            onClick={() => handleStatusChange('BUSY')}
            disabled={loading}
          >
            Make Busy
          </button>
        )}
        {event.status === 'SWAP_PENDING' && (
          <span style={{ fontSize: '12px', color: '#666' }}>
            Swap pending - cannot modify
          </span>
        )}
        {event.status !== 'SWAP_PENDING' && (
          <button
            className="button button-danger button-sm"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
