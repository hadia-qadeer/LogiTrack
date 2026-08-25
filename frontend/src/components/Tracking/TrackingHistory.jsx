import React, { useState, useEffect } from 'react';
import { trackingService } from '../../services/trackingService';
import { STATUS_BADGES } from '../../utils/constants';
import './Tracking.css';

const TrackingHistory = ({ shipmentId }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      if (!shipmentId) return;
      try {
        setLoading(true);
        setError('');
        const data = await trackingService.getTrackingHistory(shipmentId);
        if (isMounted) {
          setTrackingData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'No tracking history found for this shipment ID.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [shipmentId]);

  if (loading) {
    return (
      <div className="spinner-container" style={{ padding: '2rem' }}>
        <div className="spinner"></div>
        <p>Loading tracking history...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!trackingData) {
    return null;
  }

  const badge = STATUS_BADGES[trackingData.currentStatus] || {
    bg: '#f1f5f9',
    text: '#475569',
    label: trackingData.currentStatus,
  };

  return (
    <div className="tracking-results">
      <div className="tracking-overview-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Shipment ID
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace' }}>
              {trackingData.shipmentId}
            </div>
          </div>

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

        <div className="tracking-summary-grid">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Origin</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{trackingData.fromCity}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Destination</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{trackingData.toCity}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created At</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {new Date(trackingData.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {trackingData.deliveredAt ? 'Delivered Date' : 'Expected Delivery'}
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {trackingData.deliveredAt
                ? new Date(trackingData.deliveredAt).toLocaleDateString()
                : trackingData.expectedDelivery
                ? new Date(trackingData.expectedDelivery).toLocaleDateString()
                : 'Pending assignment'}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.25rem' }}>Activity & Tracking Timeline</h3>

        {!trackingData.history || trackingData.history.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-state-icon">⏱️</div>
            <div className="empty-state-title">No tracking logs recorded yet</div>
            <div className="empty-state-description">
              Status updates and location checkpoints will appear here once the assigned driver begins transit.
            </div>
          </div>
        ) : (
          <div className="timeline">
            {trackingData.history.map((update, index) => {
              const itemBadge = STATUS_BADGES[update.status] || {
                bg: '#eff6ff',
                text: '#2563eb',
                label: update.status,
              };

              return (
                <div key={update.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  {index < trackingData.history.length - 1 && (
                    <div className="timeline-line"></div>
                  )}
                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: itemBadge.bg,
                          color: itemBadge.text,
                          fontSize: '0.7rem',
                        }}
                      >
                        {itemBadge.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(update.updatedAt).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      📍 {update.location}
                    </div>

                    {update.notes && (
                      <p style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        "{update.notes}"
                      </p>
                    )}

                    <div className="timeline-meta">
                      {update.latitude != null && update.longitude != null && (
                        <span>
                          🌐 GPS: {update.latitude.toFixed(4)}, {update.longitude.toFixed(4)}
                        </span>
                      )}
                      <span>
                        👤 Logged by: {update.updatedBy?.name || 'System / Driver'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingHistory;
