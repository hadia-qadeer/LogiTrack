import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { STATUS_BADGES, SHIPMENT_STATUS } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

const ShipperShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const fetchShipments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const data = await shipmentService.getMyShipments(page, 10);
      setShipments(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchShipments(1);
  }, [fetchShipments]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await shipmentService.deleteShipment(deleteTarget.id);
      toast.success('Shipment deleted successfully');
      setDeleteTarget(null);
      fetchShipments(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete shipment');
    } finally {
      setDeleting(false);
    }
  };

  const filteredShipments = statusFilter
    ? shipments.filter((s) => s.status === statusFilter)
    : shipments;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>My Shipments</h1>
          <p className="page-subtitle">Manage all cargo postings, track progress, and review driver proposals</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/shipper/shipments/create')}
          className="btn btn-primary btn-lg"
        >
          ➕ Post New Shipment
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ margin: 0, whiteSpace: 'nowrap' }}>Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="">All Statuses ({shipments.length})</option>
            {Object.values(SHIPMENT_STATUS).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading your shipment portfolio...</p>
        </div>
      ) : filteredShipments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-title">No shipments found</div>
          <p className="empty-state-description">
            {statusFilter
              ? `No shipments found with status "${statusFilter}".`
              : 'You have not created any shipments yet.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/shipper/shipments/create')}
            className="btn btn-primary"
          >
            Create a Shipment
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Origin → Destination</th>
                  <th>Cargo Specs</th>
                  <th>Driver / Proposals</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((s) => {
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
                        {s.items && Array.isArray(s.items) && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {s.items.map((i) => i.name).join(', ')}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{s.weight} kg</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          PKR {Number(s.value).toLocaleString()}
                        </div>
                      </td>
                      <td>
                        {s.status === 'AVAILABLE' ? (
                          <span
                            style={{
                              backgroundColor: pendingBids > 0 ? '#f5f3ff' : '#f1f5f9',
                              color: pendingBids > 0 ? '#7c3aed' : '#64748b',
                              padding: '0.25rem 0.65rem',
                              borderRadius: 'var(--border-radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {pendingBids} {pendingBids === 1 ? 'Bid' : 'Bids'}
                          </span>
                        ) : s.driver ? (
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                              🚚 {s.driver.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {s.driver.phone || ''}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-light)' }}>-</span>
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
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => navigate(`/shipper/shipments/${s.id}`)}
                            className="btn btn-secondary btn-sm"
                          >
                            Manage & View
                          </button>

                          {s.status === 'AVAILABLE' && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(s)}
                              className="btn btn-outline-danger btn-sm"
                              title="Delete shipment"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total shipments)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchShipments(pagination.page - 1)}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchShipments(pagination.page + 1)}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button
                type="button"
                className="toast-close"
                onClick={() => setDeleteTarget(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete shipment <strong>{deleteTarget.id}</strong> (
                {deleteTarget.fromCity} → {deleteTarget.toCity})? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                className="btn btn-danger"
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipperShipments;
