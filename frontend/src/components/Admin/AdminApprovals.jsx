import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const AdminApprovals = () => {
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' | 'shippers'
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [pendingShippers, setPendingShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Reject Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const toast = useToast();

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const [drivers, shippers] = await Promise.all([
        adminService.getPendingDrivers(),
        adminService.getPendingShippers(),
      ]);
      setPendingDrivers(drivers);
      setPendingShippers(shippers);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch pending approval requests');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (user, type) => {
    try {
      setActionLoading(true);
      if (type === 'DRIVER') {
        await adminService.approveDriver(user.id);
        toast.success(`Driver "${user.name}" approved successfully!`);
      } else {
        await adminService.approveShipper(user.id);
        toast.success(`Shipper "${user.name}" approved successfully!`);
      }
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (user, type) => {
    setSelectedUser({ ...user, type });
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      if (selectedUser.type === 'DRIVER') {
        await adminService.rejectDriver(selectedUser.id, rejectReason.trim());
        toast.success(`Driver "${selectedUser.name}" registration rejected`);
      } else {
        await adminService.rejectShipper(selectedUser.id, rejectReason.trim());
        toast.success(`Shipper "${selectedUser.name}" registration rejected`);
      }
      setRejectModalOpen(false);
      setSelectedUser(null);
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>User Approvals & Verification</h1>
          <p className="page-subtitle">Review incoming Driver licenses/vehicles and Shipper onboarding requests</p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="tabs-header">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'drivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('drivers')}
        >
          🚚 Pending Drivers <span className="tab-count">{pendingDrivers.length}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'shippers' ? 'active' : ''}`}
          onClick={() => setActiveTab('shippers')}
        >
          🏢 Pending Shippers <span className="tab-count">{pendingShippers.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading pending verification requests...</p>
        </div>
      ) : activeTab === 'drivers' ? (
        /* ================= PENDING DRIVERS ================= */
        pendingDrivers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">No pending driver applications</div>
            <p className="empty-state-description">All driver accounts have been reviewed and verified.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingDrivers.map((driver) => (
              <div key={driver.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{driver.name}</h3>
                      <span className="status-badge" style={{ backgroundColor: '#fffbeb', color: '#d97706', borderColor: '#fde68a' }}>
                        ● Pending Approval
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <span>✉️ {driver.email}</span>
                      <span>📞 {driver.phone || 'No phone provided'}</span>
                      <span>📅 Registered: {new Date(driver.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleApprove(driver, 'DRIVER')}
                      className="btn btn-success"
                    >
                      ✓ Approve Driver
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => openRejectModal(driver, 'DRIVER')}
                      className="btn btn-outline-danger"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>

                {/* Vehicle Specs Box */}
                {driver.vehicleInfo && (
                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-color)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '1rem',
                      background: '#f8fafc',
                      padding: '1rem',
                      borderRadius: 'var(--border-radius-md)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Vehicle Type
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{driver.vehicleInfo.vehicleType}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        License Plate
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'monospace' }}>
                        {driver.vehicleInfo.licensePlate}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Capacity
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{driver.vehicleInfo.capacity} kg</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* ================= PENDING SHIPPERS ================= */
        pendingShippers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">No pending shipper applications</div>
            <p className="empty-state-description">All shipper accounts have been reviewed and verified.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingShippers.map((shipper) => (
              <div key={shipper.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{shipper.name}</h3>
                      <span className="status-badge" style={{ backgroundColor: '#fffbeb', color: '#d97706', borderColor: '#fde68a' }}>
                        ● Pending Approval
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <span>✉️ {shipper.email}</span>
                      <span>📞 {shipper.phone || 'No phone provided'}</span>
                      <span>📅 Registered: {new Date(shipper.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleApprove(shipper, 'SHIPPER')}
                      className="btn btn-success"
                    >
                      ✓ Approve Shipper
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => openRejectModal(shipper, 'SHIPPER')}
                      className="btn btn-outline-danger"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="modal-overlay" onClick={() => setRejectModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>Reject {selectedUser?.type === 'DRIVER' ? 'Driver' : 'Shipper'} Application</h3>
              <button
                type="button"
                className="toast-close"
                onClick={() => setRejectModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
                Are you sure you want to reject the registration application for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
              </p>

              <div>
                <label htmlFor="reject-reason">Reason for rejection (will be visible to the user):</label>
                <textarea
                  id="reject-reason"
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Incomplete vehicle registration documents, invalid contact number."
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                className="btn btn-danger"
                onClick={handleConfirmReject}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
