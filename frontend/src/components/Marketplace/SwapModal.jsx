import { useState, useEffect } from 'react';
import { eventsAPI, swapsAPI } from '../../services/api';
import { format } from 'date-fns';

const SwapModal = ({ targetSlot, onClose, onSwapRequested }) => {
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMySwappableSlots = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getMyEvents();
        const swappableSlots = response.data.filter(
          (event) => event.status === 'SWAPPABLE'
        );
        setMySwappableSlots(swappableSlots);
        setError('');
      } catch (err) {
        setError('Failed to load your swappable slots');
      } finally {
        setLoading(false);
      }
    };

    fetchMySwappableSlots();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSlotId) {
      setError('Please select a slot to offer');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await swapsAPI.createSwapRequest({
        my_slot_id: parseInt(selectedSlotId),
        their_slot_id: targetSlot.id,
      });
      onSwapRequested();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create swap request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Request Swap</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h4>Their Slot:</h4>
          <div className="swap-slot">
            <h5>{targetSlot.title}</h5>
            <p>{formatDateTime(targetSlot.start_time)}</p>
            <p>{formatDateTime(targetSlot.end_time)}</p>
            <p>Owner: {targetSlot.owner_name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="mySlot">Select Your Slot to Offer:</label>
            {loading ? (
              <p>Loading your swappable slots...</p>
            ) : mySwappableSlots.length === 0 ? (
              <p className="error">
                You don't have any swappable slots. Please mark a slot as swappable first.
              </p>
            ) : (
              <select
                id="mySlot"
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                required
              >
                <option value="">-- Select a slot --</option>
                {mySwappableSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.title} - {format(new Date(slot.start_time), 'MMM dd, hh:mm a')}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button"
              disabled={submitting || mySwappableSlots.length === 0}
            >
              {submitting ? 'Requesting...' : 'Request Swap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwapModal;
