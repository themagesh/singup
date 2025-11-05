import { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import EventForm from './EventForm';
import EventCard from './EventCard';
import { eventsAPI } from '../../services/api';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getMyEvents();
      setEvents(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventCreated = () => {
    setShowForm(false);
    fetchEvents();
  };

  const handleEventUpdated = () => {
    fetchEvents();
  };

  const handleEventDeleted = () => {
    fetchEvents();
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>My Calendar</h2>
            <button className="button" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Create Event'}
            </button>
          </div>

          {showForm && (
            <div style={{ marginBottom: '20px' }}>
              <EventForm onEventCreated={handleEventCreated} />
            </div>
          )}

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <h3>No events yet</h3>
              <p>Create your first event to get started!</p>
            </div>
          ) : (
            <div className="event-list">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onUpdate={handleEventUpdated}
                  onDelete={handleEventDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
