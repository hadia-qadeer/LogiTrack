import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TrackingHistory from './TrackingHistory';
import './Tracking.css';

const Tracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [shipmentIdInput, setShipmentIdInput] = useState(initialId);
  const [activeShipmentId, setActiveShipmentId] = useState(initialId);
  const [error, setError] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = shipmentIdInput.trim();
    if (!trimmed) {
      setError('Please enter a valid Shipment ID');
      return;
    }
    setError('');
    setActiveShipmentId(trimmed);
    setSearchParams({ id: trimmed });
  };

  return (
    <div className="tracking-page">
      <div className="tracking-header">
        <h1>Live Shipment Tracking</h1>
        <p>Enter any shipment tracking number or ID to see real-time updates and movement history.</p>
      </div>

      <div className="tracking-search-card">
        <form onSubmit={handleSearch}>
          <label htmlFor="track-input">Shipment Tracking ID</label>
          <div className="tracking-search-row">
            <input
              id="track-input"
              type="text"
              value={shipmentIdInput}
              onChange={(e) => setShipmentIdInput(e.target.value)}
              placeholder="e.g., clyz1234567890abcdef"
              autoFocus
            />
            <button type="submit" className="btn btn-primary btn-lg">
              🔍 Track Shipment
            </button>
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}
        </form>
      </div>

      {activeShipmentId && (
        <TrackingHistory shipmentId={activeShipmentId} />
      )}
    </div>
  );
};

export default Tracking;
