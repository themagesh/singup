import { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import SwapModal from './SwapModal';
import { swapsAPI } from '../../services/api';
import { format } from 'date-fns';

const Marketplace = () => {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchSwappableSlots = async () => {
    try {
      setLoading(true);
      const response = await swapsAPI.getSwappableSlots();
      setSwappableSlots(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load swappable slots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwappableSlots();
  }, []);

  const handleRequestSwap = (slot) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleSwapRequested = () => {
    setShowModal(false);
    setSelectedSlot(null);
    fetchSwappableSlots();
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Marketplace - Available Slots</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Browse and request to swap slots with other users
          </p>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading">Loading available slots...</div>
          ) : swappableSlots.length === 0 ? (
            <div className="empty-state">
              <h3>No swappable slots available</h3>
              <p>Check back later when other users mark their slots as swappable!</p>
            </div>
          ) : (
            <div className="event-list">
              {swappableSlots.map((slot) => (
                <div key={slot.id} className="event-card">
                  <div className="event-header">
                    <h3 className="event-title">{slot.title}</h3>
                    <span className="event-status swappable">SWAPPABLE</span>
                  </div>
                  <div className="event-time">
                    {formatDateTime(slot.start_time)} - {formatDateTime(slot.end_time)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    Owner: {slot.owner_name}
                  </div>
                  <div className="event-actions" style={{ marginTop: '12px' }}>
                    <button
                      className="button button-success button-sm"
                      onClick={() => handleRequestSwap(slot)}
                    >
                      Request Swap
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <SwapModal
          targetSlot={selectedSlot}
          onClose={() => setShowModal(false)}
          onSwapRequested={handleSwapRequested}
        />
      )}
    </div>
  );
};

export default Marketplace;
