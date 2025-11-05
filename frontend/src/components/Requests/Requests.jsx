import { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import SwapRequestCard from './SwapRequestCard';
import { swapsAPI } from '../../services/api';

const Requests = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [incomingResponse, outgoingResponse] = await Promise.all([
        swapsAPI.getIncomingRequests(),
        swapsAPI.getOutgoingRequests(),
      ]);
      setIncomingRequests(incomingResponse.data);
      setOutgoingRequests(outgoingResponse.data);
      setError('');
    } catch (err) {
      setError('Failed to load swap requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestUpdated = () => {
    fetchRequests();
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Swap Requests</h2>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading">Loading requests...</div>
          ) : (
            <>
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '16px' }}>
                  Incoming Requests ({incomingRequests.length})
                </h3>
                <p style={{ color: '#666', marginBottom: '16px' }}>
                  Requests from other users who want to swap with you
                </p>
                {incomingRequests.length === 0 ? (
                  <div className="empty-state">
                    <p>No incoming swap requests</p>
                  </div>
                ) : (
                  <div>
                    {incomingRequests.map((request) => (
                      <SwapRequestCard
                        key={request.id}
                        request={request}
                        type="incoming"
                        onUpdate={handleRequestUpdated}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ marginBottom: '16px' }}>
                  Outgoing Requests ({outgoingRequests.length})
                </h3>
                <p style={{ color: '#666', marginBottom: '16px' }}>
                  Requests you've sent to other users
                </p>
                {outgoingRequests.length === 0 ? (
                  <div className="empty-state">
                    <p>No outgoing swap requests</p>
                  </div>
                ) : (
                  <div>
                    {outgoingRequests.map((request) => (
                      <SwapRequestCard
                        key={request.id}
                        request={request}
                        type="outgoing"
                        onUpdate={handleRequestUpdated}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
