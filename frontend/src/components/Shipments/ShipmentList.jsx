import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import { SHIPMENT_STATUS, STATUS_COLORS } from '../../utils/constants';
import './Shipments.css';

const ShipmentList = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    fromCity: '',
    toCity: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 10,
  });
  // Text inputs are typed here immediately and copied to `filters` after a debounce
  const [textInputs, setTextInputs] = useState({
    fromCity: '',
    toCity: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const navigate = useNavigate();

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const { page, limit, ...filterObj } = filters;

      const response = await shipmentService.getAllShipments(
        filters.page,
        filters.limit,
        filterObj
      );

      setShipments(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to fetch shipments:', err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (
          prev.fromCity === textInputs.fromCity &&
          prev.toCity === textInputs.toCity &&
          prev.search === textInputs.search
        ) {
          return prev;
        }
        return { ...prev, ...textInputs, page: 1 };
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [textInputs]);

  const handleStatusUpdate = async (shipmentId, newStatus, location) => {
    try {
      await shipmentService.updateShipmentStatus(shipmentId, {
        status: newStatus,
        location,
        notes: `Updated to ${newStatus}`,
      });
      fetchShipments();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setTextInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setTextInputs({ fromCity: '', toCity: '', search: '' });
    setFilters((prev) => ({
      ...prev,
      status: '',
      fromCity: '',
      toCity: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      page: 1,
    }));
  };

  const hasActiveFilters = Boolean(
    filters.status ||
      filters.fromCity ||
      filters.toCity ||
      filters.search ||
      filters.dateFrom ||
      filters.dateTo
  );

  if (initialLoad) {
    return <div className="loading">Loading shipments...</div>;
  }

  return (
    <div className="shipment-list-container">
      <div className="list-header">
        <h2>Shipments</h2>
        <button
          onClick={() => navigate('/shipments/create')}
          className="btn-primary"
        >
          + Create Shipment
        </button>
      </div>

      <div className="filters">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Status</option>
          {Object.values(SHIPMENT_STATUS).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="fromCity"
          placeholder="From city"
          value={textInputs.fromCity}
          onChange={handleTextChange}
          className="filter-select"
        />
        <input
          type="text"
          name="toCity"
          placeholder="To city"
          value={textInputs.toCity}
          onChange={handleTextChange}
          className="filter-select"
        />
        <input
          type="text"
          name="search"
          placeholder="Search cities"
          value={textInputs.search}
          onChange={handleTextChange}
          className="filter-select"
        />
        <input
          type="date"
          name="dateFrom"
          aria-label="Date from"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          className="filter-select"
        />
        <input
          type="date"
          name="dateTo"
          aria-label="Date to"
          value={filters.dateTo}
          onChange={handleFilterChange}
          className="filter-select"
        />
        <button onClick={handleClearFilters} className="btn-small">
          Clear filters
        </button>
      </div>

      {shipments.length === 0 ? (
        <div className="empty-state">
          {hasActiveFilters
            ? 'No shipments match these filters'
            : 'No shipments found'}
        </div>
      ) : (
        <>
          <table className="shipment-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Route</th>
                <th>Weight</th>
                <th>Value</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td className="id-cell">{shipment.id.slice(0, 8)}...</td>
                  <td>{`${shipment.fromCity} → ${shipment.toCity}`}</td>
                  <td>{shipment.weight} kg</td>
                  <td>PKR {shipment.value}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: STATUS_COLORS[shipment.status],
                      }}
                    >
                      {shipment.status}
                    </span>
                  </td>
                  <td>{new Date(shipment.createdAt).toLocaleDateString()}</td>
                  <td className="action-cell">
                    <button
                      onClick={() => navigate(`/shipments/${shipment.id}`)}
                      className="btn-small"
                    >
                      Details
                    </button>
                    {shipment.status === 'ASSIGNED' && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(shipment.id, 'IN_TRANSIT', 'Warehouse')
                        }
                        className="btn-small btn-blue"
                      >
                        Start
                      </button>
                    )}
                    {shipment.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(
                            shipment.id,
                            'DELIVERED',
                            'Destination'
                          )
                        }
                        className="btn-small btn-green"
                      >
                        Deliver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <span>{pagination.total} total shipments</span>
            <div className="pagination-controls">
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={filters.page === 1}
                className="btn-small"
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.min(pagination.totalPages, prev.page + 1),
                  }))
                }
                disabled={filters.page === pagination.totalPages}
                className="btn-small"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShipmentList;