import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { STATUS_BADGES } from '../../utils/constants';

const ShipperDashboard = () => {
  const [shipmentsData, setShipmentsData] = useState({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShipperData = async () => {
      try {
        setLoading(true);
        const data = await shipmentService.getMyShipments(1, 5);
        setShipmentsData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your shipments');
      } finally {
        setLoading(false);
      }
    };

    fetchShipperData();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading shipper dashboard...</p>
      </div>
    );
  }

  const shipments = shipmentsData.data || [];
  const totalCount = shipmentsData.pagination?.total || shipments.length;
  const availableCount = shipments.filter((s) => s.status === 'AVAILABLE').length;
  const inTransitCount = shipments.filter((s) => s.status === 'IN_TRANSIT').length;
  const deliveredCount = shipments.filter((s) => s.status === 'DELIVERED').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Shipper Dashboard</h1>
          <p className="page-subtitle">Track your posted shipments, review driver quotes, and monitor deliveries</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/shipper/shipments/create')}
          className="btn btn-primary btn-lg"
        >
          ➕ Post New Shipment
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">My Total Shipments</div>
            <div className="stat-value">{totalCount}</div>
          </div>
          <div className="stat-icon-wrapper stat-blue">📦</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Open for Bidding</div>
            <div className="stat-value">{availableCount}</div>
          </div>
          <div className="stat-icon-wrapper stat-purple">🌐</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Active In Transit</div>
            <div className="stat-value">{inTransitCount}</div>
          </div>
          <div className="stat-icon-wrapper stat-amber">🚚</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Completed Deliveries</div>
            <div className="stat-value">{deliveredCount}</div>
          </div>
          <div className="stat-icon-wrapper stat-emerald">✅</div>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">My Recent Shipments</div>
          <button
            type="button"
            onClick={() => navigate('/shipper/shipments')}
            className="btn btn-secondary btn-sm"
          >
            View All ({totalCount})
          </button>
        </div>

        {shipments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No shipments created yet</div>
            <p className="empty-state-description">
              Create your first shipment to receive bids and applications from verified drivers.
            </p>
            <button
              type="button"
              onClick={() => navigate('/shipper/shipments/create')}
              className="btn btn-primary"
            >
              ➕ Create Your First Shipment
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Route</th>
                  <th>Weight / Value</th>
                  <th>Driver Bids</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => {
                  const badge = STATUS_BADGES[s.status] || {
                    bg: '#f1f5f9',
                    text: '#475569',
                    label: s.status,
                  };
                  const pendingBids = s.applications?.filter((a) => a.status === 'PENDING')?.length || 0;

                  return (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.id.slice(0, 8)}...</td>
                      <td>
                        <strong>{s.fromCity}</strong> → <strong>{s.toCity}</strong>
                      </td>
                      <td>
                        {s.weight} kg • PKR {Number(s.value).toLocaleString()}
                      </td>
                      <td>
                        {s.status === 'AVAILABLE' ? (
                          <span
                            style={{
                              backgroundColor: pendingBids > 0 ? '#f5f3ff' : '#f1f5f9',
                              color: pendingBids > 0 ? '#7c3aed' : '#64748b',
                              padding: '0.2rem 0.6rem',
                              borderRadius: 'var(--border-radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {pendingBids} {pendingBids === 1 ? 'Applicant' : 'Applicants'}
                          </span>
                        ) : s.driver ? (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                            {s.driver.name}
                          </span>
                        ) : (
                          '-'
                        )}
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
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => navigate(`/shipper/shipments/${s.id}`)}
                          className="btn btn-primary btn-sm"
                        >
                          Details & Bids
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

export default ShipperDashboard;
