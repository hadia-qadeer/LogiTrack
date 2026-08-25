import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { applicationService } from '../../services/applicationService';
import { STATUS_BADGES, APPLICATION_STATUS_BADGES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import TrackingHistory from '../Tracking/TrackingHistory';

const ShipperShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [shipment, setShipment] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Accept Confirmation Modal state
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [shipmentData, appsData] = await Promise.all([
        shipmentService.getShipmentById(id),
        applicationService.getShipmentApplications(id).catch(() => []),
      ]);
      setShipment(shipmentData);
      setApplications(appsData);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleAcceptDriver = async () => {
    if (!selectedApp) return;
    try {
      setActionLoading(true);
      await applicationService.acceptApplication(id, selectedApp.id);
      toast.success(`Driver "${selectedApp.driver.name}" accepted and assigned!`);
      setAcceptModalOpen(false);
      setSelectedApp(null);
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept driver proposal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDriver = async (applicationId, driverName) => {
    try {
      setActionLoading(true);
      await applicationService.rejectApplication(id, applicationId);
      toast.info(`Application from "${driverName}" rejected`);
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading shipment and driver proposals...</p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">Shipment not found</div>
      </div>
    );
  }

  const badge = STATUS_BADGES[shipment.status] || {
    bg: '#f1f5f9',
    text: '#475569',
    label: shipment.status,
  };

  const pendingApplications = applications.filter((a) => a.status === 'PENDING');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1>Shipment #{shipment.id.slice(0, 8)}</h1>
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
          onClick={() => navigate('/shipper/shipments')}
          className="btn btn-secondary"
        >
          ← Back to My Shipments
        </button>
      </div>

      {/* Cargo & Route Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Route Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📍 Route & Dates</div>
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
              <span style={{ color: 'var(--text-muted)' }}>Posted Date:</span>
              <span>{new Date(shipment.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Expected Delivery:</span>
              <span>
                {shipment.expectedDelivery
                  ? new Date(shipment.expectedDelivery).toLocaleDateString()
                  : 'Flexible'}
              </span>
            </div>
            {shipment.deliveredAt && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                <span>Delivered At:</span>
                <strong>{new Date(shipment.deliveredAt).toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Cargo Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">⚖️ Cargo Details</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Weight:</span>
              <strong>{shipment.weight} kg</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Declared Value:</span>
              <strong>PKR {Number(shipment.value).toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Package Count:</span>
              <span>{shipment.items?.length || 0} unique item types</span>
            </div>
          </div>
        </div>

        {/* Assigned Driver Card */}
        {shipment.driver && (
          <div className="card" style={{ borderColor: 'var(--success-border)', background: '#f0fdf4' }}>
            <div className="card-header" style={{ borderColor: 'var(--success-border)' }}>
              <div className="card-title" style={{ color: 'var(--success)' }}>🚚 Assigned Driver</div>
              <span className="status-badge" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
                Assigned
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Driver Name:</span>
                <strong>{shipment.driver.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Contact Phone:</span>
                <strong>{shipment.driver.phone || 'Not provided'}</strong>
              </div>
              {shipment.driver.vehicleInfo && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span>
                  <span>
                    {shipment.driver.vehicleInfo.vehicleType} ({shipment.driver.vehicleInfo.licensePlate})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Package Items Table */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div className="card-title">📦 Package Inventory</div>
        </div>
        <div className="table-responsive">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Description / Notes</th>
              </tr>
            </thead>
            <tbody>
              {shipment.items && shipment.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Proposals / Applications (for Shipper when Available) */}
      {shipment.status === 'AVAILABLE' && (
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="card-header">
            <div>
              <div className="card-title">📝 Driver Proposals & Applications</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Review quotes submitted by verified drivers. Accepting a driver will automatically assign them and lock this shipment.
              </p>
            </div>
            <span
              style={{
                backgroundColor: '#f5f3ff',
                color: '#7c3aed',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--border-radius-full)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {pendingApplications.length} Pending
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <div className="empty-state-icon">⏳</div>
              <div className="empty-state-title">No driver applications yet</div>
              <p className="empty-state-description">
                Your shipment is published on the driver marketplace. Verified drivers will submit bids with their proposed rates.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.map((app) => {
                const appBadge = APPLICATION_STATUS_BADGES[app.status] || {
                  bg: '#f1f5f9',
                  text: '#475569',
                  label: app.status,
                };

                return (
                  <div
                    key={app.id}
                    style={{
                      background: app.status === 'ACCEPTED' ? '#ecfdf5' : '#ffffff',
                      border: `1px solid ${app.status === 'ACCEPTED' ? 'var(--success-border)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--border-radius-md)',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{app.driver.name}</h4>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: appBadge.bg,
                              color: appBadge.text,
                              borderColor: appBadge.border,
                            }}
                          >
                            ● {appBadge.label}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.35rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          <span>📞 {app.driver.phone || 'No phone'}</span>
                          <span>✉️ {app.driver.email}</span>
                          <span>📅 Applied: {new Date(app.appliedAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {app.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => {
                              setSelectedApp(app);
                              setAcceptModalOpen(true);
                            }}
                            className="btn btn-success"
                          >
                            ✓ Accept Driver
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleRejectDriver(app.id, app.driver.name)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Proposal Price & Message */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginTop: '0.85rem',
                        padding: '0.85rem',
                        background: '#f8fafc',
                        borderRadius: 'var(--border-radius-sm)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                          Proposed Quote
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {app.proposedPrice ? `PKR ${Number(app.proposedPrice).toLocaleString()}` : 'Default / Standard Rate'}
                        </div>
                      </div>

                      {app.driver.vehicleInfo && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                            Vehicle Specs
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                            {app.driver.vehicleInfo.vehicleType} • {app.driver.vehicleInfo.licensePlate} ({app.driver.vehicleInfo.capacity} kg max)
                          </div>
                        </div>
                      )}

                      {app.message && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                            Driver Message
                          </div>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                            "{app.message}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Live Tracking History Component */}
      <TrackingHistory shipmentId={id} />

      {/* Accept Driver Confirmation Modal */}
      {acceptModalOpen && (
        <div className="modal-overlay" onClick={() => setAcceptModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Driver Assignment</h3>
              <button
                type="button"
                className="toast-close"
                onClick={() => setAcceptModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
                Are you sure you want to accept <strong>{selectedApp?.driver.name}</strong> for this shipment?
              </p>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--border-radius-md)', fontSize: '0.875rem' }}>
                <div><strong>Proposed Rate:</strong> {selectedApp?.proposedPrice ? `PKR ${Number(selectedApp.proposedPrice).toLocaleString()}` : 'Standard'}</div>
                <div><strong>Vehicle:</strong> {selectedApp?.driver.vehicleInfo?.vehicleType || 'Standard'} ({selectedApp?.driver.vehicleInfo?.licensePlate || '-'})</div>
              </div>

              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Note: Accepting this driver will update the shipment status to <strong>ASSIGNED</strong> and automatically reject all other pending applications for this shipment.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAcceptModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                className="btn btn-success"
                onClick={handleAcceptDriver}
              >
                {actionLoading ? 'Assigning...' : 'Confirm & Assign Driver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipperShipmentDetail;
