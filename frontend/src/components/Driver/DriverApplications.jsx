import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { APPLICATION_STATUS_BADGES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

const DriverApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState(null);

  const navigate = useNavigate();
  const toast = useToast();

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await applicationService.getMyApplications();
      setApplications(data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch your applications');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleConfirmWithdraw = async () => {
    if (!withdrawTarget) return;
    try {
      setActionLoading(true);
      await applicationService.withdrawApplication(withdrawTarget.shipmentId);
      toast.success('Application withdrawn successfully');
      setWithdrawTarget(null);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw application');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>My Submitted Applications</h1>
          <p className="page-subtitle">Track the status of your bids, view shipper responses, or withdraw pending proposals</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/driver/available')}
          className="btn btn-primary"
        >
          🌐 Browse More Open Jobs
        </button>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No applications submitted yet</div>
          <p className="empty-state-description">
            You have not applied for any shipments yet. Explore the marketplace to find open routes.
          </p>
          <button
            type="button"
            onClick={() => navigate('/driver/available')}
            className="btn btn-primary"
          >
            Browse Available Shipments
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Shipper</th>
                  <th>Cargo Specs</th>
                  <th>Your Proposed Quote</th>
                  <th>Your Note</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const badge = APPLICATION_STATUS_BADGES[app.status] || {
                    bg: '#f1f5f9',
                    text: '#475569',
                    label: app.status,
                  };
                  const s = app.shipment || {};

                  return (
                    <tr key={app.id}>
                      <td>
                        <strong>{s.fromCity}</strong> → <strong>{s.toCity}</strong>
                      </td>
                      <td>
                        <div>{s.createdBy?.name || 'Shipper'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {s.createdBy?.phone || ''}
                        </div>
                      </td>
                      <td>
                        <div>{s.weight} kg</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          PKR {Number(s.value).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {app.proposedPrice
                          ? `PKR ${Number(app.proposedPrice).toLocaleString()}`
                          : 'Standard Rate'}
                      </td>
                      <td style={{ maxWidth: '220px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        {app.message ? `"${app.message}"` : '-'}
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
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>
                        {app.status === 'PENDING' ? (
                          <button
                            type="button"
                            onClick={() => setWithdrawTarget(app)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            Withdraw
                          </button>
                        ) : app.status === 'ACCEPTED' ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/driver/deliveries/${app.shipmentId}`)}
                            className="btn btn-success btn-sm"
                          >
                            View Delivery
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawTarget && (
        <div className="modal-overlay" onClick={() => setWithdrawTarget(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Application Withdrawal</h3>
              <button
                type="button"
                className="toast-close"
                onClick={() => setWithdrawTarget(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to withdraw your bid for shipment{' '}
                <strong>
                  {withdrawTarget.shipment?.fromCity} → {withdrawTarget.shipment?.toCity}
                </strong>
                ?
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setWithdrawTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                className="btn btn-danger"
                onClick={handleConfirmWithdraw}
              >
                {actionLoading ? 'Withdrawing...' : 'Withdraw Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverApplications;
