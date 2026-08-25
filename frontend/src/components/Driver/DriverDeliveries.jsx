import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { STATUS_BADGES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

const DriverDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getDriverAssignedShipments();
      setDeliveries(data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load your assigned deliveries');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>My Assigned Deliveries</h1>
          <p className="page-subtitle">Track your active transit assignments, log GPS checkpoints, and complete deliveries</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/driver/available')}
          className="btn btn-secondary"
        >
          🌐 Browse More Cargo
        </button>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading your assigned delivery roster...</p>
        </div>
      ) : deliveries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚚</div>
          <div className="empty-state-title">No assigned deliveries yet</div>
          <p className="empty-state-description">
            When a shipper reviews and accepts your bid, your assigned cargo delivery contracts will appear here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/driver/available')}
            className="btn btn-primary"
          >
            Find Open Shipments to Bid
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Route</th>
                  <th>Shipper Contact</th>
                  <th>Cargo Weight / Value</th>
                  <th>Status</th>
                  <th>Expected Delivery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => {
                  const badge = STATUS_BADGES[delivery.status] || {
                    bg: '#f1f5f9',
                    text: '#475569',
                    label: delivery.status,
                  };

                  return (
                    <tr key={delivery.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{delivery.id.slice(0, 8)}...</td>
                      <td>
                        <strong>{delivery.fromCity}</strong> → <strong>{delivery.toCity}</strong>
                        {delivery.items && Array.isArray(delivery.items) && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {delivery.items.map((i) => i.name).join(', ')}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{delivery.createdBy?.name || 'Shipper'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          📞 {delivery.createdBy?.phone || delivery.createdBy?.email}
                        </div>
                      </td>
                      <td>
                        <div>{delivery.weight} kg</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          PKR {Number(delivery.value).toLocaleString()}
                        </div>
                      </td>
                      <td>
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
                      </td>
                      <td>
                        {delivery.expectedDelivery
                          ? new Date(delivery.expectedDelivery).toLocaleDateString()
                          : 'Not specified'}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => navigate(`/driver/deliveries/${delivery.id}`)}
                          className="btn btn-primary btn-sm"
                        >
                          Update Status & Route
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDeliveries;
