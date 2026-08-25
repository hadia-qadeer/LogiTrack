import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { STATUS_BADGES } from '../../utils/constants';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsData, recentData] = await Promise.all([
          adminService.getPlatformStats(),
          adminService.getRecentShipments(),
        ]);
        setStats(statsData);
        setRecentShipments(recentData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load platform statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading administration dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const pendingApprovalsCount =
    (stats?.users?.drivers?.pending || 0) + (stats?.users?.shippers?.pending || 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Platform Administration</h1>
          <p className="page-subtitle">Real-time overview of users, shipments, approvals, and fleet status</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/approvals')}
            className="btn btn-primary"
          >
            🛡️ Review Approvals {pendingApprovalsCount > 0 && `(${pendingApprovalsCount})`}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Shipments</div>
            <div className="stat-value">{stats?.shipments?.total || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {stats?.shipments?.available || 0} available • {stats?.shipments?.inTransit || 0} in transit
            </div>
          </div>
          <div className="stat-icon-wrapper stat-blue">📦</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Registered Drivers</div>
            <div className="stat-value">{stats?.users?.drivers?.total || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                {stats?.users?.drivers?.approved || 0} Active
              </span>{' '}
              •{' '}
              <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                {stats?.users?.drivers?.pending || 0} Pending
              </span>
            </div>
          </div>
          <div className="stat-icon-wrapper stat-purple">🚚</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Registered Shippers</div>
            <div className="stat-value">{stats?.users?.shippers?.total || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                {stats?.users?.shippers?.approved || 0} Active
              </span>{' '}
              •{' '}
              <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                {stats?.users?.shippers?.pending || 0} Pending
              </span>
            </div>
          </div>
          <div className="stat-icon-wrapper stat-emerald">🏢</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Driver Applications</div>
            <div className="stat-value">{stats?.applications?.total || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {stats?.applications?.pending || 0} pending • {stats?.applications?.accepted || 0} accepted
            </div>
          </div>
          <div className="stat-icon-wrapper stat-amber">📝</div>
        </div>
      </div>

      {/* Shipment Breakdown & Pending Action Banner */}
      {pendingApprovalsCount > 0 && (
        <div className="alert alert-warning" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>Action Needed:</strong> You have <strong>{pendingApprovalsCount}</strong> pending registration(s) ({stats?.users?.shippers?.pending || 0} Shippers, {stats?.users?.drivers?.pending || 0} Drivers) waiting for verification.
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/approvals')}
            className="btn btn-sm btn-primary"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Recent Platform Shipments Table */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">Recent Platform Activity</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last 10 Shipments</span>
        </div>

        {recentShipments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No shipments created yet</div>
            <p className="empty-state-description">Shipments created across the platform will appear here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Route</th>
                  <th>Shipper</th>
                  <th>Assigned Driver</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((shipment) => {
                  const badge = STATUS_BADGES[shipment.status] || {
                    bg: '#f1f5f9',
                    text: '#475569',
                    label: shipment.status,
                  };

                  return (
                    <tr key={shipment.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {shipment.id.slice(0, 8)}...
                      </td>
                      <td>
                        <strong>{shipment.fromCity}</strong> → <strong>{shipment.toCity}</strong>
                      </td>
                      <td>{shipment.createdBy?.name || 'Unknown'}</td>
                      <td>
                        {shipment.driver ? (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                            {shipment.driver.name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>
                            Unassigned
                          </span>
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
                      <td>{new Date(shipment.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => navigate(`/tracking?id=${shipment.id}`)}
                          className="btn btn-secondary btn-sm"
                        >
                          Track
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

export default AdminDashboard;
