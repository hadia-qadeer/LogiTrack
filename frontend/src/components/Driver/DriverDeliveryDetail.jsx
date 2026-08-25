import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { STATUS_BADGES, VALID_STATUS_TRANSITIONS } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import TrackingHistory from '../Tracking/TrackingHistory';

const DriverDeliveryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status update form state
  const [nextStatus, setNextStatus] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getShipmentById(id);
      setShipment(data);

      const availableTransitions = VALID_STATUS_TRANSITIONS[data.status] || [];
      if (availableTransitions.length > 0) {
        setNextStatus(availableTransitions[0]);
      } else {
        setNextStatus('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load delivery details');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
        toast.info('GPS coordinates acquired from your device');
      },
      () => {
        setGpsLoading(false);
        toast.warning('Unable to retrieve GPS coordinates. Please enter location manually.');
      },
      { timeout: 10000 }
    );
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!nextStatus) {
      toast.error('Please select a valid transition status');
      return;
    }
    if (!location.trim()) {
      toast.error('Please enter current location / checkpoint description');
      return;
    }

    try {
      setUpdating(true);
      await shipmentService.updateShipmentStatus(id, {
        status: nextStatus,
        location: location.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        notes: notes.trim() || undefined,
      });

      toast.success(`Delivery status updated to ${nextStatus}! Checkpoint logged.`);
      setLocation('');
      setNotes('');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading delivery route details...</p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">Delivery not found</div>
      </div>
    );
  }

  const badge = STATUS_BADGES[shipment.status] || {
    bg: '#f1f5f9',
    text: '#475569',
    label: shipment.status,
  };

  const availableTransitions = VALID_STATUS_TRANSITIONS[shipment.status] || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1>Delivery #{shipment.id.slice(0, 8)}</h1>
            <span
              className="status-badge"
              style={{
                backgroundColor: badge.bg,
                color: badge.text,
                borderColor: badge.border,
              }}
            >
              ● {badge.label}
            </span>
          </div>
          <p className="page-subtitle">Full ID: {shipment.id}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/driver/deliveries')}
          className="btn btn-secondary"
        >
          ← Back to Deliveries
        </button>
      </div>

      {/* Route & Shipper Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Route Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📍 Route & Destination</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Origin:</span>
              <strong style={{ fontSize: '1rem' }}>{shipment.fromCity}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Destination:</span>
              <strong style={{ fontSize: '1rem' }}>{shipment.toCity}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cargo Weight:</span>
              <strong>{shipment.weight} kg</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Declared Value:</span>
              <strong>PKR {Number(shipment.value).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Shipper Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏢 Shipper & Contact</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Company / Name:</span>
              <strong>{shipment.createdBy?.name || 'Shipper'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Phone Number:</span>
              <strong>{shipment.createdBy?.phone || 'Not provided'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email:</span>
              <span>{shipment.createdBy?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Expected Delivery:</span>
              <span>
                {shipment.expectedDelivery
                  ? new Date(shipment.expectedDelivery).toLocaleDateString()
                  : 'Flexible'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Action Card */}
      {availableTransitions.length > 0 ? (
        <div className="card" style={{ marginBottom: '1.75rem', border: '2px solid var(--primary-border)' }}>
          <div className="card-header" style={{ background: 'var(--primary-light)', margin: '-1.5rem -1.5rem 1.25rem -1.5rem', padding: '1.25rem 1.5rem' }}>
            <div>
              <div className="card-title" style={{ color: 'var(--primary)' }}>
                🚚 Log Status & Location Checkpoint
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Update transit milestones and provide location updates for the shipper to track.
              </p>
            </div>
          </div>

          <form onSubmit={handleStatusUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="next-status">New Milestone Status *</label>
                <select
                  id="next-status"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  required
                >
                  {availableTransitions.map((st) => (
                    <option key={st} value={st}>
                      Transition to: {st.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="checkpoint-location">Current Location / Checkpoint *</label>
                <input
                  id="checkpoint-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Highway Checkpost KM 145, Sukkur Bypass"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="checkpoint-notes">Notes / Observations (Optional)</label>
              <textarea
                id="checkpoint-notes"
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Cargo secured, moving smoothly without traffic delays."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label htmlFor="checkpoint-lat">Latitude (Optional)</label>
                <input
                  id="checkpoint-lat"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 31.5204"
                />
              </div>

              <div style={{ flex: 1, minWidth: '150px' }}>
                <label htmlFor="checkpoint-lng">Longitude (Optional)</label>
                <input
                  id="checkpoint-lng"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., 74.3587"
                />
              </div>

              <button
                type="button"
                onClick={handleGetGPS}
                disabled={gpsLoading}
                className="btn btn-secondary"
                style={{ height: '42px' }}
              >
                {gpsLoading ? 'Acquiring...' : '📍 Auto-fill GPS'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={updating}
                className="btn btn-primary btn-lg"
              >
                {updating ? 'Updating Status...' : `Submit Checkpoint (${nextStatus.replace('_', ' ')})`}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="alert alert-success" style={{ marginBottom: '1.75rem' }}>
          <strong>Delivery Completed:</strong> This shipment is in final status <strong>{shipment.status}</strong>. No further status updates are required.
        </div>
      )}

      {/* Live Tracking Timeline */}
      <TrackingHistory shipmentId={id} />
    </div>
  );
};

export default DriverDeliveryDetail;
