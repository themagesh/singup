import { useState } from 'react';
import { eventsAPI } from '../../services/api';

const EventForm = ({ onEventCreated }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await eventsAPI.createEvent({
        title,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      });
      
      // Reset form
      setTitle('');
      setStartTime('');
      setEndTime('');
      
      onEventCreated();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>Create New Event</h3>
      <div className="form-group">
        <label htmlFor="title">Event Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g., Team Meeting"
        />
      </div>
      <div className="form-group">
        <label htmlFor="startTime">Start Time</label>
        <input
          type="datetime-local"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="endTime">End Time</label>
        <input
          type="datetime-local"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" className="button" disabled={loading}>
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
};

export default EventForm;
