import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { applicationService } from '../../services/applicationService';
import { STATUS_BADGES } from '../../utils/constants';

const DriverDashboard = () => {
  const [assignedShipments, setAssignedShipments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        const [assigned, apps, available] = await Promise.all([
          shipmentService.getDriverAssignedShipments().catch(() => []),
          applicationService.getMyApplications().catch(() => []),
          applicationService.getAvailableShipments(1, 1).catch(() => ({ pagination: { total: 0 } })),
        ]);
        setAssignedShipments(assigned);
        setApplications(apps);
        setAvailableCount(available.pagination?.total || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load driver operations');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading driver operations dashboard...</p>
      </div>
    );
  }

  const activeDeliveries = assignedShipments.filter(
    (s) => s.status === 'ASSIGNED' || s.status === 'IN_TRANSIT'
  );
  const pendingApps = applications.filter((a) => a.status === 'PENDING');
  const acceptedApps = applications.filter((a) => a.status === 'ACCEPTED');

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Driver Dashboard</h1>
          <p className="page-subtitle">Manage your assigned cargo deliveries, browse open jobs, and check your bid status</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate('/driver/available')}
            className="btn btn-primary btn-lg"
          >
            🌐 Browse Open Shipments
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Marketplace Openings</div>
            <div className="stat-value">{availableCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Open cargo looking for drivers
            </div>
          </div>
          <div className="stat-icon-wrapper stat-blue">🌐</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Active Assigned Deliveries</div>
            <div className="stat-value">{activeDeliveries.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Assigned or in-transit
            </div>
          </div>
          <div className="stat-icon-wrapper stat-amber">🚚</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Pending Applications</div>
            <div className="stat-value">{pendingApps.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Awaiting shipper review
            </div>
          </div>
          <div className="stat-icon-wrapper stat-purple">📝</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Accepted Jobs</div>
            <div className="stat-value">{acceptedApps.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Total successful bids
            </div>
          </div>
          <div className="stat-icon-wrapper stat-emerald">✅</div>
        </div>
      </div>

      {/* Active Assigned Deliveries Card */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">Active Assigned Deliveries</div>
          <button
            type="button"
            onClick={() => navigate('/driver/deliveries')}
            className="btn btn-secondary btn-sm"
          >
            View All ({assignedShipments.length})
          </button>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚚</div>
            <div className="empty-state-title">No active deliveries in transit</div>
            <p className="empty-state-description">
              Browse available shipments on the marketplace and submit your proposals to win delivery contracts.
            </p>
            <button
              type="button"
              onClick={() => navigate('/driver/available')}
              className="btn btn-primary"
            >
              Browse Open Shipments
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Route</th>
                  <th>Shipper Contact</th>
                  <th>Cargo Weight</th>
                  <th>Current Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeDeliveries.map((s) => {
                  const badge = STATUS_BADGES[s.status] || {
                    bg: '#f1f5f9',
                    text: '#475569',
                    label: s.status,
                  };

                  return (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.id.slice(0, 8)}...</td>
                      <td>
                        <strong>{s.fromCity}</strong> → <strong>{s.toCity}</strong>
                      </td>
                      <td>
                        <div>{s.createdBy?.name || 'Shipper'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          📞 {s.createdBy?.phone || s.createdBy?.email}
                        </div>
                      </td>
                      <td>{s.weight} kg</td>
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
                        <button
                          type="button"
                          onClick={() => navigate(`/driver/deliveries/${s.id}`)}
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
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
