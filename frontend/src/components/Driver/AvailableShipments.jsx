import React, { useState, useEffect, useCallback } from 'react';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

const AvailableShipments = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [fromCityFilter, setFromCityFilter] = useState('');
  const [toCityFilter, setToCityFilter] = useState('');

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [proposedPrice, setProposedPrice] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAvailable = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const filters = {};
      if (fromCityFilter.trim()) filters.fromCity = fromCityFilter.trim();
      if (toCityFilter.trim()) filters.toCity = toCityFilter.trim();

      const data = await applicationService.getAvailableShipments(page, 9, filters);
      setShipments(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 9, total: 0, totalPages: 1 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch available cargo');
    } finally {
      setLoading(false);
    }
  }, [fromCityFilter, toCityFilter, toast]);

  useEffect(() => {
    fetchAvailable(1);
  }, [fetchAvailable]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAvailable(1);
  };

  const handleClearFilters = () => {
    setFromCityFilter('');
    setToCityFilter('');
  };

  const openApplyModal = (shipment) => {
    if (!user?.approved) {
      toast.warning('Your driver account is pending Admin approval. You cannot submit bids until approved.');
      return;
    }
    setSelectedShipment(shipment);
    setProposedPrice('');
    setMessage('');
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;

    try {
      setSubmitting(true);
      await applicationService.applyForShipment(selectedShipment.id, {
        proposedPrice: proposedPrice ? parseFloat(proposedPrice) : undefined,
        message: message.trim() || undefined,
      });
      toast.success('Your application and quote have been submitted to the shipper!');
      setApplyModalOpen(false);
      setSelectedShipment(null);
      fetchAvailable(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Available Shipments Marketplace</h1>
          <p className="page-subtitle">Find open cargo jobs, filter by route, and submit your competitive delivery bids</p>
        </div>
      </div>

      {/* Filter Form */}
      <form onSubmit={handleFilterSubmit} className="filter-bar">
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={fromCityFilter}
            onChange={(e) => setFromCityFilter(e.target.value)}
            placeholder="Origin City (e.g., Lahore)"
            style={{ flex: 1, minWidth: '180px' }}
          />
          <input
            type="text"
            value={toCityFilter}
            onChange={(e) => setToCityFilter(e.target.value)}
            placeholder="Destination City (e.g., Karachi)"
            style={{ flex: 1, minWidth: '180px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-primary">
            🔍 Search Routes
          </button>
          {(fromCityFilter || toCityFilter) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-secondary"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Driver Unapproved Alert */}
      {user && !user.approved && (
        <div className="alert alert-warning">
          <strong>Notice:</strong> Your driver profile is currently under review by platform administrators. You can browse all open cargo shipments, but you must be verified before submitting bid proposals.
        </div>
      )}

      {/* Cargo Cards Grid */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Searching marketplace for open cargo...</p>
        </div>
      ) : shipments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌐</div>
          <div className="empty-state-title">No available cargo found</div>
          <p className="empty-state-description">
            {fromCityFilter || toCityFilter
              ? 'No open shipments match your selected origin or destination filters.'
              : 'There are currently no open shipments waiting for driver bids. Please check back shortly.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {shipments.map((s) => {
            const applicantCount = s._count?.applications || 0;

            return (
              <div
                key={s.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div>
                  {/* Top route header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {s.fromCity} <span style={{ color: 'var(--primary)' }}>→</span> {s.toCity}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        ID: {s.id.slice(0, 10)}...
                      </div>
                    </div>

                    <span
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--border-radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {applicantCount} {applicantCount === 1 ? 'Bid' : 'Bids'}
                    </span>
                  </div>

                  {/* Cargo details list */}
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '0.85rem',
                      borderRadius: 'var(--border-radius-md)',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight</div>
                      <div style={{ fontWeight: 700 }}>{s.weight} kg</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cargo Value</div>
                      <div style={{ fontWeight: 700 }}>PKR {Number(s.value).toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Items</div>
                      <div style={{ fontWeight: 700 }}>
                        {s.items && Array.isArray(s.items) ? s.items.length : 1}
                      </div>
                    </div>
                  </div>

                  {/* Shipper info & date */}
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    <div>🏢 Posted by: <strong>{s.createdBy?.name || 'Shipper'}</strong></div>
                    <div>📅 Date: {new Date(s.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openApplyModal(s)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  📝 Apply & Submit Quote
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => fetchAvailable(pagination.page - 1)}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.875rem' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchAvailable(pagination.page + 1)}
            className="btn btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Apply Modal */}
      {applyModalOpen && selectedShipment && (
        <div className="modal-overlay" onClick={() => setApplyModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Apply for Delivery Contract</h3>
              <button
                type="button"
                className="toast-close"
                onClick={() => setApplyModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitApplication}>
              <div className="modal-body">
                {/* Summary box */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    {selectedShipment.fromCity} → {selectedShipment.toCity}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Weight: <strong>{selectedShipment.weight} kg</strong> • Declared Cargo Value: <strong>PKR {Number(selectedShipment.value).toLocaleString()}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  <div>
                    <label htmlFor="modal-proposedPrice">
                      Your Proposed Price (PKR) <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional quote)</span>
                    </label>
                    <input
                      id="modal-proposedPrice"
                      type="number"
                      step="0.01"
                      min="1"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      placeholder="e.g., 25000"
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-message">
                      Message to Shipper <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional pitch/availability)</span>
                    </label>
                    <textarea
                      id="modal-message"
                      rows="3"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g., I am stationed near the warehouse and can begin transit immediately."
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setApplyModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting Application...' : '🚀 Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableShipments;
