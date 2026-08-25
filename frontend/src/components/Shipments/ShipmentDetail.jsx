import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import TrackingHistory from '../Tracking/TrackingHistory';
import { STATUS_COLORS, VALID_STATUS_TRANSITIONS } from '../../utils/constants';
import './Shipments.css';

const ShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      setLoading(true);
      const response = await shipmentService.getShipmentById(id);
      setShipment(response);
    } catch (err) {
      setError('Failed to load shipment');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await shipmentService.updateShipmentStatus(
        id,
        newStatus,
        'Current Location',
        `Status updated to ${newStatus}`
      );
      fetchShipment();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="loading">Loading shipment...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!shipment) return <div className="error-message">Shipment not found</div>;

  const validTransitions = VALID_STATUS_TRANSITIONS[shipment.status] || [];

  return (
    <div className="shipment-detail">
      <div className="detail-header">
        <h2>Shipment Details</h2>
        <button onClick={() => navigate('/shipments')} className="btn-secondary">
          Back
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3>Shipment Information</h3>
          <div className="info-group">
            <label>Shipment ID:</label>
            <span>{shipment.id}</span>
          </div>
          <div className="info-group">
            <label>Route:</label>
            <span>
              {shipment.fromCity} → {shipment.toCity}
            </span>
          </div>
          <div className="info-group">
            <label>Weight:</label>
            <span>{shipment.weight} kg</span>
          </div>
          <div className="info-group">
            <label>Value:</label>
            <span>PKR {shipment.value}</span>
          </div>
          <div className="info-group">
            <label>Status:</label>
            <span
              className="status-badge"
              style={{ backgroundColor: STATUS_COLORS[shipment.status] }}
            >
              {shipment.status}
            </span>
          </div>
        </div>

        <div className="detail-card">
          <h3>Dates</h3>
          <div className="info-group">
            <label>Created:</label>
            <span>{new Date(shipment.createdAt).toLocaleString()}</span>
          </div>
          <div className="info-group">
            <label>Expected Delivery:</label>
            <span>
              {shipment.expectedDelivery
                ? new Date(shipment.expectedDelivery).toLocaleDateString()
                : 'Not set'}
            </span>
          </div>
          {shipment.deliveredAt && (
            <div className="info-group">
              <label>Delivered:</label>
              <span>{new Date(shipment.deliveredAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="detail-card">
          <h3>Creator</h3>
          <div className="info-group">
            <label>Name:</label>
            <span>{shipment.createdBy.name}</span>
          </div>
          <div className="info-group">
            <label>Email:</label>
            <span>{shipment.createdBy.email}</span>
          </div>
        </div>

        {shipment.driver && (
          <div className="detail-card">
            <h3>Driver</h3>
            <div className="info-group">
              <label>Name:</label>
              <span>{shipment.driver.name}</span>
            </div>
            <div className="info-group">
              <label>Phone:</label>
              <span>{shipment.driver.phone || 'Not provided'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="detail-card">
        <h3>Items</h3>
        <table className="items-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {shipment.items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="detail-card">
        <h3>Actions</h3>
        <div className="action-buttons">
          {validTransitions.length > 0 && (
            <>
              <p>Update Status To:</p>
              <div className="button-group">
                {validTransitions.map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => handleStatusChange(nextStatus)}
                    disabled={updatingStatus}
                    className="btn-primary"
                  >
                    {nextStatus}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <TrackingHistory shipmentId={id} />
    </div>
  );
};

export default ShipmentDetail;